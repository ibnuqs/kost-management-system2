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
            // Track payment generation type and source
            $table->enum('generation_type', ['auto', 'manual'])->default('auto')->after('status');
            $table->unsignedBigInteger('generated_by_user_id')->nullable()->after('generation_type');
            $table->text('description')->nullable()->after('generated_by_user_id');
            
            // Add foreign key constraint
            $table->foreign('generated_by_user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['generated_by_user_id']);
            $table->dropColumn(['generation_type', 'generated_by_user_id', 'description']);
        });
    }
};