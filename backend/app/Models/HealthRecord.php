<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'metadata',
        'provider_id',
        'provider_name',
        'record_date',
        'is_private'
    ];

    protected $casts = [
        'metadata' => 'array',
        'record_date' => 'date',
        'is_private' => 'boolean'
    ];

    /**
     * Get the user that owns the health record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for user health records.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for records by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}
