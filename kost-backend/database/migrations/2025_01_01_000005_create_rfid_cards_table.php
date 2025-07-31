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
        Schema::create('rfid_cards', function (Blueprint $table) {
            $table->id();
            $table->string('uid', 50)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
            $table->string('device_id', 100)->nullable(); // ESP32 device assignment
            $table->string('card_type', 20)->default('primary'); // primary, backup, temporary
            $table->enum('status', ['active', 'inactive'])->default('active');

            // Suspension fields
            $table->timestamp('suspended_at')->nullable();
            $table->string('suspension_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index(['user_id', 'status']);
            $table->index(['tenant_id', 'status']);
            $table->index('device_id');
            $table->index('card_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rfid_cards');
    }
};
