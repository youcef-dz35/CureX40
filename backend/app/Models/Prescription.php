<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Prescription extends Model
{
    use HasFactory;

        protected $fillable = [
            'prescription_number',
            'user_id',
            'doctor_id',
            'pharmacy_id',
            'patient_name',
            'patient_dob',
            'patient_phone',
            'diagnosis',
            'status',
            'prescribed_date',
            'expiry_date',
            'refills_allowed',
            'refills_used',
            'is_emergency',
            'is_controlled',
            'special_instructions',
            'doctor_name',
            'doctor_license',
            'doctor_phone',
            'doctor_address',
            'verified_at',
            'verified_by',
            'verification_notes',
            'filled_at',
            'filled_by',
            'cancelled_at',
            'cancellation_reason',
            'cancelled_by',
            'uploaded_files',
        ];

    protected $casts = [
        'patient_dob' => 'date',
        'prescribed_date' => 'date',
        'expiry_date' => 'date',
        'uploaded_files' => 'array',
        'verified_at' => 'datetime',
        'dispensed_at' => 'datetime',
    ];

    /**
     * Get the user that owns the prescription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the doctor who prescribed the medication.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Get the pharmacy that dispensed the prescription.
     */
    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the user who verified the prescription.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the user who dispensed the prescription.
     */
    public function dispensedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dispensed_by');
    }

    /**
     * Get the orders for this prescription.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the prescription items for this prescription.
     */
    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class);
    }

    /**
     * Get remaining refills for this prescription.
     */
    public function getRemainingRefills(): int
    {
        return max(0, ($this->refills_remaining ?? 0) - ($this->refills_used ?? 0));
    }

    /**
     * Get total items count.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Get filled items count.
     */
    public function getFilledItemsAttribute(): int
    {
        return $this->items()->where('status', PrescriptionItem::STATUS_FILLED)->count();
    }

    /**
     * Get fill percentage.
     */
    public function getFillPercentageAttribute(): float
    {
        $total = $this->total_items;
        if ($total === 0) return 0;
        
        return ($this->filled_items / $total) * 100;
    }

    /**
     * Get days until expiry.
     */
    public function getDaysUntilExpiryAttribute(): int
    {
        if (!$this->expiry_date) return 0;
        
        return max(0, now()->diffInDays($this->expiry_date, false));
    }

    /**
     * Check if prescription needs urgent attention.
     */
    public function needsUrgentAttention(): bool
    {
        return $this->days_until_expiry <= 3 || 
               $this->status === 'expired' || 
               $this->is_emergency;
    }

    /**
     * Generate a unique prescription number.
     */
    public static function generatePrescriptionNumber(): string
    {
        do {
            $prescriptionNumber = 'RX-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
        } while (self::where('prescription_number', $prescriptionNumber)->exists());

        return $prescriptionNumber;
    }

    /**
     * Generate a verification code.
     */
    public function generateVerificationCode(): string
    {
        $code = strtoupper(Str::random(8));
        $this->update(['verification_code' => $code]);
        return $code;
    }

    /**
     * Check if the prescription is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiry_date < now()->toDateString();
    }

    /**
     * Check if the prescription can be dispensed.
     */
    public function canBeDispensed(): bool
    {
        return $this->status === 'verified' && !$this->isExpired();
    }

    /**
     * Check if the prescription can be verified.
     */
    public function canBeVerified(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Get the patient's age.
     */
    public function getPatientAgeAttribute(): int
    {
        return $this->patient_birth_date->age;
    }

    /**
     * Get the formatted prescription date.
     */
    public function getFormattedPrescriptionDateAttribute(): string
    {
        return $this->prescription_date->format('d/m/Y');
    }

    /**
     * Get the formatted expiry date.
     */
    public function getFormattedExpiryDateAttribute(): string
    {
        return $this->expiry_date->format('d/m/Y');
    }

    /**
     * Get the status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'En attente',
            'verified' => 'Vérifiée',
            'dispensed' => 'Délivrée',
            'expired' => 'Expirée',
            'cancelled' => 'Annulée',
            default => 'Inconnu'
        };
    }

    /**
     * Get the type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'digital' => 'Numérique',
            'uploaded' => 'Téléchargée',
            'manual' => 'Manuelle',
            default => 'Inconnu'
        };
    }

    /**
     * Scope for user prescriptions.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for pharmacy prescriptions.
     */
    public function scopeForPharmacy($query, $pharmacyId)
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    /**
     * Scope for prescriptions by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active prescriptions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'expired')
                    ->where('status', '!=', 'cancelled')
                    ->where('expiry_date', '>=', now()->toDateString());
    }

    /**
     * Scope for expired prescriptions.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now()->toDateString());
    }
}