<?php

namespace App\Http\Requests\citizenRequest;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequestRequest extends FormRequest
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
            'type' => 'required|in:residency_certificate,birth_certificate,death_certificate,marriage_certificate,garbage_collection,street_repair,public_complaint',
            
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Request type is required.',
            'type.in' => 'Invalid request type.',
        ];
    }
}
