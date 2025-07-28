#!/bin/bash

# Copy the fixed AppServiceProvider.php to VPS
echo "Copying fixed AppServiceProvider.php to VPS..."

# Get the VPS IP
VPS_IP="148.230.96.228"

# Copy the file to VPS
scp -o StrictHostKeyChecking=no /mnt/c/Users/user/Desktop/kost-10/kost-backend/app/Providers/AppServiceProvider.php root@$VPS_IP:/var/www/kost/kost-backend/app/Providers/

# Copy to running container
echo "Copying file to running container..."
ssh -o StrictHostKeyChecking=no root@$VPS_IP "docker cp /var/www/kost/kost-backend/app/Providers/AppServiceProvider.php kost_backend:/var/www/html/app/Providers/"

# Test PHP syntax
echo "Testing PHP syntax..."
ssh -o StrictHostKeyChecking=no root@$VPS_IP "docker exec kost_backend php -l /var/www/html/app/Providers/AppServiceProvider.php"

# Test Laravel artisan
echo "Testing Laravel artisan..."
ssh -o StrictHostKeyChecking=no root@$VPS_IP "docker exec kost_backend php artisan config:clear"

echo "Done!"