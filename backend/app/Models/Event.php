<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'title',
        'description',
        'date',
        'target_audience',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
