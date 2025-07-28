<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\IoTDevice;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IoTDeviceController extends Controller
{
    /**
     * Get tenant's room IoT devices
     */
    public function roomDevices(Request $request)
    {
        try {
            $user = Auth::user();
            
            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();

            if (!$tenant || !$tenant->room_id) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No room assigned to tenant'
                ]);
            }

            // Get devices in tenant's room
            $devices = IoTDevice::where('room_id', $tenant->room_id)
                ->orWhere('location', 'like', '%' . $tenant->room->room_number . '%') // Fallback jika tidak ada room_id
                ->get()
                ->map(function ($device) {
                    return [
                        'id' => $device->id,
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'device_type' => $device->device_type,
                        'status' => $device->status ?? 'unknown',
                        'last_seen' => $device->last_seen ?? $device->updated_at->format('c'),
                        'location' => $device->location,
                        'battery_level' => $device->battery_level ?? null,
                        'signal_strength' => null, // Jika ada field untuk signal strength
                        'room_id' => $device->room_id,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $devices->toArray(),
                'message' => 'Room IoT devices retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve room devices: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific device status (if it belongs to tenant's room)
     */
    public function deviceStatus(Request $request, $id)
    {
        try {
            $user = Auth::user();
            
            $tenant = Tenant::where('user_id', $user->id)
                ->where('status', Tenant::STATUS_ACTIVE)
                ->first();

            if (!$tenant || !$tenant->room_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No room assigned to tenant'
                ], 404);
            }

            $device = IoTDevice::where('id', $id)
                ->where('room_id', $tenant->room_id)
                ->first();

            if (!$device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device not found in your room'
                ], 404);
            }

            $deviceStatus = [
                'id' => $device->id,
                'device_id' => $device->device_id,
                'device_name' => $device->device_name,
                'status' => $device->status ?? 'unknown',
                'last_seen' => $device->last_seen ?? $device->updated_at->format('c'),
                'battery_level' => $device->battery_level ?? null,
                'signal_strength' => null, // Jika ada field
                'uptime' => null, // Bisa dihitung dari last_seen
                'location' => $device->location,
                'device_type' => $device->device_type,
                'is_online' => $device->status === 'online',
                'health_status' => $this->getDeviceHealthStatus($device),
            ];

            return response()->json([
                'success' => true,
                'data' => $deviceStatus,
                'message' => 'Device status retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve device status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get device health status
     */
    private function getDeviceHealthStatus($device)
    {
        $status = 'healthy';
        $issues = [];

        // Check if device is offline
        if ($device->status === 'offline') {
            $status = 'warning';
            $issues[] = 'Device is offline';
        }

        // Check battery level
        if ($device->battery_level && $device->battery_level < 20) {
            $status = 'warning';
            $issues[] = 'Low battery level';
        }

        if ($device->battery_level && $device->battery_level < 10) {
            $status = 'critical';
            $issues[] = 'Critical battery level';
        }

        // Check last seen
        $lastSeen = $device->last_seen ? 
            \Carbon\Carbon::parse($device->last_seen) : 
            $device->updated_at;

        if ($lastSeen->diffInMinutes(now()) > 60) {
            $status = 'warning';
            $issues[] = 'No communication for over 1 hour';
        }

        if ($lastSeen->diffInHours(now()) > 24) {
            $status = 'critical';
            $issues[] = 'No communication for over 24 hours';
        }

        return [
            'status' => $status,
            'issues' => $issues,
            'last_check' => now()->format('c'),
        ];
    }
}