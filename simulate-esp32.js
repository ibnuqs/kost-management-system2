#!/usr/bin/env node

/**
 * ESP32 Simulator untuk Testing
 * Simulasi ESP32 yang mengirim data ke backend dan MQTT
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

// Simulasi data ESP32
const ESP32_DEVICES = [
    {
        device_id: 'ESP32-RFID-01',
        device_name: 'Door Reader - Room 101',
        device_ip: '192.168.1.100',
        firmware_version: 'v1.2.3',
        room_id: 1
    },
    {
        device_id: 'ESP32-RFID-02', 
        device_name: 'Door Reader - Room 102',
        device_ip: '192.168.1.101',
        firmware_version: 'v1.2.3',
        room_id: 2
    }
];

// Simulasi RFID cards
const RFID_CARDS = [
    'A1B2C3D4',
    'E5F6G7H8', 
    '12345678',
    'ABCDEF01'
];

console.log('🤖 ESP32 Simulator Starting...');
console.log('='.repeat(50));

// Fungsi untuk send heartbeat
async function sendHeartbeat(device) {
    try {
        const payload = {
            device_id: device.device_id,
            device_name: device.device_name,
            device_ip: device.device_ip,
            device_type: 'rfid_reader',
            firmware_version: device.firmware_version,
            wifi_connected: true,
            mqtt_connected: true,
            rfid_ready: true,
            uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
            free_heap: Math.floor(Math.random() * 50000) + 30000, // 30-80KB
            timestamp: Date.now()
        };

        const response = await axios.post(`${BASE_URL}/esp32/heartbeat`, payload);
        
        if (response.data.success) {
            console.log(`✅ ${device.device_id} heartbeat sent`);
        } else {
            console.log(`❌ ${device.device_id} heartbeat failed:`, response.data.message);
        }
    } catch (error) {
        console.log(`❌ ${device.device_id} heartbeat error:`, error.message);
    }
}

// Fungsi untuk simulasi RFID scan
async function simulateRfidScan(device) {
    try {
        const randomCard = RFID_CARDS[Math.floor(Math.random() * RFID_CARDS.length)];
        
        const payload = {
            device_id: device.device_id,
            card_uid: randomCard,
            uid: randomCard,
            signal_strength: Math.floor(Math.random() * 40) - 70, // -70 to -30 dBm
            timestamp: Date.now()
        };

        const response = await axios.post(`${BASE_URL}/esp32/rfid/scan`, payload);
        
        if (response.data.success) {
            console.log(`🏷️ ${device.device_id} RFID scan: ${randomCard} -> ${response.data.access_granted ? 'GRANTED' : 'DENIED'}`);
        } else {
            console.log(`❌ ${device.device_id} RFID scan failed:`, response.data.message);
        }
    } catch (error) {
        console.log(`❌ ${device.device_id} RFID error:`, error.message);
    }
}

// Main simulation loop
async function startSimulation() {
    console.log(`📡 Starting simulation with ${ESP32_DEVICES.length} devices`);
    
    // Send initial heartbeat for all devices
    for (const device of ESP32_DEVICES) {
        await sendHeartbeat(device);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between devices
    }
    
    // Start periodic heartbeat (every 30 seconds)
    setInterval(async () => {
        console.log('💓 Sending periodic heartbeats...');
        for (const device of ESP32_DEVICES) {
            await sendHeartbeat(device);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }, 30000);
    
    // Start random RFID scans (every 10-30 seconds)
    setInterval(async () => {
        const randomDevice = ESP32_DEVICES[Math.floor(Math.random() * ESP32_DEVICES.length)];
        await simulateRfidScan(randomDevice);
    }, Math.random() * 20000 + 10000); // 10-30 seconds
    
    console.log('🚀 Simulation running! Press Ctrl+C to stop.');
    console.log('📊 Check your dashboard for ESP32 devices and RFID scans!');
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping ESP32 simulation...');
    process.exit(0);
});

// Start simulation
startSimulation().catch(console.error);