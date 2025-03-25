'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shop, CreateShopInput, UpdateShopInput } from '@/lib/api/shops';
import { useAuth } from '@/lib/auth-context';

// Form validation schema
const shopFormSchema = z.object({
  name: z.string().min(2, { message: 'Shop name must be at least 2 characters' }),
  description: z.string().optional(),
  subdomain: z.string()
    .min(3, { message: 'Subdomain must be at least 3 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'Subdomain can only contain lowercase letters, numbers, and hyphens' }),
  logo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
  }).optional(),
});

type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopFormProps {
  shop?: Shop;
  onSubmit: (data: CreateShopInput | UpdateShopInput) => Promise<void>;
  isLoading?: boolean;
}

export function ShopForm({ shop, onSubmit, isLoading = false }: ShopFormProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  
  // Initialize form with existing shop data or defaults
  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      name: shop?.name || '',
      description: shop?.description || '',
      subdomain: shop?.subdomain || '',
      logo: shop?.logo || '',
      address: shop?.address || '',
      city: shop?.city || '',
      state: shop?.state || '',
      zipCode: shop?.zipCode || '',
      country: shop?.country || '',
      phone: shop?.phone || '',
      email: shop?.email || '',
      website: shop?.website || '',
      socialMedia: {
        facebook: shop?.socialMedia?.facebook || '',
        instagram: shop?.socialMedia?.instagram || '',
        twitter: shop?.socialMedia?.twitter || '',
      },
    },
  });

  const handleSubmit = async (values: ShopFormValues) => {
    try {
      // Clean up empty strings to undefined for optional fields
      const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value === '') {
          return acc;
        }
        
        if (key === 'socialMedia') {
          const socialMedia = Object.entries(value || {}).reduce((socialAcc, [socialKey, socialValue]) => {
            if (socialValue === '') {
              return socialAcc;
            }
            return { ...socialAcc, [socialKey]: socialValue };
          }, {});
          
          if (Object.keys(socialMedia).length > 0) {
            return { ...acc, socialMedia };
          }
          return acc;
        }
        
        return { ...acc, [key]: value };
      }, {});
      
      // Add ID if updating an existing shop
      const formData = shop?.id 
        ? { id: shop.id, ...cleanedValues } as UpdateShopInput
        : { ...cleanedValues, ownerId: user?.id || '' } as CreateShopInput;
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting shop form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{shop ? 'Edit Shop' : 'Create New Shop'}</CardTitle>
            <CardDescription>
              {shop 
                ? 'Update your coffee shop details and settings' 
                : 'Enter the details for your new coffee shop'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact & Location</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Coffee Haven" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your coffee shop as it will appear to customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A cozy coffee shop with a wide variety of specialty drinks" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your coffee shop to potential customers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain*</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input placeholder="coffee-haven" {...field} />
                          <span className="ml-2 text-gray-500">.brewrewards.com</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        This will be used for your shop's URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL to your shop's logo image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Seattle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="WA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="98101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="USA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(206) 555-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="info@coffeehaven.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://coffeehaven.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="coffeehaven" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Facebook username (without @)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="coffeehaven" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Instagram username (without @)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter</FormLabel>
                      <FormControl>
                        <Input placeholder="coffeehaven" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Twitter username (without @)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : shop ? 'Update Shop' : 'Create Shop'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
