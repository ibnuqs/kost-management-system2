<?php

// app/Models/AccessLog.php (Updated dengan Helper Methods)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccessLog extends Model
{
    use HasFactory;

    // Disable Laravel's automatic timestamps since we only use accessed_at
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'room_id',
        'rfid_uid',
        'device_id',
        'access_granted',
        'reason',
        'accessed_at',
    ];

    protected $casts = [
        'access_granted' => 'boolean',
        'accessed_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    // ✅ UPDATED: Menggunakan helper methods
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'room_id' => $this->room_id,
            'rfid_uid' => $this->rfid_uid,
            'device_id' => $this->device_id,
            'access_granted' => $this->access_granted,
            'reason' => $this->reason,
            'accessed_at' => $this->accessed_at ? $this->accessed_at->format('c') : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
            'room' => $this->room ? [
                'id' => $this->room->id,
                'room_number' => $this->room->room_number,
                'room_name' => $this->room->room_name,
            ] : null,
        ];
    }
}
