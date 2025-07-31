<?php

namespace Database\Seeders;

use App\Models\RfidCard;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;

class RfidCardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get tenant users
        $tenants = Tenant::with('user')->take(4)->get();
        
        if ($tenants->count() === 0) {
            $this->command->warn('⚠️ No tenants found. Run TenantSeeder first.');
            return;
        }

        $rfidCards = [
            ['uid' => 'A1B2C3D4', 'status' => 'active'],
            ['uid' => 'E5F6G7H8', 'status' => 'active'], 
            ['uid' => '12345678', 'status' => 'active'],
            ['uid' => 'ABCDEF01', 'status' => 'active'],
            ['uid' => '87654321', 'status' => 'inactive'], // One inactive card
        ];

        foreach ($rfidCards as $index => $cardData) {
            // Assign to tenant if available, otherwise leave unassigned
            $tenant = $tenants->get($index);
            
            RfidCard::firstOrCreate([
                'uid' => $cardData['uid'],
            ], [
                'uid' => $cardData['uid'],
                'user_id' => $tenant ? $tenant->user_id : null,
                'tenant_id' => $tenant ? $tenant->id : null,
                'card_type' => 'mifare',
                'status' => $cardData['status'],
                'issued_at' => now()->subDays(rand(1, 30)),
                'expires_at' => now()->addYear(),
            ]);
        }

        $this->command->info('✅ ' . count($rfidCards) . ' RFID cards created');
        $this->command->info('🏷️ UIDs: A1B2C3D4, E5F6G7H8, 12345678, ABCDEF01, 87654321');
    }
}