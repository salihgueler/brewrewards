'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { uploadImageToS3 } from '@/lib/s3-upload';

// Define the form schema with Zod
const menuItemSchema = z.object({
  id: z.string().optional(),
  shopId: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  category: z.string().min(1, { message: 'Category is required' }),
  imageKey: z.string().optional(),
  isAvailable: z.boolean().default(true),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z
    .object({
      calories: z.coerce.number().optional(),
      fat: z.coerce.number().optional(),
      carbs: z.coerce.number().optional(),
      protein: z.coerce.number().optional(),
      ingredients: z.array(z.string()).optional(),
    })
    .optional(),
});

// Define the props for the form component
interface MenuItemFormProps {
  shopId: string;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

// Common allergens list
const commonAllergens = [
  { id: 'milk', label: 'Milk' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'soy', label: 'Soy' },
  { id: 'nuts', label: 'Tree Nuts' },
  { id: 'peanuts', label: 'Peanuts' },
  { id: 'fish', label: 'Fish' },
  { id: 'shellfish', label: 'Shellfish' },
];

// Common categories
const categories = [
  'Coffee',
  'Tea',
  'Pastry',
  'Sandwich',
  'Breakfast',
  'Lunch',
  'Dessert',
  'Snack',
  'Other',
];

export function MenuItemForm({
  shopId,
  initialData,
  onSubmit,
  isLoading = false,
}: MenuItemFormProps) {
  const [imageUploading, setImageUploading] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      shopId: shopId,
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      category: initialData?.category || '',
      imageKey: initialData?.imageKey || '',
      isAvailable: initialData?.isAvailable !== false,
      allergens: initialData?.allergens || [],
      nutritionalInfo: {
        calories: initialData?.nutritionalInfo?.calories || 0,
        fat: initialData?.nutritionalInfo?.fat || 0,
        carbs: initialData?.nutritionalInfo?.carbs || 0,
        protein: initialData?.nutritionalInfo?.protein || 0,
        ingredients: initialData?.nutritionalInfo?.ingredients || [],
      },
    },
  });

  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof menuItemSchema>) => {
    await onSubmit(values);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const result = await uploadImageToS3(file, shopId);
      form.setValue('imageKey', result.key);
      return result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the item"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability */}
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
                      This item will be shown as available on the menu
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="imageKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ''}
                      onChange={(url) => field.onChange(url)}
                      onUpload={handleImageUpload}
                      isUploading={imageUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Allergens */}
            <div>
              <FormLabel className="mb-2 block">Allergens</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {commonAllergens.map((allergen) => (
                  <FormField
                    key={allergen.id}
                    control={form.control}
                    name="allergens"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={allergen.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(allergen.label)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([...currentValues, allergen.label])
                                  : field.onChange(
                                      currentValues.filter(
                                        (value) => value !== allergen.label
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {allergen.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Info Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Nutritional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="nutritionalInfo.calories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.fat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.carbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutritionalInfo.protein"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein (g)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || imageUploading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
