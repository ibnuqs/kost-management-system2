<?php

// app/Models/Room.php (Updated dengan Helper Methods)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Room extends Model
{
    use HasFactory;

    const STATUS_AVAILABLE = 'available';
    const STATUS_OCCUPIED = 'occupied';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_RESERVED = 'reserved';
    const STATUS_ARCHIVED = 'archived';

    const ALLOWED_STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_OCCUPIED,
        self::STATUS_MAINTENANCE,
        self::STATUS_RESERVED,
        self::STATUS_ARCHIVED,
    ];

    protected $fillable = [
        'room_number',
        'room_name',
        'monthly_price',
        'status',
        'archived_at',
        'archived_reason',
        'reserved_at',
        'reserved_until',
        'reserved_by',
        'reserved_reason',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'archived_at' => 'datetime',
        'reserved_at' => 'datetime',
        'reserved_until' => 'datetime',
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
    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }

    public function tenant(): HasOne
    {
        return $this->hasOne(Tenant::class)->where('status', 'active');
    }

    public function iotDevices(): HasMany
    {
        return $this->hasMany(IoTDevice::class);
    }

    public function getActiveTenant(): ?Tenant
    {
        return $this->tenant()->first();
    }

    // ✅ UPDATED: Menggunakan helper methods
    public function getApiData(): array
    {
        $activeTenant = $this->getActiveTenant();
        
        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'room_name' => $this->room_name,
            'monthly_price' => (float) $this->monthly_price,
            'status' => $this->status,
            'is_archived' => $this->isArchived(),
            'archive_info' => $this->getArchiveInfo(),
            'can_be_archived' => $this->canBeArchived(),
            'can_be_unarchived' => $this->canBeUnarchived(),
            'tenant' => $activeTenant ? [
                'id' => $activeTenant->id,
                'user_name' => $activeTenant->user->name ?? 'N/A',
                'user_email' => $activeTenant->user->email ?? 'N/A',
                'start_date' => $this->formatDateForApi($activeTenant->start_date),
                'monthly_rent' => (float) $activeTenant->monthly_rent,
            ] : null,
            'created_at' => $this->formatDateForApi($this->created_at),
            'updated_at' => $this->formatDateForApi($this->updated_at),
        ];
    }

    public function assignTenant(int $userId, float $monthlyRent, string $startDate, ?string $expectedStatus = null): Tenant
    {
        // Optimistic locking - check if room status has changed
        if ($expectedStatus && $this->status !== $expectedStatus) {
            throw new \Exception("Room status has changed. Expected '{$expectedStatus}' but current status is '{$this->status}'. Please refresh and try again.");
        }

        // Double-check room availability with fresh data from database
        $freshRoom = self::lockForUpdate()->find($this->id);
        
        if (!$freshRoom) {
            throw new \Exception("Room not found.");
        }

        if ($freshRoom->hasActiveTenant()) {
            throw new \Exception("This room is already occupied by another tenant. Please refresh the page and select a different room.");
        }

        if (!in_array($freshRoom->status, [self::STATUS_AVAILABLE, self::STATUS_RESERVED])) {
            throw new \Exception("Room is not available for assignment. Current status: {$freshRoom->status}");
        }

        try {
            \DB::beginTransaction();

            // Create tenant assignment
            $tenant = Tenant::create([
                'user_id' => $userId,
                'room_id' => $this->id,
                'monthly_rent' => $monthlyRent,
                'start_date' => $startDate,
                'status' => Tenant::STATUS_ACTIVE,
            ]);

            // Generate first payment (prorated if needed)
            $this->generateInitialPayment($tenant);

            // Update room status and clear reservation
            $this->update([
                'status' => self::STATUS_OCCUPIED,
                'reserved_at' => null,
                'reserved_until' => null,
                'reserved_by' => null,
                'reserved_reason' => null
            ]);

            \DB::commit();

            Log::info('Tenant assigned successfully', [
                'room_id' => $this->id,
                'room_number' => $this->room_number,
                'tenant_id' => $tenant->id,
                'user_id' => $userId,
                'monthly_rent' => $monthlyRent,
                'start_date' => $startDate,
                'assigned_by' => auth()->id()
            ]);

            return $tenant;

        } catch (\Exception $e) {
            \DB::rollBack();
            
            Log::error('Failed to assign tenant', [
                'room_id' => $this->id,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'assigned_by' => auth()->id()
            ]);
            
            throw $e;
        }
    }

    private function generateInitialPayment(Tenant $tenant): void
    {
        $startDate = \Carbon\Carbon::parse($tenant->start_date);
        $currentMonth = $startDate->copy()->startOfMonth();
        
        // Calculate prorated amount for first month
        $daysInMonth = $currentMonth->daysInMonth;
        $remainingDays = $daysInMonth - $startDate->day + 1;
        $dailyRate = $tenant->monthly_rent / $daysInMonth;
        $proratedAmount = $dailyRate * $remainingDays;
        
        // Create first payment
        Payment::create([
            'tenant_id' => $tenant->id,
            'amount' => round($proratedAmount, 2),
            'month' => $currentMonth->month,
            'year' => $currentMonth->year,
            'due_date' => $startDate->copy()->addDays(7)->toDateString(),
            'status' => 'pending',
            'payment_method' => 'pending',
            'description' => "Sewa Bulanan (Prorata) - {$this->room_number} ({$this->room_name}) - {$currentMonth->format('F Y')} ({$remainingDays} hari)",
            'created_at' => now(),
            'updated_at' => now()
        ]);

        Log::info('Initial prorated payment created', [
            'tenant_id' => $tenant->id,
            'amount' => $proratedAmount,
            'days_covered' => $remainingDays,
            'total_days_in_month' => $daysInMonth
        ]);
    }

    // ✅ MISSING METHODS for Room Management
    public function hasActiveTenant(): bool
    {
        return $this->tenant()->exists();
    }

    public function removeTenant(): void
    {
        $activeTenant = $this->getActiveTenant();
        if ($activeTenant) {
            $activeTenant->update([
                'status' => Tenant::STATUS_MOVED_OUT,
                'end_date' => now()
            ]);
            $this->update(['status' => self::STATUS_AVAILABLE]);
        }
    }

    public function getBasicStats(): array
    {
        try {
            $activeTenant = $this->getActiveTenant();
            
            return [
                'total_tenants' => $this->tenants()->count(),
                'active_tenant' => $this->hasActiveTenant(),
                'occupancy_duration' => $this->getOccupancyDuration(),
                'monthly_revenue' => $activeTenant ? (float) $activeTenant->monthly_rent : 0,
            ];
        } catch (\Exception $e) {
            \Log::warning('Error calculating basic stats', [
                'room_id' => $this->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'total_tenants' => 0,
                'active_tenant' => false,
                'occupancy_duration' => null,
                'monthly_revenue' => 0,
            ];
        }
    }

    private function getOccupancyDuration(): ?string
    {
        try {
            $activeTenant = $this->getActiveTenant();
            if (!$activeTenant || !$activeTenant->start_date) return null;
            
            $startDate = \Carbon\Carbon::parse($activeTenant->start_date);
            $duration = $startDate->diffForHumans(null, true);
            return $duration;
        } catch (\Exception $e) {
            \Log::warning('Error calculating occupancy duration', [
                'room_id' => $this->id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    // ✅ VALIDATION RULES
    public static function getValidationRules(?int $roomId = null): array
    {
        return [
            'room_number' => [
                'required',
                'string',
                'max:20',
                \Illuminate\Validation\Rule::unique('rooms', 'room_number')->ignore($roomId)
            ],
            'room_name' => 'required|string|max:100',
            'monthly_price' => 'required|numeric|min:0|max:9999999999.99',
            'status' => [\Illuminate\Validation\Rule::in(self::ALLOWED_STATUSES)],
        ];
    }

    // ✅ QUERY SCOPES
    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE);
    }

    public function scopeOccupied($query)
    {
        return $query->where('status', self::STATUS_OCCUPIED);
    }

    public function scopeMaintenance($query)
    {
        return $query->where('status', self::STATUS_MAINTENANCE);
    }

    public function scopeReserved($query)
    {
        return $query->where('status', self::STATUS_RESERVED);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('room_number', 'like', "%{$search}%")
              ->orWhere('room_name', 'like', "%{$search}%");
        });
    }

    // ✅ SAFE RELATIONSHIP CHECKS (prevent 500 errors)
    public function safeRfidCards()
    {
        try {
            if (method_exists($this, 'rfidCards')) {
                return $this->rfidCards();
            }
        } catch (\Exception $e) {
            \Log::warning('RFID cards relationship not available', ['room_id' => $this->id]);
        }
        return null;
    }

    public function safeAccessLogs()
    {
        try {
            if (method_exists($this, 'accessLogs')) {
                return $this->accessLogs();
            }
        } catch (\Exception $e) {
            \Log::warning('Access logs relationship not available', ['room_id' => $this->id]);
        }
        return null;
    }

    // ✅ ARCHIVE FUNCTIONALITY (Support both enum status & soft archive)
    public function archiveRoom(string $reason = null): void
    {
        $this->update([
            'archived_at' => now(),
            'archived_reason' => $reason ?? 'Archived by admin',
        ]);
        \Log::info('Room archived', ['room_id' => $this->id, 'reason' => $reason]);
    }

    public function unarchiveRoom(): void
    {
        $this->update([
            'archived_at' => null,
            'archived_reason' => null,
        ]);
        \Log::info('Room unarchived', ['room_id' => $this->id]);
    }

    public function isArchived(): bool
    {
        return !is_null($this->archived_at);
    }

    public function canBeArchived(): bool
    {
        return !$this->hasActiveTenant() && !$this->isArchived();
    }

    public function canBeUnarchived(): bool
    {
        return $this->isArchived();
    }

    // ✅ RESERVATION MANAGEMENT METHODS
    
    public function reserveRoom(string $reason = null, int $hoursValid = 24): void
    {
        $this->update([
            'status' => self::STATUS_RESERVED,
            'reserved_at' => now(),
            'reserved_until' => now()->addHours($hoursValid),
            'reserved_by' => auth()->id() ?? null,
            'reserved_reason' => $reason ?? 'Room reserved for tenant assignment'
        ]);
        
        Log::info('Room reserved', [
            'room_id' => $this->id,
            'room_number' => $this->room_number,
            'reserved_by' => auth()->id(),
            'reserved_until' => $this->reserved_until,
            'reason' => $reason
        ]);
    }

    public function cancelReservation(): void
    {
        $this->update([
            'status' => self::STATUS_AVAILABLE,
            'reserved_at' => null,
            'reserved_until' => null,
            'reserved_by' => null,
            'reserved_reason' => null
        ]);
        
        Log::info('Room reservation cancelled', [
            'room_id' => $this->id,
            'room_number' => $this->room_number,
            'cancelled_by' => auth()->id()
        ]);
    }

    public function confirmReservation(): void
    {
        if ($this->status === self::STATUS_RESERVED) {
            $this->update([
                'status' => self::STATUS_OCCUPIED,
                'reserved_at' => null,
                'reserved_until' => null,
                'reserved_by' => null,
                'reserved_reason' => null
            ]);
            
            Log::info('Room reservation confirmed', [
                'room_id' => $this->id,
                'room_number' => $this->room_number,
                'confirmed_by' => auth()->id()
            ]);
        }
    }

    public function isReserved(): bool
    {
        return $this->status === self::STATUS_RESERVED && 
               $this->reserved_until && 
               $this->reserved_until->isFuture();
    }

    public function isReservationExpired(): bool
    {
        return $this->status === self::STATUS_RESERVED && 
               $this->reserved_until && 
               $this->reserved_until->isPast();
    }

    public function getReservationInfo(): ?array
    {
        if (!$this->isReserved()) {
            return null;
        }

        return [
            'reserved_at' => $this->formatDateForApi($this->reserved_at),
            'reserved_until' => $this->formatDateForApi($this->reserved_until),
            'reserved_by' => $this->reserved_by,
            'reserved_reason' => $this->reserved_reason,
            'expires_in_minutes' => $this->reserved_until ? now()->diffInMinutes($this->reserved_until, false) : null,
            'is_expired' => $this->isReservationExpired()
        ];
    }

    // Scopes untuk filtering
    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }

    // Get archive info
    public function getArchiveInfo(): ?array
    {
        if (!$this->isArchived()) {
            return null;
        }

        return [
            'archived_at' => $this->formatDateForApi($this->archived_at),
            'archived_reason' => $this->archived_reason,
            'archived_ago' => $this->archived_at ? $this->archived_at->diffForHumans() : null,
        ];
    }
}