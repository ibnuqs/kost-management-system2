<?php

// app/Models/User.php (Updated dengan Helper Methods)

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
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

    // Single active tenant relationship (for current tenancy)
    public function tenant()
    {
        return $this->hasOne(Tenant::class)->where('status', 'active');
    }

    public function rfidCards(): HasMany
    {
        return $this->hasMany(RfidCard::class);
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(AccessLog::class);
    }

    // ✅ UPDATED: Menggunakan helper methods
    public function getProfileData(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'status' => $this->status,
            'tenant_summary' => $this->tenant_summary,
            'current_room_info' => $this->current_room_info,
            'created_at' => $this->formatDateForApi($this->created_at),
            'updated_at' => $this->formatDateForApi($this->updated_at),
        ];
    }

    public function getTenantSummaryAttribute(): array
    {
        $activeTenant = $this->tenants()->where('status', 'active')->first();

        return [
            'is_active_tenant' => (bool) $activeTenant,
            'total_tenancies' => $this->tenants()->count(),
            'current_monthly_rent' => $activeTenant ? (float) $activeTenant->monthly_rent : null,
            'start_date' => $activeTenant ? $this->formatDateForApi($activeTenant->start_date) : null,
        ];
    }

    public function getRecentAccessLogs(int $limit = 10): array
    {
        return $this->accessLogs()
            ->with('room')
            ->latest('accessed_at')
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'accessed_at' => $this->formatDateForApi($log->accessed_at),
                    'room_number' => $log->room ? $log->room->room_number : 'N/A',
                    'access_granted' => $log->access_granted,
                    'reason' => $log->reason,
                ];
            })
            ->toArray();
    }

    public function getPaymentHistory(int $limit = 10): array
    {
        // Optimized: Use single query with joins instead of N+1 queries
        $payments = \App\Models\Payment::query()
            ->join('tenants', 'payments.tenant_id', '=', 'tenants.id')
            ->where('tenants.user_id', $this->id)
            ->select([
                'payments.id',
                'payments.order_id',
                'payments.amount',
                'payments.status',
                'payments.payment_month',
                'payments.paid_at',
                'payments.created_at',
            ])
            ->orderBy('payments.created_at', 'desc')
            ->limit($limit)
            ->get();

        return $payments->map(function ($payment) {
            return [
                'id' => $payment->id,
                'order_id' => $payment->order_id,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'payment_month' => $payment->payment_month,
                'paid_at' => $this->formatDateForApi($payment->paid_at),
                'created_at' => $this->formatDateForApi($payment->created_at),
            ];
        })->toArray();
    }
}
