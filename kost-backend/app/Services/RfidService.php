<?php
// app/Services/RfidService.php

namespace App\Services;

use App\Models\RfidCard;
use App\Models\AccessLog;
use App\Models\Payment;
use App\Models\Tenant;
use App\Services\MqttService;
use Illuminate\Support\Facades\Log;
use Exception;

class RfidService
{
    protected $mqttService;

    public function __construct(MqttService $mqttService)
    {
        $this->mqttService = $mqttService;
    }

    /**
     * Process RFID access request from ESP32
     */
    public function processAccess($rfidUid, $deviceId, $roomId = null)
    {
        try {
            Log::info("Processing RFID access: UID={$rfidUid}, Device={$deviceId}");

            // Find RFID card with tenant relationship
            $rfidCard = RfidCard::with(['user', 'tenant.room'])
                ->where('uid', $rfidUid)
                ->where('status', 'active')
                ->first();

            if (!$rfidCard) {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'RFID card not found or inactive');
            }

            // Check if user is active
            if ($rfidCard->user->status !== 'active') {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'User account is inactive');
            }

            // Check if tenant exists and is active
            if (!$rfidCard->tenant || $rfidCard->tenant->status !== 'active') {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'No active tenancy found');
            }

            // Get device room from IoT device table
            $deviceRoom = \App\Models\IoTDevice::where('device_id', $deviceId)->value('room_id');
            
            if (!$deviceRoom) {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'Device not registered');
            }

            // Check if tenant room matches device room
            if ($rfidCard->tenant->room_id != $deviceRoom) {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'Access denied for this room');
            }

            // Check payment status for current month
            $currentMonth = now()->format('Y-m-01');
            $payment = Payment::where('tenant_id', $rfidCard->tenant->id)
                ->where('payment_month', $currentMonth)
                ->first();

            if (!$payment || $payment->status !== 'paid') {
                return $this->denyAccess($rfidUid, $deviceId, $roomId, 'Payment required for current month');
            }

            // Grant access
            return $this->grantAccess($rfidCard, $deviceId, $deviceRoom);

        } catch (Exception $e) {
            Log::error('RFID access processing failed: ' . $e->getMessage());
            return $this->denyAccess($rfidUid, $deviceId, $roomId, 'System error occurred');
        }
    }

    /**
     * Grant access and log the event
     */
    protected function grantAccess($rfidCard, $deviceId, $roomId)
    {
        // Log access
        $accessLog = AccessLog::create([
            'user_id' => $rfidCard->user_id,
            'room_id' => $rfidCard->tenant->room_id,
            'rfid_uid' => $rfidCard->uid,
            'device_id' => $deviceId,
            'access_granted' => true,
            'reason' => 'Access granted',
            'accessed_at' => now()
        ]);

        // Send door open command via MQTT
        $this->mqttService->sendDoorCommand($deviceId, 'open', 5);

        // Send access response to ESP32
        $this->mqttService->sendAccessResponse(
            $deviceId, 
            $rfidCard->uid, 
            true, 
            'Welcome ' . $rfidCard->user->name
        );

        Log::info("Access granted for user {$rfidCard->user->name} (UID: {$rfidCard->uid})");

        return [
            'success' => true,
            'access_granted' => true,
            'message' => 'Access granted',
            'user_name' => $rfidCard->user->name,
            'room_number' => $rfidCard->tenant->room->room_number,
            'access_log_id' => $accessLog->id
        ];
    }

    /**
     * Deny access and log the event
     */
    protected function denyAccess($rfidUid, $deviceId, $roomId, $reason)
    {
        // Log access attempt
        AccessLog::create([
            'user_id' => null,
            'room_id' => $roomId,
            'rfid_uid' => $rfidUid,
            'device_id' => $deviceId,
            'access_granted' => false,
            'reason' => $reason,
            'accessed_at' => now()
        ]);

        // Send access denied response to ESP32
        $this->mqttService->sendAccessResponse($deviceId, $rfidUid, false, $reason);

        Log::warning("Access denied for UID {$rfidUid}: {$reason}");

        return [
            'success' => true,
            'access_granted' => false,
            'message' => $reason,
            'user_name' => null,
            'room_number' => null
        ];
    }

    /**
     * Register new RFID card for user
     */
    public function registerCard($uid, $tenantId, $cardType = 'primary')
    {
        try {
            // Check if UID already exists
            $existingCard = RfidCard::where('uid', $uid)->first();
            if ($existingCard) {
                throw new Exception('RFID card already registered');
            }

            // Get tenant info
            $tenant = Tenant::with('user')->find($tenantId);
            if (!$tenant) {
                throw new Exception('Tenant not found');
            }

            // Deactivate old primary cards for this tenant if registering primary card
            if ($cardType === 'primary') {
                RfidCard::where('tenant_id', $tenantId)
                    ->where('card_type', 'primary')
                    ->update(['status' => 'inactive']);
            }

            // Create new card
            $rfidCard = RfidCard::create([
                'uid' => $uid,
                'user_id' => $tenant->user_id,
                'tenant_id' => $tenantId,
                'card_type' => $cardType,
                'status' => 'active'
            ]);

            Log::info("RFID card registered: UID={$uid}, Tenant={$tenantId}, Type={$cardType}");

            return [
                'success' => true,
                'rfid_card' => $rfidCard
            ];

        } catch (Exception $e) {
            Log::error('RFID card registration failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Deactivate RFID card
     */
    public function deactivateCard($uid)
    {
        try {
            $rfidCard = RfidCard::where('uid', $uid)->first();
            
            if (!$rfidCard) {
                throw new Exception('RFID card not found');
            }

            $rfidCard->update(['status' => 'inactive']);

            Log::info("RFID card deactivated: UID={$uid}");

            return [
                'success' => true,
                'message' => 'RFID card deactivated successfully'
            ];

        } catch (Exception $e) {
            Log::error('RFID card deactivation failed: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Get access history for a user or room
     */
    public function getAccessHistory($userId = null, $roomId = null, $limit = 50)
    {
        $query = AccessLog::with('user', 'room')
            ->orderBy('accessed_at', 'desc');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($roomId) {
            $query->where('room_id', $roomId);
        }

        return $query->limit($limit)->get();
    }
}