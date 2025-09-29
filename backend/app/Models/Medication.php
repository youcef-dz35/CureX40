<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Models\InventoryTransaction;
// use Laravel\Scout\Searchable; // Temporarily disabled

class Medication extends Model
{
    use HasFactory, SoftDeletes, LogsActivity; // Searchable temporarily disabled

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        "name",
        "generic_name",
        "brand",
        "description",
        "dosage",
        "form",
        "category",
        "active_ingredients",
        "contraindications",
        "side_effects",
        "price",
        "currency",
        "stock",
        "min_stock",
        "max_stock",
        "requires_prescription",
        "images",
        "manufacturer",
        "manufacturer_contact",
        "expiry_date",
        "batch_number",
        "barcode",
        "ndc_number",
        "rxcui",
        "storage_conditions",
        "storage_temperature_min",
        "storage_temperature_max",
        "storage_humidity_max",
        "therapeutic_class",
        "drug_class",
        "controlled_substance_schedule",
        "pregnancy_category",
        "lactation_safety",
        "pediatric_dosing",
        "geriatric_considerations",
        "renal_dosing_adjustment",
        "hepatic_dosing_adjustment",
        "drug_interactions",
        "food_interactions",
        "monitoring_parameters",
        "administration_route",
        "onset_of_action",
        "duration_of_action",
        "half_life",
        "metabolism",
        "excretion",
        "bioavailability",
        "protein_binding",
        "molecular_weight",
        "molecular_formula",
        "approval_date",
        "black_box_warning",
        "special_populations",
        "is_active",
        "is_available",
        "is_otc",
        "requires_refrigeration",
        "requires_freezing",
        "light_sensitive",
        "moisture_sensitive",
        "created_by",
        "updated_by",
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        "active_ingredients" => "array",
        "contraindications" => "array",
        "side_effects" => "array",
        "images" => "array",
        "drug_interactions" => "array",
        "food_interactions" => "array",
        "monitoring_parameters" => "array",
        "special_populations" => "array",
        "expiry_date" => "date",
        "approval_date" => "date",
        "price" => "decimal:2",
        "storage_temperature_min" => "decimal:1",
        "storage_temperature_max" => "decimal:1",
        "storage_humidity_max" => "decimal:1",
        "molecular_weight" => "decimal:3",
        "bioavailability" => "decimal:2",
        "protein_binding" => "decimal:2",
        "requires_prescription" => "boolean",
        "is_active" => "boolean",
        "is_available" => "boolean",
        "is_otc" => "boolean",
        "requires_refrigeration" => "boolean",
        "requires_freezing" => "boolean",
        "light_sensitive" => "boolean",
        "moisture_sensitive" => "boolean",
    ];

    /**
     * Medication forms
     */
    public const FORMS = [
        "tablet" => "Tablet",
        "capsule" => "Capsule",
        "liquid" => "Liquid",
        "injection" => "Injection",
        "cream" => "Cream",
        "ointment" => "Ointment",
        "drops" => "Drops",
        "inhaler" => "Inhaler",
        "patch" => "Patch",
        "suppository" => "Suppository",
        "gel" => "Gel",
        "lotion" => "Lotion",
        "spray" => "Spray",
        "powder" => "Powder",
    ];

    /**
     * Medication categories
     */
    public const CATEGORIES = [
        "analgesics" => "Analgesics",
        "antibiotics" => "Antibiotics",
        "antihistamines" => "Antihistamines",
        "antacids" => "Antacids",
        "vitamins" => "Vitamins & Supplements",
        "cardiovascular" => "Cardiovascular",
        "respiratory" => "Respiratory",
        "dermatological" => "Dermatological",
        "gastrointestinal" => "Gastrointestinal",
        "neurological" => "Neurological",
        "hormonal" => "Hormonal",
        "other" => "Other",
    ];

    /**
     * Administration routes
     */
    public const ROUTES = [
        "oral" => "Oral",
        "intravenous" => "Intravenous",
        "intramuscular" => "Intramuscular",
        "subcutaneous" => "Subcutaneous",
        "topical" => "Topical",
        "inhalation" => "Inhalation",
        "rectal" => "Rectal",
        "vaginal" => "Vaginal",
        "ophthalmic" => "Ophthalmic",
        "otic" => "Otic",
        "nasal" => "Nasal",
        "transdermal" => "Transdermal",
    ];

    /**
     * Activity log options
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                "name",
                "generic_name",
                "brand",
                "price",
                "stock",
                "is_active",
                "is_available",
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
            "id" => $this->id,
            "name" => $this->name,
            "generic_name" => $this->generic_name,
            "brand" => $this->brand,
            "description" => $this->description,
            "category" => $this->category,
            "form" => $this->form,
            "active_ingredients" => $this->active_ingredients,
            "manufacturer" => $this->manufacturer,
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return "id";
    }

    /**
     * Get the creator of this medication
     */
    public function creator()
    {
        return $this->belongsTo(User::class, "created_by");
    }

    /**
     * Get the last updater of this medication
     */
    public function updater()
    {
        return $this->belongsTo(User::class, "updated_by");
    }

    /**
     * Get the pharmacy inventories for this medication
     */
    public function pharmacyInventories()
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    /**
     * Get the smart shelf locations for this medication
     */
    public function shelfMedications()
    {
        return $this->hasMany(ShelfMedication::class);
    }

    /**
     * Get the prescription medications that use this medication
     */
    public function prescriptionMedications()
    {
        return $this->hasMany(PrescriptionMedication::class);
    }

    /**
     * Get the order items for this medication
     */
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the AI recommendations where this medication is original
     */
    public function originalRecommendations()
    {
        return $this->hasMany(
            MolecularRecommendation::class,
            "original_medication_id",
        );
    }

    /**
     * Get the AI recommendations where this medication is recommended
     */
    public function recommendedAlternatives()
    {
        return $this->hasMany(
            MolecularRecommendation::class,
            "recommended_medication_id",
        );
    }

    /**
     * Get the supply chain alerts for this medication
     */
    public function supplyChainAlerts()
    {
        return $this->hasMany(SupplyChainAlert::class);
    }

    /**
     * Get the drug interactions for this medication
     */
    public function drugInteractions()
    {
        return $this->hasMany(
            DrugInteraction::class,
            "medication_a_id",
        )->orWhere("medication_b_id", $this->id);
    }

    /**
     * Scope to get active medications
     */
    public function scopeActive($query)
    {
        return $query->where("is_active", true);
    }

    /**
     * Scope to get available medications
     */
    public function scopeAvailable($query)
    {
        return $query->where("is_available", true)->where("stock", ">", 0);
    }

    /**
     * Scope to get prescription medications
     */
    public function scopeRequiresPrescription($query)
    {
        return $query->where("requires_prescription", true);
    }

    /**
     * Scope to get OTC medications
     */
    public function scopeOtc($query)
    {
        return $query->where("is_otc", true);
    }

    /**
     * Scope to get low stock medications
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw("stock <= min_stock");
    }

    /**
     * Scope to get expiring medications
     */
    public function scopeExpiringWithin($query, int $days = 30)
    {
        return $query->where("expiry_date", "<=", now()->addDays($days));
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where("category", $category);
    }

    /**
     * Scope to filter by form
     */
    public function scopeByForm($query, string $form)
    {
        return $query->where("form", $form);
    }

    /**
     * Check if medication is in stock
     */
    public function isInStock(): bool
    {
        return $this->stock > 0 && $this->is_available;
    }

    /**
     * Check if medication is low stock
     */
    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }

    /**
     * Check if medication is expiring soon
     */
    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expiry_date <= now()->addDays($days);
    }

    /**
     * Get medication availability across all pharmacies
     */
    public function getTotalAvailableStock(): int
    {
        return $this->pharmacyInventories()
            ->where("is_active", true)
            ->sum("stock");
    }

    /**
     * Get the main image URL
     */
    public function getMainImageAttribute(): ?string
    {
        if (empty($this->images)) {
            return null;
        }

        return is_array($this->images) ? $this->images[0] : $this->images;
    }

    /**
     * Format price with currency
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2) .
            " " .
            ($this->currency ?? "USD");
    }

    /**
     * Get stock status
     */
    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= 0) {
            return "out_of_stock";
        } elseif ($this->isLowStock()) {
            return "low_stock";
        } else {
            return "in_stock";
        }
    }

    /**
     * Get temperature range for storage
     */
    public function getTemperatureRangeAttribute(): ?string
    {
        if ($this->storage_temperature_min && $this->storage_temperature_max) {
            return "{$this->storage_temperature_min}°C - {$this->storage_temperature_max}°C";
        }

        return null;
    }

    /**
     * Check if medication requires special storage
     */
    public function requiresSpecialStorage(): bool
    {
        return $this->requires_refrigeration ||
            $this->requires_freezing ||
            $this->light_sensitive ||
            $this->moisture_sensitive;
    }
}
