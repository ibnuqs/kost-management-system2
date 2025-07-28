<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to check if status column allows 'reserved' 
        // Since SQLite doesn't have ENUM, this is more of a documentation migration
        
        // Add comment to document the allowed statuses
        DB::statement("
            -- Room status values:
            -- 'available' - Room is available for new tenant
            -- 'occupied' - Room is currently occupied by active tenant  
            -- 'maintenance' - Room is under maintenance
            -- 'reserved' - Room is temporarily reserved (24 hours)
            -- 'archived' - Room is archived and not in use
        ");
        
        // For future reference, if we were using MySQL/PostgreSQL:
        // ALTER TABLE rooms MODIFY COLUMN status ENUM('available', 'occupied', 'maintenance', 'reserved', 'archived') NOT NULL DEFAULT 'available';
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // For SQLite, no changes needed as it doesn't enforce ENUM constraints
        // This migration is primarily for documentation
    }
};