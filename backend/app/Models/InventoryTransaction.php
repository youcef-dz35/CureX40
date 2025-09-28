<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'medication_id',
        'pharmacy_id',
        'user_id',
        'type',
        'quantity_change',
        'quantity_before',
        'quantity_after',
        'unit_cost',
        'total_cost',
        'reference_type',
        'reference_id',
        'notes',
        'expiry_date',
        'batch_number',
        'supplier',
    ];

    protected $casts = [
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'expiry_date' => 'date',
    ];

    /**
     * Get the medication for this transaction.
     */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    /**
     * Get the pharmacy for this transaction.
     */
    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the user who made this transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'in' => 'Stock In',
            'out' => 'Stock Out',
            'adjustment' => 'Adjustment',
            'transfer' => 'Transfer',
            'expired' => 'Expired',
            'damaged' => 'Damaged',
            'returned' => 'Returned',
            default => 'Unknown'
        };
    }

    /**
     * Scope for transactions by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for transactions by pharmacy.
     */
    public function scopeForPharmacy($query, $pharmacyId)
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    /**
     * Scope for transactions by medication.
     */
    public function scopeForMedication($query, $medicationId)
    {
        return $query->where('medication_id', $medicationId);
    }

    /**
     * Scope for transactions by date range.
     */
    public function scopeByDateRange($query, $fromDate, $toDate)
    {
        return $query->whereBetween('created_at', [$fromDate, $toDate]);
    }

    /**
     * Create a stock in transaction.
     */
    public static function createStockIn($medicationId, $quantity, $unitCost = null, $options = [])
    {
        $medication = Medication::findOrFail($medicationId);
        $quantityBefore = $medication->stock_quantity;
        $quantityAfter = $quantityBefore + $quantity;
        $totalCost = $unitCost ? $unitCost * $quantity : null;

        $transaction = self::create([
            'medication_id' => $medicationId,
            'pharmacy_id' => $options['pharmacy_id'] ?? null,
            'user_id' => $options['user_id'] ?? null,
            'type' => 'in',
            'quantity_change' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'unit_cost' => $unitCost,
            'total_cost' => $totalCost,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'notes' => $options['notes'] ?? null,
            'expiry_date' => $options['expiry_date'] ?? null,
            'batch_number' => $options['batch_number'] ?? null,
            'supplier' => $options['supplier'] ?? null,
        ]);

        // Update medication stock
        $medication->update(['stock_quantity' => $quantityAfter]);

        return $transaction;
    }

    /**
     * Create a stock out transaction.
     */
    public static function createStockOut($medicationId, $quantity, $options = [])
    {
        $medication = Medication::findOrFail($medicationId);
        $quantityBefore = $medication->stock_quantity;
        
        if ($quantityBefore < $quantity) {
            throw new \Exception("Insufficient stock. Available: {$quantityBefore}, Requested: {$quantity}");
        }

        $quantityAfter = $quantityBefore - $quantity;

        $transaction = self::create([
            'medication_id' => $medicationId,
            'pharmacy_id' => $options['pharmacy_id'] ?? null,
            'user_id' => $options['user_id'] ?? null,
            'type' => 'out',
            'quantity_change' => -$quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'notes' => $options['notes'] ?? null,
        ]);

        // Update medication stock
        $medication->update(['stock_quantity' => $quantityAfter]);

        return $transaction;
    }

    /**
     * Create a stock adjustment transaction.
     */
    public static function createAdjustment($medicationId, $newQuantity, $options = [])
    {
        $medication = Medication::findOrFail($medicationId);
        $quantityBefore = $medication->stock_quantity;
        $quantityChange = $newQuantity - $quantityBefore;

        $transaction = self::create([
            'medication_id' => $medicationId,
            'pharmacy_id' => $options['pharmacy_id'] ?? null,
            'user_id' => $options['user_id'] ?? null,
            'type' => 'adjustment',
            'quantity_change' => $quantityChange,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $newQuantity,
            'reference_type' => $options['reference_type'] ?? null,
            'reference_id' => $options['reference_id'] ?? null,
            'notes' => $options['notes'] ?? null,
        ]);

        // Update medication stock
        $medication->update(['stock_quantity' => $newQuantity]);

        return $transaction;
    }
}
