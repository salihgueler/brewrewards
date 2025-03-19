'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { useSubdomain } from '@/lib/subdomain-context';
import { graphql } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

// GraphQL queries
const listMenuItemsQuery = `
  query ListMenuItems($shopId: ID!, $category: String) {
    listMenuItems(shopId: $shopId, category: $category) {
      items {
        id
        shopId
        name
        description
        price
        category
        image
        imageKey
        isAvailable
        allergens
        nutritionalInfo {
          calories
          fat
          carbs
          protein
          ingredients
        }
      }
    }
  }
`;

const listFavoritesQuery = `
  query ListFavorites($userId: ID!, $shopId: ID!) {
    listFavorites(userId: $userId, shopId: $shopId) {
      items {
        itemId
      }
    }
  }
`;

const addFavoriteMutation = `
  mutation AddFavorite($userId: ID!, $shopId: ID!, $itemId: ID!) {
    addFavorite(userId: $userId, shopId: $shopId, itemId: $itemId) {
      userId
      itemId
    }
  }
`;

const removeFavoriteMutation = `
  mutation RemoveFavorite($userId: ID!, $shopId: ID!, $itemId: ID!) {
    removeFavorite(userId: $userId, shopId: $shopId, itemId: $itemId) {
      userId
      itemId
    }
  }
`;

// MenuItem type
interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  imageKey?: string;
  isAvailable: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    fat?: number;
    carbs?: number;
    protein?: number;
    ingredients?: string[];
  };
}

export default function ShopMenuPage() {
  const { shop, isLoading: isShopLoading, error: shopError } = useSubdomain();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch the current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch menu items when shop is loaded
  useEffect(() => {
    if (shop?.id) {
      fetchMenuItems(shop.id);
      if (userId) {
        fetchFavorites(userId, shop.id);
      }
    }
  }, [shop, userId]);

  // Fetch menu items for the shop
  const fetchMenuItems = async (shopId: string, category?: string) => {
    setIsLoading(true);
    try {
      const response = await graphql.query(listMenuItemsQuery, {
        shopId,
        category: category === 'all' ? null : category,
      });
      
      if (response.listMenuItems?.items) {
        setMenuItems(response.listMenuItems.items);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items. Please try again.",
        variant: "destructive"
      });
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user favorites
  const fetchFavorites = async (userId: string, shopId: string) => {
    try {
      const response = await graphql.query(listFavoritesQuery, {
        userId,
        shopId,
      });
      
      if (response.listFavorites?.items) {
        setFavorites(response.listFavorites.items.map((fav: any) => fav.itemId));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (shop?.id) {
      fetchMenuItems(shop.id, category);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (itemId: string) => {
    if (!userId || !shop?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites.",
        variant: "default"
      });
      return;
    }
    
    try {
      if (favorites.includes(itemId)) {
        // Remove from favorites
        await graphql.mutate(removeFavoriteMutation, {
          userId,
          shopId: shop.id,
          itemId,
        });
        setFavorites(favorites.filter(id => id !== itemId));
        toast({
          title: "Removed from favorites",
          description: "Item removed from your favorites."
        });
      } else {
        // Add to favorites
        await graphql.mutate(addFavoriteMutation, {
          userId,
          shopId: shop.id,
          itemId,
        });
        setFavorites([...favorites, itemId]);
        toast({
          title: "Added to favorites",
          description: "Item added to your favorites."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get unique categories from menu items
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items by category and search query
  const filteredItems = menuItems
    .filter(item => item.isAvailable)
    .filter(item => activeCategory === 'all' || item.category === activeCategory)
    .filter(item => 
      searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (isShopLoading) {
    return (
      <div className="container py-12 text-center">
        <p>Loading shop information...</p>
      </div>
    );
  }

  if (shopError) {
    return (
      <div className="container py-12 text-center">
        <p>Error: {shopError.message}</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container py-12 text-center">
        <p>Shop not found</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{shop.name} Menu</h1>
        {shop.description && (
          <p className="text-muted-foreground">{shop.description}</p>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeCategory} 
          onValueChange={handleCategoryChange}
          className="w-full"
        >
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground hidden md:block" />
            <span className="text-sm font-medium mr-4 hidden md:block">Filter by:</span>
            <TabsList className="w-full md:w-auto overflow-auto">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-8">Loading menu items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onFavorite={handleFavoriteToggle}
                  isFavorite={favorites.includes(item.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
