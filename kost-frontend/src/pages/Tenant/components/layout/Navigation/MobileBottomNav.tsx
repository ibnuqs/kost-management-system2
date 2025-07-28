// File: src/pages/Tenant/components/layout/Navigation/MobileBottomNav.tsx
import React from 'react';
import { mobileMenuItems } from '../../../config/menuConfig';
import NavItem from './NavItem';
import { mergeClasses } from '../../../utils/helpers';
import { MOBILE_SPECIFIC } from '../../../utils/constants';

interface MobileBottomNavProps {
  className?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  className = '',
}) => {
  return (
    <nav className={mergeClasses(
      'md:hidden fixed bottom-0 left-0 right-0 z-30',
      'bg-white border-t shadow-lg backdrop-blur-sm bg-white/95',
      MOBILE_SPECIFIC.BOTTOM_NAV_HEIGHT,
      MOBILE_SPECIFIC.SAFE_AREA_BOTTOM,
      className
    )}>
      <div className="flex items-center justify-around h-full px-2">
        {mobileMenuItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
          />
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;