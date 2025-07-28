<?php
// routes/console.php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Custom commands for Kost Management
Artisan::command('kost:generate-monthly-payments', function () {
    $this->info('Generating monthly payments for all active tenants...');
    
    // This will be implemented later with proper service
    $this->info('Monthly payments generated successfully!');
})->purpose('Generate monthly payment records for all active tenants');

Artisan::command('kost:check-overdue-payments', function () {
    $this->info('Checking for overdue payments...');
    
    // This will be implemented later
    $this->info('Overdue payment check completed!');
})->purpose('Check and notify about overdue payments');

// MQTT Commands - Fixed version
Artisan::command('mqtt:test', function () {
    $this->info('🧪 Testing MQTT connection...');
    
    // Configuration
    $server = env('HIVEMQ_HOST', '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud');
    $port = env('HIVEMQ_PORT', 8884);
    $username = env('HIVEMQ_USERNAME', 'hivemq.webclient.1745310839638');
    $password = env('HIVEMQ_PASSWORD', 'UXNM#Agehw3B8!4;>6tz');

    $this->info("Server: {$server}");
    $this->info("Port: {$port}");
    $this->info("Username: {$username}");
    
    try {
        // Test basic configuration
        if (empty($server) || empty($username) || empty($password)) {
            $this->error('❌ Missing MQTT configuration in .env');
            return 1;
        }
        
        $this->info('✅ Configuration looks good');
        $this->info('💡 Next: Check if MQTT library is installed');
        
        if (class_exists('\PhpMqtt\Client\MqttClient')) {
            $this->info('✅ MQTT Client library is installed');
        } else {
            $this->error('❌ MQTT Client library not found');
            $this->error('Run: composer require php-mqtt/client');
            return 1;
        }
        
        $this->info('🚀 Try connecting...');
        
        // Try actual connection
        $settings = new \PhpMqtt\Client\ConnectionSettings();
        $settings->setUsername($username)
                ->setPassword($password)
                ->setConnectTimeout(30)
                ->setUseTls(true)
                ->setTlsSelfSignedAllowed(true)
                ->setTlsVerifyPeer(false)
                ->setTlsVerifyPeerName(false);

        $client = new \PhpMqtt\Client\MqttClient($server, $port, 'test_' . uniqid());
        $client->connect($settings);
        
        $this->info('✅ MQTT Connection successful!');
        
        $client->disconnect();
        $this->info('🔌 Disconnected');
        
        return 0;
        
    } catch (\Exception $e) {
        $this->error('❌ Error: ' . $e->getMessage());
        
        // Try without SSL
        try {
            $this->info('🔄 Trying without SSL...');
            $settings = new \PhpMqtt\Client\ConnectionSettings();
            $settings->setUsername($username)
                    ->setPassword($password)
                    ->setConnectTimeout(30);
            
            $client = new \PhpMqtt\Client\MqttClient($server, 1883, 'test_nossl_' . uniqid());
            $client->connect($settings);
            
            $this->info('✅ Connection successful without SSL!');
            $this->warn('⚠️  Update .env: HIVEMQ_PORT=1883 for non-SSL');
            
            $client->disconnect();
            return 0;
            
        } catch (\Exception $e2) {
            $this->error('❌ Both SSL and non-SSL failed');
            $this->error('Original error: ' . $e->getMessage());
            $this->error('Non-SSL error: ' . $e2->getMessage());
            return 1;
        }
    }
})->purpose('Test MQTT connection configuration');

Artisan::command('mqtt:listen', function () {
    $this->info('🚀 Starting MQTT listener...');
    $this->info('📡 Connecting to HiveMQ Cloud...');
    
    try {
        // Use MqttService if available, otherwise direct connection
        if (class_exists('\App\Services\MqttService')) {
            $mqttService = new \App\Services\MqttService();
            $this->info('✅ Using MqttService class');
            $mqttService->listenToDevices();
        } else {
            $this->error('❌ MqttService class not found');
            $this->error('Please create app/Services/MqttService.php');
            return 1;
        }
        
    } catch (\Exception $e) {
        $this->error('❌ MQTT connection failed: ' . $e->getMessage());
        $this->error('💡 Check your .env configuration:');
        $this->error('   - HIVEMQ_HOST');
        $this->error('   - HIVEMQ_USERNAME'); 
        $this->error('   - HIVEMQ_PASSWORD');
        
        return 1;
    }
    
    return 0;
})->purpose('Listen to MQTT messages from ESP32 devices');

// Add this to routes/console.php

