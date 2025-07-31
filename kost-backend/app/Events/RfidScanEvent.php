<?php

// File: app/Events/RfidScanEvent.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RfidScanEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $scanData;

    public function __construct($scanData)
    {
        $this->scanData = $scanData;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'rfid-scan';
    }

    public function broadcastWith(): array
    {
        return [
            'type' => 'rfid_scan',
            'data' => $this->scanData,
        ];
    }
}
