<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name', 100)->nullable()->after('id');
            $table->string('last_name', 100)->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar')->nullable()->after('phone');
            $table->date('date_of_birth')->nullable()->after('avatar');
            $table->string('gender')->nullable()->after('date_of_birth');
            $table->string('address')->nullable()->after('gender');
            $table->string('emergency_contact_name')->nullable()->after('address');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->string('insurance_provider')->nullable()->after('emergency_contact_phone');
            $table->string('insurance_policy_number')->nullable()->after('insurance_provider');
            $table->string('medical_record_number')->nullable()->after('insurance_policy_number');
            $table->string('preferred_language', 10)->nullable()->after('medical_record_number');
            $table->string('timezone', 64)->nullable()->after('preferred_language');
            $table->boolean('two_factor_enabled')->default(false)->after('remember_token');
            $table->boolean('biometric_enabled')->default(false)->after('two_factor_enabled');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->boolean('is_active')->default(true)->after('phone_verified_at');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->timestamp('last_activity_at')->nullable()->after('last_login_at');
            $table->text('two_factor_recovery_codes')->nullable()->after('last_activity_at');
            $table->text('two_factor_secret')->nullable()->after('two_factor_recovery_codes');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn([
                'first_name','last_name','phone','avatar','date_of_birth','gender','address',
                'emergency_contact_name','emergency_contact_phone','insurance_provider','insurance_policy_number',
                'medical_record_number','preferred_language','timezone','two_factor_enabled','biometric_enabled',
                'phone_verified_at','is_active','last_login_at','last_activity_at','two_factor_recovery_codes','two_factor_secret'
            ]);
        });
    }
};