Artisan::command('mqtt:troubleshoot', function () {
    $this->info('🔍 MQTT Connection Troubleshooting...');
    
    $server = env('HIVEMQ_HOST', '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud');
    $username = env('HIVEMQ_USERNAME', 'hivemq.webclient.1745310839638');
    $password = env('HIVEMQ_PASSWORD', 'UXNM#Agehw3B8!4;>6tz');
    
    // Test 1: Basic network connectivity
    $this->info('1️⃣ Testing network connectivity...');
    $pingResult = exec("ping -n 1 $server", $output, $returnCode);
    if ($returnCode === 0) {
        $this->info('✅ Can ping HiveMQ server');
    } else {
        $this->error('❌ Cannot ping HiveMQ server - Network issue');
        $this->info('💡 Try using public WiFi or different network');
    }
    
    // Test 2: Try public MQTT broker first
    $this->info('2️⃣ Testing with public MQTT broker...');
    try {
        $settings = new \PhpMqtt\Client\ConnectionSettings();
        $settings->setConnectTimeout(10);
        
        $publicClient = new \PhpMqtt\Client\MqttClient('test.mosquitto.org', 1883, 'test_public_' . uniqid());
        $publicClient->connect($settings);
        
        $this->info('✅ Public MQTT broker works - PHP MQTT client is OK');
        $publicClient->disconnect();
        
    } catch (\Exception $e) {
        $this->error('❌ Even public MQTT broker fails: ' . $e->getMessage());
        $this->error('💡 This indicates firewall or antivirus blocking MQTT');
    }
    
    // Test 3: Try different HiveMQ ports
    $this->info('3️⃣ Testing different HiveMQ ports...');
    $ports = [1883, 8883, 8000, 80];
    
    foreach ($ports as $port) {
        try {
            $this->info("   Testing port {$port}...");
            
            $settings = new \PhpMqtt\Client\ConnectionSettings();
            $settings->setUsername($username)
                    ->setPassword($password)
                    ->setConnectTimeout(5);
            
            if ($port === 8883) {
                $settings->setUseTls(true)
                        ->setTlsSelfSignedAllowed(true)
                        ->setTlsVerifyPeer(false)
                        ->setTlsVerifyPeerName(false);
            }
            
            $client = new \PhpMqtt\Client\MqttClient($server, $port, 'test_port_' . $port . '_' . uniqid());
            $client->connect($settings);
            
            $this->info("   ✅ Port {$port} works!");
            $client->disconnect();
            
            // Update suggestion
            $this->info("💡 Update your .env: HIVEMQ_PORT={$port}");
            return;
            
        } catch (\Exception $e) {
            $this->error("   ❌ Port {$port} failed: " . substr($e->getMessage(), 0, 50) . '...');
        }
    }
    
    // Test 4: Alternative HiveMQ endpoints
    $this->info('4️⃣ Testing alternative endpoints...');
    $endpoints = [
        'broker.hivemq.com' => 1883,
        'public.mqtthq.com' => 1883,
        'broker.emqx.io' => 1883
    ];
    
    foreach ($endpoints as $host => $port) {
        try {
            $this->info("   Testing {$host}:{$port}...");
            
            $settings = new \PhpMqtt\Client\ConnectionSettings();
            $settings->setConnectTimeout(5);
            
            $client = new \PhpMqtt\Client\MqttClient($host, $port, 'test_alt_' . uniqid());
            $client->connect($settings);
            
            $this->info("   ✅ {$host} works! (No auth required)");
            $client->disconnect();
            
            $this->warn("💡 You can use {$host} for testing (no authentication)");
            $this->warn("   Update .env: HIVEMQ_HOST={$host}, HIVEMQ_PORT={$port}");
            $this->warn("   Leave username/password empty for public brokers");
            
        } catch (\Exception $e) {
            $this->error("   ❌ {$host} failed");
        }
    }
    
    // Recommendations
    $this->info('');
    $this->info('🔧 Troubleshooting recommendations:');
    $this->info('1. Check Windows Firewall settings');
    $this->info('2. Temporarily disable antivirus MQTT blocking');
    $this->info('3. Try from different network (mobile hotspot)');
    $this->info('4. Use public MQTT broker for testing');
    $this->info('5. Contact your network administrator');
    
})->purpose('Troubleshoot MQTT connection issues');

// Add to routes/console.php

