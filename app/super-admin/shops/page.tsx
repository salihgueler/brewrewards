'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coffee, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/permissions';
import { useRouter } from 'next/navigation';

// Mock data for shops - in a real app, this would come from API
interface Shop {
  id: string;
  name: string;
  description: string;
  logo?: string;
  subdomain: string;
  city: string;
  state: string;
  customerCount: number;
  rewardsProgramCount: number;
}

export default function SuperAdminShopsPage() {
  const { isAuthorized, isLoading } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingShops, setIsLoadingShops] = useState(true);

  useEffect(() => {
    // Check authorization
    if (!isLoading && !isAuthorized(UserRole.SUPER_ADMIN)) {
      router.push('/login?userType=super-admin');
      return;
    }

    // Fetch shops - in a real app, this would be an API call
    const fetchShops = async () => {
      try {
        // Mock data - replace with actual API call
        const mockShops: Shop[] = [
          {
            id: '1',
            name: 'Urban Beans',
            description: 'Specialty coffee in downtown',
            logo: '/placeholder.svg',
            subdomain: 'urban-beans',
            city: 'Seattle',
            state: 'WA',
            customerCount: 245,
            rewardsProgramCount: 3,
          },
          {
            id: '2',
            name: 'Espresso Haven',
            description: 'Artisanal coffee and pastries',
            logo: '/placeholder.svg',
            subdomain: 'espresso-haven',
            city: 'Portland',
            state: 'OR',
            customerCount: 187,
            rewardsProgramCount: 2,
          },
          {
            id: '3',
            name: 'Morning Brew Co.',
            description: 'Organic coffee and breakfast',
            logo: '/placeholder.svg',
            subdomain: 'morning-brew',
            city: 'San Francisco',
            state: 'CA',
            customerCount: 312,
            rewardsProgramCount: 4,
          },
        ];
        
        setShops(mockShops);
        setIsLoadingShops(false);
      } catch (error) {
        console.error('Error fetching shops:', error);
        setIsLoadingShops(false);
      }
    };

    fetchShops();
  }, [isAuthorized, isLoading, router]);

  const handleDeleteShop = async (shopId: string) => {
    // In a real app, this would be an API call
    if (confirm('Are you sure you want to delete this shop?')) {
      try {
        // Mock deletion - replace with actual API call
        setShops(shops.filter(shop => shop.id !== shopId));
        alert('Shop deleted successfully');
      } catch (error) {
        console.error('Error deleting shop:', error);
        alert('Failed to delete shop');
      }
    }
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coffee Shops</h1>
        <Link href="/super-admin/shops/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Shop
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search shops by name, location..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoadingShops ? (
        <div className="flex justify-center items-center h-64">Loading shops...</div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-12">
          <Coffee className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No shops found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or add a new shop.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {shop.logo ? (
                      <img 
                        src={shop.logo} 
                        alt={shop.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Coffee className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <CardTitle className="text-xl">{shop.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/super-admin/shops/${shop.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteShop(shop.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{shop.description}</p>
                <div className="flex justify-between text-sm">
                  <span>{shop.city}, {shop.state}</span>
                  <span className="text-muted-foreground">{shop.subdomain}.brewrewards.com</span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{shop.customerCount}</p>
                    <p className="text-muted-foreground">Customers</p>
                  </div>
                  <div>
                    <p className="font-medium">{shop.rewardsProgramCount}</p>
                    <p className="text-muted-foreground">Reward Programs</p>
                  </div>
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/super-admin/shops/${shop.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
