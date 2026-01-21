<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'urban_planner']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'department' => 'required|string|in:finance,it,hr,planning,public_services',
            'budget' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => ['sometimes', 'string', Rule::in([
                'planned', 
                'in_progress', 
                'completed', 
                'on_hold', 
                'cancelled'
            ])]
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
            'end_date.after' => 'The end date must be after the start date.',
            'status.in' => 'The selected status is invalid. Valid statuses are: planned, in_progress, completed, on_hold, cancelled.'
        ];
    }
}
