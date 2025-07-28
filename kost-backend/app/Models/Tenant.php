<?php
// app/Models/Tenant.php (Updated dengan Helper Methods)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    const STATUS_ACTIVE = 'active';
    const STATUS_MOVED_OUT = 'moved_out';
    const STATUS_SUSPENDED = 'suspended';

    protected $fillable = [
        'tenant_code',
        'user_id',
        'room_id',
        'monthly_rent',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function rfidCards(): HasMany
    {
        return $this->hasMany(RfidCard::class);
    }

    // ✅ UPDATED: Menggunakan helper methods
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'tenant_code' => $this->tenant_code,
            'user_id' => $this->user_id,
            'room_id' => $this->room_id,
            'monthly_rent' => (string) $this->monthly_rent,
            'start_date' => $this->start_date ? $this->start_date->format('Y-m-d') : null,
            'end_date' => $this->end_date ? $this->end_date->format('Y-m-d') : null,
            'status' => $this->status,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ] : null,
            'room' => $this->room ? [
                'id' => $this->room->id,
                'room_number' => $this->room->room_number,
                'room_name' => $this->room->room_name,
            ] : null,
            'created_at' => $this->created_at ? $this->created_at->format('c') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('c') : null,
        ];
    }
}