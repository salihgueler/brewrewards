import Link from "next/link"
import { CoffeeIcon, Heart, MapPin, Star, CircleCheck, Clock, Phone, Globe, Instagram, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"

export default function ShopDetailPage({ params }: { params: { id: string } }) {
  // Mock data for a coffee shop
  const shop = {
    id: params.id,
    name: "Urban Beans",
    address: "123 Main St, Cityville",
    phone: "(555) 123-4567",
    website: "www.urbanbeans.com",
    instagram: "@urbanbeans",
    description:
      "A cozy neighborhood coffee shop specializing in ethically sourced beans and homemade pastries. Our expertly trained baristas craft every drink with care, focusing on bringing out the unique flavors of our specialty roasts.",
    rating: 4.8,
    reviewCount: 156,
    hours: {
      monday: "7:00 AM - 6:00 PM",
      tuesday: "7:00 AM - 6:00 PM",
      wednesday: "7:00 AM - 6:00 PM",
      thursday: "7:00 AM - 6:00 PM",
      friday: "7:00 AM - 8:00 PM",
      saturday: "8:00 AM - 8:00 PM",
      sunday: "8:00 AM - 5:00 PM",
    },
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    loyalty: {
      type: "Stamp Card",
      reward: "Buy 9 drinks, get 1 free",
      currentProgress: 4,
      totalNeeded: 10,
    },
    specialties: ["Cold Brew", "Pour Over", "House-made Pastries", "Vegan Options"],
    menu: [
      {
        category: "Espresso",
        items: [
          { name: "Espresso", price: 3.5, description: "Single shot of our house blend" },
          { name: "Americano", price: 4.0, description: "Espresso with hot water" },
          { name: "Cappuccino", price: 4.75, description: "Espresso with steamed milk and foam" },
          { name: "Latte", price: 5.0, description: "Espresso with steamed milk" },
        ],
      },
      {
        category: "Brewed Coffee",
        items: [
          { name: "House Blend", price: 3.0, description: "Our signature medium roast" },
          { name: "Cold Brew", price: 4.5, description: "Slow steeped for 12 hours" },
          { name: "Pour Over", price: 5.5, description: "Single-origin, hand poured" },
        ],
      },
      {
        category: "Pastries",
        items: [
          { name: "Croissant", price: 3.75, description: "Butter croissant, baked fresh daily" },
          { name: "Blueberry Muffin", price: 3.5, description: "Made with organic blueberries" },
          { name: "Cinnamon Roll", price: 4.25, description: "With house-made cream cheese frosting" },
        ],
      },
    ],
  }

  // Calculate stamp card progress percentage
  const progressPercent = (shop.loyalty.currentProgress / shop.loyalty.totalNeeded) * 100

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background z-10">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/shops">
            All Shops
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

      <main className="flex-1">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img src={shop.images[0] || "/placeholder.svg"} alt={shop.name} className="w-full h-full object-cover" />
          <Link
            href="/shops"
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Button
            size="icon"
            variant="outline"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{shop.rating}</span>
                      <span className="text-sm">({shop.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.address}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <Button className="bg-amber-600 hover:bg-amber-700">Check In</Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {shop.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>

              <div className="mb-8">
                <p className="text-muted-foreground">{shop.description}</p>
              </div>

              <Tabs defaultValue="menu" className="mb-8">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="info">Shop Info</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="pt-4">
                  {shop.menu.map((category, index) => (
                    <div key={index} className="mb-8">
                      <h3 className="text-xl font-bold mb-4">{category.category}</h3>
                      <div className="grid gap-4">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="info" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-bold mb-3">Contact</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{shop.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={`https://${shop.website}`} className="text-blue-600 hover:underline">
                            {shop.website}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-muted-foreground" />
                          <span>{shop.instagram}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-3">Hours</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monday</span>
                          <span>{shop.hours.monday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tuesday</span>
                          <span>{shop.hours.tuesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wednesday</span>
                          <span>{shop.hours.wednesday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Thursday</span>
                          <span>{shop.hours.thursday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Friday</span>
                          <span>{shop.hours.friday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>{shop.hours.saturday}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>{shop.hours.sunday}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shop.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${shop.name} interior or products ${index + 1}`}
                        className="rounded-lg object-cover w-full aspect-square"
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3">Loyalty Program</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CircleCheck className="h-5 w-5 text-green-500" />
                      <span>
                        {shop.loyalty.type}: {shop.loyalty.reward}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Your progress</span>
                        <span>
                          {shop.loyalty.currentProgress}/{shop.loyalty.totalNeeded} stamps
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {Array(shop.loyalty.totalNeeded)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className={`aspect-square rounded-full flex items-center justify-center border ${
                              i < shop.loyalty.currentProgress
                                ? "bg-amber-600 border-amber-700 text-white"
                                : "bg-gray-100 border-gray-200"
                            }`}
                          >
                            {i < shop.loyalty.currentProgress && <CoffeeIcon className="h-4 w-4" />}
                          </div>
                        ))}
                    </div>

                    <Button className="w-full">Check In to Earn Stamp</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3">Hours Today</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <span className="text-green-600 font-medium">Open Now</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{shop.hours.monday}</p>
                  <Button variant="outline" className="w-full mt-4">
                    See All Hours
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-3">Location</h3>
                  <div className="aspect-video bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{shop.address}</p>
                  <Button variant="outline" className="w-full mt-4">
                    Get Directions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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

