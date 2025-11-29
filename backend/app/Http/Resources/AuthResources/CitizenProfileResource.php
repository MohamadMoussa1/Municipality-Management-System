<?php

namespace App\Http\Resources\AuthResources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitizenProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'type' => 'citizen',
            'national_id' => $this->national_id,
            'address' => $this->address,
            'contact' => $this->contact,
            'date_of_birth' => $this->date_of_birth->format('Y-m-d'),
        ];
    }
}
