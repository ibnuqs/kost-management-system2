<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RfidCard;
use App\Models\IoTDevice;
use App\Models\Room;

class UpdateRfidDeviceIds extends Command
{
    protected $signature = 'rfid:update-device-ids {--force : Force update without confirmation}';
    protected $description = 'Update existing RFID cards with device_id based on their room assignments';

    public function handle()
    {
        $this->info('🔧 Starting RFID Card Device ID Update...');
        
        // Get all RFID cards without device_id
        $cardsWithoutDevice = RfidCard::whereNull('device_id')->with(['room'])->get();
        
        if ($cardsWithoutDevice->isEmpty()) {
            $this->info('✅ All RFID cards already have device_id assigned.');
            return 0;
        }
        
        $this->info("📊 Found {$cardsWithoutDevice->count()} RFID cards without device_id");
        
        // Show preview
        $this->table(
            ['ID', 'UID', 'Room', 'User ID', 'Status'],
            $cardsWithoutDevice->map(function ($card) {
                return [
                    $card->id,
                    $card->uid,
                    $card->room ? $card->room->room_number : 'No Room',
                    $card->user_id ?? 'No User',
                    $card->status
                ];
            })
        );
        
        // Ask for confirmation unless --force is used
        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to update these RFID cards with device_id?')) {
                $this->info('❌ Operation cancelled.');
                return 0;
            }
        }
        
        $updateCount = 0;
        $errorCount = 0;
        
        foreach ($cardsWithoutDevice as $card) {
            try {
                $deviceId = $this->determineDeviceId($card);
                
                if ($deviceId) {
                    $card->update([
                        'device_id' => $deviceId,
                        'access_type' => 'room_only' // Default access type
                    ]);
                    
                    $this->line("✅ Updated card {$card->uid} → device: {$deviceId}");
                    $updateCount++;
                } else {
                    $this->warn("⚠️  Could not determine device_id for card {$card->uid}");
                    $errorCount++;
                }
                
            } catch (\Exception $e) {
                $this->error("❌ Error updating card {$card->uid}: {$e->getMessage()}");
                $errorCount++;
            }
        }
        
        // Summary
        $this->info('');
        $this->info('📈 Update Summary:');
        $this->info("✅ Successfully updated: {$updateCount} cards");
        if ($errorCount > 0) {
            $this->warn("⚠️  Errors encountered: {$errorCount} cards");
        }
        
        // Show final status
        $this->showFinalStatus();
        
        return 0;
    }
    
    /**
     * Determine the device_id for a given RFID card
     */
    private function determineDeviceId(RfidCard $card): ?string
    {
        // Strategy 1: If card has room_id, find IoT device for that room
        if ($card->room_id) {
            $iotDevice = IoTDevice::where('room_id', $card->room_id)
                ->where('device_type', 'rfid_reader')
                ->first();
                
            if ($iotDevice) {
                return $iotDevice->device_id;
            }
        }
        
        // Strategy 2: Default to main ESP32 device
        // This is our current single-device setup
        return 'ESP32-RFID-01';
    }
    
    /**
     * Show final status of all RFID cards
     */
    private function showFinalStatus()
    {
        $this->info('');
        $this->info('📊 Final RFID Cards Status:');
        
        $totalCards = RfidCard::count();
        $cardsWithDevice = RfidCard::whereNotNull('device_id')->count();
        $cardsWithoutDevice = RfidCard::whereNull('device_id')->count();
        
        $this->table(
            ['Status', 'Count', 'Percentage'],
            [
                ['Cards with device_id', $cardsWithDevice, round(($cardsWithDevice / $totalCards) * 100, 1) . '%'],
                ['Cards without device_id', $cardsWithoutDevice, round(($cardsWithoutDevice / $totalCards) * 100, 1) . '%'],
                ['Total Cards', $totalCards, '100%']
            ]
        );
        
        if ($cardsWithoutDevice === 0) {
            $this->info('🎉 All RFID cards now have device_id assigned!');
            $this->info('✅ Strict validation system is ready to use.');
        } else {
            $this->warn("⚠️  {$cardsWithoutDevice} cards still need device_id assignment.");
        }
    }
}