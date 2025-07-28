<?php
// 2024_01_01_000003_create_tenants_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_code')->nullable();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('room_id');
            $table->decimal('monthly_rent', 12, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'moved_out', 'suspended'])->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
            
            // Indexes
            $table->unique('tenant_code');
            $table->index('user_id', 'idx_tenants_user');
            $table->index('tenant_code', 'idx_tenant_code');
            $table->index('status', 'idx_status');
            $table->index(['room_id', 'status'], 'idx_room_status');
            $table->index('start_date', 'idx_start_date');
            $table->index('end_date', 'idx_end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};