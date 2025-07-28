<?php
// File: app/Http/Controllers/Api/Admin/TenantController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Room;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * Display a listing of tenants with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = min(100, max(5, (int) $request->get('per_page', 20)));
            $status = $request->get('status', 'all');
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = Tenant::with(['user', 'room']);

            // Filter by status
            if ($status !== 'all' && in_array($status, [Tenant::STATUS_ACTIVE, Tenant::STATUS_MOVED_OUT, Tenant::STATUS_SUSPENDED])) {
                $query->where('status', $status);
            }

            // Search functionality
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('tenant_code', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%")
                                   ->orWhere('phone', 'like', "%{$search}%");
                      })
                      ->orWhereHas('room', function ($roomQuery) use ($search) {
                          $roomQuery->where('room_number', 'like', "%{$search}%")
                                   ->orWhere('room_name', 'like', "%{$search}%");
                      });
                });
            }

            // Sorting
            $allowedSortFields = ['tenant_code', 'monthly_rent', 'start_date', 'end_date', 'status', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            }

            $tenants = $query->paginate($perPage);

            $tenantsData = $tenants->getCollection()->map(function ($tenant) {
                return $tenant->getApiData();
            });

            // Calculate comprehensive stats
            $stats = $this->calculateTenantStats();

            return response()->json([
                'success' => true,
                'data' => $tenantsData,
                'stats' => $stats,
                'pagination' => [
                    'current_page' => $tenants->currentPage(),
                    'per_page' => $tenants->perPage(),
                    'total' => $tenants->total(),
                    'last_page' => $tenants->lastPage(),
                    'from' => $tenants->firstItem(),
                    'to' => $tenants->lastItem(),
                ],
                'filters' => [
                    'status' => $status,
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
                'message' => 'Tenants retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch tenants', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_params' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tenants',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Store a newly created tenant (with new user creation)
     */
    public function store(Request $request)
    {
        try {
            // Validation for creating new user + tenant
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'password' => 'required|string|min:6',
                'password_confirmation' => 'required|same:password',
                'room_id' => 'required|exists:rooms,id',
                'tenant_code' => 'nullable|string|max:50|unique:tenants,tenant_code',
                'monthly_rent' => 'required|numeric|min:0',
                'start_date' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if room is available
            $room = Room::findOrFail($request->room_id);
            if ($room->status !== Room::STATUS_AVAILABLE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is not available'
                ], 422);
            }

            DB::beginTransaction();

            // Create new user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => bcrypt($request->password),
                'role' => 'tenant'
            ]);

            // Create tenant
            $tenant = Tenant::create([
                'tenant_code' => $request->tenant_code ?: $this->generateTenantCode(),
                'user_id' => $user->id,
                'room_id' => $request->room_id,
                'monthly_rent' => $request->monthly_rent,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => Tenant::STATUS_ACTIVE,
            ]);

            // Update room status
            $room->update(['status' => Room::STATUS_OCCUPIED]);

            DB::commit();

            Log::info('Tenant created successfully', [
                'tenant_id' => $tenant->id,
                'tenant_code' => $tenant->tenant_code,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'room_id' => $request->room_id,
                'created_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $tenant->fresh()->getApiData(),
                'message' => 'Tenant created successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create tenant', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create tenant',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Display the specified tenant
     */
    public function show($id)
    {
        try {
            $tenant = Tenant::with(['user', 'room', 'payments'])->findOrFail($id);

            $tenantData = $tenant->getApiData();
            
            // Add payment history
            $tenantData['payment_history'] = $tenant->payments()
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($payment) {
                    return $payment->getApiData();
                })
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $tenantData,
                'message' => 'Tenant details retrieved successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to fetch tenant details', [
                'tenant_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tenant details',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified tenant
     */
    public function update(Request $request, $id)
    {
        try {
            $tenant = Tenant::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $tenant->user_id,
                'phone' => 'nullable|string|max:20',
                'room_id' => 'sometimes|required|exists:rooms,id',
                'tenant_code' => 'nullable|string|max:50|unique:tenants,tenant_code,' . $tenant->id,
                'monthly_rent' => 'sometimes|numeric|min:0',
                'start_date' => 'sometimes|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'sometimes|in:' . implode(',', [Tenant::STATUS_ACTIVE, Tenant::STATUS_MOVED_OUT, Tenant::STATUS_SUSPENDED]),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldData = $tenant->toArray();
            $oldUserData = $tenant->user->toArray();
            
            DB::beginTransaction();

            // Update user data if provided
            if ($request->hasAny(['name', 'email', 'phone'])) {
                $tenant->user->update($request->only(['name', 'email', 'phone']));
            }

            // Handle room change
            $oldRoomId = $tenant->room_id;
            if ($request->has('room_id') && $request->room_id != $oldRoomId) {
                // Check if new room is available
                $newRoom = Room::findOrFail($request->room_id);
                if ($newRoom->status !== Room::STATUS_AVAILABLE) {
                    throw new \Exception('Selected room is not available');
                }
                
                // Free old room
                $oldRoom = $tenant->room;
                $oldRoom->update(['status' => Room::STATUS_AVAILABLE]);
                
                // Occupy new room
                $newRoom->update(['status' => Room::STATUS_OCCUPIED]);
            }

            // Update tenant data
            $tenant->update($request->only([
                'room_id', 'tenant_code', 'monthly_rent', 'start_date', 'end_date', 'status'
            ]));

            // Update room status if tenant status changed (not room_id change)
            if ($request->has('status') && !$request->has('room_id')) {
                $room = $tenant->room;
                if ($request->status === Tenant::STATUS_MOVED_OUT) {
                    $room->update(['status' => Room::STATUS_AVAILABLE]);
                } elseif ($request->status === Tenant::STATUS_ACTIVE && $room->status !== Room::STATUS_OCCUPIED) {
                    $room->update(['status' => Room::STATUS_OCCUPIED]);
                }
            }

            DB::commit();

            Log::info('Tenant updated successfully', [
                'tenant_id' => $tenant->id,
                'old_tenant_data' => $oldData,
                'old_user_data' => $oldUserData,
                'new_tenant_data' => $tenant->fresh()->toArray(),
                'new_user_data' => $tenant->user->fresh()->toArray(),
                'room_changed' => $request->has('room_id') && $request->room_id != $oldRoomId,
                'updated_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $tenant->fresh()->getApiData(),
                'message' => 'Tenant updated successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update tenant', [
                'tenant_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update tenant',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Terminate tenant (move out)
     */
    public function moveOut(Request $request, $id)
    {
        try {
            $tenant = Tenant::findOrFail($id);

            if ($tenant->status !== Tenant::STATUS_ACTIVE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only active tenants can be moved out'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'end_date' => 'required|date|after_or_equal:' . $tenant->start_date,
                'reason' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $tenant->update([
                'end_date' => $request->end_date,
                'status' => Tenant::STATUS_MOVED_OUT,
            ]);

            // Update room status to available
            $tenant->room->update(['status' => Room::STATUS_AVAILABLE]);

            DB::commit();

            Log::info('Tenant moved out successfully', [
                'tenant_id' => $tenant->id,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'processed_by' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => $tenant->fresh()->getApiData(),
                'message' => 'Tenant moved out successfully'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to move out tenant', [
                'tenant_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to move out tenant',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get tenant statistics
     */
    public function stats()
    {
        try {
            $currentMonth = now()->format('Y-m');
            
            $stats = [
                'total_tenants' => Tenant::count(),
                'active_tenants' => Tenant::where('status', Tenant::STATUS_ACTIVE)->count(),
                'moved_out_tenants' => Tenant::where('status', Tenant::STATUS_MOVED_OUT)->count(),
                'suspended_tenants' => Tenant::where('status', Tenant::STATUS_SUSPENDED)->count(),
                'new_this_month' => Tenant::where('status', Tenant::STATUS_ACTIVE)
                    ->whereMonth('start_date', now()->month)
                    ->whereYear('start_date', now()->year)
                    ->count(),
                'moved_out_this_month' => Tenant::where('status', Tenant::STATUS_MOVED_OUT)
                    ->whereMonth('end_date', now()->month)
                    ->whereYear('end_date', now()->year)
                    ->count(),
                'average_rent' => Tenant::where('status', Tenant::STATUS_ACTIVE)->avg('monthly_rent'),
                'rent_range' => [
                    'min' => Tenant::where('status', Tenant::STATUS_ACTIVE)->min('monthly_rent'),
                    'max' => Tenant::where('status', Tenant::STATUS_ACTIVE)->max('monthly_rent'),
                ],
                'occupancy_duration' => [
                    'less_than_6_months' => $this->getTenantsByDuration(0, 6),
                    '6_to_12_months' => $this->getTenantsByDuration(6, 12),
                    'more_than_12_months' => $this->getTenantsByDuration(12, null),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Tenant statistics retrieved successfully'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch tenant statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tenant statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Calculate simple tenant statistics
     */
    private function calculateTenantStats(): array
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', Tenant::STATUS_ACTIVE)->count();
        $movedOutTenants = Tenant::where('status', Tenant::STATUS_MOVED_OUT)->count();
        $suspendedTenants = Tenant::where('status', Tenant::STATUS_SUSPENDED)->count();
        
        // Calculate total monthly rent from active tenants
        $totalMonthlyRent = Tenant::where('status', Tenant::STATUS_ACTIVE)->sum('monthly_rent');
        $averageRent = $activeTenants > 0 ? $totalMonthlyRent / $activeTenants : 0;
        
        return [
            'total' => $totalTenants,
            'active' => $activeTenants,
            'moved_out' => $movedOutTenants,
            'suspended' => $suspendedTenants,
            'overdue_count' => 0, // Simplified - always 0
            'total_monthly_rent' => (float) $totalMonthlyRent,
            'average_rent' => (float) $averageRent,
            'occupancy_rate' => 0 // Simplified - always 0
        ];
    }

    /**
     * Generate unique tenant code
     */
    private function generateTenantCode(): string
    {
        do {
            $code = 'TNT' . now()->format('ym') . strtoupper(Str::random(4));
        } while (Tenant::where('tenant_code', $code)->exists());

        return $code;
    }

    /**
     * Get tenants by occupancy duration
     */
    private function getTenantsByDuration(?int $minMonths, ?int $maxMonths): int
    {
        $query = Tenant::where('status', Tenant::STATUS_ACTIVE);

        if ($minMonths !== null) {
            $query->where('start_date', '<=', now()->subMonths($minMonths));
        }

        if ($maxMonths !== null) {
            $query->where('start_date', '>', now()->subMonths($maxMonths));
        }

        return $query->count();
    }
}