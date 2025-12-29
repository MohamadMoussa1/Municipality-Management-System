<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
     protected $fillable = [
        'employee_id',
        'month',
        'base_salary',
        'deductions',
        'bonuses',
        'net_salary',
        'generated_by',
        'generated_at',
    ];
}
