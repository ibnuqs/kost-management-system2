<?php

// app/Models/Payment.php (Updated dengan Helper Methods)

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';

    const STATUS_PAID = 'paid';

    const STATUS_OVERDUE = 'overdue';

    const STATUS_EXPIRED = 'expired';

    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'order_id',
        'tenant_id',
        'payment_month',
        'amount',
        'status',
        'payment_method',
        'snap_token',
        'snap_token_created_at',
        'paid_at',
        'expired_at',
        'failure_reason',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'snap_token_created_at' => 'datetime',
        'expired_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    // ✅ UPDATED: Menggunakan helper methods with expiry handling
    public function getApiData(): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'tenant_id' => $this->tenant_id,
            'payment_month' => $this->payment_month,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'snap_token' => $this->snap_token,
            'snap_token_created_at' => $this->snap_token_created_at ? $this->snap_token_created_at->format('c') : null,
            'paid_at' => $this->paid_at ? $this->paid_at->format('c') : null,
            'expired_at' => $this->expired_at ? $this->expired_at->format('c') : null,
            'failure_reason' => $this->failure_reason,
            'notes' => $this->notes,
            'is_expired' => $this->isExpired(),
            'time_until_expiry' => $this->getTimeUntilExpiry(),
            'can_regenerate' => $this->canRegenerate(),
            'created_at' => $this->created_at ? $this->created_at->format('c') : null,
            'updated_at' => $this->updated_at ? $this->updated_at->format('c') : null,
        ];
    }

    /**
     * Check if payment is expired
     */
    public function isExpired(): bool
    {
        if ($this->status === self::STATUS_EXPIRED) {
            return true;
        }

        if ($this->status !== self::STATUS_PENDING) {
            return false;
        }

        // Check if snap token expired (24 hours)
        if ($this->snap_token_created_at &&
            $this->snap_token_created_at->diffInHours(now()) >= 24) {
            return true;
        }

        // Check if payment is too old (7 days)
        if ($this->created_at->diffInDays(now()) >= 7) {
            return true;
        }

        return false;
    }

    /**
     * Get time until expiry in hours
     */
    public function getTimeUntilExpiry(): ?int
    {
        if ($this->status !== self::STATUS_PENDING) {
            return null;
        }

        if ($this->snap_token_created_at) {
            $hoursElapsed = $this->snap_token_created_at->diffInHours(now());

            return max(0, 24 - $hoursElapsed);
        }

        $daysElapsed = $this->created_at->diffInDays(now());

        return max(0, 7 - $daysElapsed) * 24;
    }

    /**
     * Check if payment can be regenerated
     */
    public function canRegenerate(): bool
    {
        return in_array($this->status, [self::STATUS_EXPIRED, self::STATUS_CANCELLED]) ||
               $this->isExpired();
    }

    /**
     * Check if receipt can be generated for this payment
     */
    public function canGenerateReceipt(): bool
    {
        return $this->status === self::STATUS_PAID && $this->paid_at !== null;
    }

    /**
     * Get receipt file path if exists
     */
    public function getReceiptPath(): ?string
    {
        if (! $this->canGenerateReceipt()) {
            return null;
        }

        $receiptNumber = $this->generateReceiptNumber();
        $filename = "kwitansi_{$receiptNumber}.pdf";

        return "receipts/{$filename}";
    }

    /**
     * Generate unique receipt number
     */
    private function generateReceiptNumber(): string
    {
        $date = Carbon::parse($this->paid_at)->format('Ymd');
        $paymentId = str_pad($this->id, 6, '0', STR_PAD_LEFT);

        return "KWT-{$date}-{$paymentId}";
    }
}
