// File: src/pages/Admin/components/feature/rfid/SimpleAnalytics.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Forms/Button';
import { BarChart3, Calendar, Download, Filter } from 'lucide-react';

export const SimpleAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            📊 Access Analytics & History
          </h2>
          <p className="text-sm text-gray-600">Historical data analysis dan detailed reporting</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-xs"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">🔍 Data Filters</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500">Total Access</div>
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
                <div className="text-lg font-bold text-green-600">0%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <span className="text-lg">👥</span>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">0</div>
                <div className="text-xs text-gray-500">Unique Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <span className="text-lg">🚨</span>
              </div>
              <div>
                <div className="text-lg font-bold text-red-600">0</div>
                <div className="text-xs text-gray-500">Security Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">📋 Access Log Details</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-lg font-medium">No access logs found</div>
            <div className="text-sm">Try adjusting your filter criteria</div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Period: {dateRange.start} to {dateRange.end}</span>
              <span>•</span>
              <span>Total records: 0</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};