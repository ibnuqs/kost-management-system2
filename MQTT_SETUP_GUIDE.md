# MQTT Setup Guide - Fix "Not Authorized" Error

## Problem
Your RFID real-time monitoring is showing "Connection refused: Not authorized" errors because the HiveMQ Cloud credentials in your `.env` file are invalid or expired.

## Current Status
- ❌ MQTT connection failing with authorization error
- ❌ Real-time RFID monitoring disabled
- ✅ Application continues to work without MQTT features

## Solution Options

### Option 1: Get New HiveMQ Cloud Credentials (Recommended)

1. **Visit HiveMQ Cloud Console**
   - Go to [HiveMQ Cloud Console](https://console.hivemq.cloud/)
   - Sign in with your account

2. **Access Your Cluster**
   - Select your cluster: `16d97e84c4364ffa9d0e5a0f0fa09165`
   - Go to "Access Management" → "Credentials"

3. **Create New Credentials**
   - Click "Add Credentials"
   - Username: Choose a unique name (e.g., `kost_system_2025`)
   - Password: Generate a strong password
   - Permissions: Read/Write access to topics `rfid/*` and `kost_system/*`

4. **Update .env File**
   ```bash
   # Update these values in kost-frontend/.env
   VITE_HIVEMQ_HOST=16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud
   VITE_HIVEMQ_PORT=8884
   VITE_HIVEMQ_USERNAME=your_new_username_here
   VITE_HIVEMQ_PASSWORD=your_new_password_here
   ```

5. **Restart Development Server**
   ```bash
   cd kost-frontend
   npm run dev
   ```

### Option 2: Use Alternative MQTT Broker

If you don't have access to the HiveMQ console, you can set up a free alternative:

1. **Create Free HiveMQ Cloud Account**
   - Visit [HiveMQ Cloud](https://www.hivemq.com/mqtt-cloud-broker/)
   - Sign up for free tier (100 connections, 10GB/month)

2. **Create New Cluster**
   - Follow the setup wizard
   - Note down your cluster URL, username, and password

3. **Update .env File**
   ```bash
   VITE_HIVEMQ_HOST=your_new_cluster_url.hivemq.cloud
   VITE_HIVEMQ_PORT=8884
   VITE_HIVEMQ_USERNAME=your_new_username
   VITE_HIVEMQ_PASSWORD=your_new_password
   ```

### Option 3: Use Eclipse Mosquitto (Local Testing)

For development/testing without cloud dependency:

1. **Install Mosquitto**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients
   
   # macOS
   brew install mosquitto
   
   # Windows
   # Download from https://mosquitto.org/download/
   ```

2. **Start Mosquitto**
   ```bash
   mosquitto -p 1883
   ```

3. **Update .env File**
   ```bash
   VITE_HIVEMQ_HOST=localhost
   VITE_HIVEMQ_PORT=1883
   VITE_HIVEMQ_USERNAME=
   VITE_HIVEMQ_PASSWORD=
   ```

### Option 4: Disable MQTT (Temporary)

If you want to continue development without MQTT:

1. **Comment out MQTT credentials in .env**
   ```bash
   # VITE_HIVEMQ_HOST=16d97e84c4364ffa9d0e5a0f0fa09165.s1.eu.hivemq.cloud
   # VITE_HIVEMQ_PORT=8884
   # VITE_HIVEMQ_USERNAME=hivemq.webclient.1745310839638
   # VITE_HIVEMQ_PASSWORD="UXNM#Agehw3B8!4;>6tz"
   ```

2. **The application will skip MQTT connection attempts**

## Testing Your Fix

After updating credentials, test the connection:

1. **Check Browser Console**
   - Look for `✅ Connected to MQTT broker` message
   - No more "Not authorized" errors

2. **Verify Real-Time Monitor**
   - Go to Admin → Smart Access Management → Real-Time Monitor
   - Should show "Connected" status instead of error message

3. **Test RFID Functionality**
   - ESP32 device status should appear
   - RFID scan events should be displayed in real-time

## Troubleshooting

### Still Getting "Not Authorized"?
- Double-check username/password are correct
- Ensure no extra spaces in .env file
- Verify your HiveMQ cluster is active
- Try creating completely new credentials

### Connection Timeout?
- Check if your firewall blocks WebSocket connections
- Verify the host URL is correct
- Try different port (8884 for WSS, 8083 for WS)

### Can't Access HiveMQ Console?
- Contact your system administrator
- Use Option 2 to create new free account
- Use Option 3 for local development

## Current Fallback Behavior

The application now handles MQTT failures gracefully:
- ✅ Shows clear error message when MQTT fails
- ✅ Stops retry attempts after authorization failures
- ✅ Continues functioning without real-time features
- ✅ Displays helpful instructions in the UI

## Contact Support

If you need help with MQTT setup:
1. Check this guide first
2. Verify your HiveMQ account access
3. Contact your system administrator for credential access