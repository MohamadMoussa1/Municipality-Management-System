<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type',
        'applicant_id',
        'status',
        'issue_date',
        'expiry_date',
        'related_documents',
    ];

    protected $casts = [
        'related_documents' => 'array',
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    // Relationship to Citizen (applicant)
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Citizen::class, 'applicant_id');
    }

    // Relationship to Document
    public function documents()
    {
        return Document::findMany($this->related_documents ?? []);
    }
}
