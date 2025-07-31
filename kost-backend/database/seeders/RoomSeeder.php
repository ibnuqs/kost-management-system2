<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = [
            // Lantai 1
            ['room_number' => 'A01', 'room_name' => 'Kamar A01 - Lantai 1', 'monthly_price' => 800000, 'status' => 'available'],
            ['room_number' => 'A02', 'room_name' => 'Kamar A02 - Lantai 1', 'monthly_price' => 800000, 'status' => 'available'],
            ['room_number' => 'A03', 'room_name' => 'Kamar A03 - Lantai 1', 'monthly_price' => 800000, 'status' => 'available'],
            ['room_number' => 'A04', 'room_name' => 'Kamar A04 - Lantai 1', 'monthly_price' => 800000, 'status' => 'available'],
            ['room_number' => 'A05', 'room_name' => 'Kamar A05 - Lantai 1', 'monthly_price' => 800000, 'status' => 'available'],

            // Lantai 2
            ['room_number' => 'B01', 'room_name' => 'Kamar B01 - Lantai 2', 'monthly_price' => 850000, 'status' => 'available'],
            ['room_number' => 'B02', 'room_name' => 'Kamar B02 - Lantai 2', 'monthly_price' => 850000, 'status' => 'available'],
            ['room_number' => 'B03', 'room_name' => 'Kamar B03 - Lantai 2', 'monthly_price' => 850000, 'status' => 'available'],
            ['room_number' => 'B04', 'room_name' => 'Kamar B04 - Lantai 2', 'monthly_price' => 850000, 'status' => 'available'],
            ['room_number' => 'B05', 'room_name' => 'Kamar B05 - Lantai 2', 'monthly_price' => 850000, 'status' => 'available'],

            // Lantai 3 - Premium
            ['room_number' => 'C01', 'room_name' => 'Kamar C01 - Premium', 'monthly_price' => 1000000, 'status' => 'available'],
            ['room_number' => 'C02', 'room_name' => 'Kamar C02 - Premium', 'monthly_price' => 1000000, 'status' => 'available'],
            ['room_number' => 'C03', 'room_name' => 'Kamar C03 - Premium', 'monthly_price' => 1000000, 'status' => 'available'],
            ['room_number' => 'C04', 'room_name' => 'Kamar C04 - Premium', 'monthly_price' => 1000000, 'status' => 'available'],

            // Kamar Maintenance
            ['room_number' => 'M01', 'room_name' => 'Kamar Maintenance 1', 'monthly_price' => 750000, 'status' => 'maintenance'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }

        $this->command->info('✅ Sample rooms created');
    }
}
