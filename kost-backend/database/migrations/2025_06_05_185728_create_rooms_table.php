<?php
// 2024_01_01_000002_create_rooms_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 10);
            $table->string('room_name');
            $table->decimal('monthly_price', 12, 2);
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Indexes
            $table->unique('room_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};