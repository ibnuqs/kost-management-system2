<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Room;
use App\Models\IoTDevice;
use App\Models\RfidCard;

class KostManagementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $adminUser = User::firstOrCreate([
            'email' => 'admin@localhost.local'
        ], [
            'name' => 'System Admin',
            'email' => 'admin@localhost.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '+62000000000',
            'status' => 'active',
        ]);

        // Create Test Tenant Users
        $testTenants = [
            ['name' => 'John Doe', 'email' => 'john@test.com', 'phone' => '+6281234567801'],
            ['name' => 'Jane Smith', 'email' => 'jane@test.com', 'phone' => '+6281234567802'],
            ['name' => 'Bob Wilson', 'email' => 'bob@test.com', 'phone' => '+6281234567803'],
            ['name' => 'Alice Brown', 'email' => 'alice@test.com', 'phone' => '+6281234567804'],
        ];

        foreach ($testTenants as $tenantData) {
            User::firstOrCreate([
                'email' => $tenantData['email']
            ], [
                'name' => $tenantData['name'],
                'email' => $tenantData['email'],
                'password' => Hash::make('password123'),
                'role' => 'tenant',
                'phone' => $tenantData['phone'],
                'status' => 'active',
            ]);
        }

        // Create Minimal Room Structure (Empty - Ready for Setup)
        $roomConfigs = [
            ['number' => 'A01', 'floor' => 1, 'price' => 1500000],
            ['number' => 'A02', 'floor' => 1, 'price' => 1500000],
            ['number' => 'A03', 'floor' => 1, 'price' => 1500000],
            ['number' => 'B01', 'floor' => 2, 'price' => 1600000],
            ['number' => 'B02', 'floor' => 2, 'price' => 1600000],
        ];

        foreach ($roomConfigs as $config) {
            Room::firstOrCreate([
                'room_number' => $config['number']
            ], [
                'room_number' => $config['number'],
                'floor' => $config['floor'],
                'monthly_rent' => $config['price'],
                'status' => 'available',
                'description' => 'Room ' . $config['number'],
                'facilities' => json_encode([
                    'ac', 'bed', 'wardrobe', 'desk'
                ]),
                'archived' => false,
            ]);
        }

        // Create Default IoT Device Entry (ESP32)
        IoTDevice::firstOrCreate([
            'device_id' => 'ESP32-MAIN-DOOR'
        ], [
            'device_id' => 'ESP32-MAIN-DOOR',
            'device_name' => 'Main Door Controller',
            'device_type' => 'rfid_reader',
            'status' => 'offline',
            'device_info' => json_encode([
                'location' => 'Main Entrance',
                'connection_string' => 'mqtt://main-door',
                'firmware_version' => 'v1.0.0',
                'wifi_connected' => false,
                'mqtt_connected' => false,
                'rfid_ready' => false
            ]),
            'last_seen' => null,
            'room_id' => null,
        ]);

        // Create Tenants for testing auto-populate
        $rooms = Room::all();
        $tenantUsers = User::where('role', 'tenant')->get();

        if ($rooms->count() > 0 && $tenantUsers->count() > 0) {
            // Assign first few tenant users to rooms
            $assignments = [
                ['user_email' => 'john@test.com', 'room_number' => 'A01'],
                ['user_email' => 'jane@test.com', 'room_number' => 'A02'],
                ['user_email' => 'bob@test.com', 'room_number' => 'B01'],
            ];

            foreach ($assignments as $assignment) {
                $user = $tenantUsers->where('email', $assignment['user_email'])->first();
                $room = $rooms->where('room_number', $assignment['room_number'])->first();

                if ($user && $room) {
                    \App\Models\Tenant::firstOrCreate([
                        'user_id' => $user->id,
                        'room_id' => $room->id,
                    ], [
                        'user_id' => $user->id,
                        'room_id' => $room->id,
                        'status' => 'active',
                        'move_in_date' => now()->subDays(30),
                        'monthly_rent' => $room->monthly_rent,
                    ]);
                }
            }
        }

        // Create Test RFID Cards for Development
        $testCards = [
            ['uid' => 'A1B2C3D4', 'status' => 'active'],
            ['uid' => '01CB261E', 'status' => 'active'], 
            ['uid' => 'FF123456', 'status' => 'active'],
            ['uid' => '12345678', 'status' => 'inactive'],
            ['uid' => 'ABCDEF01', 'status' => 'active'],
            ['uid' => '98765432', 'status' => 'active'],
        ];

        foreach ($testCards as $cardData) {
            RfidCard::firstOrCreate([
                'uid' => $cardData['uid']
            ], [
                'uid' => $cardData['uid'],
                'status' => $cardData['status'],
                'user_id' => null, // Not assigned to any user initially
                'room_id' => null,
            ]);
        }

        $this->command->info('✅ Minimal system setup completed');
        $this->command->info('📧 Admin: admin@localhost.local / admin123');
        $this->command->info('🏠 ' . count($roomConfigs) . ' empty rooms created');
        $this->command->info('📡 ESP32 device placeholder created');
        $this->command->info('💳 ' . count($testCards) . ' test RFID cards created');
        $this->command->warn('⚠️  Change admin credentials before production!');
    }
}