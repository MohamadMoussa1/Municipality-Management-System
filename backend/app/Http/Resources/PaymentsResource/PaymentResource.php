<?php

namespace App\Http\Resources\PaymentsResource;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'citizen_id'   => $this->citizen_id,
            'citizen'      => $this->whenLoaded('citizen', function () { return [
                'id' => $this->citizen->id,
                'national_id' => $this->citizen->national_id ?? null,
                'contact' => $this->citizen->contact ?? null,
            ];}),
            'amount'       => (string) $this->amount,
            'payment_type' => $this->payment_type,
            'date'         => $this->date?->toDateString(),
            'status'       => $this->status,
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}

