'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { MenuItemForm } from '@/components/menu/menu-item-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { graphql } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

// GraphQL queries and mutations
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
        createdAt
        updatedAt
      }
    }
  }
`;

const createMenuItemMutation = `
  mutation CreateMenuItem($input: CreateMenuItemInput!) {
    createMenuItem(input: $input) {
      id
    }
  }
`;

const updateMenuItemMutation = `
  mutation UpdateMenuItem($input: UpdateMenuItemInput!) {
    updateMenuItem(input: $input) {
      id
    }
  }
`;

const deleteMenuItemMutation = `
  mutation DeleteMenuItem($shopId: ID!, $id: ID!) {
    deleteMenuItem(shopId: $shopId, id: $id) {
      id
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
  createdAt: string;
  updatedAt: string;
}

export default function ShopAdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [shopId, setShopId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  // Fetch the current user and their shop ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (user?.shopId) {
          setShopId(user.shopId);
          fetchMenuItems(user.shopId);
        } else {
          toast({
            title: "Authentication Error",
            description: "You must be logged in as a shop admin to access this page.",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        toast({
          title: "Error",
          description: "Failed to authenticate user. Please try logging in again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [toast]);

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

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    fetchMenuItems(shopId, category);
  };

  // Handle create/update menu item
  const handleSubmitMenuItem = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update existing item
        await graphql.mutate(updateMenuItemMutation, {
          input: data,
        });
        toast({
          title: "Success",
          description: "Menu item updated successfully."
        });
      } else {
        // Create new item
        await graphql.mutate(createMenuItemMutation, {
          input: data,
        });
        toast({
          title: "Success",
          description: "Menu item created successfully."
        });
      }
      
      // Refresh the menu items
      fetchMenuItems(shopId, activeCategory);
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit menu item
  const handleEditMenuItem = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      setEditingItem(item);
      setIsDialogOpen(true);
    }
  };

  // Handle delete menu item
  const handleDeleteMenuItem = async (id: string) => {
    try {
      await graphql.mutate(deleteMenuItemMutation, {
        shopId,
        id,
      });
      
      // Remove the item from the local state
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Menu item deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get unique categories from menu items
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items by category
  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  if (!shopId && !isLoading) {
    return (
      <div className="container py-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground text-center">
              You need to be logged in as a shop admin to access this page.
            </p>
            <Button className="mt-4" asChild>
              <a href="/login">Log In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <MenuItemForm
              shopId={shopId}
              initialData={editingItem || undefined}
              onSubmit={handleSubmitMenuItem}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeCategory} onValueChange={handleCategoryChange}>
            <div className="flex items-center mb-4">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium mr-4">Filter by:</span>
              <TabsList>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {categories.map(category => (
              <TabsContent key={category} value={category} className="m-0">
                {isLoading ? (
                  <div className="text-center py-8">Loading menu items...</div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No menu items found in this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        isAdmin={true}
                        onEdit={handleEditMenuItem}
                        onDelete={handleDeleteMenuItem}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
