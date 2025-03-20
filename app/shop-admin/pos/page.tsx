'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Coffee, 
  CreditCard, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle, 
  XCircle,
  User,
  Award,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { auth, AuthUser } from '@/lib/auth';
import { Permission, hasPermission, PermissionUser } from '@/lib/permissions';
import Link from 'next/link';

// Mock menu items
const mockMenuItems = [
  { id: 'item_1', name: 'Cappuccino', price: 4.50, category: 'Coffee', image: '☕' },
  { id: 'item_2', name: 'Latte', price: 4.00, category: 'Coffee', image: '☕' },
  { id: 'item_3', name: 'Espresso', price: 3.00, category: 'Coffee', image: '☕' },
  { id: 'item_4', name: 'Americano', price: 3.50, category: 'Coffee', image: '☕' },
  { id: 'item_5', name: 'Mocha', price: 4.75, category: 'Coffee', image: '☕' },
  { id: 'item_6', name: 'Blueberry Muffin', price: 3.25, category: 'Pastries', image: '🧁' },
  { id: 'item_7', name: 'Croissant', price: 3.00, category: 'Pastries', image: '🥐' },
  { id: 'item_8', name: 'Chocolate Chip Cookie', price: 2.50, category: 'Pastries', image: '🍪' },
  { id: 'item_9', name: 'Bagel with Cream Cheese', price: 4.00, category: 'Pastries', image: '🥯' },
  { id: 'item_10', name: 'Iced Tea', price: 3.00, category: 'Cold Drinks', image: '🧊' },
  { id: 'item_11', name: 'Lemonade', price: 3.50, category: 'Cold Drinks', image: '🍋' },
  { id: 'item_12', name: 'Iced Coffee', price: 4.00, category: 'Cold Drinks', image: '🧊' },
];

// Mock customers
const mockCustomers = [
  { id: 'user_1', name: 'John Doe', email: 'john@example.com', points: 320, stamps: 6 },
  { id: 'user_2', name: 'Sarah Miller', email: 'sarah@example.com', points: 450, stamps: 8 },
  { id: 'user_3', name: 'Robert Kim', email: 'robert@example.com', points: 180, stamps: 3 },
];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function PointOfSalePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(mockMenuItems.map(item => item.category)))];
  
  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await auth.getCurrentUser();
        if (!user) {
          router.push('/login?redirect=/shop-admin/pos');
          return;
        }
        
        // Check if user has permission to create transactions
        if (user.role !== 'SHOP_ADMIN' && user.role !== 'SUPER_ADMIN') {
          const permissionUser: PermissionUser = {
            id: user.id,
            role: user.role as any,
            permissions: user.permissions,
            shopId: user.shopId,
          };
          
          if (!hasPermission(permissionUser, Permission.CREATE_TRANSACTION)) {
            router.push('/dashboard');
            return;
          }
        }
        
        setCurrentUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login?redirect=/shop-admin/pos');
      }
    };

    checkAuth();
  }, [router]);

  // Filter menu items based on category and search term
  const filteredMenuItems = mockMenuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Filter customers based on search term
  const filteredCustomers = mockCustomers.filter(customer => {
    return customerSearchTerm === '' || 
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase());
  });

  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerDialogOpen(false);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaymentComplete(true);
      
      // In a real app, we would call an API to process the payment and update loyalty points
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsPaymentComplete(false);
        setIsPaymentDialogOpen(false);
        clearCart();
      }, 3000);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/shop-admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Point of Sale</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search menu items..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs 
              defaultValue="All" 
              value={activeCategory} 
              onValueChange={setActiveCategory}
              className="w-full md:w-auto"
            >
              <TabsList className="w-full md:w-auto">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="flex-1 md:flex-none">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenuItems.map(item => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{item.image}</div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Current Order</span>
                {cartItemCount > 0 && (
                  <Badge variant="outline">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</Badge>
                )}
              </CardTitle>
              {selectedCustomer ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <CardDescription className="flex-1">
                    {selectedCustomer.name}
                  </CardDescription>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setIsCustomerDialogOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Select Customer
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-8 w-8 mb-2" />
                  <p>Your cart is empty</p>
                  <p className="text-sm">Add items from the menu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{item.image}</div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <div className="w-full flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              {selectedCustomer && (
                <div className="w-full flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Loyalty Points</span>
                  </div>
                  <Badge variant="secondary">{selectedCustomer.points} points</Badge>
                </div>
              )}
              
              <div className="w-full grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  Clear
                </Button>
                <Button 
                  onClick={() => setIsPaymentDialogOpen(true)}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Select a customer to associate with this order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-8" 
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map(customer => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50"
                    onClick={() => selectCustomer(customer)}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <Badge variant="secondary">{customer.points} points</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCustomerDialogOpen(false)}>
              Continue Without Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Process payment for the current order
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isPaymentComplete ? (
              <div className="text-center py-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">Payment Successful!</h3>
                <p className="text-muted-foreground">
                  {selectedCustomer ? (
                    <>
                      {Math.floor(cartTotal)} points added to {selectedCustomer.name}'s account
                    </>
                  ) : (
                    'Transaction completed successfully'
                  )}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tax</span>
                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(cartTotal * 1.08).toFixed(2)}</span>
                  </div>
                </div>
                
                {selectedCustomer && (
                  <div className="bg-muted/50 p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.name}</span>
                      </div>
                      <Badge variant="secondary">
                        {selectedCustomer.points} + {Math.floor(cartTotal)} points
                      </Badge>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    Cash
                  </Button>
                  <Button variant="outline" className="w-full">
                    Credit Card
                  </Button>
                  <Button variant="outline" className="w-full">
                    Mobile Pay
                  </Button>
                  <Button variant="outline" className="w-full">
                    Gift Card
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            {isPaymentComplete ? (
              <Button onClick={() => {
                setIsPaymentComplete(false);
                setIsPaymentDialogOpen(false);
                clearCart();
              }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={processPayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Complete Payment'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Shopping Cart Icon Component
function ShoppingCart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
