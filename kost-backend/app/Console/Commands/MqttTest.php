<?php

namespace App\Console\Commands;

use App\Services\MqttService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MqttTest extends Command
{
    protected $signature = 'mqtt:test {--timeout=30 : Connection timeout in seconds}';

    protected $description = 'Test MQTT connection and basic functionality';

    protected $mqttService;

    public function __construct(MqttService $mqttService)
    {
        parent::__construct();
        $this->mqttService = $mqttService;
    }

    public function handle()
    {
        $this->info('🧪 Testing MQTT Connection...');
        $this->newLine();

        try {
            // Test 1: Environment Variables
            $this->testEnvironmentVariables();
            $this->newLine();

            // Test 2: Connection Info
            $this->testConnectionInfo();
            $this->newLine();

            // Test 3: Basic Connection
            $this->testBasicConnection();
            $this->newLine();

            // Test 4: Publish Test Message
            $this->testPublishMessage();
            $this->newLine();

            // Test 5: Subscribe and Listen
            $this->testSubscription();
            $this->newLine();

            // Test 6: Heartbeat Test
            $this->testHeartbeat();

        } catch (\Exception $e) {
            $this->error("❌ MQTT Test Failed: {$e->getMessage()}");
            Log::error('MQTT test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return 1;
        }

        return 0;
    }

    private function test_environment_variables()
    {
        $this->info('📋 1. Testing Environment Variables:');

        $requiredEnvs = [
            'HIVEMQ_HOST' => env('HIVEMQ_HOST'),
            'HIVEMQ_PORT' => env('HIVEMQ_PORT'),
            'HIVEMQ_USERNAME' => env('HIVEMQ_USERNAME'),
            'HIVEMQ_PASSWORD' => env('HIVEMQ_PASSWORD') ? '***hidden***' : null,
            'MQTT_CLIENT_ID' => env('MQTT_CLIENT_ID', 'default'),
        ];

        foreach ($requiredEnvs as $key => $value) {
            if (empty($value) && $key !== 'MQTT_CLIENT_ID') {
                $this->error("   ❌ {$key}: NOT SET");
            } else {
                $this->info("   ✅ {$key}: {$value}");
            }
        }
    }

    private function test_connection_info()
    {
        $this->info('🔍 2. Connection Information:');

        $info = $this->mqttService->getConnectionInfo();

        foreach ($info as $key => $value) {
            if (is_array($value)) {
                $this->info("   • {$key}: ".json_encode($value));
            } else {
                $this->info("   • {$key}: {$value}");
            }
        }
    }

    private function test_basic_connection()
    {
        $this->info('🔌 3. Testing Basic Connection:');

        try {
            $connected = $this->mqttService->testConnection();

            if ($connected) {
                $this->info('   ✅ Connection test successful');
                $this->info('   🔗 Connected to HiveMQ Cloud broker');
            } else {
                $this->error('   ❌ Connection test failed');
            }

        } catch (\Exception $e) {
            $this->error("   ❌ Connection error: {$e->getMessage()}");
            $this->warn('   💡 Check your HiveMQ credentials and network connectivity');
        }
    }

    private function test_publish_message()
    {
        $this->info('📤 4. Testing Message Publishing:');

        try {
            $testMessage = [
                'test' => true,
                'timestamp' => now()->format('c'),
                'from' => 'mqtt:test command',
                'message' => 'Laravel MQTT test - connection working',
                'laravel_status' => 'online',
            ];

            // Publish to status topic (same as your ESP32 monitoring)
            $published = $this->mqttService->publish(
                'kost_system/status',
                json_encode([
                    'status' => 'online',
                    'timestamp' => now()->format('c'),
                    'client_id' => 'laravel_mqtt_test_'.uniqid(),
                    'source' => 'Laravel Test Command',
                ]),
                1,
                true
            );

            if ($published) {
                $this->info('   ✅ Status message published successfully');
                $this->info('   📍 Topic: kost_system/status');
                $this->info('   🔄 Message retained for ESP32 monitoring');
            } else {
                $this->error('   ❌ Failed to publish status message');
            }

            // Also publish test message
            $testPublished = $this->mqttService->publish(
                'kost_system/test/laravel',
                json_encode($testMessage),
                0,
                false
            );

            if ($testPublished) {
                $this->info('   ✅ Test message published successfully');
            }

        } catch (\Exception $e) {
            $this->error("   ❌ Publish error: {$e->getMessage()}");
        }
    }

    private function test_subscription()
    {
        $this->info('👂 5. Testing Subscription & Listening:');

        try {
            $messageReceived = false;

            // Subscribe to test topic
            $this->mqttService->subscribe('kost_system/test/response', function ($topic, $message) use (&$messageReceived) {
                $this->info("   📨 Received message on {$topic}: {$message}");
                $messageReceived = true;
            });

            // Also subscribe to status topic to monitor
            $this->mqttService->subscribe('kost_system/status', function ($topic, $message) {
                $this->info("   📊 Status update: {$message}");
            });

            $this->info('   ✅ Subscribed to test topics');
            $this->info('   ⏱️  Listening for 8 seconds...');

            // Listen for messages
            $startTime = time();
            while ((time() - $startTime) < 8) {
                $this->mqttService->loop(1);

                // Show progress every 2 seconds
                $elapsed = time() - $startTime;
                if ($elapsed % 2 === 0 && $elapsed > 0) {
                    $remaining = 8 - $elapsed;
                    $this->info("      ⏰ {$remaining} seconds remaining...");
                }

                usleep(100000); // 100ms delay
            }

            if ($messageReceived) {
                $this->info('   ✅ Message received successfully');
            } else {
                $this->warn('   ⚠️  No test messages received (normal for isolated test)');
            }

        } catch (\Exception $e) {
            $this->error("   ❌ Subscription error: {$e->getMessage()}");
        }
    }

    private function test_heartbeat()
    {
        $this->info('💓 6. Testing Heartbeat/Ping:');

        try {
            $pingResult = $this->mqttService->ping();

            if ($pingResult) {
                $this->info('   ✅ Heartbeat sent successfully');
                $this->info('   📍 Published to: kost_system/heartbeat');
            } else {
                $this->error('   ❌ Heartbeat failed');
            }

            // Show final connection status
            if ($this->mqttService->isConnected()) {
                $this->info('   🟢 MQTT connection is active and healthy');
                $this->info('   📝 Summary: Laravel MQTT service is working correctly');
                $this->newLine();
                $this->info('🔍 Diagnosis for "offline" status message:');
                $this->info('   • The offline message you saw is likely from a previous session');
                $this->info('   • It could be a Last Will Testament (LWT) message when connection drops');
                $this->info('   • Try running: php artisan mqtt:listen to start persistent listener');
                $this->info('   • Check if ESP32 is looking for different client_id patterns');
            } else {
                $this->error('   🔴 MQTT connection is not active');
            }

        } catch (\Exception $e) {
            $this->error("   ❌ Heartbeat error: {$e->getMessage()}");
        } finally {
            // Clean disconnect
            $this->mqttService->disconnect();
            $this->info('   🔌 Disconnected from broker');
        }
    }
}
