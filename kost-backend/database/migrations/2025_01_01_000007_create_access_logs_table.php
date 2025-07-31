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
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('room_id')->nullable()->constrained()->onDelete('set null');
            $table->string('rfid_uid', 50);
            $table->string('device_id', 100)->nullable();
            $table->boolean('access_granted')->default(true);
            $table->string('reason')->nullable();
            $table->timestamp('accessed_at')->useCurrent();

            // Indexes for performance
            $table->index('room_id');
            $table->index(['user_id', 'accessed_at']);
            $table->index('rfid_uid');
            $table->index('device_id');
            $table->index('access_granted');
            $table->index('accessed_at');
            $table->index(['device_id', 'accessed_at']);
            $table->index(['room_id', 'access_granted']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};
