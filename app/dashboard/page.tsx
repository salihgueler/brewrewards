import Link from "next/link"
import { CoffeeIcon, Heart, Map, QrCode, TicketIcon, Trophy, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"

export default function UserDashboard() {
  // Mock user data
  const user = {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    profileImage: "/placeholder.svg?height=100&width=100",
    memberSince: "March 2023",
    favoriteShops: [
      {
        id: 1,
        name: "Urban Beans",
        image: "/placeholder.svg?height=200&width=300",
        stamps: 4,
        totalStamps: 10,
      },
      {
        id: 2,
        name: "Espresso Haven",
        image: "/placeholder.svg?height=200&width=300",
        stamps: 7,
        totalStamps: 8,
      },
      {
        id: 3,
        name: "Morning Brew Co.",
        image: "/placeholder.svg?height=200&width=300",
        stamps: 2,
        totalStamps: 10,
      },
    ],
    recentVisits: [
      {
        shopId: 1,
        shopName: "Urban Beans",
        date: "Today, 8:45 AM",
        earned: "1 stamp",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        shopId: 2,
        shopName: "Espresso Haven",
        date: "Yesterday, 1:30 PM",
        earned: "1 stamp",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        shopId: 1,
        shopName: "Urban Beans",
        date: "May 10, 9:15 AM",
        earned: "1 stamp",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
    rewards: [
      {
        id: 1,
        shopName: "Espresso Haven",
        reward: "Free Coffee",
        expires: "June 30, 2025",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 2,
        shopName: "Roasted Bean",
        reward: "50% Off Pastry",
        expires: "May 20, 2025",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background z-10">
        <Link className="flex items-center gap-2 font-bold" href="/">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/shops">
            Find Shops
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
            My Rewards
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <ModeToggle />
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">Member since {user.memberSince}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1">
              <QrCode className="h-4 w-4" />
              My QR Code
            </Button>
            <Button size="sm" variant="outline" className="gap-1">
              <User className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Favorite Shops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.favoriteShops.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CoffeeIcon className="h-4 w-4 text-amber-600" />
                Active Stamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.favoriteShops.reduce((total, shop) => total + shop.stamps, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-green-500" />
                Available Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.rewards.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="loyalty" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loyalty">My Loyalty Cards</TabsTrigger>
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="loyalty" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.favoriteShops.map((shop) => {
                const progressPercent = (shop.stamps / shop.totalStamps) * 100

                return (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="h-28 relative">
                      <img
                        src={shop.image || "/placeholder.svg"}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-3 text-white font-bold text-lg">{shop.name}</div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Your stamps</span>
                        <span>
                          {shop.stamps}/{shop.totalStamps}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {Array(shop.totalStamps)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className={`aspect-square rounded-full flex items-center justify-center border ${
                                i < shop.stamps
                                  ? "bg-amber-600 border-amber-700 text-white"
                                  : "bg-gray-100 border-gray-200"
                              }`}
                            >
                              {i < shop.stamps && <CoffeeIcon className="h-3 w-3" />}
                            </div>
                          ))}
                      </div>

                      <div className="flex justify-between">
                        <Button size="sm" variant="outline" className="text-xs">
                          Check In
                        </Button>
                        <Link href={`/shops/${shop.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            View Shop
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              <Card className="flex flex-col items-center justify-center p-6 border-dashed h-full">
                <Map className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium mb-2">Discover More Shops</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Find coffee shops near you and start earning rewards
                </p>
                <Link href="/shops">
                  <Button>Find Coffee Shops</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="pt-6">
            {user.rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.rewards.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden">
                    <div className="h-28 relative">
                      <img
                        src={reward.image || "/placeholder.svg"}
                        alt={reward.shopName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-3 text-white font-bold text-lg">{reward.shopName}</div>
                    </div>
                    <CardContent className="p-4">
                      <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4 flex items-start gap-3">
                        <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-700">{reward.reward}</h4>
                          <p className="text-xs text-green-600">Expires: {reward.expires}</p>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button size="sm" className="text-xs">
                          Redeem Reward
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rewards Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Visit your favorite coffee shops and collect stamps to earn rewards
                </p>
                <Link href="/shops">
                  <Button>Find Coffee Shops</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="pt-6">
            <div className="space-y-4">
              {user.recentVisits.map((visit, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={visit.image || "/placeholder.svg"}
                    alt={visit.shopName}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{visit.shopName}</h4>
                        <p className="text-sm text-muted-foreground">{visit.date}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {visit.earned}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center">
                <Button variant="outline">View More Activity</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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

