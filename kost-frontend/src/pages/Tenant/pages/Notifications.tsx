// File: src/pages/Tenant/pages/Notifications.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Filter, Check, Archive, Trash2, Settings, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useUnreadNotificationsCount } from '../hooks/useNotifications';
import { PageHeader } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { Button, IconButton } from '../components/ui/Buttons';
import { SearchInput, Select } from '../components/ui/Forms';
import { StatusBadge, LoadingSpinner } from '../components/ui/Status';
import { Modal } from '../components/ui/Modal';
import { getNotificationTypeColor, getNotificationTypeIcon, getNotificationPriorityColor, NotificationType, NotificationStatus } from '../types/notification';
import { formatTimeAgo } from '../utils/formatters';
import { mergeClasses, isMobile } from '../utils/helpers';
import { MOBILE_SPECIFIC } from '../utils/constants';

const Notifications: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({
    payment: true,
    access: true,
    system: true,
  });
  
  const { 
    notifications, 
    pagination, 
    isLoading, 
    isError, 
    error,
    refreshNotifications 
  } = useNotifications({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    per_page: 20,
  });

  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const { unreadCount } = useUnreadNotificationsCount();

  // Play notification sound when new notifications arrive
  useEffect(() => {
    if (unreadCount > previousUnreadCount && soundEnabled && previousUnreadCount > 0) {
      // Play notification beep sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {
        console.log('Could not play notification sound:', e);
      }
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, soundEnabled, previousUnreadCount]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };

  const handleNotificationSettings = () => {
    setShowSettingsModal(true);
  };

  const handleBellClick = () => {
    // Function untuk bell icon - bisa untuk toggle sound, mark all as read, atau lainnya
    if (hasUnreadNotifications) {
      handleMarkAllAsRead();
    } else {
      handleRefresh();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedNotifications(checked ? notifications.map(n => n.id) : []);
  };

  const handleSelectNotification = (notificationId: number, checked: boolean) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconName = getNotificationTypeIcon(type);
    // Simple mapping for demo - in real app would use proper icon components
    return <Bell className="w-4 h-4" />;
  };

  const isOnMobile = isMobile();
  const allSelected = notifications.length > 0 && notifications.every(n => selectedNotifications.includes(n.id));
  const someSelected = notifications.some(n => selectedNotifications.includes(n.id));
  const hasUnreadNotifications = notifications.some(n => n.status === 'unread');

  // Custom Bell Icon with Badge
  const BellIconWithBadge = ({ className = "w-6 h-6" }) => (
    <div className="relative">
      <Bell className={mergeClasses(
        className,
        unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-blue-600'
      )} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Gagal Memuat Notifikasi
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            {error?.message || 'Terjadi kesalahan saat memuat notifikasi Anda.'}
          </p>
          <Button onClick={handleRefresh} variant="primary" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={mergeClasses(
      'min-h-screen bg-gray-50',
      MOBILE_SPECIFIC.MOBILE_PADDING,
      'pb-24 md:pb-6'
    )}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Notifikasi"
          subtitle={`${pagination?.total || 0} notifikasi • ${unreadCount || 0} belum dibaca`}
          icon={() => <BellIconWithBadge className="w-6 h-6" />}
          actions={
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <IconButton
                variant="secondary"
                size="sm"
                icon={Settings}
                onClick={handleNotificationSettings}
                className="hidden sm:inline-flex"
              />
              
              {hasUnreadNotifications && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Check}
                  onClick={handleMarkAllAsRead}
                  loading={markAllAsRead.isPending}
                  className="hidden sm:inline-flex"
                >
                  Tandai Semua Sudah Dibaca
                </Button>
              )}
              
              <Button
                variant="primary"
                size="sm"
                onClick={handleRefresh}
                loading={isRefreshing}
                className="hidden sm:inline-flex"
              >
                Perbarui
              </Button>
              
              {/* Mobile actions */}
              <div className="sm:hidden flex items-center gap-1">
                <IconButton
                  variant="secondary"
                  size="sm"
                  icon={Settings}
                  onClick={handleNotificationSettings}
                />
                
                {hasUnreadNotifications && (
                  <IconButton
                    variant="secondary"
                    size="sm"
                    icon={Check}
                    onClick={handleMarkAllAsRead}
                    loading={markAllAsRead.isPending}
                  />
                )}
                
                <div className="relative">
                  <IconButton
                    variant="primary"
                    size="sm"
                    icon={Bell}
                    onClick={handleBellClick}
                    loading={isRefreshing || markAllAsRead.isPending}
                  />
                  {hasUnreadNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </div>
            </div>
          }
        />

        {/* Filters */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Filter</h3>
          </div>
          
          {/* Desktop filters */}
          <div className="hidden sm:grid grid-cols-3 gap-4">
            <SearchInput
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onSearch={handleSearch}
            />
            
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'all')}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'unread', label: 'Belum Dibaca' },
                { value: 'read', label: 'Sudah Dibaca' },
              ]}
            />
            
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
              options={[
                { value: 'all', label: 'Semua Jenis' },
                { value: 'payment', label: 'Pembayaran' },
                { value: 'access', label: 'Akses' },
                { value: 'system', label: 'Sistem' },
              ]}
            />
          </div>
          
          {/* Mobile filters - stacked */}
          <div className="sm:hidden space-y-3">
            <SearchInput
              placeholder="Cari notifikasi..."
              value={searchQuery}
              onSearch={handleSearch}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as NotificationStatus | 'all')}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'unread', label: 'Belum Dibaca' },
                  { value: 'read', label: 'Sudah Dibaca' },
                ]}
              />
              
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
                options={[
                  { value: 'all', label: 'Semua Jenis' },
                  { value: 'payment', label: 'Pembayaran' },
                  { value: 'access', label: 'Akses' },
                  { value: 'system', label: 'Sistem' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm font-medium text-blue-800">
                {selectedNotifications.length} notifikasi dipilih
              </span>
              
              {/* Desktop actions */}
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={Check}>
                  Tandai Sudah Dibaca
                </Button>
                <Button variant="secondary" size="sm" icon={Archive}>
                  Arsipkan
                </Button>
                <Button variant="danger" size="sm" icon={Trash2}>
                  Hapus
                </Button>
              </div>
              
              {/* Mobile actions */}
              <div className="sm:hidden flex items-center gap-2 w-full">
                <Button variant="secondary" size="sm" icon={Check} className="flex-1">
                  Baca
                </Button>
                <Button variant="secondary" size="sm" icon={Archive} className="flex-1">
                  Arsip
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} className="flex-1">
                  Hapus
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <div className="text-center py-8 sm:py-12 px-4">
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Tidak ada notifikasi
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Tidak ada notifikasi yang sesuai dengan filter Anda.'
                  : 'Anda sudah up to date! Tidak ada notifikasi baru.'
                }
              </p>
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Hapus Filter
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Select All */}
            {!isOnMobile && (
              <div className="flex items-center gap-3 px-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Pilih semua notifikasi
                </span>
              </div>
            )}

            {/* Notification Cards */}
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={mergeClasses(
                    'transition-all duration-200 cursor-pointer hover:shadow-md relative',
                    notification.status === 'unread' 
                      ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                      : 'bg-white border-gray-200',
                    selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : '',
                    'p-3 sm:p-4' // Responsive padding
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Selection checkbox */}
                    {!isOnMobile && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectNotification(notification.id, e.target.checked);
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Icon dengan read/unread indicator */}
                    <div className={mergeClasses(
                      'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 relative',
                      getNotificationTypeColor(notification.type).split(' ').slice(0, 2).join(' ')
                    )}>
                      <div className={getNotificationTypeColor(notification.type).split(' ').slice(2).join(' ')}>
                        <div className="w-4 h-4 sm:w-5 sm:h-5">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      {/* Dot indicator untuk unread */}
                      {notification.status === 'unread' && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={mergeClasses(
                              'font-medium text-gray-900 line-clamp-1 text-sm sm:text-base',
                              notification.status === 'unread' ? 'font-bold text-gray-900' : 'font-normal text-gray-700'
                            )}>
                              {notification.title}
                            </h4>
                            {/* Status badge */}
                            {notification.status === 'unread' ? (
                              <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full whitespace-nowrap">
                                BARU
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full whitespace-nowrap hidden sm:inline">
                                SUDAH DIBACA
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={mergeClasses(
                        'text-xs sm:text-sm mt-1 line-clamp-2',
                        notification.status === 'unread' ? 'text-gray-900' : 'text-gray-600'
                      )}>
                        {notification.message}
                      </p>
                    </div>

                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 gap-4">
                <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                  Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1} sampai {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} notifikasi
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.current_page <= 1}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Sebelumnya</span>
                    <span className="sm:hidden">←</span>
                  </Button>
                  
                  <span className="px-3 py-1 text-xs sm:text-sm whitespace-nowrap">
                    {pagination.current_page} / {pagination.last_page}
                  </span>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={pagination.current_page >= pagination.last_page}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <span className="sm:hidden">→</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Floating Action Button for mobile */}
      {hasUnreadNotifications && (
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center justify-center"
            title="Tandai Semua Sudah Dibaca"
          >
            {markAllAsRead.isPending ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </button>
        </div>
      )}
      
      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Pengaturan Notifikasi"
        size="md"
      >
        <div className="space-y-6">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Perbarui Otomatis</h3>
              <p className="text-sm text-gray-600">Perbarui notifikasi secara otomatis</p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                autoRefresh ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <span className="sr-only">Enable auto refresh</span>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {/* Sound Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Suara Notifikasi</h3>
              <p className="text-sm text-gray-600">Mainkan suara untuk notifikasi baru</p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                variant="secondary"
                size="sm"
                icon={Volume2}
                onClick={() => {
                  // Test sound
                  try {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.value = 0.1;
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                  } catch (e) {
                    console.log('Could not play test sound:', e);
                  }
                }}
              />
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  soundEnabled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                <span className="sr-only">Enable sound notifications</span>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
          
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Notifikasi Browser</h3>
              <p className="text-sm text-gray-600">Tampilkan notifikasi di browser</p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                browserNotifications ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onClick={() => {
                if ('Notification' in window) {
                  Notification.requestPermission().then(permission => {
                    setBrowserNotifications(permission === 'granted');
                  });
                } else {
                  setBrowserNotifications(!browserNotifications);
                }
              }}
            >
              <span className="sr-only">Enable browser notifications</span>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                browserNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          {/* Notification Types */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Jenis Notifikasi</h3>
            <div className="space-y-3">
              {[
                { type: 'payment', label: 'Pembayaran', description: 'Notifikasi pembayaran dan tagihan' },
                { type: 'access', label: 'Akses', description: 'Notifikasi akses pintu dan keamanan' },
                { type: 'system', label: 'Sistem', description: 'Notifikasi sistem dan maintenance' },
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      notificationTypes[item.type as keyof typeof notificationTypes] ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                    onClick={() => {
                      setNotificationTypes(prev => ({
                        ...prev,
                        [item.type]: !prev[item.type as keyof typeof prev]
                      }));
                    }}
                  >
                    <span className="sr-only">Enable {item.label} notifications</span>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationTypes[item.type as keyof typeof notificationTypes] ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => setShowSettingsModal(false)}
              className="flex-1"
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Save settings
                console.log('Save notification settings');
                setShowSettingsModal(false);
              }}
              className="flex-1"
            >
              Simpan Pengaturan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;