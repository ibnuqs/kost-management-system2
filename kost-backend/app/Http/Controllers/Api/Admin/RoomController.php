<?php

// File: app/Http/Controllers/Api/Admin/RoomController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of rooms with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = min(100, max(5, (int) $request->get('per_page', 20)));
            $status = $request->get('status', 'all');
            $includeArchived = $request->get('include_archived', false);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'room_number');
            $sortOrder = $request->get('sort_order', 'asc');

            $query = Room::with(['tenant.user']);

            // Filter archived rooms
            if (! $includeArchived) {
                $query->active(); // Only show non-archived rooms by default
            }

            // Filter by status
            if ($status !== 'all' && in_array($status, Room::ALLOWED_STATUSES)) {
                $query->where('status', $status);
            }

            // Search functionality
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('room_number', 'like', "%{$search}%")
                        ->orWhere('room_name', 'like', "%{$search}%");
                });
            }

            // Sorting
            $allowedSortFields = ['room_number', 'room_name', 'monthly_price', 'status', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            }

            $rooms = $query->paginate($perPage);

            $roomsData = $rooms->getCollection()->map(function ($room) {
                return $room->getApiData();
            });

            return response()->json([
                'success' => true,
                'data' => $roomsData,
                'pagination' => [
                    'current_page' => $rooms->currentPage(),
                    'per_page' => $rooms->perPage(),
                    'total' => $rooms->total(),
                    'last_page' => $rooms->lastPage(),
                    'from' => $rooms->firstItem(),
                    'to' => $rooms->lastItem(),
                ],
                'filters' => [
                    'status' => $status,
                    'include_archived' => $includeArchived,
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
                'message' => 'Rooms retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch rooms', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_params' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve rooms',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Store a newly created room
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'room_number' => 'required|string|max:20|unique:rooms,room_number',
                'room_name' => 'required|string|max:100',
                'monthly_price' => 'required|numeric|min:0',
                'status' => 'sometimes|in:'.implode(',', Room::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $room = Room::create([
                'room_number' => $request->room_number,
                'room_name' => $request->room_name,
                'monthly_price' => $request->monthly_price,
                'status' => $request->get('status', Room::STATUS_AVAILABLE),
            ]);

            Log::info('Room created successfully', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->getApiData(),
                'message' => 'Room created successfully',
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create room', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create room',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified room
     */
    public function show($id)
    {
        try {
            $room = Room::with(['tenant.user', 'tenants.user'])->findOrFail($id);

            $roomData = $room->getApiData();

            // Add additional details for single room view
            $roomData['tenancy_history'] = $room->tenants()
                ->with('user')
                ->orderBy('start_date', 'desc')
                ->get()
                ->map(function ($tenant) {
                    return [
                        'id' => $tenant->id,
                        'tenant_code' => $tenant->tenant_code,
                        'user_name' => $tenant->user->name ?? 'N/A',
                        'user_email' => $tenant->user->email ?? 'N/A',
                        'monthly_rent' => (float) $tenant->monthly_rent,
                        'start_date' => $tenant->formatDateForApi($tenant->start_date),
                        'end_date' => $tenant->formatDateForApi($tenant->end_date),
                        'status' => $tenant->status,
                    ];
                })
                ->toArray();

            return response()->json([
                'success' => true,
                'data' => $roomData,
                'message' => 'Room details retrieved successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to fetch room details', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve room details',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified room
     */
    public function update(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'room_number' => 'sometimes|string|max:20|unique:rooms,room_number,'.$id,
                'room_name' => 'sometimes|string|max:100',
                'monthly_price' => 'sometimes|numeric|min:0',
                'status' => 'sometimes|in:'.implode(',', Room::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $oldData = $room->toArray();

            $room->update($request->only([
                'room_number', 'room_name', 'monthly_price', 'status',
            ]));

            Log::info('Room updated successfully', [
                'room_id' => $room->id,
                'old_data' => $oldData,
                'new_data' => $room->fresh()->toArray(),
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->fresh()->getApiData(),
                'message' => 'Room updated successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to update room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update room',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified room
     */
    public function destroy($id)
    {
        try {
            $room = Room::findOrFail($id);

            Log::info('Attempting to delete room', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'user' => Auth::id(),
            ]);

            // Check if room has active tenants using a safer method
            $activeTenantCount = $room->tenants()->where('status', Tenant::STATUS_ACTIVE)->count();
            if ($activeTenantCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete room with active tenants. Please remove tenants first.',
                    'error_type' => 'active_tenants',
                ], 422);
            }

            // Start transaction for safe deletion
            DB::beginTransaction();

            try {
                $roomNumber = $room->room_number;
                $roomId = $room->id;

                // Delete the room
                $room->delete();

                DB::commit();

                Log::info('Room deleted successfully', [
                    'room_id' => $roomId,
                    'room_number' => $roomNumber,
                    'deleted_by' => Auth::id(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Room {$roomNumber} deleted successfully",
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error during room deletion', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'sql_state' => $e->errorInfo[0] ?? null,
                'error_code' => $e->errorInfo[1] ?? null,
            ]);

            // Handle specific database constraint violations
            if (str_contains($e->getMessage(), 'FOREIGN KEY constraint')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete room due to related data. Please remove all associated records first.',
                    'error_type' => 'constraint_violation',
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while deleting room',
                'error_type' => 'database_error',
            ], 500);

        } catch (\Exception $e) {
            Log::error('Failed to delete room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Database error occurred. Please try again or contact support.',
                'error_type' => 'database_error',
                'alternatives' => [
                    'Archive the room instead of deleting',
                    'Change room status to maintenance',
                    'Contact system administrator',
                ],
                'archive_url' => '/api/admin/rooms/'.$id.'/archive',
            ], 500);
        }
    }

    /**
     * Archive room instead of deleting (ALTERNATIVE SOLUTION)
     */
    public function archive($id)
    {
        try {
            $room = Room::findOrFail($id);

            Log::info('Attempting to archive room', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'user' => Auth::id(),
            ]);

            // Check if room can be archived
            if (! $room->canBeArchived()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot archive room with active tenants. Please remove tenants first.',
                    'error_type' => 'active_tenants',
                ], 422);
            }

            $roomNumber = $room->room_number;
            $room->archiveRoom();

            Log::info('Room archived successfully', [
                'room_id' => $room->id,
                'room_number' => $roomNumber,
                'archived_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Room {$roomNumber} archived successfully",
                'data' => $room->fresh()->getApiData(),
                'note' => 'Room has been archived instead of deleted to preserve data integrity',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to archive room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to archive room: '.$e->getMessage(),
                'error_type' => 'general_error',
            ], 500);
        }
    }

    /**
     * Assign a tenant to a room
     */
    public function assignTenant(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);

            if ($room->status !== Room::STATUS_AVAILABLE) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is not available for assignment',
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'monthly_rent' => 'required|numeric|min:0',
                'start_date' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if user already has an active tenancy
            $existingTenant = Tenant::where('user_id', $request->user_id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->exists();

            if ($existingTenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'User already has an active tenancy',
                ], 422);
            }

            DB::beginTransaction();

            $tenant = $room->assignTenant(
                $request->user_id,
                $request->monthly_rent,
                $request->start_date
            );

            DB::commit();

            Log::info('Tenant assigned to room successfully', [
                'room_id' => $room->id,
                'tenant_id' => $tenant->id,
                'user_id' => $request->user_id,
                'assigned_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'room' => $room->fresh()->getApiData(),
                    'tenant' => $tenant->fresh()->getApiData(),
                ],
                'message' => 'Tenant assigned successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to assign tenant to room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign tenant',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove tenant from room (move out)
     */
    public function removeTenant($id)
    {
        try {
            $room = Room::with(['tenant.user'])->findOrFail($id);

            // Check if room has an active tenant
            $activeTenant = $room->tenant();
            if (! $activeTenant->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active tenant found in this room',
                ], 422);
            }

            DB::beginTransaction();

            $tenant = $activeTenant->first();

            // Update tenant status to moved out
            $tenant->update([
                'status' => Tenant::STATUS_MOVED_OUT,
                'end_date' => now()->format('Y-m-d'),
            ]);

            // Update room status to available
            $room->update(['status' => Room::STATUS_AVAILABLE]);

            DB::commit();

            Log::info('Tenant removed from room successfully', [
                'room_id' => $room->id,
                'tenant_id' => $tenant->id,
                'removed_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->fresh()->getApiData(),
                'message' => 'Tenant removed successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to remove tenant from room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to remove tenant',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Test room deletion readiness (for debugging)
     */
    public function testDeletion($id)
    {
        try {
            $room = Room::findOrFail($id);

            $debugInfo = [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'room_name' => $room->room_name,
                'status' => $room->status,
                'has_tenant_relation' => method_exists($room, 'tenant'),
                'has_tenants_relation' => method_exists($room, 'tenants'),
            ];

            // Try different ways to check for tenants
            try {
                $debugInfo['tenant_check_1'] = $room->tenant ? 'Has active tenant' : 'No active tenant';
            } catch (\Exception $e) {
                $debugInfo['tenant_check_1_error'] = $e->getMessage();
            }

            try {
                $debugInfo['tenant_check_2'] = $room->tenants()->where('status', 'active')->count();
            } catch (\Exception $e) {
                $debugInfo['tenant_check_2_error'] = $e->getMessage();
            }

            try {
                $debugInfo['tenant_check_3'] = $room->tenants()->where('status', Tenant::STATUS_ACTIVE)->count();
            } catch (\Exception $e) {
                $debugInfo['tenant_check_3_error'] = $e->getMessage();
            }

            return response()->json([
                'success' => true,
                'debug_info' => $debugInfo,
                'message' => 'Room deletion test completed',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }

    /**
     * Unarchive a room
     */
    public function unarchive($id)
    {
        try {
            $room = Room::findOrFail($id);

            Log::info('Attempting to unarchive room', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'user' => Auth::id(),
            ]);

            // Check if room can be unarchived
            if (! $room->canBeUnarchived()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is not archived or cannot be unarchived.',
                    'error_type' => 'not_archived',
                ], 422);
            }

            $roomNumber = $room->room_number;
            $room->unarchiveRoom();

            Log::info('Room unarchived successfully', [
                'room_id' => $room->id,
                'room_number' => $roomNumber,
                'unarchived_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Room {$roomNumber} unarchived successfully",
                'data' => $room->fresh()->getApiData(),
                'note' => 'Room has been restored and is now active',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to unarchive room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to unarchive room: '.$e->getMessage(),
                'error_type' => 'general_error',
            ], 500);
        }
    }

    /**
     * Get archived rooms
     */
    public function archived(Request $request)
    {
        try {
            $perPage = min(100, max(5, (int) $request->get('per_page', 20)));
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'archived_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = Room::archived()->with(['tenant.user']);

            // Search functionality
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('room_number', 'like', "%{$search}%")
                        ->orWhere('room_name', 'like', "%{$search}%")
                        ->orWhere('archived_reason', 'like', "%{$search}%");
                });
            }

            // Sorting
            $allowedSortFields = ['room_number', 'room_name', 'monthly_price', 'archived_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            }

            $rooms = $query->paginate($perPage);

            $roomsData = $rooms->getCollection()->map(function ($room) {
                return $room->getApiData();
            });

            return response()->json([
                'success' => true,
                'data' => $roomsData,
                'pagination' => [
                    'current_page' => $rooms->currentPage(),
                    'per_page' => $rooms->perPage(),
                    'total' => $rooms->total(),
                    'last_page' => $rooms->lastPage(),
                    'from' => $rooms->firstItem(),
                    'to' => $rooms->lastItem(),
                ],
                'filters' => [
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
                'message' => 'Archived rooms retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch archived rooms', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request_params' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve archived rooms',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get room statistics
     */
    public function stats()
    {
        try {
            $stats = [
                'total_rooms' => Room::count(),
                'active_rooms' => Room::active()->count(),
                'available_rooms' => Room::active()->where('status', Room::STATUS_AVAILABLE)->count(),
                'occupied_rooms' => Room::active()->where('status', Room::STATUS_OCCUPIED)->count(),
                'maintenance_rooms' => Room::active()->where('status', Room::STATUS_MAINTENANCE)->count(),
                'reserved_rooms' => Room::active()->where('status', Room::STATUS_RESERVED)->count(),
                'archived_rooms' => Room::archived()->count(),
                'occupancy_rate' => $this->calculateOccupancyRate(),
                'average_monthly_price' => Room::active()->avg('monthly_price'),
                'price_range' => [
                    'min' => Room::active()->min('monthly_price'),
                    'max' => Room::active()->max('monthly_price'),
                ],
                'total_revenue' => $this->calculateMonthlyRevenue(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Room statistics retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch room statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve room statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Calculate occupancy rate (only active rooms)
     */
    private function calculateOccupancyRate(): float
    {
        try {
            $totalActiveRooms = Room::active()->count();
            $occupiedRooms = Room::active()->where('status', Room::STATUS_OCCUPIED)->count();

            return $totalActiveRooms > 0 ? round(((float) $occupiedRooms / (float) $totalActiveRooms) * 100, 2) : 0.0;
        } catch (\Exception $e) {
            Log::error('Error calculating occupancy rate', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    /**
     * Calculate monthly revenue from occupied rooms
     */
    private function calculateMonthlyRevenue(): float
    {
        try {
            // Get all occupied rooms with active tenants
            $occupiedRooms = Room::active()
                ->where('status', Room::STATUS_OCCUPIED)
                ->whereHas('tenant', function ($query) {
                    $query->where('status', 'active');
                })
                ->get();

            Log::info('Revenue calculation debug', [
                'total_rooms' => Room::count(),
                'active_rooms' => Room::active()->count(),
                'occupied_rooms' => Room::active()->where('status', Room::STATUS_OCCUPIED)->count(),
                'occupied_with_active_tenant' => $occupiedRooms->count(),
                'occupied_room_ids' => $occupiedRooms->pluck('id')->toArray(),
                'monthly_prices' => $occupiedRooms->pluck('monthly_price')->toArray(),
            ]);

            // Sum of monthly prices for all occupied rooms
            $totalRevenue = $occupiedRooms->sum('monthly_price');

            Log::info('Monthly revenue calculated', [
                'total_revenue' => $totalRevenue,
                'occupied_rooms_count' => $occupiedRooms->count(),
            ]);

            return (float) $totalRevenue;
        } catch (\Exception $e) {
            Log::error('Error calculating monthly revenue', ['error' => $e->getMessage()]);

            return 0.0;
        }
    }

    // ===================================================================
    // NEW: ROOM RESERVATION ENDPOINTS
    // ===================================================================

    /**
     * Reserve a room temporarily
     */
    public function reserve(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);

            // Validate request
            $validator = Validator::make($request->all(), [
                'reason' => 'sometimes|string|max:255',
                'hours' => 'sometimes|integer|min:1|max:72', // Max 3 days
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if room is available for reservation
            if (! in_array($room->status, [Room::STATUS_AVAILABLE])) {
                return response()->json([
                    'success' => false,
                    'message' => "Room cannot be reserved. Current status: {$room->status}",
                    'data' => ['current_status' => $room->status],
                ], 422);
            }

            // Reserve the room
            $reason = $request->get('reason', 'Room reserved for tenant assignment');
            $hours = $request->get('hours', 24);

            $room->reserveRoom($reason, $hours);

            Log::info('Room reserved successfully', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'reserved_by' => Auth::id(),
                'hours' => $hours,
                'reason' => $reason,
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->fresh()->getApiData(),
                'reservation_info' => $room->fresh()->getReservationInfo(),
                'message' => "Room {$room->room_number} reserved successfully for {$hours} hours",
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to reserve room', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reserve room',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Cancel room reservation
     */
    public function cancelReservation($id)
    {
        try {
            $room = Room::findOrFail($id);

            if (! $room->isReserved()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is not currently reserved',
                    'data' => ['current_status' => $room->status],
                ], 422);
            }

            $room->cancelReservation();

            Log::info('Room reservation cancelled', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'cancelled_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->fresh()->getApiData(),
                'message' => "Reservation for room {$room->room_number} cancelled successfully",
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to cancel room reservation', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel reservation',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Confirm room reservation (convert to occupied)
     */
    public function confirmReservation($id)
    {
        try {
            $room = Room::findOrFail($id);

            if (! $room->isReserved()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Room is not currently reserved',
                    'data' => ['current_status' => $room->status],
                ], 422);
            }

            $room->confirmReservation();

            Log::info('Room reservation confirmed', [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'confirmed_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $room->fresh()->getApiData(),
                'message' => "Reservation for room {$room->room_number} confirmed successfully",
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to confirm room reservation', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm reservation',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get available tenants (users without active tenancy)
     */
    public function getAvailableTenants()
    {
        try {
            // Get users who don't have active tenancy
            $availableUsers = User::where('role', 'tenant')
                ->whereDoesntHave('tenants', function ($query) {
                    $query->where('status', Tenant::STATUS_ACTIVE);
                })
                ->select(['id', 'name', 'email', 'phone'])
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $availableUsers,
                'message' => 'Available tenants retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch available tenants', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available tenants',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Enhanced assign tenant with optimistic locking
     */
    public function assignTenantEnhanced(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'monthly_rent' => 'required|numeric|min:0',
                'start_date' => 'required|date|after_or_equal:today',
                'expected_status' => 'sometimes|string|in:'.implode(',', Room::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Check if user already has an active tenancy
            $existingTenant = Tenant::where('user_id', $request->user_id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->exists();

            if ($existingTenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'User already has an active tenancy',
                ], 422);
            }

            // Use optimistic locking from Room model
            $expectedStatus = $request->get('expected_status');

            $tenant = $room->assignTenant(
                $request->user_id,
                $request->monthly_rent,
                $request->start_date,
                $expectedStatus
            );

            Log::info('Tenant assigned to room successfully (enhanced)', [
                'room_id' => $room->id,
                'tenant_id' => $tenant->id,
                'user_id' => $request->user_id,
                'expected_status' => $expectedStatus,
                'assigned_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'room' => $room->fresh()->getApiData(),
                    'tenant' => $tenant->fresh()->getApiData(),
                ],
                'message' => 'Tenant assigned successfully with prorated first payment',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to assign tenant to room (enhanced)', [
                'room_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error_type' => str_contains($e->getMessage(), 'status has changed') ? 'concurrent_modification' : 'general_error',
            ], str_contains($e->getMessage(), 'status has changed') ? 409 : 500);
        }
    }
}
