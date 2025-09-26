<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Laravel\Scout\Searchable;

class Pharmacy extends Model
{
    use HasFactory, SoftDeletes, LogsActivity, Searchable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'license_number',
        'registration_number',
        'phone',
        'email',
        'website',
        'address_street',
        'address_city',
        'address_state',
        'address_postal_code',
        'address_country',
        'latitude',
        'longitude',
        'operating_hours',
        'services',
        'specializations',
        'accepts_insurance',
        'insurance_networks',
        'delivery_available',
        'delivery_radius',
        'delivery_fee',
        'pickup_available',
        'drive_through_available',
        'wheelchair_accessible',
        'languages_spoken',
        'pharmacist_in_charge',
        'total_staff_count',
        'smart_shelves_enabled',
        'iot_integration_active',
        'temperature_monitoring',
        'humidity_monitoring',
        'automated_inventory',
        'fifo_system_enabled',
        'ai_recommendations_enabled',
        'prescription_verification_system',
        'insurance_auto_processing',
        'government_reporting_enabled',
        'vitalls_integration',
        'rating',
        'review_count',
        'total_prescriptions_filled',
        'total_orders_processed',
        'average_wait_time',
        'customer_satisfaction_score',
        'quality_score',
        'compliance_score',
        'last_inspection_date',
        'next_inspection_due',
        'certification_status',
        'certifications',
        'is_active',
        'is_verified',
        'is_24_hours',
        'emergency_services',
        'created_by',
        'updated_by'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'operating_hours' => 'array',
        'services' => 'array',
        'specializations' => 'array',
        'insurance_networks' => 'array',
        'languages_spoken' => 'array',
        'certifications' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'delivery_fee' => 'decimal:2',
        'delivery_radius' => 'decimal:2',
        'rating' => 'decimal:2',
        'average_wait_time' => 'decimal:2',
        'customer_satisfaction_score' => 'decimal:2',
        'quality_score' => 'decimal:2',
        'compliance_score' => 'decimal:2',
        'last_inspection_date' => 'date',
        'next_inspection_due' => 'date',
        'accepts_insurance' => 'boolean',
        'delivery_available' => 'boolean',
        'pickup_available' => 'boolean',
        'drive_through_available' => 'boolean',
        'wheelchair_accessible' => 'boolean',
        'smart_shelves_enabled' => 'boolean',
        'iot_integration_active' => 'boolean',
        'temperature_monitoring' => 'boolean',
        'humidity_monitoring' => 'boolean',
        'automated_inventory' => 'boolean',
        'fifo_system_enabled' => 'boolean',
        'ai_recommendations_enabled' => 'boolean',
        'prescription_verification_system' => 'boolean',
        'insurance_auto_processing' => 'boolean',
        'government_reporting_enabled' => 'boolean',
        'vitalls_integration' => 'boolean',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'is_24_hours' => 'boolean',
        'emergency_services' => 'boolean',
    ];

    /**
     * Pharmacy services
     */
    public const SERVICES = [
        'prescription_filling' => 'Prescription Filling',
        'medication_counseling' => 'Medication Counseling',
        'health_screening' => 'Health Screening',
        'vaccinations' => 'Vaccinations',
        'delivery' => 'Delivery Service',
        'consultation' => 'Pharmacist Consultation',
        'compounding' => 'Medication Compounding',
        'medication_synchronization' => 'Medication Synchronization',
        'adherence_packaging' => 'Adherence Packaging',
        'blood_pressure_monitoring' => 'Blood Pressure Monitoring',
        'diabetes_management' => 'Diabetes Management',
        'smoking_cessation' => 'Smoking Cessation Programs',
        'weight_management' => 'Weight Management',
        'travel_medicine' => 'Travel Medicine',
        'veterinary_pharmacy' => 'Veterinary Pharmacy'
    ];

    /**
     * Pharmacy specializations
     */
    public const SPECIALIZATIONS = [
        'retail' => 'Retail Pharmacy',
        'clinical' => 'Clinical Pharmacy',
        'hospital' => 'Hospital Pharmacy',
        'compounding' => 'Compounding Pharmacy',
        'specialty' => 'Specialty Pharmacy',
        'oncology' => 'Oncology Pharmacy',
        'pediatric' => 'Pediatric Pharmacy',
        'geriatric' => 'Geriatric Pharmacy',
        'psychiatric' => 'Psychiatric Pharmacy',
        'veterinary' => 'Veterinary Pharmacy',
        'long_term_care' => 'Long-Term Care Pharmacy',
        'mail_order' => 'Mail Order Pharmacy'
    ];

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name', 'license_number', 'phone', 'email',
                'is_active', 'is_verified', 'rating'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address_city' => $this->address_city,
            'address_state' => $this->address_state,
            'services' => $this->services,
            'specializations' => $this->specializations,
            'is_active' => $this->is_active,
        ];
    }

    /**
     * Get the creator of this pharmacy
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the last updater of this pharmacy
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the pharmacist in charge
     */
    public function pharmacistInCharge()
    {
        return $this->belongsTo(User::class, 'pharmacist_in_charge');
    }

    /**
     * Get all staff members
     */
    public function staff()
    {
        return $this->belongsToMany(User::class, 'pharmacy_staff')
            ->withPivot(['role', 'is_active', 'hired_at', 'salary', 'permissions'])
            ->withTimestamps();
    }

    /**
     * Get active staff members
     */
    public function activeStaff()
    {
        return $this->staff()->wherePivot('is_active', true);
    }

    /**
     * Get pharmacists
     */
    public function pharmacists()
    {
        return $this->staff()->wherePivot('role', 'pharmacist');
    }

    /**
     * Get pharmacy technicians
     */
    public function technicians()
    {
        return $this->staff()->wherePivot('role', 'technician');
    }

    /**
     * Get smart shelves
     */
    public function smartShelves()
    {
        return $this->hasMany(SmartShelf::class);
    }

    /**
     * Get active smart shelves
     */
    public function activeShelves()
    {
        return $this->smartShelves()->where('status', 'active');
    }

    /**
     * Get pharmacy inventory
     */
    public function inventory()
    {
        return $this->hasMany(PharmacyInventory::class);
    }

    /**
     * Get available inventory
     */
    public function availableInventory()
    {
        return $this->inventory()->where('is_active', true)->where('stock', '>', 0);
    }

    /**
     * Get prescriptions processed at this pharmacy
     */
    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }

    /**
     * Get orders processed at this pharmacy
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get AI insights for this pharmacy
     */
    public function aiInsights()
    {
        return $this->hasMany(AIInsight::class);
    }

    /**
     * Get IoT sensor readings
     */
    public function sensorReadings()
    {
        return $this->hasManyThrough(SensorReading::class, SmartShelf::class);
    }

    /**
     * Get recent sensor readings
     */
    public function recentSensorReadings()
    {
        return $this->sensorReadings()
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get pharmacy reviews
     */
    public function reviews()
    {
        return $this->hasMany(PharmacyReview::class);
    }

    /**
     * Get insurance claims processed
     */
    public function insuranceClaims()
    {
        return $this->hasMany(InsuranceClaim::class);
    }

    /**
     * Get notifications for this pharmacy
     */
    public function notifications()
    {
        return $this->hasMany(PharmacyNotification::class);
    }

    /**
     * Scope to get active pharmacies
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get verified pharmacies
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope to get 24-hour pharmacies
     */
    public function scope24Hours($query)
    {
        return $query->where('is_24_hours', true);
    }

    /**
     * Scope to get pharmacies with delivery
     */
    public function scopeWithDelivery($query)
    {
        return $query->where('delivery_available', true);
    }

    /**
     * Scope to get smart pharmacies
     */
    public function scopeSmart($query)
    {
        return $query->where('smart_shelves_enabled', true)
                     ->where('iot_integration_active', true);
    }

    /**
     * Scope to get pharmacies within radius
     */
    public function scopeWithinRadius($query, $latitude, $longitude, $radius = 10)
    {
        return $query->selectRaw(
            "*,
            ( 6371 * acos( cos( radians(?) ) *
            cos( radians( latitude ) ) *
            cos( radians( longitude ) - radians(?) ) +
            sin( radians(?) ) *
            sin( radians( latitude ) ) ) ) AS distance",
            [$latitude, $longitude, $latitude]
        )->having('distance', '<', $radius);
    }

    /**
     * Scope to filter by service
     */
    public function scopeWithService($query, string $service)
    {
        return $query->whereJsonContains('services', $service);
    }

    /**
     * Scope to filter by specialization
     */
    public function scopeWithSpecialization($query, string $specialization)
    {
        return $query->whereJsonContains('specializations', $specialization);
    }

    /**
     * Get the full address
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address_street,
            $this->address_city,
            $this->address_state,
            $this->address_postal_code,
            $this->address_country
        ]);

        return implode(', ', $parts);
    }

    /**
     * Check if pharmacy is currently open
     */
    public function isCurrentlyOpen(): bool
    {
        if ($this->is_24_hours) {
            return true;
        }

        if (empty($this->operating_hours)) {
            return false;
        }

        $currentDay = strtolower(now()->format('l'));
        $currentTime = now()->format('H:i');

        $todayHours = collect($this->operating_hours)
            ->firstWhere('day', $currentDay);

        if (!$todayHours || $todayHours['is_closed'] ?? false) {
            return false;
        }

        return $currentTime >= $todayHours['open_time'] &&
               $currentTime <= $todayHours['close_time'];
    }

    /**
     * Get distance from coordinates
     */
    public function getDistanceFrom(float $latitude, float $longitude): float
    {
        $earthRadius = 6371; // km

        $latFrom = deg2rad($latitude);
        $lonFrom = deg2rad($longitude);
        $latTo = deg2rad($this->latitude);
        $lonTo = deg2rad($this->longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($latFrom) * cos($latTo) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Check if medication is available
     */
    public function hasMedicationInStock(int $medicationId, int $quantity = 1): bool
    {
        $inventory = $this->inventory()
            ->where('medication_id', $medicationId)
            ->where('is_active', true)
            ->first();

        return $inventory && $inventory->stock >= $quantity;
    }

    /**
     * Get total inventory value
     */
    public function getTotalInventoryValue(): float
    {
        return $this->inventory()
            ->join('medications', 'pharmacy_inventories.medication_id', '=', 'medications.id')
            ->selectRaw('SUM(pharmacy_inventories.stock * medications.price) as total')
            ->value('total') ?? 0;
    }

    /**
     * Get low stock medications count
     */
    public function getLowStockCount(): int
    {
        return $this->inventory()
            ->whereRaw('stock <= min_stock')
            ->count();
    }

    /**
     * Get expiring medications count
     */
    public function getExpiringMedicationsCount(int $days = 30): int
    {
        return $this->inventory()
            ->join('medications', 'pharmacy_inventories.medication_id', '=', 'medications.id')
            ->where('medications.expiry_date', '<=', now()->addDays($days))
            ->count();
    }

    /**
     * Get average rating
     */
    public function getAverageRating(): float
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    /**
     * Update pharmacy statistics
     */
    public function updateStatistics(): void
    {
        $this->update([
            'rating' => $this->getAverageRating(),
            'review_count' => $this->reviews()->count(),
        ]);
    }

    /**
     * Check if pharmacy has smart features enabled
     */
    public function hasSmartFeatures(): bool
    {
        return $this->smart_shelves_enabled &&
               $this->iot_integration_active &&
               $this->ai_recommendations_enabled;
    }

    /**
     * Get pharmacy efficiency score
     */
    public function getEfficiencyScore(): float
    {
        $factors = [
            'smart_features' => $this->hasSmartFeatures() ? 25 : 0,
            'automation' => $this->automated_inventory ? 15 : 0,
            'fifo_system' => $this->fifo_system_enabled ? 15 : 0,
            'wait_time' => max(0, 20 - ($this->average_wait_time ?? 20)),
            'satisfaction' => ($this->customer_satisfaction_score ?? 0) * 0.25,
        ];

        return array_sum($factors);
    }
}
