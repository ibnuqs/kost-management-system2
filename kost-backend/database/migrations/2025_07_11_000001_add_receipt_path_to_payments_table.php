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
        Schema::table('payments', function (Blueprint $table) {
            $table->string('receipt_path')->nullable()->after('notes');
            $table->string('receipt_number')->nullable()->after('receipt_path');
            $table->timestamp('receipt_generated_at')->nullable()->after('receipt_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['receipt_path', 'receipt_number', 'receipt_generated_at']);
        });
    }
};