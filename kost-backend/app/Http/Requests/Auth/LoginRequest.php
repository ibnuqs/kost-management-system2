<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;
use App\Rules\StrongPassword;

class LoginRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:255'
            ],
            'password' => [
                'required',
                'string',
                'min:8'
            ],
            'remember' => [
                'sometimes',
                'boolean'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return array_merge(parent::messages(), [
            'email.required' => 'Email address is required to log in.',
            'email.email' => 'Please enter a valid email address.',
            'password.required' => 'Password is required to log in.',
            'password.min' => 'Password must be at least 8 characters long.',
        ]);
    }
}