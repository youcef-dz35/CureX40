<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'avatar',
        'date_of_birth',
        'gender',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'insurance_provider',
        'insurance_policy_number',
        'medical_record_number',
        'preferred_language',
        'timezone',
        'two_factor_enabled',
        'biometric_enabled',
        'email_verified_at',
        'phone_verified_at',
        'is_active',
        'last_login_at',
        'last_activity_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'biometric_enabled' => 'boolean',
        'last_login_at' => 'datetime',
        'last_activity_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'email', 'phone', 'is_active'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if user is a patient
     */
    public function isPatient(): bool
    {
        return $this->hasRole('patient');
    }

    /**
     * Check if user is a pharmacist
     */
    public function isPharmacist(): bool
    {
        return $this->hasRole('pharmacist');
    }

    /**
     * Check if user is a government official
     */
    public function isGovernmentOfficial(): bool
    {
        return $this->hasRole('government_official');
    }

    /**
     * Check if user is an insurance provider
     */
    public function isInsuranceProvider(): bool
    {
        return $this->hasRole('insurance_provider');
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get the pharmacies associated with the user (for pharmacists)
     */
    public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class, 'pharmacy_staff')
            ->withPivot(['role', 'is_active', 'hired_at'])
            ->withTimestamps();
    }

    /**
     * Get the user's prescriptions (for patients)
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class, 'patient_id');
    }

    /**
     * Get the user's orders (for patients)
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'patient_id');
    }

    /**
     * Get the user's insurance claims (for patients)
     */
    public function insuranceClaims()
    {
        return $this->hasMany(InsuranceClaim::class, 'patient_id');
    }

    /**
     * Get the user's health vault (for patients)
     */
    public function healthVault()
    {
        return $this->hasOne(HealthVault::class, 'patient_id');
    }

    /**
     * Get the user's allergies (for patients)
     */
    public function allergies()
    {
        return $this->hasMany(Allergy::class, 'patient_id');
    }

    /**
     * Get the user's chronic conditions (for patients)
     */
    public function chronicConditions()
    {
        return $this->hasMany(ChronicCondition::class, 'patient_id');
    }

    /**
     * Get the user's vital signs (for patients)
     */
    public function vitalSigns()
    {
        return $this->hasMany(VitalSign::class, 'patient_id');
    }

    /**
     * Get notifications for this user
     */
    public function userNotifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    /**
     * Get the user's API tokens
     */
    public function apiTokens()
    {
        return $this->hasMany(PersonalAccessToken::class, 'tokenable_id')
            ->where('tokenable_type', self::class);
    }

    /**
     * Get the user's sessions
     */
    public function sessions()
    {
        return $this->hasMany(UserSession::class);
    }

    /**
     * Get the user's activity logs
     */
    public function activities()
    {
        return $this->hasMany(\Spatie\Activitylog\Models\Activity::class, 'causer_id')
            ->where('causer_type', self::class);
    }

    /**
     * Scope to get active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get verified users
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope to get users by role
     */
    public function scopeWithRole($query, string $role)
    {
        return $query->role($role);
    }

    /**
     * Check if user has two-factor authentication enabled
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled && !is_null($this->two_factor_secret);
    }

    /**
     * Generate a new two-factor recovery code
     */
    public function generateTwoFactorRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtolower(str_replace(['0', '1', 'o', 'i'], ['x', 'y', 'z', 'w'], substr(md5(random_bytes(16)), 0, 8)));
        }

        $this->two_factor_recovery_codes = encrypt(json_encode($codes));
        $this->save();

        return $codes;
    }

    /**
     * Update last activity timestamp
     */
    public function updateLastActivity(): void
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update([
            'last_login_at' => now(),
            'last_activity_at' => now(),
        ]);
    }
}
