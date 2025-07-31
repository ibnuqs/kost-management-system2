// File: src/pages/Admin/types/menu.ts
import type { ElementType } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  icon: ElementType;
  description: string;
  component: React.ComponentType<Record<string, unknown>>;
  category?: 'main' | 'property' | 'security';
  badge?: string;
  isNew?: boolean;
}

export interface MenuCategories {
  main: MenuItem[];
  property: MenuItem[];
  security: MenuItem[];
}

export interface CategoryLabels {
  main: string;
  property: string;
  security: string;
}