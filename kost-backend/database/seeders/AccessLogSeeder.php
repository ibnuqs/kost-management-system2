<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant;
use App\Models\AccessLog;
use Carbon\Carbon;

class AccessLogSeeder extends Seeder
{
    public function run()
    {
        $user = User::where('role', 'tenant')->first();
        
        if (!$user) {
            $this->command->info('No tenant user found. Creating a test tenant user...');
            
            $user = User::create([
                'name' => 'Test Tenant',
                'email' => 'tenant@test.com',
                'password' => bcrypt('password'),
                'role' => 'tenant',
            ]);
        }
        
        $tenant = Tenant::where('user_id', $user->id)->first();
        
        if (!$tenant) {
            $this->command->info('No tenant record found for user. Please create a tenant record first.');
            return;
        }
        
        $this->command->info("Creating access logs for tenant: {$tenant->id}, user: {$user->id}, room: {$tenant->room_id}");
        
        // Clear existing access logs for this user
        AccessLog::where('user_id', $user->id)->delete();
        
        // Create sample access logs with variety
        $accessLogs = [
            // Today's access
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now(),
                'reason' => 'Valid RFID access'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now()->subHours(2),
                'reason' => 'Valid RFID access'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-mobile-001',
                'access_granted' => true,
                'accessed_at' => now()->subHours(4),
                'reason' => 'Mobile app access'
            ],
            
            // Yesterday's access
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now()->subDay()->setHour(14),
                'reason' => 'Valid RFID access'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => false,
                'accessed_at' => now()->subDay()->setHour(18),
                'reason' => 'Card temporarily suspended'
            ],
            
            // This week's access
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now()->subDays(2)->setHour(16),
                'reason' => 'Valid RFID access'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-manual-001',
                'access_granted' => true,
                'accessed_at' => now()->subDays(3)->setHour(17),
                'reason' => 'Manual entry by admin'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-002',
                'device_id' => 'door-rfid-001',
                'access_granted' => false,
                'accessed_at' => now()->subDays(4)->setHour(19),
                'reason' => 'Invalid card'
            ],
            
            // More historical data
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now()->subWeek()->setHour(13),
                'reason' => 'Valid RFID access'
            ],
            [
                'user_id' => $user->id,
                'room_id' => $tenant->room_id,
                'rfid_uid' => 'test-rfid-001',
                'device_id' => 'door-rfid-001',
                'access_granted' => true,
                'accessed_at' => now()->subWeeks(2)->setHour(14),
                'reason' => 'Valid RFID access'
            ],
        ];
        
        foreach ($accessLogs as $log) {
            AccessLog::create($log);
        }
        
        $total = AccessLog::where('user_id', $user->id)->count();
        $denied = AccessLog::where('user_id', $user->id)->where('access_granted', false)->count();
        $granted = AccessLog::where('user_id', $user->id)->where('access_granted', true)->count();
        
        $this->command->info("Created {$total} access logs:");
        $this->command->info("- Granted: {$granted}");
        $this->command->info("- Denied: {$denied}");
        $this->command->info("Sample data ready for testing!");
    }
}