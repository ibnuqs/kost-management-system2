<?php

namespace App\Services;

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\Exceptions\MqttClientException;
use Illuminate\Support\Facades\Log;

class MqttService
{
    private $client;
    private $connectionSettings;
    private $isConnected = false;
    private $subscriptions = [];
    private $reconnectAttempts = 0;
    private $maxReconnectAttempts = 5;
    
    public function __construct()
    {
        $this->initializeConnection();
    }

    /**
     * Initialize MQTT connection settings
     */
    private function initializeConnection()
    {
        $host = env('HIVEMQ_HOST', 'your-cluster.hivemq.cloud');
        $port = (int) env('HIVEMQ_PORT', 8883);
        $username = env('HIVEMQ_USERNAME', '');
        $password = env('HIVEMQ_PASSWORD', '');
        $clientId = env('MQTT_CLIENT_ID', 'laravel_kost_system_' . uniqid());
        
        // Validate required env variables
        if (empty($host) || empty($username) || empty($password)) {
            Log::warning('MQTT: Missing required environment variables');
        }
        
        // Create MQTT client
        $this->client = new MqttClient($host, $port, $clientId);
        
        // Configure connection settings
        $this->connectionSettings = (new ConnectionSettings())
            ->setUsername($username)
            ->setPassword($password)
            ->setKeepAliveInterval(60)
            ->setLastWillTopic('kost_system/status')
            ->setLastWillMessage('offline')
            ->setLastWillQualityOfService(1)
            ->setUseTls(true)
            ->setTlsSelfSignedAllowed(true)
            ->setConnectTimeout(30)
            ->setSocketTimeout(5)
            ->setResendTimeout(10);
    }

    /**
     * Connect to MQTT broker
     */
    public function connect($timeout = 30)
    {
        try {
            if ($this->isConnected) {
                return true;
            }

            Log::info('MQTT: Attempting to connect to broker', [
                'host' => env('HIVEMQ_HOST'),
                'port' => env('HIVEMQ_PORT'),
                'client_id' => $this->client->getClientId()
            ]);

            $this->client->connect($this->connectionSettings, true);
            $this->isConnected = true;
            $this->reconnectAttempts = 0;
            
            Log::info('MQTT: Connected to broker successfully');
            
            // Publish online status
            $this->publish('kost_system/status', json_encode([
                'status' => 'online',
                'timestamp' => now()->toISOString(),
                'client_id' => $this->client->getClientId()
            ]), 1, true);
            
            return true;
            
        } catch (MqttClientException $e) {
            $this->isConnected = false;
            $this->reconnectAttempts++;
            
            Log::error('MQTT: Connection failed', [
                'error' => $e->getMessage(),
                'attempt' => $this->reconnectAttempts,
                'max_attempts' => $this->maxReconnectAttempts
            ]);
            
            throw new \Exception('Failed to connect to MQTT broker: ' . $e->getMessage());
        }
    }

