// File: src/pages/Admin/components/feature/rfid/RfidScanModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Scan, WifiOff, CheckCircle, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRfidScanner } from '../../../../../hooks/useRfidScanner';
import { esp32Service } from '../../../services/esp32Service';

interface ScannedCard {
  uid: string;
  device_id: string;
  signal_strength?: number;
  timestamp: number;
}

interface ExistingCard {
  uid: string;
  user?: { name: string; email: string };
  room?: { room_number: string };
  status: string;
}

interface RfidScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardScanned: (uid: string) => void;
  scanTimeoutMs?: number;
}

export const RfidScanModal: React.FC<RfidScanModalProps> = ({
  isOpen,
  onClose,
  onCardScanned,
  scanTimeoutMs = 30000
}) => {
  const {
    isScanning,
    scannedCard,
    error,
    startScanning,
    stopScanning,
    clearScannedCard,
    clearError,
    isConnected
  } = useRfidScanner(scanTimeoutMs);

  const [existingCard, setExistingCard] = useState<ExistingCard | null>(null);
  const [checkingCard, setCheckingCard] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Check if UID already exists in database
  const checkCardExists = async (uid: string): Promise<ExistingCard | null> => {
    try {
      setCheckingCard(true);
      console.log('🔍 Checking if card exists:', uid);
      
      const cards = await esp32Service.getRfidCards();
      const existingCard = cards.find(card => card.uid.toUpperCase() === uid.toUpperCase());
      
      if (existingCard) {
        console.log('⚠️ Card already exists:', existingCard);
        return {
          uid: existingCard.uid,
          user: existingCard.user,
          room: existingCard.room,
          status: existingCard.status
        };
      }
      
      console.log('✅ Card is new (not in database)');
      return null;
    } catch (error) {
      console.error('❌ Error checking card existence:', error);
      return null;
    } finally {
      setCheckingCard(false);
    }
  };

  // Manual start scanning - removed auto-start to prevent bugs
  const handleStartScan = () => {
    console.log('🔍 RFID Scan Modal: Manual start scan...');
    
    if (isConnected) {
      console.log('✅ MQTT connected, starting scan...');
      const success = startScanning(async (card: ScannedCard) => {
        console.log('✨ Card scanned in modal:', card);
        
        // Check if card already exists
        const existing = await checkCardExists(card.uid);
        if (existing) {
          setExistingCard(existing);
          return; // Don't proceed with onCardScanned
        }
        
        // Card is new, proceed normally with countdown
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev && prev > 1) {
              return prev - 1;
            } else {
              clearInterval(countdownInterval);
              onCardScanned(card.uid);
              return null;
            }
          });
        }, 1000);
      });
      
      if (!success) {
        console.warn('⚠️ Failed to start scanning');
      }
    } else {
      console.warn('❌ MQTT not connected, cannot start scanning');
    }
  };

  // Simple cleanup on unmount
  useEffect(() => {
    return () => {
      if (isScanning) {
        console.log('🧹 Cleaning up scan on modal unmount...');
        stopScanning();
      }
    };
  }, [isScanning, stopScanning]);

  // Handle close
  const handleClose = () => {
    stopScanning();
    clearScannedCard();
    clearError();
    setExistingCard(null);
    setCountdown(null);
    onClose();
  };

  // Handle retry
  const handleRetry = () => {
    clearError();
    clearScannedCard();
    setExistingCard(null);
    setCountdown(null);
    if (isConnected) {
      startScanning(async (card: ScannedCard) => {
        // Check if card already exists
        const existing = await checkCardExists(card.uid);
        if (existing) {
          setExistingCard(existing);
          return;
        }
        
        // Start countdown for new card
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev && prev > 1) {
              return prev - 1;
            } else {
              clearInterval(countdownInterval);
              onCardScanned(card.uid);
              return null;
            }
          });
        }, 1000);
      });
    }
  };

  // Handle force use existing card
  const handleForceUse = () => {
    if (existingCard) {
      onCardScanned(existingCard.uid);
    }
  };

  if (!isOpen) return null;

  // Connection check
  if (!isConnected) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
          
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <WifiOff className="h-6 w-6 text-red-500" />
                  Koneksi Terputus
                </h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <WifiOff className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-600 mb-4">
                  MQTT tidak terhubung. Pemindaian RFID tidak tersedia.
                </p>
                <p className="text-sm text-gray-500">
                  Pastikan koneksi internet stabil dan MQTT broker dapat diakses.
                </p>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Scan className="h-6 w-6 text-blue-600" />
                Pindai Kartu RFID
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Ready to Scan State */}
            {!isScanning && !scannedCard && !error && (
              <div className="text-center py-8">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Scan className="w-12 h-12 text-blue-600" />
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Siap untuk Memindai
                </h4>
                <p className="text-gray-600 mb-6">
                  Klik tombol "Mulai Pindai" lalu tempelkan kartu RFID ke pembaca ESP32
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleStartScan}
                    disabled={!isConnected}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Mulai Pindai
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Scanning State */}
            {isScanning && !scannedCard && !error && (
              <div className="text-center py-8">
                {/* Animated scanner icon */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                    <Scan className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
                
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Menunggu Kartu RFID...
                </h4>
                <p className="text-gray-600 mb-4">
                  Tempelkan kartu RFID Anda ke pembaca ESP32
                </p>
                
                {/* Progress indicator */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full animate-pulse"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  Timeout: {Math.ceil(scanTimeoutMs / 1000)} detik
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => stopScanning()}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Hentikan Scan
                  </button>
                </div>
              </div>
            )}

            {/* Checking Card State */}
            {checkingCard && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                
                <h4 className="text-lg font-medium text-yellow-900 mb-2">
                  Memeriksa Kartu...
                </h4>
                <p className="text-yellow-600">
                  Mengecek apakah kartu sudah terdaftar di database
                </p>
              </div>
            )}

            {/* Card Already Exists State */}
            {existingCard && !checkingCard && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
                
                <h4 className="text-lg font-medium text-orange-900 mb-2">
                  Kartu Sudah Terdaftar!
                </h4>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-left">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">UID:</span>
                      <span className="font-mono font-bold text-orange-700">{existingCard.uid}</span>
                    </div>
                    {existingCard.user && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pengguna:</span>
                        <span className="text-orange-700">{existingCard.user.name}</span>
                      </div>
                    )}
                    {existingCard.room && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kamar:</span>
                        <span className="text-orange-700">{existingCard.room.room_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        existingCard.status === 'active' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {existingCard.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-orange-600 mb-6">
                  Kartu ini sudah terdaftar dalam sistem. Pilih tindakan:
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Pindai Lagi
                  </button>
                  <button
                    onClick={handleForceUse}
                    className="flex-1 px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Tetap Gunakan
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {scannedCard && !error && !existingCard && !checkingCard && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                
                <h4 className="text-lg font-medium text-green-900 mb-2">
                  Kartu Berhasil Dipindai!
                </h4>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">UID:</span>
                      <span className="font-mono font-bold text-green-700">{scannedCard.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device:</span>
                      <span className="text-green-700">{scannedCard.device_id}</span>
                    </div>
                    {scannedCard.signal_strength && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Signal:</span>
                        <span className="text-green-700">{scannedCard.signal_strength} dBm</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu:</span>
                      <span className="text-green-700">
                        {new Date(scannedCard.timestamp).toLocaleTimeString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  UID kartu akan otomatis terisi di form registrasi dalam{' '}
                  <span className="font-bold text-green-600">
                    {countdown !== null ? `${countdown} detik` : '3 detik'}
                  </span>
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ 
                      width: countdown !== null ? `${(countdown / 3) * 100}%` : '100%' 
                    }}
                  ></div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Pindai Lagi
                  </button>
                  <button
                    onClick={() => {
                      if (scannedCard) {
                        onCardScanned(scannedCard.uid);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Gunakan Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                
                <h4 className="text-lg font-medium text-red-900 mb-2">
                  Pemindaian Gagal
                </h4>
                
                <p className="text-red-600 mb-4">{error}</p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-red-900 mb-2">Saran Troubleshooting:</h5>
                  <ul className="text-sm text-red-700 space-y-1 text-left">
                    <li>• Pastikan kartu RFID valid dan berfungsi</li>
                    <li>• Dekatkan kartu ke pembaca ESP32</li>
                    <li>• Periksa koneksi MQTT dan WiFi ESP32</li>
                    <li>• Coba restart ESP32 jika perlu</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {/* Connection Status Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                MQTT {isConnected ? 'Terhubung' : 'Terputus'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};