// File: src/pages/Admin/components/feature/rfid/BackendHealthCheck.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthStatus {
  backend: 'healthy' | 'unhealthy' | 'checking';
  accessLogs: 'available' | 'unavailable' | 'checking';
  lastCheck: Date | null;
  error?: string;
}

export const BackendHealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    backend: 'checking',
    accessLogs: 'checking',
    lastCheck: null
  });

  const checkHealth = async () => {
    setStatus(prev => ({
      ...prev,
      backend: 'checking',
      accessLogs: 'checking',
      error: undefined
    }));

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://148.230.96.228:8000/api';
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || 'test_token';

    try {
      // Test 1: Basic backend health
      try {
        const healthResponse = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        if (healthResponse.ok) {
          setStatus(prev => ({ ...prev, backend: 'healthy' }));
        } else {
          throw new Error(`Health check failed: ${healthResponse.status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setStatus(prev => ({ ...prev, backend: 'unhealthy', error: errorMessage }));
      }

      // Test 2: Access logs endpoint
      try {
        const logsResponse = await fetch(`${apiBaseUrl}/admin/access-logs?per_page=1`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });

        if (logsResponse.ok) {
          setStatus(prev => ({ ...prev, accessLogs: 'available' }));
        } else if (logsResponse.status === 401) {
          setStatus(prev => ({ ...prev, accessLogs: 'unavailable', error: 'Authentication required' }));
        } else {
          throw new Error(`Access logs failed: ${logsResponse.status}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setStatus(prev => ({ ...prev, accessLogs: 'unavailable', error: errorMessage }));
      }

    } finally {
      setStatus(prev => ({ ...prev, lastCheck: new Date() }));
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'healthy':
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unhealthy':
      case 'unavailable':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'healthy': return 'Backend Healthy';
      case 'unhealthy': return 'Backend Down';
      case 'available': return 'Endpoint Available';
      case 'unavailable': return 'Endpoint Failed';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          🔍 Backend Connection Status
        </h3>
        <p className="text-gray-600">Diagnostic untuk troubleshoot masalah koneksi</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Backend Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.backend)}
              <div>
                <div className="font-medium">{getStatusText(status.backend)}</div>
                <div className="text-sm text-gray-500">
                  {import.meta.env.VITE_API_URL || 'http://148.230.96.228:8000/api'}/health
                </div>
              </div>
            </div>
          </div>

          {/* Access Logs Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.accessLogs)}
              <div>
                <div className="font-medium">{getStatusText(status.accessLogs)}</div>
                <div className="text-sm text-gray-500">
                  /admin/access-logs endpoint
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {status.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {status.error}
              </div>
            </div>
          )}

          {/* Last Check */}
          <div className="text-xs text-gray-500 text-center">
            {status.lastCheck && `Last checked: ${status.lastCheck.toLocaleTimeString()}`}
          </div>

          {/* Manual Refresh */}
          <div className="flex gap-2">
            <Button 
              onClick={checkHealth} 
              variant="outline" 
              size="sm"
              disabled={status.backend === 'checking'}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${status.backend === 'checking' ? 'animate-spin' : ''}`} />
              Check Again
            </Button>
          </div>

          {/* Instructions */}
          {status.backend === 'unhealthy' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🚀 How to Fix:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>1. Open terminal di folder <code>kost-backend</code></p>
                <p>2. Jalankan: <code>php artisan serve</code></p>
                <p>3. Backend akan berjalan di http://148.230.96.228:8000</p>
                <p>4. Refresh halaman ini</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};