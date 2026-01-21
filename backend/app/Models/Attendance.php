<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $table = 'attendance';
    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'hours_worked',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'hours_worked' => 'decimal:2',
    ];

    // Relationship to Employee
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
