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
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['prescription', 'lab_result', 'imaging', 'consultation', 'vaccination', 'other']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->json('metadata')->nullable();
            $table->string('provider_id')->nullable();
            $table->string('provider_name')->nullable();
            $table->date('record_date');
            $table->boolean('is_private')->default(true);
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'record_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};
