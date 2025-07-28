// File: src/pages/Tenant/components/feature/door/TenantDoorControl.tsx
import React, { useState } from 'react';
import { DoorOpen, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useTenantDoorControl } from '../../../hooks/useDoorControl';
import { useRfidEvents } from '../../../../../hooks/useRfidEvents';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Buttons';
import { Modal } from '../../ui/Modal';
import { StatusBadge } from '../../ui/Status';

const TenantDoorControl: React.FC = () => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { 
    doorStatus, 
    openDoor, 
    isOpeningDoor 
  } = useTenantDoorControl();
  
  // Get MQTT connection status
  const { isConnected } = useRfidEvents();

  const handleOpenDoor = () => {
    setShowConfirmModal(true);
  };

  const confirmOpenDoor = () => {
    openDoor('Manual door open from tenant dashboard');
    setShowConfirmModal(false);
  };



  return (
    <>
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <DoorOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Kontrol Pintu</h3>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status Koneksi</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <StatusBadge status="success" label="Terhubung" size="sm" />
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <StatusBadge status="error" label="Terputus" size="sm" />
                </>
              )}
            </div>
          </div>


          {/* Last Update */}
          {doorStatus?.last_seen && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Terakhir Update</span>
              <span className="text-xs text-gray-500">
                {new Date(doorStatus.last_seen).toLocaleTimeString('id-ID')}
              </span>
            </div>
          )}

          {/* Open Door Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              fullWidth
              onClick={handleOpenDoor}
              disabled={!isConnected || isOpeningDoor}
              loading={isOpeningDoor}
              icon={DoorOpen}
            >
              {isOpeningDoor ? 'Membuka Pintu...' : 'Buka Pintu'}
            </Button>
          </div>

          {/* Warning for disconnected state */}
          {!isConnected && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">Koneksi Terputus</p>
                <p className="text-yellow-700">
                  Sistem tidak dapat mengirim perintah buka pintu. Silakan hubungi admin jika masalah berlanjut.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Konfirmasi Buka Pintu"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              Apakah Anda yakin ingin membuka pintu kamar Anda?
            </p>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <DoorOpen className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Informasi:</p>
                  <p>Pintu akan terbuka selama 5 detik dan akan tertutup otomatis untuk keamanan.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="secondary" 
                onClick={() => setShowConfirmModal(false)}
              >
                Batal
              </Button>
              <Button 
                variant="primary" 
                onClick={confirmOpenDoor}
                icon={DoorOpen}
              >
                Ya, Buka Pintu
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TenantDoorControl;