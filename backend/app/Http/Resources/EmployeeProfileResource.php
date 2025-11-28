<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'type' => 'employee',
            'department' => $this->department,
            'position' => $this->position,
            'hire_date' => $this->hire_date->format('Y-m-d'),
            'salary' => $this->salary
        ];
    }
}