    /**
     * Disconnect from MQTT broker
     */
    public function disconnect()
    {
        try {
            if ($this->isConnected && $this->client) {
                // Publish offline status before disconnecting
                $this->publish('kost_system/status', json_encode([
                    'status' => 'offline',
                    'timestamp' => now()->toISOString(),
                    'client_id' => $this->client->getClientId()
                ]), 1, true);
                
                $this->client->disconnect();
                $this->isConnected = false;
                $this->subscriptions = [];
                
                Log::info('MQTT: Disconnected from broker');
            }
        } catch (MqttClientException $e) {
            Log::error('MQTT: Disconnect error', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Subscribe to MQTT topic with callback
     */
    public function subscribe($topic, callable $callback, $qos = 0)
    {
        try {
            if (!$this->isConnected) {
                $this->connect();
            }

            $this->client->subscribe($topic, function ($topic, $message, $retained, $matchedWildcards) use ($callback) {
                try {
                    Log::debug('MQTT: Message received', [
                        'topic' => $topic,
                        'message' => substr($message, 0, 500), // Truncate long messages in log
                        'retained' => $retained
                    ]);
                    
                    // Call the provided callback
                    call_user_func($callback, $topic, $message, $retained, $matchedWildcards);
                    
                } catch (\Exception $e) {
                    Log::error('MQTT: Callback error', [
                        'topic' => $topic,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }, $qos);

            // Store subscription info
            $this->subscriptions[$topic] = [
                'callback' => $callback,
                'qos' => $qos,
                'subscribed_at' => now()
            ];

            Log::info('MQTT: Subscribed to topic', ['topic' => $topic, 'qos' => $qos]);
            
        } catch (MqttClientException $e) {
            Log::error('MQTT: Subscribe failed', [
                'topic' => $topic,
                'error' => $e->getMessage()
            ]);
            throw new \Exception('Failed to subscribe to topic: ' . $e->getMessage());
        }
    }

    /**
     * Publish message to MQTT topic
     */
    public function publish($topic, $message, $qos = 0, $retain = false)
    {
        try {
            // Auto-connect if not connected
            if (!$this->isConnected) {
                $this->connect();
            }

            $this->client->publish($topic, $message, $qos, $retain);
            
            Log::debug('MQTT: Message published', [
                'topic' => $topic,
                'message_length' => strlen($message),
                'qos' => $qos,
                'retain' => $retain
            ]);
            
            return true;
            
        } catch (MqttClientException $e) {
            Log::error('MQTT: Publish failed', [
                'topic' => $topic,
                'message_length' => strlen($message),
                'error' => $e->getMessage()
            ]);
            
            // Try to reconnect and retry once
            if ($this->reconnectAttempts < $this->maxReconnectAttempts) {
                try {
                    $this->reconnect();
                    $this->client->publish($topic, $message, $qos, $retain);
                    return true;
                } catch (\Exception $retryE) {
                    Log::error('MQTT: Retry publish failed', ['error' => $retryE->getMessage()]);
                }
            }
            
            return false;
        }
    }

    /**
     * Process incoming messages (blocking loop)
     */
    public function loop($timeout = 1)
    {
        try {
            if (!$this->isConnected) {
                if ($this->reconnectAttempts < $this->maxReconnectAttempts) {
                    $this->connect();
                } else {
                    return false;
                }
            }

            $this->client->loop(true, $timeout);
            return true;
            
        } catch (MqttClientException $e) {
            Log::error('MQTT: Loop error', ['error' => $e->getMessage()]);
            $this->isConnected = false;
            
            // Try to reconnect
            if ($this->reconnectAttempts < $this->maxReconnectAttempts) {
                sleep(2); // Wait before reconnecting
                try {
                    return $this->reconnect();
                } catch (\Exception $reconnectE) {
                    Log::error('MQTT: Reconnect in loop failed', ['error' => $reconnectE->getMessage()]);
                }
            }
            
            return false;
        }
    }

    /**
     * Check if client is connected
     */
    public function isConnected()
    {
        return $this->isConnected;
    }

    /**
     * Get active subscriptions
     */
    public function getSubscriptions()
    {
        return $this->subscriptions;
    }

    /**
     * Reconnect to MQTT broker
     */
    public function reconnect()
    {
        try {
            Log::info('MQTT: Attempting to reconnect...');
            
            $this->disconnect();
            sleep(1); // Brief pause before reconnecting
            
            return $this->connect();
        } catch (\Exception $e) {
            Log::error('MQTT: Reconnect failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Send heartbeat/ping to keep connection alive
     */
    public function ping()
    {
        try {
            if (!$this->isConnected) {
                return false;
            }

            // Publish heartbeat
            $heartbeat = [
                'timestamp' => now()->toISOString(),
                'status' => 'alive',
                'client_id' => $this->client->getClientId(),
                'subscriptions' => array_keys($this->subscriptions)
            ];

            return $this->publish('kost_system/heartbeat', json_encode($heartbeat));
            
        } catch (\Exception $e) {
            Log::error('MQTT: Ping failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Get connection status info
     */
    public function getConnectionInfo()
    {
        return [
            'connected' => $this->isConnected,
            'client_id' => $this->client ? $this->client->getClientId() : null,
            'host' => env('HIVEMQ_HOST'),
            'port' => env('HIVEMQ_PORT'),
            'subscriptions_count' => count($this->subscriptions),
            'active_topics' => array_keys($this->subscriptions),
            'reconnect_attempts' => $this->reconnectAttempts,
            'max_reconnect_attempts' => $this->maxReconnectAttempts
        ];
    }

    /**
     * Test MQTT connection
     */
    public function testConnection()
    {
        try {
            $testTopic = 'kost_system/test/' . uniqid();
            $testMessage = json_encode([
                'test' => true,
                'timestamp' => now()->toISOString(),
                'client_id' => $this->client->getClientId()
            ]);
            
            $connected = $this->connect(10);
            if (!$connected) {
                return false;
            }
            
            $published = $this->publish($testTopic, $testMessage);
            
            return $published;
            
        } catch (\Exception $e) {
            Log::error('MQTT: Connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Cleanup on destruction
     */
    public function __destruct()
    {
        $this->disconnect();
    }
}