// File: src/pages/Tenant/components/feature/profile/RfidCardList.tsx
import React, { useState } from 'react';
import { CreditCard, Plus, AlertTriangle, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { useRfidCards, useReportLostCard } from '../../../hooks/useRfidCards';
import { Card } from '../../ui/Card';
import { Button, IconButton } from '../../ui/Buttons';
import { StatusBadge } from '../../ui/Status';
import { getRfidStatusLabel, getRfidTypeLabel, getAccessLevelLabel } from '../../../types/rfid';
import { formatDate } from '../../../utils/formatters';
import { mergeClasses } from '../../../utils/helpers';

interface RfidCardListProps {
  onRequestNewCard?: () => void;
  onReportLostCard?: (cardId: number) => void;
  className?: string;
}

const RfidCardList: React.FC<RfidCardListProps> = ({
  onRequestNewCard,
  onReportLostCard,
  className = '',
}) => {
  const [showFullUid, setShowFullUid] = useState<Record<number, boolean>>({});
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  
  const { cards, isLoading } = useRfidCards();
  const reportLostCard = useReportLostCard();

  const toggleUidVisibility = (cardId: number) => {
    setShowFullUid(prev => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleReportLost = (cardId: number) => {
    if (onReportLostCard) {
      onReportLostCard(cardId);
    } else {
      // Default implementation
      const reason = prompt('Please provide a reason for reporting this card as lost:');
      if (reason) {
        reportLostCard.mutate({ cardId, reason });
      }
    }
  };

  const maskUid = (uid: string) => {
    if (uid.length <= 4) return uid;
    return uid.substring(0, 2) + '*'.repeat(uid.length - 4) + uid.substring(uid.length - 2);
  };

  const activeCards = cards.filter(card => card.status === 'active');
  const inactiveCards = cards.filter(card => card.status !== 'active');

  if (isLoading) {
    return (
      <Card className={mergeClasses('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">RFID Cards</h3>
          <span className="text-sm text-gray-500">
            ({cards.length} total)
          </span>
        </div>
        
        <Button
          variant="primary"
          size="sm"
          onClick={onRequestNewCard}
          icon={Plus}
        >
          Request New Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">No RFID Cards</h4>
          <p className="text-gray-500 mb-4">
            You don't have any RFID cards registered yet.
          </p>
          <Button
            variant="primary"
            onClick={onRequestNewCard}
            icon={Plus}
          >
            Request Your First Card
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Cards */}
          {activeCards.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Active Cards ({activeCards.length})
              </h4>
              
              <div className="space-y-3">
                {activeCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 border border-green-200 bg-green-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900">
                              RFID Card #{card.id}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getRfidTypeLabel(card.card_type)} • {getAccessLevelLabel(card.access_level)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">UID:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                              {showFullUid[card.id] ? card.uid : maskUid(card.uid)}
                            </code>
                            <IconButton
                              icon={showFullUid[card.id] ? EyeOff : Eye}
                              onClick={() => toggleUidVisibility(card.id)}
                              variant="ghost"
                              size="sm"
                              aria-label={showFullUid[card.id] ? 'Hide UID' : 'Show UID'}
                            />
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">
                              Assigned: {formatDate(card.assigned_at || card.created_at)}
                            </span>
                            
                            {card.last_used_at && (
                              <span className="text-gray-600">
                                Last used: {formatDate(card.last_used_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          status="success"
                          label={getRfidStatusLabel(card.status)}
                          size="sm"
                        />
                        
                        <div className="relative">
                          <IconButton
                            icon={MoreVertical}
                            onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                            variant="ghost"
                            size="sm"
                            aria-label="Card options"
                          />
                          
                          {selectedCard === card.id && (
                            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 min-w-[150px] z-10">
                              <button
                                onClick={() => handleReportLost(card.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2 text-red-600"
                              >
                                <AlertTriangle className="w-4 h-4" />
                                Report Lost
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Cards */}
          {inactiveCards.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Inactive Cards ({inactiveCards.length})
              </h4>
              
              <div className="space-y-3">
                {inactiveCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 border border-gray-200 bg-gray-50 rounded-lg opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900">
                              RFID Card #{card.id}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getRfidTypeLabel(card.card_type)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">UID:</span>
                            <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                              {maskUid(card.uid)}
                            </code>
                          </div>
                          
                          {card.deactivated_at && (
                            <div className="text-gray-600">
                              Deactivated: {formatDate(card.deactivated_at)}
                            </div>
                          )}
                          
                          {card.notes && (
                            <div className="text-gray-600">
                              Note: {card.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <StatusBadge
                        status={card.status === 'lost' ? 'error' : 'warning'}
                        label={getRfidStatusLabel(card.status)}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Card Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">RFID Card Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Keep your RFID card safe and secure at all times</li>
          <li>• Report lost or stolen cards immediately</li>
          <li>• Do not share your RFID card with others</li>
          <li>• Contact support if your card stops working</li>
        </ul>
      </div>
    </Card>
  );
};

export default RfidCardList;