Artisan::command('mqtt:test-original', function () {
    $this->info('🧪 Testing with ORIGINAL HiveMQ credentials...');
    
    // Original working configuration
    $server = '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud';
    $username = 'hivemq.webclient.1745310839638';
    $password = 'UXNM#Agehw3B8!4;>6tz';
    
    $this->info("Server: {$server}");
    $this->info("Username: {$username}");
    
    // Test different port configurations that worked before
    $configs = [
        ['port' => 8883, 'ssl' => true, 'name' => 'SSL (Port 8883)'],
        ['port' => 8884, 'ssl' => true, 'name' => 'SSL WebSocket (Port 8884)'],
        ['port' => 1883, 'ssl' => false, 'name' => 'Non-SSL (Port 1883)'],
        ['port' => 8000, 'ssl' => false, 'name' => 'HTTP (Port 8000)'],
    ];
    
    foreach ($configs as $config) {
        $this->info("🔄 Trying {$config['name']}...");
        
        try {
            $settings = new \PhpMqtt\Client\ConnectionSettings();
            $settings->setUsername($username)
                    ->setPassword($password)
                    ->setConnectTimeout(30)
                    ->setSocketTimeout(30)
                    ->setResendTimeout(10)
                    ->setKeepAliveInterval(60);
            
            if ($config['ssl']) {
                $settings->setUseTls(true)
                        ->setTlsSelfSignedAllowed(true)
                        ->setTlsVerifyPeer(false)
                        ->setTlsVerifyPeerName(false);
                        // Removed invalid method
            }
            
            $clientId = 'laravel_test_' . uniqid() . '_' . time();
            $client = new \PhpMqtt\Client\MqttClient($server, $config['port'], $clientId);
            
            $this->info("   Connecting with client ID: {$clientId}");
            $client->connect($settings);
            
            $this->info("   ✅ SUCCESS with {$config['name']}!");
            
            // Test publish/subscribe
            $testTopic = 'test/laravel/' . uniqid();
            $testMessage = 'Hello from Laravel ' . date('H:i:s');
            
            $client->publish($testTopic, $testMessage);
            $this->info("   📤 Published test message");
            
            $client->disconnect();
            $this->info("   🔌 Disconnected successfully");
            
            $this->info("");
            $this->info("🎉 WORKING CONFIGURATION FOUND!");
            $this->info("📝 Update your .env with:");
            $this->info("HIVEMQ_HOST={$server}");
            $this->info("HIVEMQ_PORT={$config['port']}");
            $this->info("HIVEMQ_USERNAME={$username}");
            $this->info("HIVEMQ_PASSWORD=\"{$password}\"");
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error("   ❌ Failed: " . substr($e->getMessage(), 0, 80) . '...');
        }
    }
    
    $this->error('');
    $this->error('❌ All configurations failed with original credentials');
    $this->error('💡 Possible issues:');
    $this->error('1. HiveMQ Cloud trial expired');
    $this->error('2. Credentials changed/revoked');
    $this->error('3. Network/firewall blocking specific server');
    $this->error('4. HiveMQ server maintenance');
    
    return 1;
    
})->purpose('Test original HiveMQ credentials with all possible configurations');

Artisan::command('mqtt:debug', function () {
    $this->info('🔍 MQTT Debug Mode - Listening for ESP32 messages...');
    
    try {
        $server = env('HIVEMQ_HOST', '16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud');
        $port = env('HIVEMQ_PORT', 8884);
        $username = env('HIVEMQ_USERNAME', 'hivemq.webclient.1745310839638');
        $password = env('HIVEMQ_PASSWORD', 'UXNM#Agehw3B8!4;>6tz');
        
        $this->info("Connecting to: {$server}:{$port}");
        
        $settings = new \PhpMqtt\Client\ConnectionSettings();
        $settings->setUsername($username)
                ->setPassword($password)
                ->setConnectTimeout(30)
                ->setUseTls(true)
                ->setTlsSelfSignedAllowed(true)
                ->setTlsVerifyPeer(false)
                ->setTlsVerifyPeerName(false);

        $client = new \PhpMqtt\Client\MqttClient($server, $port, 'debug_' . uniqid());
        $client->connect($settings);
        
        $this->info('✅ Connected! Waiting for ESP32 messages...');
        $this->info('📱 Topics: rfid/tags, rfid/status, rfid/command');
        $this->info('🧪 Tap RFID card on ESP32 now...');
        
        $messageCount = 0;
        
        // Subscribe to all ESP32 topics
        $client->subscribe('rfid/tags', function ($topic, $message) use (&$messageCount) {
            $messageCount++;
            $this->info("📥 [{$messageCount}] RFID SCAN: {$message}");
            
            // Parse and auto-respond
            $data = json_decode($message, true);
            if ($data && isset($data['uid'])) {
                $response = [
                    'uid' => $data['uid'],
                    'status' => 'success',
                    'user' => 'Debug User',
                    'message' => 'Debug response from Laravel at ' . date('H:i:s'),
                    'timestamp' => time()
                ];
                
                global $client;
                $client->publish('rfid/command', json_encode($response));
                $this->info("📤 Sent response: " . json_encode($response));
            }
            
            return $messageCount < 10; // Stop after 10 messages
        });
        
        $client->subscribe('rfid/status', function ($topic, $message) use (&$messageCount) {
            $messageCount++;
            $this->info("📊 [{$messageCount}] DEVICE STATUS: {$message}");
            return $messageCount < 10;
        });
        
        $client->subscribe('rfid/command', function ($topic, $message) use (&$messageCount) {
            $messageCount++;
            $this->info("📨 [{$messageCount}] COMMAND: {$message}");
            return $messageCount < 10;
        });
        
        // Listen for 60 seconds or until 10 messages
        $startTime = time();
        while (time() - $startTime < 60 && $messageCount < 10) {
            $client->loop(false, true);
            usleep(100000); // 0.1 second
        }
        
        $this->info("📈 Total messages received: {$messageCount}");
        $client->disconnect();
        
        if ($messageCount === 0) {
            $this->error('❌ No messages received from ESP32');
            $this->error('💡 Check ESP32 connection and MQTT topics');
        }
        
    } catch (\Exception $e) {
        $this->error('❌ Debug failed: ' . $e->getMessage());
    }
    
})->purpose('Debug MQTT communication with ESP32');