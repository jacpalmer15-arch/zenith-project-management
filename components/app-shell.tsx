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
import type { User } from '@supabase/supabase-js';

interface AppShellProps {
  children: React.ReactNode;
  user: User;
}

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Customers', href: '/app/customers', icon: Users },
  { name: 'Locations', href: '/app/locations', icon: MapPin },
  { name: 'Work Orders', href: '/app/work-orders', icon: ClipboardList },
  { name: 'Schedule', href: '/app/schedule', icon: Calendar },
  { name: 'Time', href: '/app/time', icon: Clock },
  { name: 'Equipment', href: '/app/equipment', icon: Wrench },
  { name: 'Quotes', href: '/app/quotes', icon: FileText },
  { name: 'Jobs', href: '/app/jobs', icon: Briefcase },
  { name: 'Parts & Inventory', href: '/app/parts', icon: Package },
  { name: 'Reports', href: '/app/reports', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
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
                    <p className="text-xs text-slate-500">Account</p>
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
