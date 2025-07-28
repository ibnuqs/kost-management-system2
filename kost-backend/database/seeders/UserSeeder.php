<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create ONLY admin user for system setup
        User::firstOrCreate([
            'email' => 'admin@localhost.local'
        ], [
            'name' => 'System Administrator',
            'email' => 'admin@localhost.local',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '+62000000000',
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Admin user created');
        $this->command->info('📧 Login: admin@localhost.local / admin123');
        $this->command->warn('⚠️  Change credentials in production!');
    }
}