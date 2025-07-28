#!/bin/bash

# Start cron daemon
service cron start

# Start supervisor (for queue workers)
service supervisor start

# Run Laravel migrations
php artisan migrate --force

# Clear and cache config for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link if it doesn't exist
php artisan storage:link

# Start Apache in foreground
apache2-foreground