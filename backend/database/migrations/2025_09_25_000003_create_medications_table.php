<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('brand')->nullable();
            $table->text('description')->nullable();
            $table->string('dosage')->nullable();
            $table->string('form')->nullable();
            $table->string('category')->nullable();
            $table->json('active_ingredients')->nullable();
            $table->json('contraindications')->nullable();
            $table->json('side_effects')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->integer('max_stock')->nullable();
            $table->boolean('requires_prescription')->default(false);
            $table->json('images')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('manufacturer_contact')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('batch_number')->nullable();
            $table->string('barcode')->nullable();
            $table->string('ndc_number')->nullable();
            $table->string('rxcui')->nullable();
            $table->string('storage_conditions')->nullable();
            $table->decimal('storage_temperature_min', 5, 1)->nullable();
            $table->decimal('storage_temperature_max', 5, 1)->nullable();
            $table->decimal('storage_humidity_max', 5, 1)->nullable();
            $table->string('therapeutic_class')->nullable();
            $table->string('drug_class')->nullable();
            $table->string('controlled_substance_schedule')->nullable();
            $table->string('pregnancy_category')->nullable();
            $table->string('lactation_safety')->nullable();
            $table->text('pediatric_dosing')->nullable();
            $table->text('geriatric_considerations')->nullable();
            $table->text('renal_dosing_adjustment')->nullable();
            $table->text('hepatic_dosing_adjustment')->nullable();
            $table->json('drug_interactions')->nullable();
            $table->json('food_interactions')->nullable();
            $table->json('monitoring_parameters')->nullable();
            $table->string('administration_route')->nullable();
            $table->string('onset_of_action')->nullable();
            $table->string('duration_of_action')->nullable();
            $table->string('half_life')->nullable();
            $table->string('metabolism')->nullable();
            $table->string('excretion')->nullable();
            $table->decimal('bioavailability', 5, 2)->nullable();
            $table->decimal('protein_binding', 5, 2)->nullable();
            $table->decimal('molecular_weight', 10, 3)->nullable();
            $table->string('molecular_formula')->nullable();
            $table->date('approval_date')->nullable();
            $table->boolean('black_box_warning')->default(false);
            $table->json('special_populations')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);
            $table->boolean('is_otc')->default(false);
            $table->boolean('requires_refrigeration')->default(false);
            $table->boolean('requires_freezing')->default(false);
            $table->boolean('light_sensitive')->default(false);
            $table->boolean('moisture_sensitive')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};


