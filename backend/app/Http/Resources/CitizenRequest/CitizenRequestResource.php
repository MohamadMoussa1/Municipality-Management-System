<?php

namespace App\Http\Resources\CitizenRequest;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitizenRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray($request)
{
    return [
        'id' => $this->id,
        'type' => $this->type,
        'status' => $this->status,
        'submission_date' => $this->submission_date,
        'completion_date' => $this->completion_date,
    ];
}
}
