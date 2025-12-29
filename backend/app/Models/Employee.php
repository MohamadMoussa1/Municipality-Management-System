<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'user_id',
        'position',
        'department',
        'hire_date',
        'salary',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'salary' => 'decimal:2',
    ];

    // Relationship to User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relationship to Tasks (as assignee)
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    // Relationship to Attendance
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    // relationship to Leaves
    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }


}
