<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminRegisterRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasAnyRole(['admin', 'hr_manager']);
    }

    public function rules()
    {
        return [
            // User fields
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:admin,finance_officer,urban_planner,hr_manager,clerk',
            'status' => 'string|in:active,inactive,suspended|nullable',
            
            // Employee fields
            'department' => 'required_unless:role,citizen|string|in:finance,it,hr,planning,public_services',
            'position' => 'required_unless:role,citizen|string|max:255',
            'hire_date' => 'required_unless:role,citizen|date|before_or_equal:today',
            'salary' => 'required_unless:role,citizen|numeric|min:0',
            
            
        ];
    }

    public function messages()
    {
        return [
            'role.in' => 'Invalid role selected.',
            'department.in' => 'Invalid department selected.',
            'email.unique' => 'This email is already registered.',
            '*.required' => 'The :attribute field is required.',
            '*.required_unless' => 'The :attribute field is required for employees.'
        ];
    }
}
