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
        Schema::create('iot_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 100)->unique();
            $table->string('device_name');
            $table->enum('device_type', ['door_lock', 'card_scanner', 'rfid_reader'])->nullable();
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['online', 'offline'])->default('offline');

            // Device info stored as JSON
            $table->json('device_info')->nullable();

            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('device_type');
            $table->index(['room_id', 'device_type']);
            $table->index('last_seen');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iot_devices');
    }
};
