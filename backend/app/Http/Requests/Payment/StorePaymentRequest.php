<?php
namespace App\Http\Requests\Payment;
use Illuminate\Foundation\Http\FormRequest;
class StorePaymentRequest extends FormRequest
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
            'citizen_id'   => 'required|exists:citizens,id',
            'amount'       => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:property_tax,water_bill,electricity_bill,waste_management,other',
           
            
        ];
    }
    public function messages(): array
    {
         return [
            'citizen_id.required' => 'Citizen ID is required',
            'citizen_id.exists' => 'The selected citizen does not exist',
            'amount.required' => 'Amount is required',
            'amount.numeric' => 'Amount must be a valid number',
            'amount.min' => 'Amount must be greater than 0',
            'payment_type.required' => 'Payment type is required',
            'payment_type.in' => 'Invalid payment type',
            'date.required' => 'Date is required',
            'date.date' => 'Date must be a valid date',
            'date.date_format' => 'Date must be in format Y-m-d',
        ];
    }
}
