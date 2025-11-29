<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => 'required|string|min:8|confirmed',
            'national_id' => 'required_if:role,citizen|string|size:14|unique:citizens,national_id',
            'address' => 'required_if:role,citizen|string|max:500',
            'contact' => 'required_if:role,citizen|string|max:20',
            'date_of_birth' => ['required', 'date', 'before:today', 'after:1900-01-01'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'national_id.regex' => 'The national ID must be exactly 14 digits.',
            'date_of_birth.before' => 'The date of birth must be before today.',
            'date_of_birth.after' => 'The date of birth must be after 1900-01-01.',
        ];
    }
}
