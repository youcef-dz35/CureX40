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
        Schema::create("prescription_items", function (Blueprint $table) {
            $table->id();
            $table
                ->foreignId("prescription_id")
                ->constrained()
                ->onDelete("cascade");
            $table
                ->foreignId("medication_id")
                ->constrained()
                ->onDelete("cascade");
            $table->string("medication_name");
            $table->string("strength")->nullable();
            $table->string("dosage_form")->nullable();
            $table->text("dosage_instructions");
            $table->string("frequency");
            $table->integer("quantity_prescribed");
            $table->integer("quantity_dispensed")->default(0);
            $table->integer("days_supply")->nullable();
            $table->decimal("unit_price", 8, 2)->nullable();
            $table->decimal("total_price", 10, 2)->nullable();
            $table->boolean("generic_substitution_allowed")->default(true);
            $table
                ->foreignId("substituted_medication_id")
                ->nullable()
                ->constrained("medications")
                ->onDelete("set null");
            $table->string("substitution_reason")->nullable();
            $table->text("special_instructions")->nullable();
            $table->text("pharmacist_notes")->nullable();
            $table
                ->enum("status", [
                    "pending",
                    "partially_filled",
                    "filled",
                    "refused",
                    "out_of_stock",
                ])
                ->default("pending");
            $table->timestamp("filled_at")->nullable();
            $table
                ->foreignId("filled_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->timestamps();

            // Indexes
            $table->index(["prescription_id", "medication_id"]);
            $table->index("status");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("prescription_items");
    }
};
