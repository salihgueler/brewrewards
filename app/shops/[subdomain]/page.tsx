'use client';

import { useSubdomain } from '@/lib/subdomain-context';
import { Coffee, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ShopHomePage() {
  const { shop, isLoading, error } = useSubdomain();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading shop information...</p>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Coffee className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
        <p className="text-muted-foreground mb-6 text-center">
          {error?.message || "We couldn't find the coffee shop you're looking for."}
        </p>
        <Button asChild>
          <Link href="/">Return to BrewRewards Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          {shop.logo ? (
            <img src={shop.logo} alt={shop.name} className="h-12 w-12 rounded-full" />
          ) : (
            <Coffee className="h-12 w-12" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            {shop.description && <p className="text-muted-foreground">{shop.description}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/login?shop=${shop.subdomain}`}>Sign In</Link>
          </Button>
          <Button asChild>
            <Link href={`/register?shop=${shop.subdomain}`}>Join Rewards</Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Loyalty Program</CardTitle>
            <CardDescription>Earn points with every purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Join our loyalty program and earn 1 point for every dollar spent. Redeem your points for free drinks, food, and more!</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Learn More</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Digital Stamp Cards</CardTitle>
            <CardDescription>Collect stamps for free rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Collect digital stamps with every qualifying purchase. Complete a card and earn a free reward of your choice!</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Stamp Cards</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu & Favorites</CardTitle>
            <CardDescription>Browse our menu and save favorites</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explore our full menu and save your favorite items for quick ordering. Special discounts on favorite items for members!</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Browse Menu</Button>
          </CardFooter>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Featured Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* This would be populated from the API in a real implementation */}
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>Free {i === 1 ? 'Coffee' : i === 2 ? 'Pastry' : i === 3 ? 'Smoothie' : 'Tea'}</CardTitle>
                <CardDescription>{i * 50} points</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Redeem for a free {i === 1 ? 'coffee of your choice' : i === 2 ? 'pastry from our bakery' : i === 3 ? 'smoothie of the day' : 'tea of your choice'}.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Reward</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
