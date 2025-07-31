<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\IoTDevice;
use App\Services\MqttService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class DoorController extends Controller
{
    protected $mqttService;

    public function __construct(MqttService $mqttService)
    {
        $this->mqttService = $mqttService;
    }

    /**
     * Get all door control devices
     */
    public function index()
    {
        try {
            $devices = IoTDevice::where('device_type', 'rfid_reader')
                ->with('room')
                ->get()
                ->map(function ($device) {
                    $deviceInfo = json_decode($device->device_info ?? '{}', true);

                    return [
                        'id' => $device->id,
                        'device_id' => $device->device_id,
                        'device_name' => $device->device_name,
                        'status' => $device->status,
                        'door_status' => $deviceInfo['door_status'] ?? 'unknown',
                        'last_seen' => $device->last_seen,
                        'device_info' => $deviceInfo,
                        'room' => $device->room ? [
                            'room_number' => $device->room->room_number,
                            'room_name' => $device->room->room_name,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $devices,
                'message' => 'Door devices retrieved successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Error retrieving door devices', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve door devices: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Send door control command
     */
    public function sendCommand(Request $request)
    {
        // Debug logging
        Log::info('DoorController sendCommand called:', [
            'device_id' => $request->device_id,
            'command' => $request->command,
            'all_input' => $request->all(),
        ]);

        $validator = Validator::make($request->all(), [
            'device_id' => 'required|string',
            'command' => 'required|in:open_door,close_door,ping,restart',
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $deviceId = $request->device_id;
            $command = $request->command;
            $reason = $request->reason ?? 'Remote command from admin';

            // Check if device exists
            $device = IoTDevice::where('device_id', $deviceId)->first();
            if (! $device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device not found',
                ], 404);
            }

            // Check if device is online
            if ($device->status !== 'online') {
                return response()->json([
                    'success' => false,
                    'message' => 'Device is offline',
                ], 400);
            }

            // Prepare MQTT command using ESP32 expected format
            $commandData = [
                'command' => $command, // ESP32 expects "open_door" or "close_door"
                'device_id' => $deviceId,
                'timestamp' => time() * 1000, // ESP32 expects milliseconds
                'reason' => $reason,
                'from' => 'admin_dashboard',
                'user_id' => auth()->id() ?? null,
            ];

            // Use the topic that ESP32 actually subscribes to
            $topic = 'rfid/command';

            // Connect to MQTT and send command
            $this->mqttService->connect();
            $success = $this->mqttService->publish($topic, json_encode($commandData));

            if ($success) {
                // Log the command for audit
                Log::info('Door command sent', [
                    'device_id' => $deviceId,
                    'command' => $command,
                    'reason' => $reason,
                    'user_id' => auth()->id(),
                ]);

                // If it's a door command, log access
                if (in_array($command, ['open_door', 'close_door'])) {
                    $this->logDoorAccess($deviceId, $command, $reason);
                }

                return response()->json([
                    'success' => true,
                    'message' => "Command '{$command}' sent to device '{$deviceId}' successfully",
                    'data' => [
                        'device_id' => $deviceId,
                        'command' => $command,
                        'timestamp' => time(),
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send command to device',
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error sending door command', [
                'device_id' => $request->device_id,
                'command' => $request->command,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send command: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get device status
     */
    public function getStatus($deviceId)
    {
        try {
            $device = IoTDevice::where('device_id', $deviceId)->first();

            if (! $device) {
                return response()->json([
                    'success' => false,
                    'message' => 'Device not found',
                ], 404);
            }

            $deviceInfo = json_decode($device->device_info ?? '{}', true);

            return response()->json([
                'success' => true,
                'data' => [
                    'device_id' => $device->device_id,
                    'device_name' => $device->device_name,
                    'status' => $device->status,
                    'door_status' => $deviceInfo['door_status'] ?? 'unknown',
                    'last_seen' => $device->last_seen,
                    'wifi_connected' => $deviceInfo['wifi_connected'] ?? false,
                    'mqtt_connected' => $deviceInfo['mqtt_connected'] ?? false,
                    'rfid_ready' => $deviceInfo['rfid_ready'] ?? false,
                    'device_info' => $deviceInfo,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get device status: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get recent door access logs
     */
    public function getAccessLogs(Request $request)
    {
        try {
            $deviceId = $request->device_id;
            $limit = $request->limit ?? 20;

            $query = AccessLog::with(['user', 'room'])
                ->orderBy('accessed_at', 'desc')
                ->limit($limit);

            if ($deviceId) {
                $query->where('device_id', $deviceId);
            }

            $logs = $query->get()->map(function ($log) {
                return [
                    'id' => $log->id,
                    'device_id' => $log->device_id,
                    'rfid_uid' => $log->rfid_uid,
                    'access_granted' => $log->access_granted,
                    'reason' => $log->reason,
                    'accessed_at' => $log->accessed_at,
                    'user' => $log->user ? [
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                    ] : null,
                    'room' => $log->room ? [
                        'room_number' => $log->room->room_number,
                        'room_name' => $log->room->room_name,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $logs,
                'message' => 'Access logs retrieved successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve access logs: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test MQTT connection
     */
    public function testConnection()
    {
        try {
            $this->mqttService->connect();

            // Send test message using ESP32 expected format
            $testData = [
                'command' => 'ping',
                'device_id' => 'TEST',
                'timestamp' => time() * 1000,
                'from' => 'admin_dashboard',
                'message' => 'Connection test from admin dashboard',
            ];

            $success = $this->mqttService->publish('rfid/command', json_encode($testData));

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'MQTT connection test successful',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'MQTT connection test failed',
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'MQTT connection test failed: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log door access for audit trail
     */
    private function logDoorAccess($deviceId, $command, $reason)
    {
        try {
            // Lookup room_id dari device_id (sama seperti RFID cards logic)
            $iotDevice = IoTDevice::where('device_id', $deviceId)->first();
            $roomId = $iotDevice ? $iotDevice->room_id : null;

            Log::info('Door access logging:', [
                'device_id' => $deviceId,
                'room_id' => $roomId,
                'command' => $command,
            ]);

            AccessLog::create([
                'device_id' => $deviceId,
                'room_id' => $roomId, // ← Ini yang missing!
                'rfid_uid' => 'MANUAL_COMMAND',
                'access_granted' => true,
                'reason' => "Manual {$command}: {$reason}",
                'accessed_at' => now(),
                'user_id' => auth()->id(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to log door access', [
                'device_id' => $deviceId,
                'command' => $command,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
