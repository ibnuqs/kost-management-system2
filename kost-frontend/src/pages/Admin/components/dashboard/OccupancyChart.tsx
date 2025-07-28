// File: src/pages/Admin/components/dashboard/OccupancyChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';

interface OccupancyData {
  month: string;
  total_rooms: number;
  occupied_rooms: number;
  vacancy_rate: number;
  occupancy_rate: number;
}

interface OccupancyChartProps {
  data: OccupancyData[];
  isLoading: boolean;
  currentStats?: {
    total_rooms: number;
    occupied_rooms: number;
    occupancy_percentage: number;
  } | null;
}

const OccupancyChart: React.FC<OccupancyChartProps> = ({ 
  data, 
  isLoading,
  currentStats
}) => {
  // Simple approach: just show placeholder data if no real data
  const placeholderData = [
    { month: 'Jul 2024', occupied_rooms: 0 },
    { month: 'Aug 2024', occupied_rooms: 0 },
    { month: 'Sep 2024', occupied_rooms: 0 },
    { month: 'Oct 2024', occupied_rooms: 0 },
    { month: 'Nov 2024', occupied_rooms: 0 },
    { month: 'Dec 2024', occupied_rooms: 0 },
  ];
  
  const chartData = data && data.length > 0 ? data : placeholderData;
  const hasRealData = data && data.length > 0;
  
  // Stats from current dashboard data
  const totalRooms = currentStats?.total_rooms || 0;
  const occupiedRooms = currentStats?.occupied_rooms || 0;
  const occupancyRate = currentStats?.occupancy_percentage || 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Tingkat Hunian</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold">Tingkat Hunian</h3>
          <p className="text-xs text-gray-500">Data hunian kamar kost</p>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600">Kamar Terisi</p>
          <p className="text-lg font-semibold text-green-600">{occupiedRooms}</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600">Total Kamar</p>
          <p className="text-lg font-semibold text-blue-600">{totalRooms}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600">Tingkat Hunian</p>
          <p className="text-lg font-semibold text-purple-600">{occupancyRate}%</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Bar 
              dataKey="occupied_rooms" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!hasRealData && (
        <p className="text-xs text-gray-400 text-center mt-2">
          Menampilkan data placeholder - menunggu data historis
        </p>
      )}
    </div>
  );
};

export { OccupancyChart };