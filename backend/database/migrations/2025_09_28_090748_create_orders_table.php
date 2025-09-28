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
        Schema::create("orders", function (Blueprint $table) {
            $table->id();
            $table->string("order_number")->unique();
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table
                ->foreignId("pharmacy_id")
                ->nullable()
                ->constrained()
                ->onDelete("set null");
            $table
                ->enum("status", [
                    "pending",
                    "confirmed",
                    "preparing",
                    "ready",
                    "completed",
                    "cancelled",
                ])
                ->default("pending");
            $table
                ->enum("type", ["online", "prescription", "walk_in"])
                ->default("online");
            $table->decimal("subtotal", 10, 2)->default(0);
            $table->decimal("tax_amount", 10, 2)->default(0);
            $table->decimal("discount_amount", 10, 2)->default(0);
            $table->decimal("total_amount", 10, 2)->default(0);
            $table->string("currency", 3)->default("DZD");
            $table->text("notes")->nullable();
            $table->text("pharmacy_notes")->nullable();
            $table->json("delivery_address")->nullable();
            $table
                ->enum("delivery_method", ["pickup", "delivery"])
                ->default("pickup");
            $table->decimal("delivery_fee", 8, 2)->default(0);
            $table->timestamp("estimated_ready_at")->nullable();
            $table->timestamp("ready_at")->nullable();
            $table->timestamp("completed_at")->nullable();
            $table->timestamp("cancelled_at")->nullable();
            $table->string("cancellation_reason")->nullable();
            $table
                ->foreignId("cancelled_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table
                ->foreignId("processed_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->boolean("requires_prescription")->default(false);
            $table->boolean("prescription_verified")->default(false);
            $table->timestamp("prescription_verified_at")->nullable();
            $table
                ->foreignId("prescription_verified_by")
                ->nullable()
                ->constrained("users")
                ->onDelete("set null");
            $table->timestamps();

            // Indexes
            $table->index(["user_id", "status"]);
            $table->index(["pharmacy_id", "status"]);
            $table->index(["status", "created_at"]);
            $table->index("order_number");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists("orders");
    }
};
