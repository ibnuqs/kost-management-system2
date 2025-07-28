<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('iot_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 100)->unique();
            $table->string('device_name');
            $table->enum('device_type', ['door_lock', 'card_scanner', 'rfid_reader']);
            $table->unsignedBigInteger('room_id')->nullable();
            $table->enum('status', ['online', 'offline'])->default('offline');
            $table->json('device_info')->nullable();
            $table->timestamp('last_seen')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            
            // Indexes (device_id sudah unique di atas, tidak perlu index lagi)
            $table->index('room_id');
            $table->index('status');
            $table->index('device_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('iot_devices');
    }
};