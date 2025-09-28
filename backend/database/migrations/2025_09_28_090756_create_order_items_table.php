<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create("order_items", function (Blueprint $table) {
            $table->id();
            $table->foreignId("order_id")->constrained()->onDelete("cascade");
            $table
                ->foreignId("medication_id")
                ->constrained()
                ->onDelete("cascade");
            $table->integer("quantity")->default(1);
            $table->decimal("unit_price", 8, 2);
            $table->decimal("total_price", 10, 2);
            $table->text("dosage_instructions")->nullable();
            $table->text("pharmacist_notes")->nullable();
            $table->boolean("substitution_allowed")->default(false);
            $table
                ->foreignId("substituted_medication_id")
                ->nullable()
                ->constrained("medications")
                ->onDelete("set null");
            $table->string("substitution_reason")->nullable();
            $table->boolean("is_fulfilled")->default(false);
            $table->timestamp("fulfilled_at")->nullable();
            $table
                ->foreignId("fulfilled_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->timestamps();

            // Indexes
            $table->index(["order_id", "medication_id"]);
            $table->index("is_fulfilled");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("order_items");
    }
};
