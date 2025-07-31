<?php

namespace Database\Seeders;

use App\Models\IoTDevice;
use App\Models\Room;
use Illuminate\Database\Seeder;

class IoTDeviceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rooms = Room::where('status', '!=', 'maintenance')->take(5)->get();

        $devices = [
            [
                'device_id' => 'ESP32-RFID-01',
                'device_name' => 'Smart Lock A01',
                'device_type' => 'rfid_reader',
                'room_id' => $rooms->get(0)?->id,
                'status' => 'online',
                'device_info' => [
                    'wifi_connected' => true,
                    'mqtt_connected' => true,
                    'rfid_ready' => true,
                    'device_ip' => '192.168.1.101',
                    'uptime' => '2h 30m',
                    'firmware_version' => 'v2.1.0',
                    'door_status' => 'closed',
                ],
                'last_seen' => now(),
            ],
            [
                'device_id' => 'ESP32-RFID-02',
                'device_name' => 'Smart Lock A02',
                'device_type' => 'rfid_reader',
                'room_id' => $rooms->get(1)?->id,
                'status' => 'online',
                'device_info' => [
                    'wifi_connected' => true,
                    'mqtt_connected' => true,
                    'rfid_ready' => true,
                    'device_ip' => '192.168.1.102',
                    'uptime' => '1h 45m',
                    'firmware_version' => 'v2.1.0',
                    'door_status' => 'closed',
                ],
                'last_seen' => now(),
            ],
            [
                'device_id' => 'ESP32-RFID-03',
                'device_name' => 'Smart Lock B01',
                'device_type' => 'rfid_reader',
                'room_id' => $rooms->get(2)?->id,
                'status' => 'offline',
                'device_info' => [
                    'wifi_connected' => false,
                    'mqtt_connected' => false,
                    'rfid_ready' => false,
                    'device_ip' => null,
                    'uptime' => null,
                    'firmware_version' => 'v2.0.5',
                    'door_status' => 'unknown',
                ],
                'last_seen' => now()->subHours(2),
            ],
            [
                'device_id' => 'ESP32-SCANNER-01',
                'device_name' => 'Main Gate Scanner',
                'device_type' => 'card_scanner',
                'room_id' => null,
                'status' => 'online',
                'device_info' => [
                    'wifi_connected' => true,
                    'mqtt_connected' => true,
                    'rfid_ready' => true,
                    'device_ip' => '192.168.1.200',
                    'uptime' => '5h 12m',
                    'firmware_version' => 'v2.1.0',
                ],
                'last_seen' => now(),
            ],
        ];

        foreach ($devices as $device) {
            IoTDevice::create($device);
        }

        $this->command->info('✅ IoT devices created');
    }
}
