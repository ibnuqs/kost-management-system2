import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/Card';
import { Button } from '../../ui/Forms';
import { Modal } from '../../ui/Modal';

interface RfidCard {
  id: number;
  uid: string;
  user_id: number | null;
  room_id: number | null;
  device_id: string | null;
  status: 'active' | 'inactive';
  room?: {
    id: number;
    room_number: string;
    room_name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface IoTDevice {
  id: number;
  device_id: string;
  device_name: string;
  room_id: number | null;
  status: string;
}

interface UpdateResult {
  success: boolean;
  message: string;
  updated_count?: number;
  error_count?: number;
  details?: Array<{
    card_uid: string;
    status: 'updated' | 'error';
    device_id?: string;
    message?: string;
  }>;
}

const RfidDeviceUpdater: React.FC = () => {
  const [cardsWithoutDevice, setCardsWithoutDevice] = useState<RfidCard[]>([]);
  const [iotDevices, setIoTDevices] = useState<IoTDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateResult | null>(null);

  // Fetch cards without device_id
  const fetchCardsWithoutDevice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/rfid-cards?filter=no_device_id', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCardsWithoutDevice(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch IoT devices
  const fetchIoTDevices = async () => {
    try {
      const response = await fetch('/api/admin/iot-devices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIoTDevices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching IoT devices:', error);
    }
  };

  useEffect(() => {
    fetchCardsWithoutDevice();
    fetchIoTDevices();
  }, []);

  // Update device IDs
  const updateDeviceIds = async () => {
    if (cardsWithoutDevice.length === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/rfid-cards/update-device-ids', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          cards: cardsWithoutDevice.map(card => ({
            id: card.id,
            uid: card.uid,
            room_id: card.room_id
          }))
        }),
      });

      const result = await response.json();
      setUpdateResult(result);
      setShowModal(true);

      if (result.success) {
        // Refresh the list
        fetchCardsWithoutDevice();
      }
    } catch (error) {
      console.error('Error updating device IDs:', error);
      setUpdateResult({
        success: false,
        message: 'Network error occurred while updating device IDs'
      });
      setShowModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine which device should be assigned to a card
  const getRecommendedDevice = (card: RfidCard): string => {
    if (card.room_id) {
      const deviceForRoom = iotDevices.find(device => 
        device.room_id === card.room_id && 
        device.device_id.includes('RFID')
      );
      if (deviceForRoom) {
        return deviceForRoom.device_id;
      }
    }
    return 'ESP32-RFID-01'; // Default device
  };

  const renderResultModal = () => {
    if (!updateResult) return null;

    return (
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={updateResult.success ? '✅ Update Successful' : '❌ Update Failed'}
      >
        <div className="space-y-4">
          <p className="text-gray-700">{updateResult.message}</p>
          
          {updateResult.success && updateResult.updated_count !== undefined && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Successfully updated: {updateResult.updated_count} cards
              </p>
              {updateResult.error_count && updateResult.error_count > 0 && (
                <p className="text-orange-600">
                  ⚠️ Errors encountered: {updateResult.error_count} cards
                </p>
              )}
            </div>
          )}

          {updateResult.details && updateResult.details.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              <h4 className="font-medium mb-2">Update Details:</h4>
              <div className="space-y-2">
                {updateResult.details.map((detail, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded text-sm ${
                      detail.status === 'updated' 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    <div className="font-mono">
                      {detail.status === 'updated' ? '✅' : '❌'} {detail.card_uid}
                      {detail.device_id && ` → ${detail.device_id}`}
                    </div>
                    {detail.message && (
                      <div className="text-xs mt-1">{detail.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setShowModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              🔧 RFID Device ID Updater
            </h3>
            <p className="text-sm text-gray-600">
              Update existing RFID cards with device_id for strict validation
            </p>
          </div>
          <Button
            variant="primary"
            onClick={fetchCardsWithoutDevice}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading cards...</div>
          </div>
        ) : cardsWithoutDevice.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg">✅ All RFID cards have device_id assigned!</div>
            <p className="text-gray-600 mt-2">Strict validation system is ready to use.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-yellow-600 text-lg mr-2">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-800">
                    {cardsWithoutDevice.length} cards need device_id assignment
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    These cards cannot use strict validation until device_id is assigned.
                  </p>
                </div>
              </div>
            </div>

            {/* Cards List */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Card UID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Room
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recommended Device
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cardsWithoutDevice.map((card) => (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm">{card.uid}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {card.room ? (
                          <span className="text-sm">
                            {card.room.room_number} - {card.room.room_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No Room</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {card.user ? (
                          <span className="text-sm">{card.user.name}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">No User</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-blue-600">
                          {getRecommendedDevice(card)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          card.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {card.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Update Button */}
            <div className="flex justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={updateDeviceIds}
                disabled={isUpdating || cardsWithoutDevice.length === 0}
                className="px-8"
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating Device IDs...
                  </span>
                ) : (
                  `🔧 Update ${cardsWithoutDevice.length} Cards with Device IDs`
                )}
              </Button>
            </div>
          </div>
        )}

        {renderResultModal()}
      </CardContent>
    </Card>
  );
};

export default RfidDeviceUpdater;