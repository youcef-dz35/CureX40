<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'pharmacy_id',
        'status',
        'payment_status',
        'subtotal',
        'tax_amount',
        'shipping_cost',
        'total_amount',
        'currency',
        'shipping_address',
        'billing_address',
        'notes',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the pharmacy that handles the order.
     */
    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    /**
     * Get the order items for the order.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Alias for orderItems for backward compatibility.
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the medications for the order.
     */
    public function medications()
    {
        return $this->belongsToMany(Medication::class, 'order_items')
                    ->withPivot('quantity', 'unit_price', 'total_price', 'notes')
                    ->withTimestamps();
    }

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
        } while (self::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    /**
     * Check if the order can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Check if the order can be updated.
     */
    public function canBeUpdated(): bool
    {
        return !in_array($this->status, ['delivered', 'cancelled', 'refunded']);
    }

    /**
     * Get the total items count.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->orderItems()->sum('quantity');
    }

    /**
     * Scope for user orders.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for pharmacy orders.
     */
    public function scopeForPharmacy($query, $pharmacyId)
    {
        return $query->where('pharmacy_id', $pharmacyId);
    }

    /**
     * Scope for orders by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}