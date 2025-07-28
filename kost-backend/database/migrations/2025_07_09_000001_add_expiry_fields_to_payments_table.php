<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add expiry handling fields
            $table->timestamp('snap_token_created_at')->nullable()->after('snap_token');
            $table->timestamp('expired_at')->nullable()->after('paid_at');
            $table->string('failure_reason')->nullable()->after('expired_at');
            $table->text('notes')->nullable()->after('failure_reason');
            
            // Add expired status to enum
            $table->enum('status', ['pending', 'paid', 'overdue', 'expired', 'cancelled'])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['snap_token_created_at', 'expired_at', 'failure_reason', 'notes']);
            
            // Revert status enum
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending')->change();
        });
    }
};