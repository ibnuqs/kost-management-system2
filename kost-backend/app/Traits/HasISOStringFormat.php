<?php
// File: app/Traits/HasISOStringFormat.php


namespace App\Traits;

trait HasISOStringFormat
{
    /**
     * Convert datetime to ISO string format
     */
    public function toISOString($attribute = null): ?string
    {
        if ($attribute) {
            $value = $this->getAttribute($attribute);
        } else {
            $value = $this;
        }

        if (is_null($value)) {
            return null;
        }

        if (is_string($value)) {
            $value = \Carbon\Carbon::parse($value);
        }

        if ($value instanceof \Carbon\Carbon || $value instanceof \Illuminate\Support\Carbon) {
            return $value->format('c'); // ISO 8601 format
        }

        if ($value instanceof \DateTime) {
            return $value->format('c');
        }

        return null;
    }
}