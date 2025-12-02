<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['admin', 'urban_planner']);
    }

    public function rules(): array
    {
         return [
            'title' => 'required|string|max:255',
            'assignee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'sometimes|in:todo,in_progress,in_review,completed,blocked'
        ];
    }

    public function messages(): array
    {
       return [
            'assignee_id.exists' => 'The selected employee does not exist.',
            'end_date.after_or_equal' => 'The end date must be after or equal to the start date.',
            'status.in' => 'The status must be one of: todo, in_progress, in_review, completed, blocked'
        ];
    }
}
