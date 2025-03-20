'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Users, Store, Settings, LogOut, BarChart3, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

interface SuperAdminNavigationProps {
  onSignOut: () => Promise<void>;
}

export function SuperAdminNavigation({ onSignOut }: SuperAdminNavigationProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <div className="hidden md:flex flex-col w-64 border-r h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6" />
          <span className="font-bold">BrewRewards Admin</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Button 
          variant={isActive('/super-admin') && !isActive('/super-admin/users') && !isActive('/super-admin/shops') ? "default" : "ghost"} 
          className="w-full justify-start"
          asChild
        >
          <Link href="/super-admin">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button 
          variant={isActive('/super-admin/shops') ? "default" : "ghost"} 
          className="w-full justify-start"
          asChild
        >
          <Link href="/super-admin/shops">
            <Store className="mr-2 h-4 w-4" />
            Coffee Shops
          </Link>
        </Button>
        <Button 
          variant={isActive('/super-admin/users') ? "default" : "ghost"} 
          className="w-full justify-start"
          asChild
        >
          <Link href="/super-admin/users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </Link>
        </Button>
        <Button 
          variant={isActive('/super-admin/invite') ? "default" : "ghost"} 
          className="w-full justify-start"
          asChild
        >
          <Link href="/super-admin/invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Admin
          </Link>
        </Button>
        <Button 
          variant={isActive('/super-admin/settings') ? "default" : "ghost"} 
          className="w-full justify-start"
          asChild
        >
          <Link href="/super-admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
