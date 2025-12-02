<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class IndexPaymentsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         return [
        'citizen_id'  => 'nullable|exists:citizens,id',
        'payment_type'=> 'nullable|in:property_tax,water_bill,electricity_bill,waste_management,other',
        'status'      => 'nullable|in:pending,completed,failed,refunded',
        'date'        => 'nullable|date',
        'date_from'   => 'nullable|date',
        'date_to'     => 'nullable|date',
        'sort_by'     => 'nullable|in:id,citizen_id,payment_type,status,date,created_at',
        'sort_order'  => 'nullable|in:asc,desc',
        'per_page'    => 'nullable|integer|min:1'
    ];
    }
}
