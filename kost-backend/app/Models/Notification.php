<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;
    
    public $timestamps = false;

    // Type constants (sesuai database schema)
    const TYPE_PAYMENT = 'payment';
    const TYPE_ACCESS = 'access';
    const TYPE_SYSTEM = 'system';

    // Priority constants
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    // Status constants (sesuai database)
    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';
    const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function isRead(): bool
    {
        return $this->status === self::STATUS_READ;
    }

    public function isUnread(): bool
    {
        return $this->status === self::STATUS_UNREAD;
    }

    public function markAsRead(): void
    {
        $this->update([
            'status' => self::STATUS_READ
        ]);
    }

    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'status' => $this->status,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ] : null,
        ];
    }

    // Static helper methods
    public static function createForUser($userId, $type, $title, $message)
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'status' => self::STATUS_UNREAD,
        ]);
    }
}