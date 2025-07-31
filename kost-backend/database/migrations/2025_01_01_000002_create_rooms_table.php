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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 10)->unique();
            $table->string('room_name');
            $table->decimal('monthly_price', 12, 2);
            $table->enum('status', ['available', 'occupied', 'maintenance', 'archived', 'reserved'])->default('available');

            // Archive fields
            $table->timestamp('archived_at')->nullable();
            $table->string('archived_reason')->nullable();

            // Reservation fields
            $table->timestamp('reserved_at')->nullable();
            $table->timestamp('reserved_until')->nullable();
            $table->foreignId('reserved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reserved_reason')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('monthly_price');
            $table->index(['status', 'monthly_price']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
