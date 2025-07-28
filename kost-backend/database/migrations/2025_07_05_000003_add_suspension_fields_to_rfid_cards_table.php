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
        Schema::table('rfid_cards', function (Blueprint $table) {
            // Add suspension tracking for RFID cards
            $table->timestamp('suspended_at')->nullable()->after('status');
            $table->string('suspension_reason')->nullable()->after('suspended_at');
            
            // Add index for access control queries
            $table->index(['status', 'suspended_at'], 'rfid_cards_status_suspended_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rfid_cards', function (Blueprint $table) {
            // Drop index
            $table->dropIndex('rfid_cards_status_suspended_at_index');
            
            // Drop columns
            $table->dropColumn([
                'suspended_at',
                'suspension_reason'
            ]);
        });
    }
};