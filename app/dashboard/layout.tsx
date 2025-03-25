'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Coffee, LayoutDashboard, Store, Star, Clock, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect if not a customer
    if (!isLoading && (!user || user.role !== UserRole.CUSTOMER)) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Coffee Shops',
      href: '/shops',
      icon: <Store className="h-5 w-5" />,
    },
    {
      name: 'My Rewards',
      href: '/dashboard/rewards',
      icon: <Star className="h-5 w-5" />,
    },
    {
      name: 'Activity',
      href: '/dashboard/activity',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-bold text-xl">BrewRewards</span>
          </Link>
          <div className="mt-2 text-sm text-muted-foreground">Customer Dashboard</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="h-6 w-6" />
            <span className="font-bold">BrewRewards</span>
          </Link>
          {/* Mobile menu button would go here */}
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
