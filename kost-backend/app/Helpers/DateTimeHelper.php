<?php
// File: app/Helpers/DateTimeHelper.php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Support\Carbon as IlluminateCarbon;

class DateTimeHelper
{
    /**
     * Convert Carbon/DateTime to ISO string format
     * Replaces toISOString() method which doesn't exist in Laravel
     */
    public static function toISOString($datetime): ?string
    {
        if (is_null($datetime)) {
            return null;
        }

        if (is_string($datetime)) {
            $datetime = Carbon::parse($datetime);
        }

        if ($datetime instanceof Carbon || $datetime instanceof IlluminateCarbon) {
            return $datetime->format('c'); // ISO 8601 format
        }

        if ($datetime instanceof \DateTime) {
            return $datetime->format('c');
        }

        return null;
    }

    /**
     * Format untuk frontend compatibility
     */
    public static function toFrontendFormat($datetime): ?string
    {
        return self::toISOString($datetime);
    }
}
