<?php

namespace App\Events;

use App\Models\Tenant;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TenantAccessChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tenant;
    public $accessInfo;

    public function __construct(Tenant $tenant, array $accessInfo)
    {
        $this->tenant = $tenant;
        $this->accessInfo = $accessInfo;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.tenant-access'),
            new PrivateChannel("tenant.{$this->tenant->user_id}"),
            new PrivateChannel("room.{$this->tenant->room_id}")
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'tenant.access.changed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->tenant->user_id,
            'room_id' => $this->tenant->room_id,
            'room_number' => $this->tenant->room->room_number,
            'user_name' => $this->tenant->user->name,
            'status' => $this->tenant->status,
            'has_access' => $this->accessInfo['has_access'],
            'reason' => $this->accessInfo['reason'],
            'overdue_amount' => $this->accessInfo['overdue_amount'],
            'overdue_count' => $this->accessInfo['overdue_count'],
            'timestamp' => now()->toISOString()
        ];
    }
}