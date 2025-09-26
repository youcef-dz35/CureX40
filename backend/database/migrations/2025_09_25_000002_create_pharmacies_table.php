<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pharmacies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('license_number')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('address_street')->nullable();
            $table->string('address_city')->nullable();
            $table->string('address_state')->nullable();
            $table->string('address_postal_code')->nullable();
            $table->string('address_country')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('operating_hours')->nullable();
            $table->json('services')->nullable();
            $table->json('specializations')->nullable();
            $table->boolean('accepts_insurance')->default(false);
            $table->json('insurance_networks')->nullable();
            $table->boolean('delivery_available')->default(false);
            $table->decimal('delivery_radius', 8, 2)->nullable();
            $table->decimal('delivery_fee', 10, 2)->nullable();
            $table->boolean('pickup_available')->default(false);
            $table->boolean('drive_through_available')->default(false);
            $table->boolean('wheelchair_accessible')->default(false);
            $table->json('languages_spoken')->nullable();
            $table->foreignId('pharmacist_in_charge')->nullable()->constrained('users');
            $table->integer('total_staff_count')->default(0);
            $table->boolean('smart_shelves_enabled')->default(false);
            $table->boolean('iot_integration_active')->default(false);
            $table->boolean('temperature_monitoring')->default(false);
            $table->boolean('humidity_monitoring')->default(false);
            $table->boolean('automated_inventory')->default(false);
            $table->boolean('fifo_system_enabled')->default(false);
            $table->boolean('ai_recommendations_enabled')->default(false);
            $table->boolean('prescription_verification_system')->default(false);
            $table->boolean('insurance_auto_processing')->default(false);
            $table->boolean('government_reporting_enabled')->default(false);
            $table->boolean('vitalls_integration')->default(false);
            $table->decimal('rating', 4, 2)->nullable();
            $table->integer('review_count')->default(0);
            $table->integer('total_prescriptions_filled')->default(0);
            $table->integer('total_orders_processed')->default(0);
            $table->decimal('average_wait_time', 5, 2)->nullable();
            $table->decimal('customer_satisfaction_score', 5, 2)->nullable();
            $table->decimal('quality_score', 5, 2)->nullable();
            $table->decimal('compliance_score', 5, 2)->nullable();
            $table->date('last_inspection_date')->nullable();
            $table->date('next_inspection_due')->nullable();
            $table->string('certification_status')->nullable();
            $table->json('certifications')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_24_hours')->default(false);
            $table->boolean('emergency_services')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pharmacies');
    }
};


