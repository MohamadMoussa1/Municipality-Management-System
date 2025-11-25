<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Request extends Model
{
    protected $fillable = [
        'citizen_id',
        'type',
        'status',
        'submission_date',
        'completion_date',
    ];

    protected $casts = [
        'submission_date' => 'datetime',
        'completion_date' => 'datetime',
    ];

    // Relationship to Citizen
    public function citizen(): BelongsTo
    {
        return $this->belongsTo(Citizen::class);
    }
}
