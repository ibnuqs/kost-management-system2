// File: src/pages/Admin/components/feature/rfid/RfidAccessControl.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../ui/Card';
import { StatusBadge } from '../../ui/Status/StatusBadge';
import { Button } from '../../ui/Forms/Button';
import { Input } from '../../ui/Forms/Input';
import { Select } from '../../ui/Forms/Select';
import { Modal } from '../../ui/Modal';
import { useRfidEvents } from '../../../../../hooks';
import { esp32Service } from '../../../services/esp32Service';

interface LocalRfidCard {
  id: string;
  card_uid: string;
  user_id: string;
  room_id?: string;
  status: 'active' | 'inactive' | 'lost' | 'expired';
  issued_at: string;
  expires_at?: string;
  user?: {
    name: string;
    email: string;
  };
  room?: {
    room_number: string;
    room_name: string;
  };
}

interface AccessAttempt {
  id: string;
  card_uid: string;
  device_id: string;
  access_granted: boolean;
  reason: string;
  timestamp: string;
  user_name?: string;
  room_number?: string;
}

export const RfidAccessControl: React.FC = () => {
  const [cards, setCards] = useState<LocalRfidCard[]>([]);
  const [accessAttempts, setAccessAttempts] = useState<AccessAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'access' | null>(null);
  const [newCardForm, setNewCardForm] = useState({
    card_uid: '',
    user_id: '',
    room_id: '',
    expires_at: ''
  });

  // Use MQTT hook for real-time RFID events (with fallback for demo mode)
  const { recentScans, isConnected, sendRfidResponse } = useRfidEvents();

  const sendResponse = useCallback((uid: string, response: unknown) => {
    if (sendRfidResponse) {
      return sendRfidResponse(uid, response);
    } else {
      console.log('Demo mode: would send response', uid, response);
      return false;
    }
  }, [sendRfidResponse]);

  useEffect(() => {
    fetchCards();
    fetchRecentAttempts();
  }, []);

  const processRfidScan = useCallback(async (scan: RfidScan) => {
    try {
      console.log('🔍 Processing RFID scan with ESP32 service:', { scan });
      
      // Use ESP32 service to process scan (includes auto-registration and database logging)
      const response = await esp32Service.processRfidScan({
        uid: scan.uid,
        device_id: scan.device_id,
        signal_strength: scan.signal_strength
      });
      
      console.log('✅ ESP32 service response:', response);

      // Send response back to ESP32
      sendResponse(scan.uid, response);

      // Refresh data to show new cards/attempts
      fetchCards();
      fetchRecentAttempts();

    } catch (error) {
      console.error('❌ Error processing RFID scan:', error);
      
      // Send error response
      sendResponse(scan.uid, {
        status: 'error',
        user: 'System',
        message: 'System error occurred',
        access_granted: false
      });
    }
  }, [sendResponse]);

  // Handle real-time RFID scans
  useEffect(() => {
    recentScans.forEach(scan => {
      if (!scan.response) {
        // Process the scan and send response
        processRfidScan(scan);
      }
    });
  }, [recentScans, processRfidScan]);

  const fetchCards = async () => {
    try {
      // Use real service with fallback to mock data
      const cardsResponse = await esp32Service.getRfidCards();
      // Ensure we always have an array and map to LocalRfidCard format
      const cardsArray = Array.isArray(cardsResponse) ? cardsResponse.map(card => ({
        id: card.id.toString(),
        card_uid: card.uid,
        user_id: card.user_id?.toString() || '',
        room_id: card.tenant?.room?.id?.toString(),
        status: card.status === 'active' ? 'active' as const : 'inactive' as const,
        issued_at: card.created_at || new Date().toISOString(),
        expires_at: undefined,
        user: card.user ? {
          name: card.user.name,
          email: card.user.email
        } : undefined,
        room: card.tenant?.room ? {
          room_number: card.tenant.room.room_number,
          room_name: card.tenant.room.room_name || `Room ${card.tenant.room.room_number}`
        } : undefined
      })) : [];
      setCards(cardsArray);
    } catch (error) {
      console.error('Error fetching cards:', error);
      // Fallback to mock data
      const mockCards: LocalRfidCard[] = [
        {
          id: '1',
          card_uid: 'A1B2C3D4',
          user_id: '1',
          room_id: '1',
          status: 'active',
          issued_at: '2024-01-15T00:00:00Z',
          expires_at: '2024-12-31T23:59:59Z',
          user: {
            name: 'John Doe',
            email: 'john@example.com'
          },
          room: {
            room_number: '101',
            room_name: 'Room 101'
          }
        },
        {
          id: '2',
          card_uid: 'E5F6A7B8',
          user_id: '2',
          status: 'active',
          issued_at: '2024-02-01T00:00:00Z',
          user: {
            name: 'Jane Smith',
            email: 'jane@example.com'
          }
        },
        {
          id: '3',
          card_uid: '01CB261E',
          user_id: '3',
          room_id: '2',
          status: 'active',
          issued_at: '2025-01-01T00:00:00Z',
          expires_at: '2025-12-31T23:59:59Z',
          user: {
            name: 'ESP32 Test User',
            email: 'test@example.com'
          },
          room: {
            room_number: '102',
            room_name: 'Room 102'
          }
        }
      ];
      
      setCards(mockCards);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentAttempts = async () => {
    try {
      // Use real service with fallback to mock data
      const attempts = await esp32Service.getAccessAttempts(20);
      setAccessAttempts(attempts);
    } catch (_error) {
      console.error('Error fetching access attempts:', _error);
      // Fallback to mock data
      const mockAttempts: AccessAttempt[] = [
        {
          id: '1',
          card_uid: 'A1B2C3D4',
          device_id: 'ESP32-RFID-01',
          access_granted: true,
          reason: 'Valid card',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user_name: 'John Doe',
          room_number: '101'
        },
        {
          id: '2',
          card_uid: 'UNKNOWN123',
          device_id: 'ESP32-RFID-01',
          access_granted: false,
          reason: 'Card not found',
          timestamp: new Date(Date.now() - 600000).toISOString()
        }
      ];
      
      setAccessAttempts(mockAttempts);
    }
  };

  const handleAddCard = async () => {
    try {
      // Validate form
      if (!newCardForm.card_uid || !newCardForm.user_id) {
        alert('Please fill in required fields');
        return;
      }

      // Check if card UID already exists
      if (Array.isArray(cards) && cards.some(c => c.card_uid === newCardForm.card_uid)) {
        alert('Card UID already exists');
        return;
      }

      // In real app, this would be an API call
      const newCard: LocalRfidCard = {
        id: Date.now().toString(),
        card_uid: newCardForm.card_uid,
        user_id: newCardForm.user_id,
        room_id: newCardForm.room_id || undefined,
        status: 'active',
        issued_at: new Date().toISOString(),
        expires_at: newCardForm.expires_at || undefined,
        user: {
          name: 'New User', // Would come from user lookup
          email: 'user@example.com'
        }
      };

      setCards(prev => [newCard, ...prev]);
      setModalType(null);
      setNewCardForm({ card_uid: '', user_id: '', room_id: '', expires_at: '' });
      
      alert('Card added successfully');
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Error adding card');
    }
  };

  const handleCardAction = (card: LocalRfidCard, action: 'activate' | 'deactivate' | 'block' | 'delete') => {
    try {
      switch (action) {
        case 'activate':
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'active' } : c));
          break;
        case 'deactivate':
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'inactive' } : c));
          break;
        case 'block':
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'lost' } : c));
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this card?')) {
            setCards(prev => prev.filter(c => c.id !== card.id));
          }
          break;
      }
    } catch {
      console.error(`Error ${action} card:`);
    }
  };

  const formatDateTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="mt-4 text-gray-600">Loading RFID cards...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RFID Access Control</h2>
          <p className="text-gray-600">Manage RFID cards and access permissions</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge 
            status={`MQTT ${isConnected ? 'Connected' : 'Disconnected'}`}
            variant={isConnected ? 'success' : 'error'}
          />
          <Button onClick={() => setModalType('add')}>
            ➕ Add Card
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">{Array.isArray(cards) ? cards.length : 0}</div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Total Cards</div>
                <div className="text-xs text-gray-400">Issued cards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {Array.isArray(cards) ? cards.filter(c => c.status === 'active').length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Active</div>
                <div className="text-xs text-gray-400">Working cards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-600">
                {Array.isArray(cards) ? cards.filter(c => c.status === 'lost').length : 0}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Blocked</div>
                <div className="text-xs text-gray-400">Lost/stolen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-600">
                {recentScans.length}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-500">Live Scans</div>
                <div className="text-xs text-gray-400">Real-time activity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFID Cards Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">RFID Cards</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Card UID</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Room</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Issued</th>
                  <th className="text-left py-3 px-4">Expires</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(cards) ? cards.map(card => (
                  <tr key={card.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{card.card_uid}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{card.user?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{card.user?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {card.room ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {card.room.room_number}
                        </span>
                      ) : (
                        <span className="text-gray-400">No room</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(card.status)}`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatDateTime(card.issued_at)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {card.expires_at ? formatDateTime(card.expires_at) : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {card.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCardAction(card, 'deactivate')}
                          >
                            ⏸️
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCardAction(card, 'activate')}
                          >
                            ▶️
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCardAction(card, 'block')}
                        >
                          🚫
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCardAction(card, 'delete')}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No RFID cards found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Access Attempts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Access Attempts</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessAttempts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <div>No recent access attempts</div>
              </div>
            ) : (
              accessAttempts.map(attempt => (
                <div 
                  key={attempt.id} 
                  className={`border rounded-lg p-4 ${attempt.access_granted ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${attempt.access_granted ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="font-medium font-mono text-sm">{attempt.card_uid}</div>
                        <div className="text-sm text-gray-600">
                          {attempt.user_name || 'Unknown User'} • {attempt.device_id}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge 
                        status={attempt.access_granted ? 'Granted' : 'Denied'}
                        variant={attempt.access_granted ? 'success' : 'error'}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(attempt.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {attempt.reason}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Card Modal */}
      {modalType === 'add' && (
        <Modal
          isOpen={true}
          onClose={() => setModalType(null)}
          title="Add New RFID Card"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Card UID *</label>
              <Input
                value={newCardForm.card_uid}
                onChange={(e) => setNewCardForm(prev => ({ ...prev, card_uid: e.target.value }))}
                placeholder="A1B2C3D4"
                className="font-mono"
              />
              <div className="text-xs text-gray-500 mt-1">
                Scan a card or enter manually
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User *</label>
              <Select
                value={newCardForm.user_id}
                onChange={(value) => setNewCardForm(prev => ({ ...prev, user_id: value }))}
                options={[
                  { value: "", label: "Select User" },
                  { value: "1", label: "John Doe" },
                  { value: "2", label: "Jane Smith" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Room (Optional)</label>
              <Select
                value={newCardForm.room_id}
                onChange={(value) => setNewCardForm(prev => ({ ...prev, room_id: value }))}
                options={[
                  { value: "", label: "No specific room" },
                  { value: "1", label: "Room 101" },
                  { value: "2", label: "Room 102" }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
              <Input
                type="datetime-local"
                value={newCardForm.expires_at}
                onChange={(e) => setNewCardForm(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setModalType(null)}>
                Cancel
              </Button>
              <Button onClick={handleAddCard}>
                Add Card
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};