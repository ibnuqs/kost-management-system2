<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IndonesianPhone implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Remove spaces, dashes, and parentheses
        $phone = preg_replace('/[\s\-\(\)]/', '', $value);
        
        // Check if it's a valid Indonesian phone number
        $patterns = [
            '/^0[0-9]{9,13}$/',           // 0xxx format (10-14 digits total)
            '/^\+62[0-9]{9,13}$/',        // +62xxx format
            '/^62[0-9]{9,13}$/',          // 62xxx format
        ];
        
        $isValid = false;
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $phone)) {
                $isValid = true;
                break;
            }
        }
        
        if (!$isValid) {
            $fail('The :attribute must be a valid Indonesian phone number.');
        }
        
        // Additional validation for known Indonesian mobile prefixes
        $mobilePatterns = [
            '/^0(81[0-9]|82[0-9]|83[0-9]|85[0-9]|85[67]|87[0-9]|88[0-9]|89[0-9])/',
            '/^\+?62(81[0-9]|82[0-9]|83[0-9]|85[0-9]|85[67]|87[0-9]|88[0-9]|89[0-9])/',
        ];
        
        $isMobile = false;
        foreach ($mobilePatterns as $pattern) {
            if (preg_match($pattern, $phone)) {
                $isMobile = true;
                break;
            }
        }
        
        if (!$isMobile) {
            $fail('The :attribute must be a valid Indonesian mobile phone number.');
        }
    }
}