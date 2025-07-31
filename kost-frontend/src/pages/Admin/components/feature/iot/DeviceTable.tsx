// File: src/pages/Admin/components/features/iot/DeviceTable.tsx
import React from 'react';
import { Edit, Wifi, WifiOff, DoorOpen , CreditCard, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { IoTDevice } from '../../../types/iot';

interface DeviceTableProps {
  devices: IoTDevice[];
  loading: boolean;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onEdit: (device: IoTDevice) => void;
  onPageChange?: (page: number) => void;
}

const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  loading,
  pagination,
  onEdit,
  onPageChange
}) => {
  const handlePreviousPage = () => {
    if ((pagination?.current_page || 1) > 1 && onPageChange) {
      onPageChange((pagination?.current_page || 1) - 1);
    }
  };

  const handleNextPage = () => {
    if ((pagination?.current_page || 1) < (pagination?.last_page || 1) && onPageChange) {
      onPageChange((pagination?.current_page || 1) + 1);
    }
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'door_lock':
        return <DoorOpen  className="w-4 h-4" />;
      case 'card_scanner':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string, isOnline: boolean) => {
    if (status === 'online' || isOnline) {
      return <Wifi className="w-4 h-4 text-green-600" />;
    }
    return <WifiOff className="w-4 h-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white">
          <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" />
          Memuat perangkat...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-xl border border-gray-200">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {devices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="flex flex-col items-center">
              <Wifi className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada perangkat</h3>
              <p>Tidak ada perangkat IoT yang sesuai dengan filter Anda.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {devices.map((device) => (
              <div key={device.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                      device.status === 'online' || device.is_online 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {getDeviceTypeIcon(device.device_type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{device.device_name}</div>
                      <div className="text-xs text-gray-500">ID: {device.device_id}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(device)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit perangkat"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Tipe:</span>
                    <div className="font-medium">{device.device_type_label || device.device_type}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Kamar:</span>
                    <div className="font-medium">
                      {device.room ? `Kamar ${device.room.room_number}` : 'Belum Ditugaskan'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className="flex items-center">
                      {getStatusIcon(device.status, device.is_online)}
                      <span className={`ml-1 text-xs ${
                        device.status === 'online' || device.is_online ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {device.status === 'online' || device.is_online ? 'Terhubung' : 'Terputus'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Terakhir Aktif:</span>
                    <div className="font-medium">{device.last_seen_human || 'Tidak Pernah'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perangkat
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kamar
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Terakhir Aktif
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Wifi className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada perangkat ditemukan</h3>
                    <p className="text-gray-600 mb-4">Tidak ada perangkat IoT yang sesuai dengan filter saat ini.</p>
                    <div className="text-sm text-gray-500">
                      • Coba sesuaikan filter pencarian Anda<br/>
                      • Periksa apakah perangkat sudah terdaftar dengan benar<br/>
                      • Pastikan perangkat terhubung ke jaringan
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-blue-50 transition-all duration-200 hover:shadow-sm">
                  {/* Device Info - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 lg:h-12 lg:w-12">
                        <div className={`h-full w-full rounded-xl flex items-center justify-center shadow-sm border-2 ${
                          device.status === 'online' || device.is_online 
                            ? 'bg-green-100 text-green-600 border-green-200' 
                            : 'bg-red-100 text-red-600 border-red-200'
                        }`}>
                          {getDeviceTypeIcon(device.device_type)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {device.device_name}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                          ID: {device.device_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Device Type - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-2 ${
                        device.device_type === 'door_lock' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {getDeviceTypeIcon(device.device_type)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {device.device_type_label || device.device_type}
                        </span>
                        <div className="text-xs text-gray-500">
                          {device.device_type === 'door_lock' ? 'Kontrol Akses' : 'Pembaca Kartu'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Room - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {device.room ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                        Kamar {device.room.room_number}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 shadow-sm">
                        Belum Ditugaskan
                      </span>
                    )}
                  </td>

                  {/* Status - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-1.5 rounded-full mr-2 ${
                        device.status === 'online' || device.is_online ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {getStatusIcon(device.status, device.is_online)}
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold shadow-sm ${
                          device.status === 'online' || device.is_online
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {device.status === 'online' || device.is_online ? 'Terhubung' : 'Terputus'}
                        </span>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {device.status === 'online' || device.is_online ? 'Aktif' : 'Tidak Aktif'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last Seen - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-gray-100 rounded-full mr-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {device.last_seen_human || 'Tidak Pernah'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {device.last_seen_human ? 'Aktivitas terakhir' : 'Tidak ada aktivitas'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Actions - Enhanced */}
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEdit(device)}
                        className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all shadow-sm border border-blue-200 hover:border-blue-300"
                        title="Edit perangkat"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Enhanced */}
      {devices.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button 
              onClick={handlePreviousPage}
              disabled={pagination.current_page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Sebelumnya
            </button>
            <button 
              onClick={handleNextPage}
              disabled={pagination.current_page === pagination.last_page}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-700 bg-white px-3 py-1 rounded-lg border">
                Menampilkan <span className="font-bold text-blue-600">{((pagination?.current_page || 1) - 1) * (pagination?.per_page || 10) + 1}</span> sampai{' '}
                <span className="font-bold text-blue-600">
                  {Math.min((pagination?.current_page || 1) * (pagination?.per_page || 10), pagination?.total || 0)}
                </span> dari{' '}
                <span className="font-bold text-blue-600">{(pagination?.total || 0).toLocaleString()}</span> perangkat
              </div>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm border border-gray-300 overflow-hidden">
                <button
                  onClick={handlePreviousPage}
                  disabled={(pagination?.current_page || 1) === 1}
                  className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Sebelumnya</span>
                </button>
                
                <span className="relative inline-flex items-center px-4 py-2 bg-blue-50 border-l border-r border-gray-300 text-sm font-bold text-blue-600">
                  Halaman {pagination?.current_page || 1} dari {pagination?.last_page || 1}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={(pagination?.current_page || 1) === (pagination?.last_page || 1)}
                  className="relative inline-flex items-center px-3 py-2 bg-white text-sm font-medium text-gray-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="sr-only">Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceTable;