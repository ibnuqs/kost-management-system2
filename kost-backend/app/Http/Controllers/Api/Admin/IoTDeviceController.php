<?php

// File: app/Http/Controllers/Api/Admin/IoTDeviceController.php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IoTDevice;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class IoTDeviceController extends Controller
{
    /**
     * Display a listing of IoT devices with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            // Add debug logging
            Log::info('IoT Devices API called', [
                'user_id' => Auth::id(),
                'params' => $request->all(),
                'timestamp' => now(),
            ]);

            $perPage = min(100, max(5, (int) $request->get('per_page', 20)));
            $status = $request->get('status', 'all');
            $deviceType = $request->get('device_type', 'all');
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            // Start with simple query to avoid timeout
            $query = IoTDevice::query();

            // Only add room relationship if needed for search or if we have few records
            $deviceCount = IoTDevice::count();
            if ($deviceCount < 1000 || ! empty($search)) {
                $query->with(['room']);
            }

            // Filter by status
            if ($status !== 'all' && in_array($status, IoTDevice::ALLOWED_STATUSES)) {
                $query->where('status', $status);
            }

            // Filter by device type
            if ($deviceType !== 'all' && in_array($deviceType, IoTDevice::ALLOWED_TYPES)) {
                $query->where('device_type', $deviceType);
            }

            // Simplified search functionality - avoid complex joins if possible
            if (! empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('device_id', 'like', "%{$search}%")
                        ->orWhere('device_name', 'like', "%{$search}%");

                    // Only search rooms if we have room relationship loaded
                    if ($q->getModel()->relationLoaded('room')) {
                        $q->orWhereHas('room', function ($roomQuery) use ($search) {
                            $roomQuery->where('room_number', 'like', "%{$search}%")
                                ->orWhere('room_name', 'like', "%{$search}%");
                        });
                    }
                });
            }

            // Sorting
            $allowedSortFields = ['device_id', 'device_name', 'device_type', 'status', 'last_seen', 'created_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder === 'desc' ? 'desc' : 'asc');
            }

            Log::info('Executing IoT devices query...');
            $devices = $query->paginate($perPage);
            Log::info('IoT devices query completed', ['count' => $devices->count()]);

            // Load rooms separately if not already loaded to avoid N+1 issue
            if (! $devices->first()?->relationLoaded('room')) {
                $devices->load('room');
            }

            $devicesData = $devices->getCollection()->map(function ($device) {
                try {
                    return [
                        'id' => $device->id,
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'device_type' => $device->device_type,
                        'room_id' => $device->room_id,
                        'status' => $device->status,
                        'device_info' => $device->device_info,
                        'last_seen' => $device->last_seen?->format('c'),
                        'room' => $device->room ? [
                            'id' => $device->room->id,
                            'room_number' => $device->room->room_number,
                            'room_name' => $device->room->room_name ?? "Room {$device->room->room_number}",
                        ] : null,
                        'created_at' => $device->created_at?->format('c'),
                        'updated_at' => $device->updated_at?->format('c'),
                    ];
                } catch (\Exception $e) {
                    Log::warning('Error formatting device data', [
                        'device_id' => $device->id,
                        'error' => $e->getMessage(),
                    ]);

                    // Return basic data if formatting fails
                    return [
                        'id' => $device->id,
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'device_type' => $device->device_type,
                        'status' => $device->status,
                        'room_id' => $device->room_id,
                        'last_seen' => null,
                        'room' => null,
                        'created_at' => null,
                        'updated_at' => null,
                    ];
                }
            });

            Log::info('IoT devices API completed successfully');

            return response()->json([
                'success' => true,
                'data' => $devicesData,
                'pagination' => [
                    'current_page' => $devices->currentPage(),
                    'per_page' => $devices->perPage(),
                    'total' => $devices->total(),
                    'last_page' => $devices->lastPage(),
                    'from' => $devices->firstItem(),
                    'to' => $devices->lastItem(),
                ],
                'filters' => [
                    'status' => $status,
                    'device_type' => $deviceType,
                    'search' => $search,
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder,
                ],
                'message' => 'IoT devices retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch IoT devices', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request_params' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve IoT devices',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
                'data' => [],
            ], 500);
        }
    }

    /**
     * Store a newly created IoT device
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|string|max:50|unique:iot_devices,device_id',
                'device_name' => 'required|string|max:100',
                'device_type' => 'required|in:'.implode(',', IoTDevice::ALLOWED_TYPES),
                'room_id' => 'nullable|exists:rooms,id',
                'status' => 'sometimes|in:'.implode(',', IoTDevice::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $device = IoTDevice::create([
                'device_id' => $request->device_id,
                'device_name' => $request->device_name,
                'device_type' => $request->device_type,
                'room_id' => $request->room_id,
                'status' => $request->get('status', IoTDevice::STATUS_OFFLINE),
                'last_seen' => now(),
            ]);

            Log::info('IoT device created successfully', [
                'device_id' => $device->id,
                'device_identifier' => $device->device_id,
                'device_type' => $device->device_type,
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $device->fresh()->getApiData(),
                'message' => 'IoT device created successfully',
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create IoT device', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create IoT device',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Display the specified IoT device
     */
    public function show($id)
    {
        try {
            $device = IoTDevice::with(['room'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $device->getApiData(),
                'message' => 'IoT device details retrieved successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to fetch IoT device details', [
                'device_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve IoT device details',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update the specified IoT device
     */
    public function update(Request $request, $id)
    {
        try {
            $device = IoTDevice::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'device_id' => 'sometimes|string|max:50|unique:iot_devices,device_id,'.$id,
                'device_name' => 'sometimes|string|max:100',
                'device_type' => 'sometimes|in:'.implode(',', IoTDevice::ALLOWED_TYPES),
                'room_id' => 'nullable|exists:rooms,id',
                'status' => 'sometimes|in:'.implode(',', IoTDevice::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $oldData = $device->toArray();

            $device->update($request->only([
                'device_id', 'device_name', 'device_type', 'room_id', 'status',
            ]));

            Log::info('IoT device updated successfully', [
                'device_id' => $device->id,
                'old_data' => $oldData,
                'new_data' => $device->fresh()->toArray(),
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $device->fresh()->getApiData(),
                'message' => 'IoT device updated successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to update IoT device', [
                'device_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update IoT device',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Remove the specified IoT device
     */
    public function destroy($id)
    {
        try {
            $device = IoTDevice::findOrFail($id);
            $deviceData = $device->getApiData();

            $device->delete();

            Log::info('IoT device deleted successfully', [
                'device_id' => $id,
                'device_data' => $deviceData,
                'deleted_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'IoT device deleted successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to delete IoT device', [
                'device_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete IoT device',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Update device status (heartbeat from device)
     */
    public function heartbeat(Request $request, $deviceId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|in:'.implode(',', IoTDevice::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $device = IoTDevice::where('device_id', $deviceId)->firstOrFail();

            $device->update([
                'status' => $request->get('status', IoTDevice::STATUS_ONLINE),
                'last_seen' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'device_id' => $device->device_id,
                    'status' => $device->status,
                    'last_seen' => $device->formatDateForApi($device->last_seen),
                ],
                'message' => 'Heartbeat received successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to process device heartbeat', [
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process heartbeat',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Send command to IoT device
     */
    public function sendCommand(Request $request, $id)
    {
        try {
            $device = IoTDevice::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'command' => 'required|string|in:unlock,lock,reset,reboot,status',
                'parameters' => 'sometimes|array',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            if ($device->isOffline()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot send command to offline device',
                ], 422);
            }

            // Log the command
            Log::info('Command sent to IoT device', [
                'device_id' => $device->id,
                'device_identifier' => $device->device_id,
                'command' => $request->command,
                'parameters' => $request->get('parameters', []),
                'sent_by' => Auth::id(),
            ]);

            // TODO: Implement actual MQTT command sending
            // Example: $this->mqttService->sendCommand($device->device_id, $request->command, $request->parameters);

            return response()->json([
                'success' => true,
                'data' => [
                    'device_id' => $device->device_id,
                    'command' => $request->command,
                    'parameters' => $request->get('parameters', []),
                    'sent_at' => now()->format('c'),
                ],
                'message' => 'Command sent to device successfully',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to send command to IoT device', [
                'device_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send command to device',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get IoT device statistics
     */
    public function stats()
    {
        try {
            $stats = [
                'total_devices' => IoTDevice::count(),
                'online_devices' => IoTDevice::where('status', IoTDevice::STATUS_ONLINE)->count(),
                'offline_devices' => IoTDevice::where('status', IoTDevice::STATUS_OFFLINE)->count(),
                'device_types' => [
                    'door_locks' => IoTDevice::where('device_type', IoTDevice::TYPE_DOOR_LOCK)->count(),
                    'card_scanners' => IoTDevice::where('device_type', IoTDevice::TYPE_CARD_SCANNER)->count(),
                ],
                'uptime_percentage' => $this->calculateUptimePercentage(),
                'rooms_with_devices' => $this->getRoomsWithDevicesCount(),
                'recent_offline_devices' => $this->getRecentOfflineDevices(5),
                'last_heartbeat_summary' => $this->getLastHeartbeatSummary(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'IoT device statistics retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch IoT device statistics', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve IoT device statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get devices that are offline for too long
     */
    public function getOfflineDevices()
    {
        try {
            $offlineThreshold = now()->subMinutes(30);

            $offlineDevices = IoTDevice::with(['room'])
                ->where('status', IoTDevice::STATUS_OFFLINE)
                ->orWhere('last_seen', '<', $offlineThreshold)
                ->orderBy('last_seen', 'asc')
                ->get()
                ->map(function ($device) {
                    $data = $device->getApiData();
                    $data['offline_duration'] = $device->last_seen
                        ? now()->diffForHumans($device->last_seen, true)
                        : 'Unknown';

                    return $data;
                });

            return response()->json([
                'success' => true,
                'data' => $offlineDevices,
                'count' => $offlineDevices->count(),
                'message' => 'Offline devices retrieved successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to fetch offline devices', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve offline devices',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Bulk update device status
     */
    public function bulkUpdateStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'device_ids' => 'required|array|min:1',
                'device_ids.*' => 'exists:iot_devices,id',
                'status' => 'required|in:'.implode(',', IoTDevice::ALLOWED_STATUSES),
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updatedCount = IoTDevice::whereIn('id', $request->device_ids)
                ->update([
                    'status' => $request->status,
                    'last_seen' => now(),
                ]);

            Log::info('Bulk device status update', [
                'device_ids' => $request->device_ids,
                'new_status' => $request->status,
                'updated_count' => $updatedCount,
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'updated_count' => $updatedCount,
                    'new_status' => $request->status,
                ],
                'message' => 'Device status updated successfully',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to bulk update device status', [
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update device status',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Calculate overall uptime percentage
     */
    private function calculateUptimePercentage(): float
    {
        $totalDevices = IoTDevice::count();
        $onlineDevices = IoTDevice::where('status', IoTDevice::STATUS_ONLINE)->count();

        return $totalDevices > 0 ? round(($onlineDevices / $totalDevices) * 100, 2) : 0.0;
    }

    /**
     * Get count of rooms that have IoT devices
     */
    private function getRoomsWithDevicesCount(): int
    {
        return IoTDevice::whereNotNull('room_id')
            ->distinct('room_id')
            ->count('room_id');
    }

    /**
     * Get recently offline devices
     */
    private function getRecentOfflineDevices(int $limit): array
    {
        return IoTDevice::with(['room'])
            ->where('status', IoTDevice::STATUS_OFFLINE)
            ->latest('last_seen')
            ->limit($limit)
            ->get()
            ->map(function ($device) {
                return [
                    'id' => $device->id,
                    'device_id' => $device->device_id,
                    'device_name' => $device->device_name,
                    'device_type' => $device->device_type,
                    'room' => $device->room ? [
                        'id' => $device->room->id,
                        'room_number' => $device->room->room_number,
                        'room_name' => $device->room->room_name,
                    ] : null,
                    'last_seen' => $device->formatDateForApi($device->last_seen),
                    'offline_duration' => $device->last_seen
                        ? now()->diffForHumans($device->last_seen, true)
                        : 'Unknown',
                ];
            })
            ->toArray();
    }

    /**
     * Get last heartbeat summary
     */
    private function getLastHeartbeatSummary(): array
    {
        $recentHeartbeats = IoTDevice::where('last_seen', '>', now()->subHour())->count();
        $oldHeartbeats = IoTDevice::where('last_seen', '<=', now()->subHour())
            ->where('last_seen', '>', now()->subDay())->count();
        $veryOldHeartbeats = IoTDevice::where('last_seen', '<=', now()->subDay())->count();

        return [
            'last_hour' => $recentHeartbeats,
            'last_day' => $oldHeartbeats,
            'older_than_day' => $veryOldHeartbeats,
        ];
    }

    /**
     * Auto-assign IoT devices to rooms based on RFID card usage
     */
    public function autoAssignRooms()
    {
        try {
            Log::info('Starting auto-assignment of IoT devices to rooms');

            // Get RFID devices that don't have room assignments
            $unassignedDevices = IoTDevice::where('device_type', 'rfid_reader')
                ->whereNull('room_id')
                ->get();

            if ($unassignedDevices->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'All RFID devices are already assigned to rooms',
                    'assignments' => [],
                ], 200);
            }

            $assignments = [];

            foreach ($unassignedDevices as $device) {
                // Find RFID cards that might be associated with this device
                // Look for recent access logs or cards that reference this device
                $roomId = $this->findBestRoomForDevice($device);

                if ($roomId) {
                    $device->update(['room_id' => $roomId]);

                    $assignments[] = [
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'assigned_room_id' => $roomId,
                        'room' => \App\Models\Room::find($roomId),
                    ];

                    Log::info('Auto-assigned device to room', [
                        'device_id' => $device->device_id,
                        'room_id' => $roomId,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($assignments) > 0
                    ? 'Successfully auto-assigned '.count($assignments).' devices to rooms'
                    : 'No suitable room assignments found for unassigned devices',
                'assignments' => $assignments,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Failed to auto-assign IoT devices to rooms', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to auto-assign devices to rooms',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Manually assign IoT device to a room
     */
    public function assignToRoom(Request $request, $id)
    {
        try {
            $device = IoTDevice::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'room_id' => 'required|exists:rooms,id',
                'reason' => 'sometimes|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $oldRoomId = $device->room_id;
            $device->update(['room_id' => $request->room_id]);

            $room = \App\Models\Room::find($request->room_id);

            Log::info('Manually assigned device to room', [
                'device_id' => $device->device_id,
                'old_room_id' => $oldRoomId,
                'new_room_id' => $request->room_id,
                'reason' => $request->reason ?? 'Manual assignment',
                'assigned_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'device' => $device->fresh()->getApiData(),
                    'room' => $room,
                    'old_room_id' => $oldRoomId,
                ],
                'message' => "Device {$device->device_name} assigned to room {$room->room_number}",
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'IoT device not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to assign device to room', [
                'device_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to assign device to room',
                'error' => app()->environment('local') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Find the best room assignment for an IoT device
     */
    private function findBestRoomForDevice(IoTDevice $device): ?int
    {
        // Strategy 1: Look for RFID cards that might be used with this device
        // If this is ESP32-RFID-01, it might correspond to the first room, etc.

        // Extract potential room number from device name/ID
        if (preg_match('/(\d+)/', $device->device_id, $matches)) {
            $deviceNumber = (int) $matches[1];

            // Try to find a room that makes sense
            $room = \App\Models\Room::where('room_number', 'LIKE', '%'.str_pad($deviceNumber, 2, '0', STR_PAD_LEFT).'%')
                ->orWhere('room_number', 'LIKE', '%'.$deviceNumber.'%')
                ->first();

            if ($room) {
                return $room->id;
            }
        }

        // Strategy 2: Look for rooms that have RFID cards but no assigned devices
        $roomsWithCards = \DB::table('rfid_cards')
            ->whereNotNull('room_id')
            ->where('status', 'active')
            ->pluck('room_id')
            ->unique();

        $roomsWithDevices = IoTDevice::whereNotNull('room_id')
            ->where('device_type', 'rfid_reader')
            ->pluck('room_id')
            ->unique();

        $roomsNeedingDevices = $roomsWithCards->diff($roomsWithDevices);

        if ($roomsNeedingDevices->isNotEmpty()) {
            return $roomsNeedingDevices->first();
        }

        // Strategy 3: Assign to first available room
        $firstRoom = \App\Models\Room::where('status', '!=', 'maintenance')
            ->orderBy('room_number')
            ->first();

        return $firstRoom ? $firstRoom->id : null;
    }
}
