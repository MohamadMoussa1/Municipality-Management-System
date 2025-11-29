<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminRegisterRequest extends FormRequest
{
    public function authorize()
    {
        return $this->user()?->hasRole('admin');
    }

    public function rules()
    {
        return [
            // User fields
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:admin,finance_officer,urban_planner,hr_manager,clerk,citizen',
            'status' => 'string|in:active,inactive,suspended|nullable',
            
            // Employee fields
            'department' => 'required_unless:role,citizen|string|in:finance,it,hr,planning,public_services',
            'position' => 'required_unless:role,citizen|string|max:255',
            'hire_date' => 'required_unless:role,citizen|date|before_or_equal:today',
            'salary' => 'required_unless:role,citizen|numeric|min:0',
            
            // Citizen fields
            'national_id' => 'required_if:role,citizen|string|size:14|unique:citizens,national_id',
            'address' => 'required_if:role,citizen|string|max:500',
            'contact' => 'required_if:role,citizen|string|max:20',
            'date_of_birth' => 'required_if:role,citizen|date|before:today'
        ];
    }

    public function messages()
    {
        return [
            'role.in' => 'Invalid role selected.',
            'department.in' => 'Invalid department selected.',
            'email.unique' => 'This email is already registered.',
            'national_id.unique' => 'This national ID is already registered.',
            '*.required' => 'The :attribute field is required.',
            '*.required_if' => 'The :attribute field is required for citizens.',
            '*.required_unless' => 'The :attribute field is required for employees.'
        ];
    }
}
