<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'citizen_id',
        'amount',
        'payment_type',
        'date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
    ];

    // Relationship to Citizen
    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }
}
