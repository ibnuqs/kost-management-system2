// File: src/pages/Admin/components/feature/rfid/SimpleRealTimeMonitor.tsx
import React from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Activity, Wifi } from 'lucide-react';

export const SimpleRealTimeMonitor: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          ⚡ Real-time Monitor
        </h2>
        <p className="text-sm text-gray-600">Live monitoring RFID activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <Wifi className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">LIVE</div>
                <div className="text-xs text-gray-500">Connection</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500">Scans Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">0</div>
                <div className="text-xs text-gray-500">Granted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <span className="text-lg">❌</span>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">0</div>
                <div className="text-xs text-gray-500">Denied</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            🔴 Live Activity Stream
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📡</div>
            <div className="text-lg font-medium">Waiting for RFID Activity...</div>
            <div className="text-sm">Scan kartu RFID untuk melihat aktivitas real-time</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};