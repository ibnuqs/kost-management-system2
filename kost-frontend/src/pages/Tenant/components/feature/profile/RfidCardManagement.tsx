// File: src/pages/Tenant/components/feature/profile/RfidCardManagement.tsx
import React, { useState } from 'react';
import { CreditCard, Plus, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { useRfidCards } from '../../../hooks/useRfidCards';
import { Card, StatCard } from '../../ui/Card';
import { Button } from '../../ui/Buttons';
import RfidCardList from './RfidCardList';
import RequestCardModal from './RequestCardModal';
import ReportLostCardModal from './ReportLostCardModal';
import { RfidCard } from '../../../types/rfid';
import { mergeClasses, getResponsiveColumns } from '../../../utils/helpers';

interface RfidCardManagementProps {
  className?: string;
}

const RfidCardManagement: React.FC<RfidCardManagementProps> = ({
  className = '',
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RfidCard | undefined>();
  
  const { cards, isLoading, refreshCards } = useRfidCards();

  const handleRequestNewCard = () => {
    setShowRequestModal(true);
  };

  const handleReportLostCard = (cardId: number) => {
    const card = cards.find(c => c.id === cardId);
    setSelectedCard(card);
    setShowReportModal(true);
  };

  const handleModalSuccess = () => {
    refreshCards();
  };

  // Calculate statistics
  const activeCards = cards.filter(card => card.status === 'active');
  const inactiveCards = cards.filter(card => card.status === 'inactive');
  const lostCards = cards.filter(card => card.status === 'lost');
  const totalCards = cards.length;

  const statsCards = [
    {
      title: 'Total Cards',
      value: totalCards,
      subtitle: 'All RFID cards',
      icon: CreditCard,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Active Cards',
      value: activeCards.length,
      subtitle: 'Ready to use',
      icon: CreditCard,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Inactive Cards',
      value: inactiveCards.length,
      subtitle: 'Not in use',
      icon: CreditCard,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
    {
      title: 'Lost/Stolen',
      value: lostCards.length,
      subtitle: 'Reported issues',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  ];

  if (isLoading) {
    return (
      <div className={mergeClasses('space-y-6', className)}>
        {/* Stats Cards Skeleton */}
        <div className={mergeClasses('grid gap-4', getResponsiveColumns(4))}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Card List Skeleton */}
        <div className="bg-white p-6 rounded-xl border animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={mergeClasses('space-y-6', className)}>
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">RFID Card Management</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={BarChart3}
              className="hidden sm:inline-flex"
            >
              Usage Stats
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRequestNewCard}
              icon={Plus}
            >
              Request Card
            </Button>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Manage your RFID cards for room access. You can request new cards, report issues, 
          and monitor the status of all your cards from this page.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={handleRequestNewCard}
            icon={Plus}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">Request New Card</div>
              <div className="text-sm opacity-90">Get a new RFID card</div>
            </div>
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {/* Open settings */}}
            icon={Settings}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">Card Settings</div>
              <div className="text-sm opacity-75">Manage preferences</div>
            </div>
          </Button>
          
          <Button
            variant="warning"
            onClick={() => {/* Open report without specific card */}}
            icon={AlertTriangle}
            className="justify-start"
          >
            <div className="text-left">
              <div className="font-medium">Report Issue</div>
              <div className="text-sm opacity-90">Lost or damaged card</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className={mergeClasses('grid gap-4', getResponsiveColumns(4))}>
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            className="hover:shadow-lg transition-shadow duration-200"
          />
        ))}
      </div>

      {/* Cards Overview */}
      {totalCards > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Card Overview</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{activeCards.length}</div>
              <div className="text-sm text-green-700">Active & Working</div>
              <div className="text-xs text-green-600 mt-1">
                {totalCards > 0 ? Math.round((activeCards.length / totalCards) * 100) : 0}% of total
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{inactiveCards.length}</div>
              <div className="text-sm text-yellow-700">Inactive</div>
              <div className="text-xs text-yellow-600 mt-1">
                {totalCards > 0 ? Math.round((inactiveCards.length / totalCards) * 100) : 0}% of total
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{lostCards.length}</div>
              <div className="text-sm text-red-700">Lost/Issues</div>
              <div className="text-xs text-red-600 mt-1">
                {lostCards.length > 0 ? 'Needs attention' : 'All good!'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Card List */}
      <RfidCardList
        onRequestNewCard={handleRequestNewCard}
        onReportLostCard={handleReportLostCard}
      />

      {/* Modals */}
      <RequestCardModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={handleModalSuccess}
      />

      <ReportLostCardModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        card={selectedCard}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default RfidCardManagement;