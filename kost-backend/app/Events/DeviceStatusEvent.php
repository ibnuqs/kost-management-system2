<?php
// File: app/Events/DeviceStatusEvent.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeviceStatusEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $statusData;

    public function __construct($statusData)
    {
        $this->statusData = $statusData;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-notifications')
        ];
    }

    public function broadcastAs(): string
    {
        return 'device-status';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'device_status',
            'data' => $this->statusData
        ];
    }
}