<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add device_info column if it doesn't exist
        if (!Schema::hasColumn('iot_devices', 'device_info')) {
            Schema::table('iot_devices', function (Blueprint $table) {
                $table->json('device_info')->nullable()->after('status');
            });
        }
        
        // Update device_type enum to include rfid_reader
        // Note: In MySQL, we need to drop and recreate enum
        DB::statement("ALTER TABLE iot_devices MODIFY device_type ENUM('door_lock', 'card_scanner', 'rfid_reader')");
    }

    public function down(): void
    {
        // Remove device_info column
        if (Schema::hasColumn('iot_devices', 'device_info')) {
            Schema::table('iot_devices', function (Blueprint $table) {
                $table->dropColumn('device_info');
            });
        }
        
        // Revert device_type enum
        DB::statement("ALTER TABLE iot_devices MODIFY device_type ENUM('door_lock', 'card_scanner')");
    }
};