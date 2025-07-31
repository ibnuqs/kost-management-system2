<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Tenant;
use Illuminate\Console\Command;

class CreateSampleNotifications extends Command
{
    protected $signature = 'notifications:create-sample {--tenant-id=}';

    protected $description = 'Create sample notifications for testing';

    public function handle()
    {
        $tenantId = $this->option('tenant-id');

        if ($tenantId) {
            $tenant = Tenant::find($tenantId);
            if (! $tenant) {
                $this->error("Tenant with ID {$tenantId} not found");

                return 1;
            }
            $tenants = collect([$tenant]);
        } else {
            $tenants = Tenant::where('status', 'active')->get();
        }

        if ($tenants->isEmpty()) {
            $this->error('No active tenants found');

            return 1;
        }

        $this->info('Creating sample notifications...');

        foreach ($tenants as $tenant) {
            $this->createSampleNotificationsForTenant($tenant);
        }

        $this->info('Sample notifications created successfully!');

        return 0;
    }

    private function createSampleNotificationsForTenant(Tenant $tenant)
    {
        $sampleNotifications = [
            [
                'tenant_id' => $tenant->id,
                'type' => 'payment_reminder',
                'title' => 'Pengingat Pembayaran',
                'message' => 'Pembayaran sewa bulanan Anda jatuh tempo dalam 3 hari',
                'priority' => 'high',
                'status' => 'unread',
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'tenant_id' => $tenant->id,
                'type' => 'rfid_request_approved',
                'title' => 'Kartu Akses Diperbarui',
                'message' => 'Kartu akses Anda telah berhasil diperbarui',
                'priority' => 'medium',
                'status' => 'read',
                'read_at' => now()->subDays(1),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(1),
            ],
            [
                'tenant_id' => $tenant->id,
                'type' => 'maintenance_scheduled',
                'title' => 'Pemberitahuan Maintenance',
                'message' => 'Maintenance terjadwal untuk fasilitas gedung pada akhir pekan',
                'priority' => 'low',
                'status' => 'unread',
                'created_at' => now()->subDays(7),
                'updated_at' => now()->subDays(7),
            ],
            [
                'tenant_id' => $tenant->id,
                'type' => 'payment_success',
                'title' => 'Pembayaran Berhasil',
                'message' => 'Pembayaran sewa untuk bulan November 2024 telah berhasil diproses',
                'priority' => 'medium',
                'status' => 'read',
                'read_at' => now()->subDays(10),
                'created_at' => now()->subDays(10),
                'updated_at' => now()->subDays(10),
            ],
            [
                'tenant_id' => $tenant->id,
                'type' => 'access_granted',
                'title' => 'Akses Diizinkan',
                'message' => 'Anda berhasil mengakses ruangan pada '.now()->subHours(2)->format('H:i'),
                'priority' => 'low',
                'status' => 'unread',
                'created_at' => now()->subHours(2),
                'updated_at' => now()->subHours(2),
            ],
        ];

        foreach ($sampleNotifications as $notificationData) {
            Notification::create($notificationData);
        }

        $this->info('Created '.count($sampleNotifications)." notifications for tenant {$tenant->id}");
    }
}
