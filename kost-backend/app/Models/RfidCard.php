<?php

// app/Models/RfidCard.php (Updated dengan Helper Methods)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RfidCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'uid',
        'user_id',
        'tenant_id',
        'card_type',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['device_id'];

    // ✅ HELPER METHODS untuk DateTime Formatting
    protected function formatDateForApi($date): ?string
    {
        return $date ? $date->format('c') : null;
    }

    protected function toISOString($date): ?string
    {
        return \App\Helpers\DateTimeHelper::toISOString($date);
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // Accessor for device_id - dynamically get from IoT device based on tenant's room
    public function getDeviceIdAttribute(): ?string
    {
        \Log::info('Getting device_id for RFID card', ['card_id' => $this->id, 'tenant_id' => $this->tenant_id]);

        // 1. Ambil tenant_id dari RFID card
        if (! $this->tenant_id) {
            \Log::info('No tenant_id found for RFID card', ['card_id' => $this->id]);

            return null;
        }

        // 2. Cari tenant record, ambil room_id nya
        $tenant = Tenant::find($this->tenant_id);
        if (! $tenant) {
            \Log::warning('Tenant not found', ['tenant_id' => $this->tenant_id]);

            return null;
        }

        if (! $tenant->room_id) {
            \Log::warning('Tenant has no room_id', ['tenant_id' => $this->tenant_id]);

            return null;
        }

        \Log::info('Found tenant with room', ['tenant_id' => $tenant->id, 'room_id' => $tenant->room_id]);

        // 3. Cari iot_device berdasarkan room_id
        $iotDevice = IoTDevice::where('room_id', $tenant->room_id)->first();

        if (! $iotDevice) {
            \Log::warning('No IoT device found for room', ['room_id' => $tenant->room_id]);

            return null;
        }

        \Log::info('Found IoT device', ['device_id' => $iotDevice->device_id, 'room_id' => $tenant->room_id]);

        // 4. Return device_id yang real dari ESP32
        return $iotDevice->device_id;
    }

    // ✅ UPDATED: Menggunakan helper methods
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'uid' => $this->uid,
            'user_id' => $this->user_id,
            'tenant_id' => $this->tenant_id,
            'card_type' => $this->card_type,
            'status' => $this->status,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
            'tenant' => $this->tenant ? [
                'id' => $this->tenant->id,
                'tenant_code' => $this->tenant->tenant_code,
                'room' => $this->tenant->room ? [
                    'id' => $this->tenant->room->id,
                    'room_number' => $this->tenant->room->room_number,
                    'room_name' => $this->tenant->room->room_name,
                ] : null,
            ] : null,
            'created_at' => $this->formatDateForApi($this->created_at),
            'updated_at' => $this->formatDateForApi($this->updated_at),
        ];
    }
}
