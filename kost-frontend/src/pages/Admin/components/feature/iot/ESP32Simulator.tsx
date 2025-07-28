// ESP32 Simulator Control Panel
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { esp32Simulator } from '../../../../../utils/esp32Simulator';

export const ESP32Simulator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');

  useEffect(() => {
    const status = esp32Simulator.getStatus();
    setIsRunning(status.running);
  }, []);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const success = await esp32Simulator.start();
      setIsRunning(success);
      if (success) {
        console.log('✅ ESP32 Simulator started successfully');
      }
    } catch (error) {
      console.error('❌ Failed to start ESP32 simulator:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = () => {
    esp32Simulator.stop();
    setIsRunning(false);
  };

  const handleSimulateRfid = () => {
    const testCards = [
      'A1B2C3D4',
      '01CB261E', 
      'FF123456',
      '12345678',
      'ABCDEF01'
    ];
    
    const randomCard = testCards[Math.floor(Math.random() * testCards.length)];
    esp32Simulator.simulateRfidScan(randomCard);
    setLastScan(randomCard);
  };

  const handleSimulateSpecificCard = () => {
    const uid = prompt('Enter RFID UID (8 characters):');
    if (uid && uid.length === 8) {
      esp32Simulator.simulateRfidScan(uid.toUpperCase());
      setLastScan(uid.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulator Control */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🔧 ESP32 Device Simulator
            <span className={`px-2 py-1 rounded text-xs ${
              isRunning ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </span>
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 What is this?</h4>
              <p className="text-sm text-blue-800">
                This simulator mimics a real ESP32 device for testing the dashboard. 
                It sends device status and responds to commands just like a real ESP32 would.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  disabled={isStarting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {isStarting ? '⏳ Starting...' : '▶️ Start ESP32 Simulator'}
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  ⏹️ Stop Simulator
                </button>
              )}

              {isRunning && (
                <>
                  <button
                    onClick={handleSimulateRfid}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    💳 Simulate RFID Scan
                  </button>
                  
                  <button
                    onClick={handleSimulateSpecificCard}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    🎯 Scan Specific Card
                  </button>
                </>
              )}
            </div>

            {lastScan && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Last Simulated Scan:</strong> {lastScan} at {new Date().toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📋 How to Use</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <strong>Start Simulator:</strong> Click "Start ESP32 Simulator" to begin sending device status updates
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <strong>Check Dashboard:</strong> Go to "Simple Monitor" tab to see the simulated ESP32 device appear
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <strong>Test RFID:</strong> Click "Simulate RFID Scan" to generate fake card scans and see real-time activity
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <strong>Custom Cards:</strong> Use "Scan Specific Card" to test with specific RFID UIDs
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Note:</strong> This is for development/testing only. 
              In production, real ESP32 devices will automatically appear when connected to the MQTT broker.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">🔍 Simulated Device Info</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Device ID:</strong>
              <div className="text-gray-600">ESP32-RFID-01</div>
            </div>
            <div>
              <strong>Device Name:</strong>
              <div className="text-gray-600">Main Door RFID Scanner</div>
            </div>
            <div>
              <strong>Firmware:</strong>
              <div className="text-gray-600">v2.1.0-sim</div>
            </div>
            <div>
              <strong>Status Interval:</strong>
              <div className="text-gray-600">30 seconds</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};