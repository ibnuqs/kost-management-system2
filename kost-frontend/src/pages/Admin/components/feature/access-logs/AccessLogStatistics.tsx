// File: src/pages/Admin/components/features/access-logs/AccessLogStatistics.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Shield, AlertCircle } from 'lucide-react';

import type { AccessLogStatistics as StatisticsData } from '../../../types/accessLog';

interface AccessLogStatisticsProps {
  statistics: StatisticsData | null;
}

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6'];

export const AccessLogStatistics: React.FC<AccessLogStatisticsProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
          <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" />
          Loading statistics...
        </div>
      </div>
    );
  }

  // Validate data structure
  const dailyStats = statistics.daily_stats || [];
  const hourlyStats = statistics.hourly_stats || [];
  const summary = statistics.summary || { total_period: 0, average_daily: 0, busiest_hour: 0 };

  if (dailyStats.length === 0 && hourlyStats.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No statistics data available</h3>
        <p>No access log data found for the selected period.</p>
      </div>
    );
  }

  // Calculate totals for pie chart
  const totalGranted = dailyStats.reduce((sum, day) => sum + (day.granted_access || 0), 0);
  const totalDenied = dailyStats.reduce((sum, day) => sum + (day.denied_access || 0), 0);
  
  const pieData = [
    { name: 'Granted', value: totalGranted, fill: '#10B981' },
    { name: 'Denied', value: totalDenied, fill: '#EF4444' }
  ].filter(item => item.value > 0);

  // Find peak hour
  const peakHourData = hourlyStats.reduce((peak, current) => 
    (current.count || 0) > (peak.count || 0) ? current : peak, 
    { hour: 0, count: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Period Access</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total_period.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Daily</p>
              <p className="text-2xl font-bold text-gray-900">{summary.average_daily.toFixed(1)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900">{summary.busiest_hour}:00</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalGranted + totalDenied > 0 
                  ? `${((totalGranted / (totalGranted + totalDenied)) * 100).toFixed(1)}%`
                  : '0%'
                }
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Distribution */}
      {dailyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Access Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day_name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(dayName, payload) => {
                  if (payload && payload[0]) {
                    const date = new Date(payload[0].payload.date);
                    return `${dayName} - ${date.toLocaleDateString()}`;
                  }
                  return dayName;
                }}
              />
              <Legend />
              <Bar dataKey="total_access" fill="#3B82F6" name="Total Access" />
              <Bar dataKey="granted_access" fill="#10B981" name="Granted" />
              <Bar dataKey="denied_access" fill="#EF4444" name="Denied" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hourly Distribution */}
      {hourlyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Access Pattern (Today)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}:00`}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(hour) => `${hour}:00 - ${(hour + 1) % 24}:00`}
                formatter={(value, name) => [value, 'Access Count']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Access Count"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {peakHourData.count > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Peak Activity:</strong> {peakHourData.hour}:00 - {(peakHourData.hour + 1) % 24}:00 
                with {peakHourData.count} access attempts
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Distribution Pie Chart */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Success/Failure Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => 
                    `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value.toLocaleString(), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Access Attempts:</span>
              <span className="font-semibold text-lg">{summary.total_period.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Average Daily Access:</span>
              <span className="font-semibold text-lg">{summary.average_daily.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Successful Access:</span>
              <span className="font-semibold text-lg text-green-600">{totalGranted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Failed Access:</span>
              <span className="font-semibold text-lg text-red-600">{totalDenied.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Success Rate:</span>
              <span className={`font-semibold text-lg ${
                totalGranted + totalDenied > 0 && totalGranted / (totalGranted + totalDenied) > 0.8 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {totalGranted + totalDenied > 0 
                  ? `${((totalGranted / (totalGranted + totalDenied)) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Peak Hour:</span>
              <span className="font-semibold text-lg">{summary.busiest_hour}:00 - {(summary.busiest_hour + 1) % 24}:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      {dailyStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Most Active Day</h4>
              <p className="text-blue-700">
                {dailyStats.reduce((max, day) => 
                  (day.total_access || 0) > (max.total_access || 0) ? day : max, 
                  dailyStats[0]
                )?.day_name || 'N/A'} with {' '}
                {Math.max(...dailyStats.map(day => day.total_access || 0)).toLocaleString()} access attempts
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Overall Health</h4>
              <p className="text-green-700">
                {totalGranted + totalDenied > 0 && totalGranted / (totalGranted + totalDenied) > 0.9 
                  ? 'Excellent - Very high success rate'
                  : totalGranted + totalDenied > 0 && totalGranted / (totalGranted + totalDenied) > 0.8
                  ? 'Good - High success rate'
                  : totalGranted + totalDenied > 0 && totalGranted / (totalGranted + totalDenied) > 0.7
                  ? 'Fair - Moderate success rate'
                  : 'Needs attention - Low success rate'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};