<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Carbon;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register MqttService only if needed
        if (class_exists(\App\Services\MqttService::class)) {
            $this->app->singleton(\App\Services\MqttService::class, function ($app) {
                return new \App\Services\MqttService();
            });
        }

        // Register MidtransService
        if (class_exists(\App\Services\MidtransService::class)) {
            $this->app->singleton(\App\Services\MidtransService::class, function ($app) {
                return new \App\Services\MidtransService();
            });
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Carbon macros
        $this->registerCarbonMacros();
        
        // Configure application locale
        $this->configureLocale();
    }

    /**
     * Register Carbon macros for datetime formatting
     */
    private function registerCarbonMacros(): void
    {
        // Add toISOString method (ISO 8601 format)
        Carbon::macro('toISOString', function () {
            return $this->format('c');
        });

        // Add Indonesian formatting
        Carbon::macro('toIndonesianFormat', function () {
            return $this->locale('id')->isoFormat('dddd, D MMMM Y HH:mm');
        });

        // Add short date format
        Carbon::macro('toShortFormat', function () {
            return $this->format('d/m/Y');
        });

        // Add time ago in Indonesian
        Carbon::macro('timeAgoInIndonesian', function () {
            return $this->locale('id')->diffForHumans();
        });

        // Add payment due date calculator
        Carbon::macro('getPaymentDueDate', function () {
            // Payment due on 10th of each month
            $dueDate = $this->copy()->day(10);
            
            // If today is after 10th, next month's due date
            if ($this->day > 10) {
                $dueDate = $dueDate->addMonth();
            }
            
            return $dueDate;
        });
    }

    /**
     * Configure application locale
     */
    private function configureLocale(): void
    {
        // Set Carbon locale to Indonesian
        Carbon::setLocale('id');
        
        // Set application timezone
        if (config('app.timezone')) {
            date_default_timezone_set(config('app.timezone'));
        }
    }
}