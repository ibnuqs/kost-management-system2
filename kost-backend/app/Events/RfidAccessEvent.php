<?php

// File: app/Events/RfidAccessEvent.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RfidAccessEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $accessData;

    /**
     * Create a new event instance.
     */
    public function __construct($accessData)
    {
        $this->accessData = $accessData;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('admin-notifications'),
            // If user_id is available, also broadcast to user's private channel
            // new PrivateChannel('user.' . ($this->accessData['user_id'] ?? 'unknown'))
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'rfid-access';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'type' => 'rfid_access',
            'data' => $this->accessData,
        ];
    }
}
