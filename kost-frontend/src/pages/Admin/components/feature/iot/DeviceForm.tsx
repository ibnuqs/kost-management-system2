// File: src/pages/Admin/components/feature/iot/DeviceForm.tsx
import React, { useState, useEffect } from 'react';
import { Input, Select } from '../../ui/Forms/';
import { Modal } from '../../ui/Modal';
import type { IoTDevice } from '../../../types/iot';

interface RoomOption {
  id: number;
  room_number: string;
  tenant?: {
    user_name?: string;
    name?: string;
    tenant_name?: string;
  };
}

interface DeviceFormProps {
  isOpen: boolean;
  device: IoTDevice | null;
  rooms: RoomOption[];
  onClose: () => void;
  onSubmit: (data: { device_id: string; device_name: string; device_type: string; room_id?: string; status: string }) => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({
  isOpen,
  device,
  rooms,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    device_type: 'door_lock',
    room_id: '',
    status: 'online'
  });

  useEffect(() => {
    if (device) {
      setFormData({
        device_id: device.device_id,
        device_name: device.device_name,
        device_type: device.device_type,
        room_id: device.room ? device.room.id.toString() : '',
        status: device.status
      });
    } else {
      // Reset form when adding new device
      setFormData({
        device_id: '',
        device_name: '',
        device_type: 'door_lock',
        room_id: '',
        status: 'online'
      });
    }
  }, [device, isOpen]);

  const handleChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // When editing, preserve unchanged values; when creating new, use defaults
    const submitData = {
      device_id: device ? device.device_id : formData.device_id,
      device_name: formData.device_name,
      device_type: device ? device.device_type : formData.device_type,
      room_id: formData.room_id === '' ? undefined : formData.room_id,
      status: device ? device.status : formData.status
    };
    
    onSubmit(submitData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={device ? '✏️ Edit Perangkat' : '➕ Tambah Perangkat'}
    >
      <div className="p-6">
        <div className="space-y-4">
          {/* For new devices, show ID field */}
          {!device && (
            <div>
              <Input
                label="ID Perangkat"
                value={formData.device_id}
                name="device_id"
                onChange={(e) => handleChange('device_id')(e.target.value)}
                placeholder="ESP32-RFID-01"
              />
            </div>
          )}
          
          {/* Device Name - Always editable */}
          <div>
            <Input
              label="Nama Perangkat"
              value={formData.device_name}
              name="device_name"
              onChange={(e) => handleChange('device_name')(e.target.value)}
              placeholder="Contoh: Door Lock A01, Scanner B02"
            />
          </div>
          
          {/* For new devices, show device type */}
          {!device && (
            <div>
              <Select
                label="Tipe Perangkat"
                value={formData.device_type}
                name="device_type"
                onChange={(value) => handleChange('device_type')(value)}
                options={[
                  { label: 'Kunci Pintu', value: 'door_lock' },
                  { label: '💳 Pembaca Kartu', value: 'card_scanner' }
                ]}
              />
            </div>
          )}
          
          {/* Room Assignment - Always editable */}
          <div>
            <Select
              label="Kamar"
              value={formData.room_id}
              name="room_id"
              onChange={(value) => handleChange('room_id')(value)}
              options={[
                { label: '🚫 Belum Ditugaskan ke Kamar', value: '' },
                ...rooms.map(room => {
                  const tenantName = room.tenant?.user_name || room.tenant?.name || room.tenant_name || null;
                  return {
                    label: `Kamar ${room.room_number}${tenantName ? ` - ${tenantName}` : ' - Kosong'}`,
                    value: room.id.toString()
                  };
                })
              ]}
            />
          </div>
          
          {/* Read-only device info for editing */}
          {device && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Info Perangkat</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Perangkat:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{device.device_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipe:</span>
                  <span>{device.device_type === 'door_lock' ? 'Kunci Pintu' : 'Pembaca Kartu'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={device.status === 'online' ? 'text-green-600' : 'text-red-600'}>
{device.status === 'online' ? 'Terhubung' : 'Terputus'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {device ? 'Update' : 'Simpan'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeviceForm;
