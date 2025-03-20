'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Coffee, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Home,
  Award,
  ShoppingBag,
  CreditCard,
  Users,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/lib/types';
import { PermissionGate } from '@/components/ui/permission-gate';
import { Permission } from '@/lib/permissions';

export function AppHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };
  
  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];
    
    if (user.role === UserRole.SUPER_ADMIN) {
      return [
        { name: 'Dashboard', href: '/super-admin', icon: <Home className="mr-2 h-4 w-4" /> },
        { name: 'Shops', href: '/super-admin/shops', icon: <Store className="mr-2 h-4 w-4" /> },
        { name: 'Users', href: '/super-admin/users', icon: <Users className="mr-2 h-4 w-4" /> },
        { name: 'Transactions', href: '/super-admin/transactions', icon: <CreditCard className="mr-2 h-4 w-4" /> },
      ];
    }
    
    if (user.role === UserRole.SHOP_ADMIN) {
      return [
        { name: 'Dashboard', href: '/shop-admin', icon: <Home className="mr-2 h-4 w-4" /> },
        { name: 'Point of Sale', href: '/shop-admin/pos', icon: <CreditCard className="mr-2 h-4 w-4" /> },
        { name: 'Menu', href: '/shop-admin/menu', icon: <Coffee className="mr-2 h-4 w-4" /> },
        { name: 'Customers', href: '/shop-admin/customers', icon: <Users className="mr-2 h-4 w-4" /> },
        { name: 'Staff', href: '/shop-admin/staff', icon: <Users className="mr-2 h-4 w-4" /> },
        { name: 'Loyalty', href: '/shop-admin/loyalty', icon: <Award className="mr-2 h-4 w-4" /> },
        { name: 'Transactions', href: '/shop-admin/transactions', icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
        { name: 'Settings', href: '/shop-admin/settings', icon: <Settings className="mr-2 h-4 w-4" /> },
      ];
    }
    
    if (user.role === UserRole.SHOP_STAFF) {
      const items = [
        { name: 'Dashboard', href: '/staff', icon: <Home className="mr-2 h-4 w-4" /> },
      ];
      
      // Add POS link if user has permission
      if (user.permissions?.includes(Permission.CREATE_TRANSACTION)) {
        items.push({ name: 'Point of Sale', href: '/shop-admin/pos', icon: <CreditCard className="mr-2 h-4 w-4" /> });
      }
      
      // Add Customers link if user has permission
      if (user.permissions?.includes(Permission.VIEW_CUSTOMERS)) {
        items.push({ name: 'Customers', href: '/shop-admin/customers', icon: <Users className="mr-2 h-4 w-4" /> });
      }
      
      // Add Transactions link if user has permission
      if (user.permissions?.includes(Permission.VIEW_TRANSACTIONS)) {
        items.push({ name: 'Transactions', href: '/shop-admin/transactions', icon: <ShoppingBag className="mr-2 h-4 w-4" /> });
      }
      
      return items;
    }
    
    // Customer navigation
    return [
      { name: 'Dashboard', href: '/dashboard', icon: <Home className="mr-2 h-4 w-4" /> },
      { name: 'Rewards', href: '/dashboard/rewards', icon: <Award className="mr-2 h-4 w-4" /> },
      { name: 'Transactions', href: '/dashboard/transactions', icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
      { name: 'Profile', href: '/dashboard/profile', icon: <User className="mr-2 h-4 w-4" /> },
    ];
  };
  
  const navigationItems = getNavigationItems();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <Link href={user ? (user.role === UserRole.CUSTOMER ? '/dashboard' : `/${user.role.toLowerCase().replace('_', '-')}`) : '/'} className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="text-lg font-bold">BrewRewards</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name || user.email} />
                    <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === UserRole.CUSTOMER ? '/dashboard/profile' : `/${user.role.toLowerCase().replace('_', '-')}/settings`}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === UserRole.CUSTOMER ? '/dashboard/settings' : `/${user.role.toLowerCase().replace('_', '-')}/settings`}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Navigation */}
          {user && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex items-center gap-2 mb-8">
                  <Coffee className="h-6 w-6" />
                  <span className="text-lg font-bold">BrewRewards</span>
                </div>
                <nav className="flex flex-col space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Button variant="ghost" className="justify-start px-2" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
