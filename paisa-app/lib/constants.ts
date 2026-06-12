import { Home, ShoppingCart, Bolt, User, Package } from 'lucide-react';

export const CATEGORIES = [
  { value: 'home_expenses', label: 'Home', icon: Home, color: '#16a34a', bg: '#dcfce7', bgClass: 'badge-home' },
  { value: 'grocery', label: 'Grocery', icon: ShoppingCart, color: '#d97706', bg: '#ffedd5', bgClass: 'badge-grocery' },
  { value: 'utility', label: 'Utility', icon: Bolt, color: '#7c3aed', bg: '#ede9fe', bgClass: 'badge-utility' },
  { value: 'personal', label: 'Personal', icon: User, color: '#374151', bg: '#f3f4f6', bgClass: 'badge-personal' },
  { value: 'other', label: 'Other', icon: Package, color: '#1d4ed8', bg: '#dbeafe', bgClass: 'badge-other' },
] as const;

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat;
  return acc;
}, {} as Record<string, typeof CATEGORIES[number]>);
