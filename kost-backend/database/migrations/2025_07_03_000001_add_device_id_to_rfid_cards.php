<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rfid_cards', function (Blueprint $table) {
            $table->string('device_id', 100)->nullable()->after('room_id');
            $table->enum('access_type', ['room_only', 'all_rooms'])->default('room_only')->after('device_id');
            
            // Add index for device_id
            $table->index('device_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rfid_cards', function (Blueprint $table) {
            $table->dropIndex(['device_id']);
            $table->dropColumn(['device_id', 'access_type']);
        });
    }
};