<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some rooms
        $rooms = Room::take(4)->get();
        
        if ($rooms->count() === 0) {
            $this->command->warn('⚠️ No rooms found. Run RoomSeeder first.');
            return;
        }

        $tenants = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '+6281234567890',
                'room_number' => $rooms[0]->room_number ?? '101',
            ],
            [
                'name' => 'Jane Smith', 
                'email' => 'jane@example.com',
                'phone' => '+6281234567891',
                'room_number' => $rooms[1]->room_number ?? '102',
            ],
            [
                'name' => 'Bob Wilson',
                'email' => 'bob@example.com', 
                'phone' => '+6281234567892',
                'room_number' => $rooms[2]->room_number ?? '103',
            ],
            [
                'name' => 'Alice Brown',
                'email' => 'alice@example.com',
                'phone' => '+6281234567893', 
                'room_number' => $rooms[3]->room_number ?? '104',
            ],
        ];

        foreach ($tenants as $index => $tenantData) {
            // Create user for tenant
            $user = User::firstOrCreate([
                'email' => $tenantData['email'],
            ], [
                'name' => $tenantData['name'],
                'email' => $tenantData['email'],
                'password' => Hash::make('tenant123'),
                'role' => 'tenant',
                'phone' => $tenantData['phone'],
                'email_verified_at' => now(),
            ]);

            // Create tenant record
            if (isset($rooms[$index])) {
                Tenant::firstOrCreate([
                    'user_id' => $user->id,
                ], [
                    'user_id' => $user->id,
                    'room_id' => $rooms[$index]->id,
                    'tenant_code' => 'T' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                    'move_in_date' => now()->subDays(rand(30, 365)),
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info('✅ ' . count($tenants) . ' tenants created');
        $this->command->info('📧 Login: john@example.com, jane@example.com, etc. / tenant123');
    }
}