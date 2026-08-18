import {
  LayoutDashboardIcon,
  SchoolIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** `exact` keeps "Dashboard" from matching every route under `/`. */
  match: 'exact' | 'prefix';
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    description: 'School overview',
    icon: LayoutDashboardIcon,
    match: 'exact',
  },
  {
    href: '/classes',
    label: 'Classes',
    description: 'Rosters and enrolment',
    icon: SchoolIcon,
    match: 'prefix',
  },
  {
    href: '/students',
    label: 'Students',
    description: 'Full student directory',
    icon: UsersIcon,
    match: 'prefix',
  },
];

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.match === 'exact') return pathname === item.href;

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
