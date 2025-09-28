<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'medication_id',
        'last_ordered',
        'times_ordered',
    ];

    protected $casts = [
        'last_ordered' => 'datetime',
        'times_ordered' => 'integer',
    ];

    /**
     * Get the user that owns the favorite.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the medication for the favorite.
     */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }

    /**
     * Increment the times ordered counter.
     */
    public function incrementTimesOrdered(): void
    {
        $this->increment('times_ordered');
        $this->update(['last_ordered' => now()]);
    }

    /**
     * Get formatted last ordered date.
     */
    public function getFormattedLastOrderedAttribute(): ?string
    {
        return $this->last_ordered ? $this->last_ordered->format('M j, Y') : null;
    }
}
