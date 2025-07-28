// Quick Actions Component
import React, { memo } from 'react';
import { QuickAction } from '../../config/navigation';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = memo(({
  actions,
  onActionClick,
  className = ''
}) => {
  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      case 'secondary':
      default:
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actions.map((action) => {
        const Icon = action.icon;
        const buttonClasses = getButtonVariant(action.variant);

        return (
          <button
            key={action.id}
            onClick={() => onActionClick(action.action)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
              border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${buttonClasses}
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;