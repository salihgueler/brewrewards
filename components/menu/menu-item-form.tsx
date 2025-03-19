'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getImageUrl } from '@/lib/s3-upload';

// Define the form schema with Zod
const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean().default(true),
  allergens: z.string().optional(),
  calories: z.coerce.number().optional(),
  fat: z.coerce.number().optional(),
  carbs: z.coerce.number().optional(),
  protein: z.coerce.number().optional(),
  ingredients: z.string().optional(),
});

// Define the form values type
type MenuItemFormValues = z.infer<typeof menuItemSchema>;

// Define the props for the component
interface MenuItemFormProps {
  shopId: string;
  initialData?: {
    id?: string;
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
  };
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function MenuItemForm({
  shopId,
  initialData,
  onSubmit,
  isLoading = false,
}: MenuItemFormProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image || '');
  const [imageKey, setImageKey] = useState<string>(initialData?.imageKey || '');

  // Initialize the form with react-hook-form
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      category: initialData?.category || '',
      isAvailable: initialData?.isAvailable ?? true,
      allergens: initialData?.allergens?.join(', ') || '',
      calories: initialData?.nutritionalInfo?.calories || undefined,
      fat: initialData?.nutritionalInfo?.fat || undefined,
      carbs: initialData?.nutritionalInfo?.carbs || undefined,
      protein: initialData?.nutritionalInfo?.protein || undefined,
      ingredients: initialData?.nutritionalInfo?.ingredients?.join(', ') || '',
    },
  });

  // Handle form submission
  const handleSubmit = (values: MenuItemFormValues) => {
    // Format the data for the API
    const formattedData = {
      ...values,
      shopId,
      image: imageUrl,
      imageKey: imageKey,
      allergens: values.allergens ? values.allergens.split(',').map(a => a.trim()) : [],
      nutritionalInfo: {
        calories: values.calories,
        fat: values.fat,
        carbs: values.carbs,
        protein: values.protein,
        ingredients: values.ingredients ? values.ingredients.split(',').map(i => i.trim()) : [],
      },
    };

    // Remove the fields that were moved to nutritionalInfo
    delete formattedData.calories;
    delete formattedData.fat;
    delete formattedData.carbs;
    delete formattedData.protein;
    delete formattedData.ingredients;

    // If this is an update, include the ID
    if (initialData?.id) {
      formattedData.id = initialData.id;
    }

    onSubmit(formattedData);
  };

  // Handle image upload
  const handleImageUploaded = (url: string, key: string) => {
    setImageUrl(url);
    setImageKey(key);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cappuccino" {...field} />
                  </FormControl>
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
                      placeholder="A rich, full-bodied espresso with steamed milk and a deep layer of foam"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Coffee">Coffee</SelectItem>
                        <SelectItem value="Tea">Tea</SelectItem>
                        <SelectItem value="Pastry">Pastry</SelectItem>
                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                        <SelectItem value="Lunch">Lunch</SelectItem>
                        <SelectItem value="Smoothie">Smoothie</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allergens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergens</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Milk, Nuts, Gluten"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate allergens with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      This item will be shown on the menu
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div>
              <FormLabel>Item Image</FormLabel>
              <ImageUpload
                shopId={shopId}
                initialImage={initialData?.image}
                onImageUploaded={handleImageUploaded}
                className="mt-2"
              />
            </div>

            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Nutritional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbs (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Milk, Espresso, Water"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Separate ingredients with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
