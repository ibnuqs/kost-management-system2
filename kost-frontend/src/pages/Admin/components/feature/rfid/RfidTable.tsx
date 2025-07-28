// File: src/pages/Admin/components/feature/rfid/RfidTable.tsx
import React from 'react';
import { Search, Edit, Power, Trash2, CreditCard, User, Home } from 'lucide-react';
import type { RfidCard } from '../../../types/rfid';

interface RfidTableProps {
  cards: RfidCard[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (card: RfidCard) => void;
  onToggleStatus: (cardId: number) => void;
  onDelete: (cardId: number) => void;
}

// Helper function to get room display name
const getRoomDisplay = (room: any) => {
  if (!room) return 'No room access';
  return room.room_number || room.number || room.title || `Room ${room.id}`;
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="p-8 text-center">
    <div className="space-y-4">
      <div className="animate-pulse">
        <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <tr>
    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
      <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Kartu RFID tidak ditemukan</h3>
      <p>Tidak ada kartu yang sesuai dengan kriteria pencarian.</p>
    </td>
  </tr>
);

// Card row component
const CardRow: React.FC<{
  card: RfidCard;
  onEdit: (card: RfidCard) => void;
  onToggleStatus: (cardId: number) => void;
  onDelete: (cardId: number) => void;
}> = ({ card, onEdit, onToggleStatus, onDelete }) => (
  <tr key={card.id} className="hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900 font-mono">
            {card.uid}
          </div>
          <div className="text-sm text-gray-500">
            ID: {card.id}
          </div>
        </div>
      </div>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      {card.user ? (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {card.user.name}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {card.user.email}
            </div>
          </div>
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Belum ditugaskan</span>
      )}
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      {card.tenant?.room ? (
        <div className="flex items-center">
          <Home className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-900">
            {getRoomDisplay(card.tenant.room)}
          </span>
        </div>
      ) : card.room ? (
        <div className="flex items-center">
          <Home className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-900">
            {getRoomDisplay(card.room)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Tidak ada akses kamar</span>
      )}
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      {card.device_id ? (
        <div className="flex items-center">
          <div className="p-1 bg-purple-100 rounded text-purple-600 mr-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
            </svg>
          </div>
          <span className="text-sm text-gray-900 font-mono">
            {card.device_id}
          </span>
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Tidak ada perangkat</span>
      )}
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        card.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full mr-1.5 ${card.status === 'active' ? 'bg-green-400' : 'bg-red-400'}"></span>
        {card.status === 'active' ? 'Aktif' : 'Nonaktif'}
      </span>
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {(() => {
        try {
          if (!card.created_at) return 'Tidak diketahui';
          
          const date = new Date(card.created_at);
          if (isNaN(date.getTime())) {
            return 'Format tanggal tidak valid';
          }
          
          return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric'
          });
        } catch (error) {
          console.warn('Date parsing error for card:', card.id, card.created_at);
          return 'Error format tanggal';
        }
      })()}
    </td>
    
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(card)}
          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-md transition-colors"
          title="Edit penugasan kartu"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onToggleStatus(card.id)}
          className={`p-2 hover:bg-gray-50 rounded-md transition-colors ${
            card.status === 'active' 
              ? 'text-orange-600 hover:text-orange-900' 
              : 'text-green-600 hover:text-green-900'
          }`}
          title={card.status === 'active' ? 'Nonaktifkan kartu' : 'Aktifkan kartu'}
        >
          <Power className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(card.id)}
          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-md transition-colors"
          title="Hapus kartu"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

export const RfidTable: React.FC<RfidTableProps> = ({
  cards,
  loading,
  searchTerm,
  onSearchChange,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 border-b bg-gray-50">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Kartu RFID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan UID, nama pengguna, email, atau kamar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
          {searchTerm && (
            <p className="mt-1 text-sm text-gray-500">
              Ditemukan {cards.length} kartu yang sesuai dengan "{searchTerm}"
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Informasi Kartu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pengguna
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akses Kamar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dibuat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.length === 0 ? (
              <EmptyState />
            ) : (
              cards.map((card) => (
                <CardRow
                  key={card.id}
                  card={card}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {cards.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Menampilkan {cards.length} kartu
              {searchTerm && ` yang sesuai dengan "${searchTerm}"`}
            </div>
            <div className="flex items-center gap-4">
              <span>{cards.filter(c => c.status === 'active').length} aktif</span>
              <span>{cards.filter(c => c.user_id).length} ditugaskan</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};