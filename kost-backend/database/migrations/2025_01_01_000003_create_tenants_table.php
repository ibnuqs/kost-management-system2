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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_code')->nullable()->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->decimal('monthly_rent', 12, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();

            // Suspension fields
            $table->timestamp('suspended_at')->nullable();
            $table->text('suspension_reason')->nullable();
            $table->timestamp('reactivated_at')->nullable();

            $table->enum('status', ['active', 'moved_out', 'suspended'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index(['user_id', 'status']);
            $table->index(['room_id', 'status']);
            $table->index('start_date');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
