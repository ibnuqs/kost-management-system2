<?php
// 2024_01_01_000007_create_access_logs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('room_id')->nullable();
            $table->string('rfid_uid', 50);
            $table->string('device_id', 100)->nullable();
            $table->boolean('access_granted')->default(true);
            $table->string('reason')->nullable();
            $table->timestamp('accessed_at')->useCurrent();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            
            // Indexes
            $table->index('room_id');
            $table->index(['user_id', 'accessed_at'], 'idx_access_user_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access_logs');
    }
};