'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Package,
  FileText,
  Settings,
  LogOut,
  MapPin,
  Calendar,
  Clock,
  ClipboardList,
  Wrench,
  BarChart3,
  Menu,
  X,
  DollarSign,
  UserCircle,
  TestTube,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/app/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { hasPermission, type Permission } from '@/lib/auth/permissions';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { User } from '@supabase/supabase-js';
import { CommandPalette } from '@/components/command-palette';

interface AppShellProps {
  children: React.ReactNode;
  user: User;
}

const navigation: Array<{
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission: Permission
}> = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { name: 'Customers', href: '/app/customers', icon: Users, permission: 'view_customers' },
  { name: 'Locations', href: '/app/locations', icon: MapPin, permission: 'view_customers' },
  { name: 'Work Orders', href: '/app/work-orders', icon: ClipboardList, permission: 'view_work_orders' },
  { name: 'Schedule', href: '/app/schedule', icon: Calendar, permission: 'view_schedule' },
  { name: 'Time', href: '/app/time', icon: Clock, permission: 'view_time' },
  { name: 'Equipment', href: '/app/equipment', icon: Wrench, permission: 'view_parts' },
  { name: 'Quotes', href: '/app/quotes', icon: FileText, permission: 'view_quotes' },
  { name: 'Jobs', href: '/app/jobs', icon: Briefcase, permission: 'view_projects' },
  { name: 'Parts & Inventory', href: '/app/parts', icon: Package, permission: 'view_parts' },
  { name: 'Costs', href: '/app/receipts', icon: DollarSign, permission: 'view_costs' },
  { name: 'Reports', href: '/app/reports', icon: BarChart3, permission: 'view_reports' },
  { name: 'Employees', href: '/app/employees', icon: UserCircle, permission: 'view_employees' },
  { name: 'Settings', href: '/app/settings', icon: Settings, permission: 'view_settings' },
];

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = useCurrentUser()
  
  const visibleNavItems = navigation.filter(item => 
    hasPermission(currentUser?.role, item.permission)
  )

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle navigation menu"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-slate-900" />
        ) : (
          <Menu className="h-6 w-6 text-slate-900" />
        )}
      </button>

      {/* Sidebar with mobile overlay */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col',
          'transition-transform duration-300 lg:relative lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Zenith</h1>
          <p className="text-sm text-slate-500 mt-1">Field Service</p>
        </div>

        {/* Global Search */}
        <div className="p-4 border-b border-slate-200">
          <CommandPalette />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'min-h-[44px]', // Ensure 44px touch target
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Dev Tools - Admin Only */}
          {currentUser?.role === 'ADMIN' && (
            <>
              <div className="my-2 border-t border-slate-200" />
              <Link
                href="/app/dev/smoke-test"
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  'min-h-[44px]',
                  pathname === '/app/dev/smoke-test'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <TestTube className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Smoke Test</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-left font-normal min-h-[44px]"
                aria-label="User menu"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-slate-700">
                      {user.email?.[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-slate-500">{currentUser?.role || 'Loading...'}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" id="main-content">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
