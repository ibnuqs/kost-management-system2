<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * User registration
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'phone' => 'required|string|max:20|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'sometimes|string|in:admin,tenant',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $role = $request->get('role', 'tenant');
            
            if ($role === 'admin' && (!Auth::check() || Auth::user()->role !== 'admin')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to create admin account'
                ], 403);
            }

            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => $role,
                'status' => 'active',
            ]);

            $token = $user->createToken('auth_token', [$role])->plainTextToken;

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => $this->formatUserResponse($user),
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * User login
     */
    public function login(Request $request): JsonResponse
    {
        try {
            // Add debug logging
            Log::info('Login attempt started', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'timestamp' => now()
            ]);

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
                'remember' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $credentials = $request->only('email', 'password');
            
            Log::info('Finding user by email...');
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                Log::warning('User not found', ['email' => $request->email]);
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            if ($user->status !== 'active') {
                Log::warning('User account inactive', ['user_id' => $user->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Account is inactive. Please contact administrator.'
                ], 403);
            }

            Log::info('Attempting authentication...');
            if (!Auth::attempt($credentials)) {
                Log::warning('Authentication failed', ['user_id' => $user->id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            Log::info('Creating access token...');
            $tokenName = $request->remember ? 'long_lived_token' : 'auth_token';
            
            try {
                // Simplified token creation without expiration to avoid potential issues
                $token = $user->createToken($tokenName, [$user->role])->plainTextToken;
                Log::info('Token created successfully');
            } catch (\Exception $e) {
                Log::error('Token creation failed', ['error' => $e->getMessage()]);
                throw $e;
            }

            Log::info('Updating user login information...');
            try {
                $user->update([
                    'last_login_at' => now(),
                    'last_login_ip' => $request->ip()
                ]);
                Log::info('User login info updated');
            } catch (\Exception $e) {
                Log::warning('Failed to update login info', ['error' => $e->getMessage()]);
                // Don't fail login for this
            }

            Log::info('Login completed successfully', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $this->formatUserResponseSimple($user),
                    'token' => $token,
                    'token_type' => 'Bearer'
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'email' => $request->email ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * User logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            
            $user->load(['tenants' => function($query) {
                $query->where('status', Tenant::STATUS_ACTIVE)
                      ->with(['room:id,room_number,room_name,monthly_price']);
            }]);

            return response()->json([
                'success' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $this->formatUserProfileResponse($user)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20|unique:users,phone,' . $user->id,
                'current_password' => 'required_with:password|string',
                'password' => 'sometimes|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if ($request->has('password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect'
                    ], 422);
                }
            }

            $updateData = [];
            
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            
            if ($request->has('phone')) {
                $updateData['phone'] = $request->phone;
            }
            
            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            if (!empty($updateData)) {
                $user->update($updateData);
            }

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $this->formatUserResponse($user->fresh())
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::where('email', $request->email)->first();
            
            if ($user->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is inactive'
                ], 403);
            }

            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password reset link sent to your email'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Unable to send password reset link'
            ], 500);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reset link',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function ($user, $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                        'remember_token' => Str::random(60),
                    ])->save();

                    $user->tokens()->delete();
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password reset successful'
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid reset token or email'
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Password reset failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Refresh access token
     */
    public function refreshToken(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            
            $request->user()->currentAccessToken()->delete();
            
            $token = $user->createToken('auth_token', [$user->role], now()->addDay())->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => now()->addDay()->format('c')
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Format user response for API (lightweight for login)
     */
    private function formatUserResponseSimple(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ];
    }

    /**
     * Format user response for API (full version)
     */
    private function formatUserResponse(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->format('c') : null,
            'created_at' => $user->created_at->format('c'),
            'updated_at' => $user->updated_at->format('c'),
        ];
    }

    /**
     * Format detailed user profile response
     */
    private function formatUserProfileResponse(User $user): array
    {
        $profile = $this->formatUserResponse($user);
        
        if ($user->role === 'tenant') {
            $activeTenant = $user->tenants->first();
            
            $profile['tenant_info'] = $activeTenant ? [
                'tenant_code' => $activeTenant->tenant_code,
                'monthly_rent' => (float) $activeTenant->monthly_rent,
                'start_date' => $activeTenant->start_date ? $activeTenant->start_date->format('c') : null,
                'status' => $activeTenant->status,
                'room' => $activeTenant->room ? [
                    'id' => $activeTenant->room->id,
                    'room_number' => $activeTenant->room->room_number,
                    'room_name' => $activeTenant->room->room_name,
                    'monthly_price' => (float) $activeTenant->room->monthly_price,
                ] : null,
            ] : null;
        }

        $profile['statistics'] = [
            'total_access_logs' => $user->accessLogs()->count(),
            'total_rfid_cards' => $user->rfidCards()->count(),
            'total_tenancies' => $user->tenants()->count(),
        ];

        return $profile;
    }
}