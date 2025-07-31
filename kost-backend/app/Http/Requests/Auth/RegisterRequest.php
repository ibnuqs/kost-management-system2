<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;
use App\Rules\IndonesianPhone;
use App\Rules\StrongPassword;

class RegisterRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                'regex:/^[a-zA-Z\s]+$/', // Only letters and spaces
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:users,phone',
                new IndonesianPhone,
            ],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                new StrongPassword,
            ],
            'role' => [
                'sometimes',
                'string',
                'in:admin,tenant',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'name.required' => 'Full name is required for registration.',
            'name.min' => 'Name must be at least 2 characters long.',
            'name.regex' => 'Name can only contain letters and spaces.',
            'email.required' => 'Email address is required for registration.',
            'email.unique' => 'This email address is already registered.',
            'phone.required' => 'Phone number is required for registration.',
            'phone.unique' => 'This phone number is already registered.',
            'password.required' => 'Password is required for registration.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Additional custom validation logic can go here
            if ($this->role === 'admin' && ! $this->user()?->isAdmin()) {
                $validator->errors()->add('role', 'You are not authorized to create admin accounts.');
            }
        });
    }
}
