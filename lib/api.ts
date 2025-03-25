// Mock GraphQL API client for development

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

// Mock data store
const mockData = {
  menuItems: [
    {
      id: '1',
      shopId: 'shop-1',
      name: 'Cappuccino',
      description: 'A rich, full-bodied espresso with steamed milk and a deep layer of foam',
      price: 4.99,
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&auto=format&fit=crop',
      imageKey: 'shop-1/images/cappuccino.jpg',
      isAvailable: true,
      allergens: ['Milk'],
      nutritionalInfo: {
        calories: 120,
        fat: 4,
        carbs: 12,
        protein: 8,
        ingredients: ['Espresso', 'Milk', 'Water']
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      shopId: 'shop-1',
      name: 'Croissant',
      description: 'Buttery, flaky pastry with a golden-brown crust',
      price: 3.49,
      category: 'Pastry',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
      imageKey: 'shop-1/images/croissant.jpg',
      isAvailable: true,
      allergens: ['Gluten', 'Milk', 'Eggs'],
      nutritionalInfo: {
        calories: 240,
        fat: 12,
        carbs: 26,
        protein: 5,
        ingredients: ['Flour', 'Butter', 'Sugar', 'Yeast', 'Salt']
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      shopId: 'shop-1',
      name: 'Green Tea',
      description: 'Delicate tea with a subtle, refreshing flavor',
      price: 2.99,
      category: 'Tea',
      image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&auto=format&fit=crop',
      imageKey: 'shop-1/images/green-tea.jpg',
      isAvailable: true,
      allergens: [],
      nutritionalInfo: {
        calories: 0,
        fat: 0,
        carbs: 0,
        protein: 0,
        ingredients: ['Green Tea Leaves', 'Water']
      },
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }
  ]
};

// Helper to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};

// Mock GraphQL client
export const graphql = {
  query: async <T = any>(query: string, variables?: any): Promise<T> => {
    console.log('GraphQL Query:', query, variables);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Handle different queries
    if (query.includes('ListMenuItems')) {
      const { shopId, category } = variables || {};
      
      let items = mockData.menuItems.filter(item => item.shopId === shopId);
      
      if (category && category !== 'all') {
        items = items.filter(item => item.category === category);
      }
      
      return {
        listMenuItems: {
          items
        }
      } as unknown as T;
    }
    
    // Default response
    return {} as T;
  },
  
  mutate: async <T = any>(mutation: string, variables?: any): Promise<T> => {
    console.log('GraphQL Mutation:', mutation, variables);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Handle different mutations
    if (mutation.includes('CreateMenuItem')) {
      const { input } = variables || {};
      
      const newItem = {
        id: generateId(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockData.menuItems.push(newItem);
      
      return {
        createMenuItem: {
          id: newItem.id
        }
      } as unknown as T;
    }
    
    if (mutation.includes('UpdateMenuItem')) {
      const { input } = variables || {};
      
      const index = mockData.menuItems.findIndex(item => item.id === input.id);
      
      if (index !== -1) {
        mockData.menuItems[index] = {
          ...mockData.menuItems[index],
          ...input,
          updatedAt: new Date().toISOString()
        };
      }
      
      return {
        updateMenuItem: {
          id: input.id
        }
      } as unknown as T;
    }
    
    if (mutation.includes('DeleteMenuItem')) {
      const { shopId, id } = variables || {};
      
      const index = mockData.menuItems.findIndex(item => item.id === id && item.shopId === shopId);
      
      if (index !== -1) {
        mockData.menuItems.splice(index, 1);
      }
      
      return {
        deleteMenuItem: {
          id
        }
      } as unknown as T;
    }
    
    // Default response
    return {} as T;
  }
};
