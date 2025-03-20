'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, ArrowLeft, Building, User, MapPin, Phone, Mail, Globe, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { UserRole } from '@/lib/types';

export default function AddShopPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Shop details form state
  const [shopDetails, setShopDetails] = useState({
    name: '',
    subdomain: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    hours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: '10:00 AM - 4:00 PM',
    }
  });
  
  // Admin details form state
  const [adminDetails, setAdminDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Form validation state
  const [errors, setErrors] = useState({
    shop: {
      name: '',
      subdomain: '',
      email: '',
      phone: '',
    },
    admin: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  // Handle shop details change
  const handleShopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('hours.')) {
      const dayName = name.split('.')[1];
      setShopDetails({
        ...shopDetails,
        hours: {
          ...shopDetails.hours,
          [dayName]: value
        }
      });
    } else {
      setShopDetails({
        ...shopDetails,
        [name]: value
      });
    }
    
    // Clear error when field is edited
    if (name in errors.shop) {
      setErrors({
        ...errors,
        shop: {
          ...errors.shop,
          [name]: ''
        }
      });
    }
  };
  
  // Handle admin details change
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminDetails({
      ...adminDetails,
      [name]: value
    });
    
    // Clear error when field is edited
    if (name in errors.admin) {
      setErrors({
        ...errors,
        admin: {
          ...errors.admin,
          [name]: ''
        }
      });
    }
  };
  
  // Validate shop details
  const validateShopDetails = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (!shopDetails.name.trim()) {
      newErrors.shop.name = 'Shop name is required';
      isValid = false;
    }
    
    if (!shopDetails.subdomain.trim()) {
      newErrors.shop.subdomain = 'Subdomain is required';
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(shopDetails.subdomain)) {
      newErrors.shop.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
      isValid = false;
    }
    
    if (shopDetails.email && !/^\S+@\S+\.\S+$/.test(shopDetails.email)) {
      newErrors.shop.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Validate admin details
  const validateAdminDetails = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (!adminDetails.firstName.trim()) {
      newErrors.admin.firstName = 'First name is required';
      isValid = false;
    }
    
    if (!adminDetails.lastName.trim()) {
      newErrors.admin.lastName = 'Last name is required';
      isValid = false;
    }
    
    if (!adminDetails.email.trim()) {
      newErrors.admin.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(adminDetails.email)) {
      newErrors.admin.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!adminDetails.password) {
      newErrors.admin.password = 'Password is required';
      isValid = false;
    } else if (adminDetails.password.length < 8) {
      newErrors.admin.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    
    if (adminDetails.password !== adminDetails.confirmPassword) {
      newErrors.admin.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1 && validateShopDetails()) {
      setCurrentStep(2);
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAdminDetails()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API to create the shop and admin
      // For now, we'll simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the data for API submission
      const shopData = {
        name: shopDetails.name,
        subdomain: shopDetails.subdomain,
        description: shopDetails.description,
        address: shopDetails.address,
        contact: {
          phone: shopDetails.phone,
          email: shopDetails.email,
          website: shopDetails.website,
          instagram: shopDetails.instagram,
        },
        hours: shopDetails.hours,
      };
      
      const adminData = {
        firstName: adminDetails.firstName,
        lastName: adminDetails.lastName,
        email: adminDetails.email,
        password: adminDetails.password,
        role: UserRole.SHOP_ADMIN,
      };
      
      console.log('Creating shop:', shopData);
      console.log('Creating admin:', adminData);
      
      // Redirect to the shop list page with a success message
      router.push('/super-admin?success=shop-created');
    } catch (error) {
      console.error('Error creating shop:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate subdomain from shop name
  const generateSubdomain = () => {
    if (!shopDetails.name) return;
    
    const subdomain = shopDetails.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setShopDetails({
      ...shopDetails,
      subdomain
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container px-4 py-4 flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/super-admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Add New Coffee Shop</h1>
        </div>
      </header>

      <main className="container px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Coffee Shop</CardTitle>
            <CardDescription>
              Add a new coffee shop to the BrewRewards platform and assign an admin user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Shop Details</span>
                </div>
                <div className="h-0.5 w-16 bg-muted"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Admin Account</span>
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Shop Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        name="name"
                        value={shopDetails.name}
                        onChange={handleShopChange}
                        placeholder="Urban Beans"
                      />
                      <Button type="button" variant="outline" onClick={generateSubdomain}>
                        Generate URL
                      </Button>
                    </div>
                    {errors.shop.name && (
                      <p className="text-sm text-destructive">{errors.shop.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subdomain">
                      Subdomain <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex items-center">
                      <Input
                        id="subdomain"
                        name="subdomain"
                        value={shopDetails.subdomain}
                        onChange={handleShopChange}
                        placeholder="urban-beans"
                        className="rounded-r-none"
                      />
                      <div className="bg-muted px-3 py-2 border border-l-0 border-input rounded-r-md text-muted-foreground">
                        .brewrewards.com
                      </div>
                    </div>
                    {errors.shop.subdomain && (
                      <p className="text-sm text-destructive">{errors.shop.subdomain}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={shopDetails.description}
                    onChange={handleShopChange}
                    placeholder="A cozy neighborhood coffee shop specializing in ethically sourced beans..."
                    rows={3}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      value={shopDetails.address}
                      onChange={handleShopChange}
                      placeholder="123 Main St, Cityville"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={shopDetails.phone}
                        onChange={handleShopChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    {errors.shop.phone && (
                      <p className="text-sm text-destructive">{errors.shop.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shopDetails.email}
                        onChange={handleShopChange}
                        placeholder="contact@urbanbeans.com"
                      />
                    </div>
                    {errors.shop.email && (
                      <p className="text-sm text-destructive">{errors.shop.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        value={shopDetails.website}
                        onChange={handleShopChange}
                        placeholder="www.urbanbeans.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram (Optional)</Label>
                    <div className="flex items-center">
                      <Instagram className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="instagram"
                        name="instagram"
                        value={shopDetails.instagram}
                        onChange={handleShopChange}
                        placeholder="@urbanbeans"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Hours</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(shopDetails.hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-2">
                        <Label htmlFor={`hours.${day}`} className="w-24">{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                        <Input
                          id={`hours.${day}`}
                          name={`hours.${day}`}
                          value={hours}
                          onChange={handleShopChange}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{shopDetails.name}</p>
                    <p className="text-sm text-muted-foreground">{shopDetails.subdomain}.brewrewards.com</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shop Admin Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Create an admin account for this coffee shop. This person will have full access to manage the shop's rewards, menu, and settings.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={adminDetails.firstName}
                      onChange={handleAdminChange}
                      placeholder="John"
                    />
                    {errors.admin.firstName && (
                      <p className="text-sm text-destructive">{errors.admin.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={adminDetails.lastName}
                      onChange={handleAdminChange}
                      placeholder="Smith"
                    />
                    {errors.admin.lastName && (
                      <p className="text-sm text-destructive">{errors.admin.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminEmail"
                      name="email"
                      type="email"
                      value={adminDetails.email}
                      onChange={handleAdminChange}
                      placeholder="admin@example.com"
                    />
                  </div>
                  {errors.admin.email && (
                    <p className="text-sm text-destructive">{errors.admin.email}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={adminDetails.password}
                      onChange={handleAdminChange}
                    />
                    {errors.admin.password && (
                      <p className="text-sm text-destructive">{errors.admin.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={adminDetails.confirmPassword}
                      onChange={handleAdminChange}
                    />
                    {errors.admin.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.admin.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <p className="font-medium">Shop Admin Role</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This user will be assigned the SHOP_ADMIN role and will have access to manage this coffee shop only.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep === 1 ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/super-admin">Cancel</Link>
                </Button>
                <Button onClick={handleNextStep}>Next: Admin Account</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handlePrevStep}>Back</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Coffee Shop'}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
