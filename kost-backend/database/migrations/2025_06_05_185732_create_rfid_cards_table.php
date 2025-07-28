<?php
// 2024_01_01_000005_create_rfid_cards_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rfid_cards', function (Blueprint $table) {
            $table->id();
            $table->string('uid', 50)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('room_id')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('set null');
            
            // Indexes (uid sudah unique di atas, tidak perlu duplikasi)
            $table->index('user_id');
            $table->index('room_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rfid_cards');
    }
};
