#!/usr/bin/env node

/**
 * MQTT Connection Test Tool
 * 
 * This tool tests the MQTT connection with your HiveMQ Cloud credentials
 * Run with: node test-mqtt-connection.js
 */

const mqtt = require('mqtt');
require('dotenv').config({ path: './kost-frontend/.env' });

// MQTT Configuration from .env file
const config = {
  host: process.env.VITE_HIVEMQ_HOST,
  port: process.env.VITE_HIVEMQ_PORT || '8884',
  username: process.env.VITE_HIVEMQ_USERNAME,
  password: process.env.VITE_HIVEMQ_PASSWORD
};

console.log('🔧 MQTT Connection Test');
console.log('='.repeat(50));
console.log('Host:', config.host || 'NOT SET');
console.log('Port:', config.port);
console.log('Username:', config.username || 'NOT SET');
console.log('Password:', config.password ? `${'*'.repeat(config.password.length)} (${config.password.length} chars)` : 'NOT SET');
console.log('='.repeat(50));

// Validate configuration
if (!config.host || !config.username || !config.password) {
  console.error('❌ Missing MQTT credentials in .env file!');
  console.log('\nPlease set the following in kost-frontend/.env:');
  console.log('VITE_HIVEMQ_HOST=your_host_here');
  console.log('VITE_HIVEMQ_USERNAME=your_username_here');
  console.log('VITE_HIVEMQ_PASSWORD=your_password_here');
  process.exit(1);
}

// Test connection
const brokerUrl = `wss://${config.host}:${config.port}/mqtt`;
console.log(`🔗 Attempting to connect to: ${brokerUrl}\n`);

const options = {
  clientId: `test_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  username: config.username,
  password: config.password,
  keepalive: 30,
  connectTimeout: 10000,
  clean: true,
  protocol: 'wss',
  protocolVersion: 4,
};

const client = mqtt.connect(brokerUrl, options);

let isConnected = false;

client.on('connect', (connack) => {
  isConnected = true;
  console.log('✅ Successfully connected to MQTT broker!');
  console.log('Connection details:', connack);
  
  // Test subscribe
  client.subscribe('test/connection', (err) => {
    if (!err) {
      console.log('✅ Successfully subscribed to test topic');
      
      // Test publish
      client.publish('test/connection', JSON.stringify({
        message: 'Hello from connection test',
        timestamp: Date.now(),
        client_id: options.clientId
      }), (err) => {
        if (!err) {
          console.log('✅ Successfully published test message');
        } else {
          console.log('❌ Failed to publish test message:', err.message);
        }
        
        // Clean up
        setTimeout(() => {
          client.end();
          console.log('🔌 Connection closed');
          console.log('\n🎉 MQTT connection test completed successfully!');
          process.exit(0);
        }, 1000);
      });
    } else {
      console.log('❌ Failed to subscribe:', err.message);
      client.end();
      process.exit(1);
    }
  });
});

client.on('message', (topic, message) => {
  console.log('📨 Received message on', topic, ':', message.toString());
});

client.on('error', (error) => {
  console.error('❌ MQTT connection error:', error.message);
  
  if (error.message.includes('Not authorized')) {
    console.log('\n🔧 Troubleshooting "Not authorized" error:');
    console.log('1. Verify your HiveMQ Cloud credentials are correct');
    console.log('2. Check if your HiveMQ Cloud account is active');
    console.log('3. Ensure the username/password combination is valid');
    console.log('4. Try generating new credentials in HiveMQ Cloud console');
  }
  
  process.exit(1);
});

client.on('close', () => {
  if (!isConnected) {
    console.log('🔌 Connection closed without successful connection');
    process.exit(1);
  }
});

client.on('offline', () => {
  console.log('📵 Client went offline');
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!isConnected) {
    console.log('⏰ Connection timeout - unable to connect within 30 seconds');
    client.end();
    process.exit(1);
  }
}, 30000);