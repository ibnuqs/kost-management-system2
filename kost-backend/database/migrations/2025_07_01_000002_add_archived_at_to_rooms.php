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
            $table->timestamp('archived_at')->nullable()->after('status');
            $table->string('archived_reason')->nullable()->after('archived_at');
            
            // Add index for better performance when filtering archived rooms
            $table->index('archived_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropIndex(['archived_at']);
            $table->dropColumn(['archived_at', 'archived_reason']);
        });
    }
};