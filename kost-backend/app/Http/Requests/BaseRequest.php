<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;

abstract class BaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Override in child classes as needed
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'timestamp' => now()->format('c')
            ], 422)
        );
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'phone' => 'phone number',
            'password' => 'password',
            'password_confirmation' => 'password confirmation',
            'current_password' => 'current password',
            'room_number' => 'room number',
            'monthly_rent' => 'monthly rent',
            'start_date' => 'start date',
            'end_date' => 'end date',
            'user_id' => 'user',
            'room_id' => 'room',
            'tenant_id' => 'tenant',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'required' => 'The :attribute field is required.',
            'email' => 'Please enter a valid email address.',
            'unique' => 'This :attribute is already taken.',
            'min' => 'The :attribute must be at least :min characters.',
            'max' => 'The :attribute may not be greater than :max characters.',
            'confirmed' => 'The :attribute confirmation does not match.',
            'numeric' => 'The :attribute must be a number.',
            'integer' => 'The :attribute must be an integer.',
            'boolean' => 'The :attribute field must be true or false.',
            'date' => 'The :attribute is not a valid date.',
            'after' => 'The :attribute must be a date after :date.',
            'before' => 'The :attribute must be a date before :date.',
            'in' => 'The selected :attribute is invalid.',
            'exists' => 'The selected :attribute is invalid.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Sanitize phone number
        if ($this->has('phone')) {
            $phone = $this->phone;
            // Remove spaces, dashes, and parentheses
            $phone = preg_replace('/[\s\-\(\)]/', '', $phone);
            // Convert +62 to 0
            if (str_starts_with($phone, '+62')) {
                $phone = '0' . substr($phone, 3);
            } elseif (str_starts_with($phone, '62')) {
                $phone = '0' . substr($phone, 2);
            }
            $this->merge(['phone' => $phone]);
        }

        // Sanitize name
        if ($this->has('name')) {
            $this->merge(['name' => trim($this->name)]);
        }

        // Sanitize email
        if ($this->has('email')) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
    }
}