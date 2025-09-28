<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PrescriptionItem extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "prescription_id",
        "medication_id",
        "medication_name",
        "strength",
        "dosage_form",
        "dosage_instructions",
        "frequency",
        "quantity_prescribed",
        "quantity_dispensed",
        "days_supply",
        "unit_price",
        "total_price",
        "generic_substitution_allowed",
        "substituted_medication_id",
        "substitution_reason",
        "special_instructions",
        "pharmacist_notes",
        "status",
        "filled_at",
        "filled_by",
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        "quantity_prescribed" => "integer",
        "quantity_dispensed" => "integer",
        "days_supply" => "integer",
        "unit_price" => "decimal:2",
        "total_price" => "decimal:2",
        "generic_substitution_allowed" => "boolean",
        "filled_at" => "datetime",
    ];

    /**
     * Prescription item statuses
     */
    public const STATUS_PENDING = "pending";
    public const STATUS_PARTIALLY_FILLED = "partially_filled";
    public const STATUS_FILLED = "filled";
    public const STATUS_REFUSED = "refused";
    public const STATUS_OUT_OF_STOCK = "out_of_stock";

    public const STATUSES = [
        self::STATUS_PENDING => "Pending",
        self::STATUS_PARTIALLY_FILLED => "Partially Filled",
        self::STATUS_FILLED => "Filled",
        self::STATUS_REFUSED => "Refused",
        self::STATUS_OUT_OF_STOCK => "Out of Stock",
    ];

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                "quantity_prescribed",
                "quantity_dispensed",
                "status",
                "substituted_medication_id",
                "unit_price",
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($prescriptionItem) {
            if (
                empty($prescriptionItem->total_price) &&
                $prescriptionItem->unit_price
            ) {
                $prescriptionItem->total_price =
                    $prescriptionItem->unit_price *
                    $prescriptionItem->quantity_prescribed;
            }
        });

        static::updating(function ($prescriptionItem) {
            if (
                $prescriptionItem->isDirty([
                    "unit_price",
                    "quantity_prescribed",
                ])
            ) {
                $prescriptionItem->total_price =
                    $prescriptionItem->unit_price *
                    $prescriptionItem->quantity_prescribed;
            }
        });
    }

    /**
     * Get the prescription that owns this item
     */
    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    /**
     * Get the medication for this item
     */
    public function medication()
    {
        return $this->belongsTo(Medication::class);
    }

    /**
     * Get the substituted medication if any
     */
    public function substitutedMedication()
    {
        return $this->belongsTo(Medication::class, "substituted_medication_id");
    }

    /**
     * Get the user who filled this item
     */
    public function filledBy()
    {
        return $this->belongsTo(User::class, "filled_by");
    }

    /**
     * Scope to get filled items
     */
    public function scopeFilled($query)
    {
        return $query->where("status", self::STATUS_FILLED);
    }

    /**
     * Scope to get pending items
     */
    public function scopePending($query)
    {
        return $query->where("status", self::STATUS_PENDING);
    }

    /**
     * Scope to get partially filled items
     */
    public function scopePartiallyFilled($query)
    {
        return $query->where("status", self::STATUS_PARTIALLY_FILLED);
    }

    /**
     * Scope to get substituted items
     */
    public function scopeSubstituted($query)
    {
        return $query->whereNotNull("substituted_medication_id");
    }

    /**
     * Check if item has been substituted
     */
    public function isSubstituted(): bool
    {
        return !is_null($this->substituted_medication_id);
    }

    /**
     * Check if item is completely filled
     */
    public function isCompletelyFilled(): bool
    {
        return $this->status === self::STATUS_FILLED &&
            $this->quantity_dispensed >= $this->quantity_prescribed;
    }

    /**
     * Check if item is partially filled
     */
    public function isPartiallyFilled(): bool
    {
        return $this->quantity_dispensed > 0 &&
            $this->quantity_dispensed < $this->quantity_prescribed;
    }

    /**
     * Check if item can be filled
     */
    public function canBeFilled(): bool
    {
        return in_array($this->status, [
            self::STATUS_PENDING,
            self::STATUS_PARTIALLY_FILLED,
        ]) && $this->quantity_dispensed < $this->quantity_prescribed;
    }

    /**
     * Get remaining quantity to be filled
     */
    public function getRemainingQuantity(): int
    {
        return max(0, $this->quantity_prescribed - $this->quantity_dispensed);
    }

    /**
     * Get fill percentage
     */
    public function getFillPercentage(): float
    {
        if ($this->quantity_prescribed === 0) {
            return 0;
        }

        return ($this->quantity_dispensed / $this->quantity_prescribed) * 100;
    }

    /**
     * Get the actual medication (original or substituted)
     */
    public function getActualMedication()
    {
        return $this->isSubstituted()
            ? $this->substitutedMedication
            : $this->medication;
    }

    /**
     * Fill item with specified quantity
     */
    public function fillPrescription(int $quantity, User $pharmacist): bool
    {
        if (!$this->canBeFilled() || $quantity <= 0) {
            return false;
        }

        $maxQuantity = $this->getRemainingQuantity();
        $actualQuantity = min($quantity, $maxQuantity);

        $newTotalDispensed = $this->quantity_dispensed + $actualQuantity;

        $status =
            $newTotalDispensed >= $this->quantity_prescribed
                ? self::STATUS_FILLED
                : self::STATUS_PARTIALLY_FILLED;

        return $this->update([
            "quantity_dispensed" => $newTotalDispensed,
            "status" => $status,
            "filled_at" =>
                $status === self::STATUS_FILLED ? now() : $this->filled_at,
            "filled_by" => $pharmacist->id,
        ]);
    }

    /**
     * Add substitution to the item
     */
    public function addSubstitution(
        Medication $substituteMedication,
        string $reason,
        User $pharmacist,
    ): bool {
        if (
            !$this->generic_substitution_allowed ||
            $this->isCompletelyFilled()
        ) {
            return false;
        }

        return $this->update([
            "substituted_medication_id" => $substituteMedication->id,
            "substitution_reason" => $reason,
            "unit_price" => $substituteMedication->price,
            "total_price" =>
                $substituteMedication->price * $this->quantity_prescribed,
        ]);
    }

    /**
     * Mark item as refused
     */
    public function markAsRefused(string $reason, User $pharmacist): bool
    {
        return $this->update([
            "status" => self::STATUS_REFUSED,
            "pharmacist_notes" => $reason,
            "filled_by" => $pharmacist->id,
        ]);
    }

    /**
     * Mark item as out of stock
     */
    public function markAsOutOfStock(User $pharmacist): bool
    {
        return $this->update([
            "status" => self::STATUS_OUT_OF_STOCK,
            "filled_by" => $pharmacist->id,
        ]);
    }

    /**
     * Get status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Get formatted unit price
     */
    public function getFormattedUnitPriceAttribute(): string
    {
        return number_format($this->unit_price, 2) . " DZD";
    }

    /**
     * Get formatted total price
     */
    public function getFormattedTotalPriceAttribute(): string
    {
        return number_format($this->total_price, 2) . " DZD";
    }

    /**
     * Get medication display name
     */
    public function getMedicationDisplayNameAttribute(): string
    {
        $medication = $this->getActualMedication();
        return $medication ? $medication->name : $this->medication_name;
    }

    /**
     * Get substitution details
     */
    public function getSubstitutionDetailsAttribute(): ?array
    {
        if (!$this->isSubstituted()) {
            return null;
        }

        return [
            "original_medication" => $this->medication->name,
            "substituted_medication" => $this->substitutedMedication->name,
            "reason" => $this->substitution_reason,
            "price_difference" =>
                $this->substitutedMedication->price - $this->medication->price,
        ];
    }

    /**
     * Get dosage summary
     */
    public function getDosageSummaryAttribute(): string
    {
        $parts = array_filter([
            $this->strength,
            $this->dosage_form,
            $this->frequency,
        ]);

        return implode(" - ", $parts);
    }

    /**
     * Check if item requires special handling
     */
    public function requiresSpecialHandling(): bool
    {
        $medication = $this->getActualMedication();

        return ($medication && $medication->requiresSpecialStorage()) ||
            $this->isSubstituted() ||
            !empty($this->special_instructions);
    }

    /**
     * Get item summary
     */
    public function getSummaryAttribute(): array
    {
        return [
            "medication_name" => $this->medication_display_name,
            "strength" => $this->strength,
            "quantity_prescribed" => $this->quantity_prescribed,
            "quantity_dispensed" => $this->quantity_dispensed,
            "remaining_quantity" => $this->getRemainingQuantity(),
            "fill_percentage" => $this->getFillPercentage(),
            "status" => $this->status_label,
            "is_substituted" => $this->isSubstituted(),
            "requires_special_handling" => $this->requiresSpecialHandling(),
        ];
    }
}
