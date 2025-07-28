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
        Schema::table('tenants', function (Blueprint $table) {
            // Add suspension tracking fields
            $table->timestamp('suspended_at')->nullable()->after('end_date');
            $table->text('suspension_reason')->nullable()->after('suspended_at');
            $table->timestamp('reactivated_at')->nullable()->after('suspension_reason');
            
            // Add indexes for performance
            $table->index(['status', 'suspended_at'], 'tenants_status_suspended_at_index');
            $table->index('suspended_at', 'tenants_suspended_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            // Drop indexes
            $table->dropIndex('tenants_status_suspended_at_index');
            $table->dropIndex('tenants_suspended_at_index');
            
            // Drop columns
            $table->dropColumn([
                'suspended_at',
                'suspension_reason',
                'reactivated_at'
            ]);
        });
    }
};