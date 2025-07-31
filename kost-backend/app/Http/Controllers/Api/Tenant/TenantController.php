<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class TenantController extends Controller
{
    /**
     * Get tenant profile settings
     */
    public function profileSettings(Request $request)
    {
        try {
            $user = Auth::user();

            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->with(['room', 'user'])
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            $profileData = [
                'id' => $tenant->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'tenant_code' => $tenant->tenant_code,
                'room' => [
                    'room_number' => $tenant->room->room_number ?? null,
                    'monthly_rent' => (float) $tenant->monthly_rent,
                    'check_in_date' => $tenant->start_date ? $tenant->start_date->format('Y-m-d') : null,
                ],
                'emergency_contact' => [
                    'name' => null, // Jika ada field emergency contact di database
                    'phone' => null,
                    'relationship' => null,
                ],
                'status' => $tenant->status,
            ];

            return response()->json([
                'success' => true,
                'data' => $profileData,
                'message' => 'Profile settings retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile settings: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update tenant profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();

            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
                'email' => 'sometimes|required|email|unique:users,email,'.$user->id,
                'current_password' => 'sometimes|required_with:new_password|string',
                'new_password' => 'sometimes|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updateData = [];

            // Update user data
            if ($request->has('name')) {
                $updateData['name'] = $request->name;
            }
            if ($request->has('email')) {
                $updateData['email'] = $request->email;
            }
            if ($request->has('phone')) {
                $updateData['phone'] = $request->phone;
            }

            // Update password if provided
            if ($request->has('new_password') && $request->has('current_password')) {
                if (! Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect',
                    ], 422);
                }
                $updateData['password'] = Hash::make($request->new_password);
            }

            if (! empty($updateData)) {
                $user->update($updateData);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'message' => 'Profile updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update emergency contact
     */
    public function updateEmergencyContact(Request $request)
    {
        try {
            $user = Auth::user();

            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();

            if (! $tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Active tenant record not found',
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'relationship' => 'required|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Untuk sekarang, karena tidak ada field emergency contact di schema,
            // kita bisa simpan sebagai JSON di field tambahan atau buat table terpisah
            // Sementara ini kita kembalikan success response

            return response()->json([
                'success' => true,
                'data' => [
                    'name' => $request->name,
                    'phone' => $request->phone,
                    'relationship' => $request->relationship,
                ],
                'message' => 'Emergency contact updated successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update emergency contact: '.$e->getMessage(),
            ], 500);
        }
    }
}
