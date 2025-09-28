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
        Schema::create("prescriptions", function (Blueprint $table) {
            $table->id();
            $table->string("prescription_number")->unique();
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table
                ->foreignId("doctor_id")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table
                ->foreignId("pharmacy_id")
                ->nullable()
                ->constrained()
                ->onDelete("set null");
            $table->string("doctor_name");
            $table->string("doctor_license")->nullable();
            $table->string("doctor_phone")->nullable();
            $table->text("doctor_address")->nullable();
            $table->string("patient_name");
            $table->date("patient_dob")->nullable();
            $table->string("patient_phone")->nullable();
            $table->text("diagnosis")->nullable();
            $table
                ->enum("status", [
                    "pending",
                    "verified",
                    "partially_filled",
                    "filled",
                    "expired",
                    "cancelled",
                ])
                ->default("pending");
            $table->date("prescribed_date");
            $table->date("expiry_date")->nullable();
            $table->integer("refills_allowed")->default(0);
            $table->integer("refills_used")->default(0);
            $table->boolean("is_emergency")->default(false);
            $table->boolean("is_controlled")->default(false);
            $table->text("special_instructions")->nullable();
            $table->json("uploaded_files")->nullable();
            $table->timestamp("verified_at")->nullable();
            $table
                ->foreignId("verified_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->text("verification_notes")->nullable();
            $table->timestamp("filled_at")->nullable();
            $table
                ->foreignId("filled_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->timestamp("cancelled_at")->nullable();
            $table->string("cancellation_reason")->nullable();
            $table
                ->foreignId("cancelled_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->timestamps();

            // Indexes
            $table->index(["user_id", "status"]);
            $table->index(["pharmacy_id", "status"]);
            $table->index(["status", "expiry_date"]);
            $table->index("prescription_number");
            $table->index("prescribed_date");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("prescriptions");
    }
};
