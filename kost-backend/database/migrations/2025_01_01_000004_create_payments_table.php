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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('order_id', 100)->unique();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('payment_month', 10)->nullable(); // Format: 2025-07
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'paid', 'overdue', 'expired', 'cancelled'])->default('pending');

            // Generation tracking
            $table->enum('generation_type', ['auto', 'manual'])->default('auto');
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description')->nullable();
            $table->foreignId('regenerated_from')->nullable()->constrained('payments')->onDelete('set null');

            // Payment details
            $table->string('payment_method', 50)->nullable();
            $table->string('snap_token')->nullable();
            $table->timestamp('snap_token_created_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->text('notes')->nullable();

            // Receipt tracking
            $table->string('receipt_path')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('tenant_id');
            $table->index('status');
            $table->index('payment_month');
            $table->index(['tenant_id', 'payment_month']);
            $table->index(['tenant_id', 'status']);
            $table->index('snap_token_created_at');
            $table->index('paid_at');
            $table->index('expired_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
