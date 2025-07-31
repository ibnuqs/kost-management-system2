<?php

// ===================================================================
// app/Models/IoTDevice.php (Fixed)
// ===================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IoTDevice extends Model
{
    use HasFactory;

    protected $table = 'iot_devices';

    // Device type constants
    const TYPE_DOOR_LOCK = 'door_lock';

    const TYPE_CARD_SCANNER = 'card_scanner';

    const TYPE_RFID_READER = 'rfid_reader';

    // Status constants
    const STATUS_ONLINE = 'online';

    const STATUS_OFFLINE = 'offline';

    const ALLOWED_TYPES = [
        self::TYPE_DOOR_LOCK,
        self::TYPE_CARD_SCANNER,
        self::TYPE_RFID_READER,
    ];

    const ALLOWED_STATUSES = [
        self::STATUS_ONLINE,
        self::STATUS_OFFLINE,
    ];

    protected $fillable = [
        'device_id',
        'device_name',
        'device_type',
        'room_id',
        'status',
        'device_info',
        'last_seen',
    ];

    protected $casts = [
        'device_info' => 'array',
        'last_seen' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

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
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    // Helper methods
    public function isOnline(): bool
    {
        return $this->status === self::STATUS_ONLINE;
    }

    public function isOffline(): bool
    {
        return $this->status === self::STATUS_OFFLINE;
    }

    public function isDoorLock(): bool
    {
        return $this->device_type === self::TYPE_DOOR_LOCK;
    }

    public function isCardScanner(): bool
    {
        return $this->device_type === self::TYPE_CARD_SCANNER;
    }

    public function isRfidReader(): bool
    {
        return $this->device_type === self::TYPE_RFID_READER;
    }

    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'device_id' => $this->device_id,
            'device_name' => $this->device_name,
            'device_type' => $this->device_type,
            'room_id' => $this->room_id,
            'status' => $this->status,
            'device_info' => $this->device_info,
            'last_seen' => $this->formatDateForApi($this->last_seen),
            'room' => $this->room ? [
                'id' => $this->room->id,
                'room_number' => $this->room->room_number,
                'room_name' => $this->room->room_name,
            ] : null,
            'created_at' => $this->formatDateForApi($this->created_at),
            'updated_at' => $this->formatDateForApi($this->updated_at),
        ];
    }
}
