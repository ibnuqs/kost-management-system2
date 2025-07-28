<?php
// 2024_01_01_000004_create_payments_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 100);
            $table->unsignedBigInteger('tenant_id');
            $table->string('payment_month', 10)->nullable(); // Format: YYYY-MM
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->string('snap_token')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            
            // Indexes
            $table->unique('order_id');
            $table->index('tenant_id', 'idx_payments_tenant');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};