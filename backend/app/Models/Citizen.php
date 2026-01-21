<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Citizen extends Model
{
    protected $fillable = [
        'user_id',
        'national_id',
        'address',
        'contact',
        'date_of_birth',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // Relationship to User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relationship to Requests
    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    // Relationship to Permits
    public function permits(): HasMany
    {
        return $this->hasMany(Permit::class, 'applicant_id');
    }

    // Relationship to Payments
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
