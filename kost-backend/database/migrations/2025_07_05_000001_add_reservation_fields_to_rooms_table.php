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
        Schema::table('rooms', function (Blueprint $table) {
            // Add reservation fields
            $table->timestamp('reserved_at')->nullable()->after('archived_reason');
            $table->timestamp('reserved_until')->nullable()->after('reserved_at');
            $table->unsignedBigInteger('reserved_by')->nullable()->after('reserved_until');
            $table->string('reserved_reason')->nullable()->after('reserved_by');
            
            // Add index for reservation queries
            $table->index(['status', 'reserved_until'], 'rooms_status_reserved_until_index');
            $table->index('reserved_by', 'rooms_reserved_by_index');
            
            // Add foreign key constraint for reserved_by (user who made reservation)
            $table->foreign('reserved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['reserved_by']);
            
            // Drop indexes
            $table->dropIndex('rooms_status_reserved_until_index');
            $table->dropIndex('rooms_reserved_by_index');
            
            // Drop columns
            $table->dropColumn([
                'reserved_at',
                'reserved_until', 
                'reserved_by',
                'reserved_reason'
            ]);
        });
    }
};