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
        // Alter the enum to include 'archived' status
        DB::statement("ALTER TABLE rooms MODIFY COLUMN status ENUM('available', 'occupied', 'maintenance', 'archived') DEFAULT 'available'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if there are any archived rooms
        $archivedCount = DB::table('rooms')->where('status', 'archived')->count();
        
        if ($archivedCount > 0) {
            // Update archived rooms to maintenance before removing the enum value
            DB::table('rooms')->where('status', 'archived')->update(['status' => 'maintenance']);
        }
        
        // Revert the enum back to original
        DB::statement("ALTER TABLE rooms MODIFY COLUMN status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available'");
    }
};