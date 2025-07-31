<?php

namespace App\Console\Commands;

use App\Models\Room;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredReservations extends Command
{
    protected $signature = 'rooms:cleanup-expired-reservations 
                          {--dry-run : Run without actually cleaning up reservations}';

    protected $description = 'Clean up expired room reservations and return them to available status';

    public function handle()
    {
        $isDryRun = $this->option('dry-run');

        $this->info('🧹 Cleaning up expired room reservations');

        if ($isDryRun) {
            $this->warn('⚠️  DRY RUN MODE - No reservations will be cleaned');
        }

        try {
            $result = $this->cleanupExpiredReservations($isDryRun);

            $this->info('✅ Reservation cleanup completed!');
            $this->table(['Metric', 'Count'], [
                ['Expired Reservations Found', $result['found']],
                ['Reservations Cleaned', $result['cleaned']],
                ['Errors', $result['errors']],
            ]);

            return $result['errors'] > 0 ? 1 : 0;

        } catch (\Exception $e) {
            $this->error('❌ Fatal error: '.$e->getMessage());
            Log::error('Reservation cleanup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }
    }

    private function cleanupExpiredReservations(bool $isDryRun = false): array
    {
        $stats = [
            'found' => 0,
            'cleaned' => 0,
            'errors' => 0,
        ];

        // Find all expired reservations
        $expiredReservations = Room::reserved()
            ->where('reserved_until', '<', now())
            ->get();

        $stats['found'] = $expiredReservations->count();

        if ($stats['found'] === 0) {
            $this->info('ℹ️  No expired reservations found');

            return $stats;
        }

        $this->info("Found {$stats['found']} expired reservations");

        foreach ($expiredReservations as $room) {
            try {
                $reservationInfo = [
                    'room_number' => $room->room_number,
                    'room_name' => $room->room_name,
                    'reserved_at' => $room->reserved_at,
                    'reserved_until' => $room->reserved_until,
                    'reserved_by' => $room->reserved_by,
                    'expired_for' => now()->diffForHumans($room->reserved_until, true).' ago',
                ];

                if (! $isDryRun) {
                    $room->cancelReservation();

                    Log::info('Expired reservation cleaned up', $reservationInfo);
                }

                $this->line("🧹 Cleaned reservation: Room {$room->room_number} (expired {$reservationInfo['expired_for']})");
                $stats['cleaned']++;

            } catch (\Exception $e) {
                $stats['errors']++;
                $this->error("❌ Error cleaning reservation for room {$room->room_number}: ".$e->getMessage());

                Log::error('Error cleaning expired reservation', [
                    'room_id' => $room->id,
                    'room_number' => $room->room_number,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }
}
