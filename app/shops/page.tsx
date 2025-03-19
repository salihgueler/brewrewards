import Link from "next/link"
import { CoffeeIcon, Filter, MapPin, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"

export default function ShopsPage() {
  // Mock data for coffee shops
  const coffeeShops = [
    {
      id: 1,
      name: "Urban Beans",
      address: "123 Main St, Cityville",
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["Cold Brew", "Pastries"],
      distance: "0.5 miles",
    },
    {
      id: 2,
      name: "Espresso Haven",
      address: "456 Oak Ave, Townsburg",
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["Single-Origin", "Espresso"],
      distance: "1.2 miles",
    },
    {
      id: 3,
      name: "Morning Brew Co.",
      address: "789 Pine Blvd, Villageton",
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["Organic", "Breakfast"],
      distance: "0.8 miles",
    },
    {
      id: 4,
      name: "The Coffee Corner",
      address: "101 Elm St, Hamletville",
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["Pour Over", "Vegan Treats"],
      distance: "1.5 miles",
    },
    {
      id: 5,
      name: "Barista's Delight",
      address: "202 Maple Dr, Boroughburg",
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["Latte Art", "Sandwiches"],
      distance: "0.3 miles",
    },
    {
      id: 6,
      name: "Roasted Bean",
      address: "303 Cedar Ln, Districtville",
      rating: 4.4,
      image: "/placeholder.svg?height=200&width=300",
      specialties: ["House Roast", "Cookies"],
      distance: "2.1 miles",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background z-10">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Home
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            My Rewards
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <ModeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Coffee Shops</h1>
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            Near Me
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, location, or specialty..." className="pl-10" />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coffeeShops.map((shop) => (
            <Link key={shop.id} href={`/shops/${shop.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={shop.image || "/placeholder.svg"}
                    alt={shop.name}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-amber-600" />
                    {shop.distance}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">{shop.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{shop.address}</p>
                  <div className="flex flex-wrap gap-1">
                    {shop.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <span className="text-xs text-amber-600 font-medium">Loyalty program available</span>
                  <span className="text-xs">View details →</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2025 BrewRewards. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  )
}

