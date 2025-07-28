// File: src/pages/Admin/components/dashboard/SystemHealthPanel.tsx
import React, { useState } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Users,
  CreditCard,
  Terminal
} from 'lucide-react';
import { reservationService } from '../../services/reservationService';

interface SystemHealthData {
  overall_status: 'healthy' | 'warning' | 'critical' | 'unhealthy';
  health_checks: {
    database: {
      status: string;
      rooms_count?: number;
      tenants_count?: number;
      payments_count?: number;
    };
    payments: {
      status: string;
      pending_payments?: number;
      overdue_payments?: number;
    };
    tenants: {
      status: string;
      active_tenants?: number;
      suspended_tenants?: number;
    };
    commands: {
      status: string;
      available_commands?: string[];
      unavailable_commands?: string[];
    };
    timestamp: string;
  };
}

export const SystemHealthPanel: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSystemHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reservationService.getSystemHealth();
      if (result.success) {
        setHealthData(result.data);
      } else {
        setError(result.message || 'Failed to get system health');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to check system health');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'unhealthy':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Kesehatan Sistem
            </h3>
            <p className="text-sm text-gray-500">
              Monitor status dan performa sistem secara real-time
            </p>
          </div>
        </div>
        
        <button
          onClick={checkSystemHealth}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          {loading ? 'Checking...' : 'Cek Kesehatan'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">Error:</span>
            {error}
          </div>
        </div>
      )}

      {healthData && (
        <>
          {/* Overall Status */}
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(healthData.overall_status)}`}>
              {getStatusIcon(healthData.overall_status)}
              <span className="font-medium capitalize">
                Status Keseluruhan: {healthData.overall_status}
              </span>
            </div>
          </div>

          {/* Health Check Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Database Health */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Database</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(healthData.health_checks.database.status)}`}>
                  {getStatusIcon(healthData.health_checks.database.status)}
                  {healthData.health_checks.database.status}
                </div>
              </div>
              
              {healthData.health_checks.database.rooms_count !== undefined && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Rooms: {healthData.health_checks.database.rooms_count}</p>
                  <p>Tenants: {healthData.health_checks.database.tenants_count}</p>
                  <p>Payments: {healthData.health_checks.database.payments_count}</p>
                </div>
              )}
            </div>

            {/* Payments Health */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Payments</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(healthData.health_checks.payments.status)}`}>
                  {getStatusIcon(healthData.health_checks.payments.status)}
                  {healthData.health_checks.payments.status}
                </div>
              </div>
              
              {healthData.health_checks.payments.pending_payments !== undefined && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Pending: {healthData.health_checks.payments.pending_payments}</p>
                  <p>Overdue: {healthData.health_checks.payments.overdue_payments}</p>
                </div>
              )}
            </div>

            {/* Tenants Health */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Tenants</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(healthData.health_checks.tenants.status)}`}>
                  {getStatusIcon(healthData.health_checks.tenants.status)}
                  {healthData.health_checks.tenants.status}
                </div>
              </div>
              
              {healthData.health_checks.tenants.active_tenants !== undefined && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Active: {healthData.health_checks.tenants.active_tenants}</p>
                  <p>Suspended: {healthData.health_checks.tenants.suspended_tenants}</p>
                </div>
              )}
            </div>

            {/* Commands Health */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium">Commands</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(healthData.health_checks.commands.status)}`}>
                  {getStatusIcon(healthData.health_checks.commands.status)}
                  {healthData.health_checks.commands.status}
                </div>
              </div>
              
              {healthData.health_checks.commands.available_commands && (
                <div className="text-sm text-gray-600">
                  <p>Available Commands: {healthData.health_checks.commands.available_commands.length}</p>
                  {healthData.health_checks.commands.unavailable_commands && (
                    <p className="text-red-600">Unavailable: {healthData.health_checks.commands.unavailable_commands.length}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last checked: {new Date(healthData.health_checks.timestamp).toLocaleString('id-ID')}
          </div>
        </>
      )}

      {!healthData && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Klik "Cek Kesehatan" untuk memulai monitoring sistem</p>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPanel;