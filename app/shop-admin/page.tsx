import Link from "next/link"
import { CoffeeIcon, Download, PlusIcon, Settings, Store, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"

export default function ShopAdminDashboard() {
  // Mock shop data for admin
  const shopData = {
    name: "Urban Beans",
    address: "123 Main St, Cityville",
    image: "/placeholder.svg?height=400&width=600",
    stats: {
      totalCustomers: 287,
      activeStampCards: 156,
      redeemedRewards: 78,
      visitorsThisWeek: 43,
    },
    recentActivity: [
      {
        type: "check-in",
        user: {
          name: "Alex Johnson",
          image: "/placeholder.svg?height=100&width=100",
        },
        time: "10 minutes ago",
        action: "Earned a stamp",
      },
      {
        type: "reward",
        user: {
          name: "Jessica Miller",
          image: "/placeholder.svg?height=100&width=100",
        },
        time: "2 hours ago",
        action: "Redeemed free coffee",
      },
      {
        type: "check-in",
        user: {
          name: "Carlos Rodriguez",
          image: "/placeholder.svg?height=100&width=100",
        },
        time: "3 hours ago",
        action: "Earned a stamp",
      },
      {
        type: "signup",
        user: {
          name: "Emma Thompson",
          image: "/placeholder.svg?height=100&width=100",
        },
        time: "Yesterday",
        action: "Joined loyalty program",
      },
      {
        type: "reward",
        user: {
          name: "David Chen",
          image: "/placeholder.svg?height=100&width=100",
        },
        time: "Yesterday",
        action: "Redeemed 50% off pastry",
      },
    ],
    topCustomers: [
      {
        name: "Michelle Park",
        visits: 27,
        spent: "$312.50",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "James Wilson",
        visits: 23,
        spent: "$278.30",
        image: "/placeholder.svg?height=100&width=100",
      },
      {
        name: "Sophia Garcia",
        visits: 19,
        spent: "$215.75",
        image: "/placeholder.svg?height=100&width=100",
      },
    ],
    popularItems: [
      { name: "Cold Brew", orders: 129, revenue: "$516.00" },
      { name: "Cappuccino", orders: 97, revenue: "$427.80" },
      { name: "Blueberry Muffin", orders: 84, revenue: "$294.00" },
      { name: "Latte", orders: 76, revenue: "$304.00" },
      { name: "Croissant", orders: 72, revenue: "$270.00" },
    ],
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block w-64 border-r p-4">
        <div className="flex items-center gap-2 font-bold mb-6">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
        </div>

        <div className="space-y-1 mb-6">
          <Link href="/shop-admin">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Store className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/shop-admin/menu">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
                <path d="M8 6h8"></path>
                <path d="M8 10h8"></path>
                <path d="M8 14h8"></path>
                <path d="M8 18h8"></path>
              </svg>
              Menu Management
            </Button>
          </Link>
          <Link href="/shop-admin/loyalty">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"></path>
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"></path>
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"></path>
              </svg>
              Loyalty Program
            </Button>
          </Link>
          <Link href="/shop-admin/customers">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Customers
            </Button>
          </Link>
          <Link href="/shop-admin/reports">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
              Reports
            </Button>
          </Link>
          <Link href="/shop-admin/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Shop Owner" />
              <AvatarFallback>UB</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">Jason Miller</div>
              <div className="text-xs text-muted-foreground">Shop Owner</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b">
          <Button variant="outline" size="icon" className="lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M9 3v18"></path>
            </svg>
          </Button>
          <h1 className="ml-2 lg:ml-0 text-lg font-bold">{shopData.name} Dashboard</h1>
          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" size="sm" className="hidden md:flex gap-1">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Shop Owner" />
              <AvatarFallback>UB</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <CardDescription>Coffee shop loyalty members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {shopData.stats.totalCustomers}
                    <span className="text-xs font-normal text-green-600">+12%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Stamp Cards</CardTitle>
                  <CardDescription>Customers earning rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {shopData.stats.activeStampCards}
                    <span className="text-xs font-normal text-green-600">+5%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Redeemed Rewards</CardTitle>
                  <CardDescription>Total rewards claimed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {shopData.stats.redeemedRewards}
                    <span className="text-xs font-normal text-amber-600">+2%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Visitors</CardTitle>
                  <CardDescription>Customers this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {shopData.stats.visitorsThisWeek}
                    <span className="text-xs font-normal text-green-600">+8%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="customers">Top Customers</TabsTrigger>
              <TabsTrigger value="items">Popular Items</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Performance</CardTitle>
                    <CardDescription>Average visits and rewards over the past 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border">
                      <p className="text-sm text-muted-foreground">Performance Chart</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Loyalty Program Summary</CardTitle>
                    <CardDescription>Stamps issued and rewards redeemed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-md border">
                      <p className="text-sm text-muted-foreground">Loyalty Program Chart</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Customer activity from the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shopData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={activity.user.image} alt={activity.user.name} />
                          <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{activity.user.name}</p>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customers" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>Customers with the most visits and purchases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {shopData.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="font-medium text-muted-foreground w-6">{index + 1}</div>
                        <Avatar>
                          <AvatarImage src={customer.image} alt={customer.name} />
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.visits} visits</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{customer.spent}</p>
                          <p className="text-sm text-muted-foreground">Total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                  <CardDescription>Most ordered items in the past 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shopData.popularItems.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="font-medium text-muted-foreground w-6">{index + 1}</div>
                        <div className="flex-1 ml-4">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.revenue}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Upcoming Features</CardTitle>
                <CardDescription>New features and improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                    <h3 className="font-medium text-amber-800 mb-1">Customer Feedback Integration</h3>
                    <p className="text-sm text-amber-700">
                      Allow customers to leave feedback after visits and redeeming rewards.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <h3 className="font-medium text-green-800 mb-1">Personalized Promotions</h3>
                    <p className="text-sm text-green-700">
                      Send targeted offers based on customer preferences and visit history.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <h3 className="font-medium text-blue-800 mb-1">Advanced Analytics Dashboard</h3>
                    <p className="text-sm text-blue-700">
                      More detailed insights on customer behavior and loyalty program performance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common shop management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start text-left" variant="outline">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add New Menu Item
                  </Button>
                  <Button className="w-full justify-start text-left" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Lookup Customer
                  </Button>
                  <Button className="w-full justify-start text-left" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Reports
                  </Button>
                  <Button className="w-full justify-start text-left" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Shop Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

