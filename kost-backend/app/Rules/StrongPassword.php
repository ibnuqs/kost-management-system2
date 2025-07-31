<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = $value;
        $errors = [];

        // Minimum length check
        if (strlen($password) < 8) {
            $errors[] = 'at least 8 characters';
        }

        // Contains lowercase letter
        if (! preg_match('/[a-z]/', $password)) {
            $errors[] = 'one lowercase letter';
        }

        // Contains uppercase letter - DISABLED
        // if (!preg_match('/[A-Z]/', $password)) {
        //     $errors[] = 'one uppercase letter';
        // }

        // Contains digit - DISABLED
        // if (!preg_match('/\d/', $password)) {
        //     $errors[] = 'one number';
        // }

        // Contains special character
        if (! preg_match('/[@$!%*?&]/', $password)) {
            $errors[] = 'one special character (@$!%*?&)';
        }

        // Check for common weak patterns
        $weakPatterns = [
            '/^(.)\1+$/',                    // All same character
            '/^(012|123|234|345|456|567|678|789|890)/',  // Sequential numbers
            '/^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i',  // Sequential letters
        ];

        foreach ($weakPatterns as $pattern) {
            if (preg_match($pattern, $password)) {
                $errors[] = 'avoid common patterns';
                break;
            }
        }

        // Check against common passwords
        $commonPasswords = [
            'password', '12345678', 'qwerty123', 'admin123',
            'welcome123', 'password123', '123456789',
        ];

        if (in_array(strtolower($password), $commonPasswords)) {
            $errors[] = 'avoid common passwords';
        }

        if (! empty($errors)) {
            $message = 'The :attribute must contain '.implode(', ', $errors).'.';
            $fail($message);
        }
    }
}
