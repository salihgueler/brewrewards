import Link from "next/link"
import { CoffeeIcon, Download, Filter, Map, Plus, Search, Settings, Store, UserCog, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"

export default function SuperAdminDashboard() {
  // Mock data for super admin
  const adminData = {
    stats: {
      totalShops: 42,
      totalCustomers: 8745,
      totalRewards: 3289,
      activeUsers: 2156,
    },
    recentShops: [
      {
        id: 1,
        name: "Urban Beans",
        location: "Cityville",
        customers: 287,
        image: "/placeholder.svg?height=200&width=300",
        status: "active",
      },
      {
        id: 2,
        name: "Espresso Haven",
        location: "Townsburg",
        customers: 195,
        image: "/placeholder.svg?height=200&width=300",
        status: "active",
      },
      {
        id: 3,
        name: "Morning Brew Co.",
        location: "Villageton",
        customers: 241,
        image: "/placeholder.svg?height=200&width=300",
        status: "active",
      },
      {
        id: 4,
        name: "The Coffee Corner",
        location: "Hamletville",
        customers: 178,
        image: "/placeholder.svg?height=200&width=300",
        status: "pending",
      },
      {
        id: 5,
        name: "Barista's Delight",
        location: "Boroughburg",
        customers: 214,
        image: "/placeholder.svg?height=200&width=300",
        status: "active",
      },
    ],
    topPerforming: [
      {
        shop: "Urban Beans",
        customers: 287,
        rewards: 156,
        redemptionRate: "54%",
      },
      {
        shop: "Morning Brew Co.",
        customers: 241,
        rewards: 142,
        redemptionRate: "59%",
      },
      {
        shop: "Barista's Delight",
        customers: 214,
        rewards: 118,
        redemptionRate: "55%",
      },
    ],
    recentActivity: [
      {
        shop: "Espresso Haven",
        action: "Updated menu items",
        time: "10 minutes ago",
      },
      {
        shop: "Urban Beans",
        action: "Approved 12 reward redemptions",
        time: "2 hours ago",
      },
      {
        shop: "Morning Brew Co.",
        action: "Modified loyalty program",
        time: "Yesterday",
      },
      {
        shop: "Barista's Delight",
        action: "Added 2 new staff members",
        time: "Yesterday",
      },
      {
        shop: "The Coffee Corner",
        action: "Completed account setup",
        time: "2 days ago",
      },
    ],
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block w-64 border-r p-4">
        <div className="flex items-center gap-2 font-bold mb-6">
          <CoffeeIcon className="h-6 w-6" />
          <span>BrewRewards</span>
          <Badge className="ml-auto">Admin</Badge>
        </div>

        <div className="space-y-1 mb-6">
          <Link href="/super-admin">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Store className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/super-admin/shops">
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
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 3v18"></path>
              </svg>
              Coffee Shops
            </Button>
          </Link>
          <Link href="/super-admin/users">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Users
            </Button>
          </Link>
          <Link href="/super-admin/analytics">
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
              Analytics
            </Button>
          </Link>
          <Link href="/super-admin/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">Admin User</div>
              <div className="text-xs text-muted-foreground">Super Admin</div>
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
          <h1 className="ml-2 lg:ml-0 text-lg font-bold">Super Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-4">
            <ModeToggle />
            <Button variant="outline" size="sm" className="hidden md:flex gap-1">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
              <AvatarFallback>SA</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Coffee Shops</CardTitle>
                  <CardDescription>Active shops on platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {adminData.stats.totalShops}
                    <span className="text-xs font-normal text-green-600">+3</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <CardDescription>Registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {adminData.stats.totalCustomers}
                    <span className="text-xs font-normal text-green-600">+124</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
                  <CardDescription>Across all shops</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {adminData.stats.totalRewards}
                    <span className="text-xs font-normal text-green-600">+87</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <CardDescription>Last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-2">
                    {adminData.stats.activeUsers}
                    <span className="text-xs font-normal text-green-600">+5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Coffee Shops</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Link href="/super-admin/shops/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shop
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search coffee shops..." className="pl-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminData.recentShops.map((shop) => (
                <Card key={shop.id} className="overflow-hidden">
                  <div className="h-32 relative">
                    <img
                      src={shop.image || "/placeholder.svg"}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        className={
                          shop.status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }
                      >
                        {shop.status === "active" ? "Active" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Map className="h-3 w-3 mr-1" />
                      {shop.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-muted-foreground">Customers</div>
                        <div className="font-medium">{shop.customers}</div>
                      </div>
                      <Link href={`/super-admin/shops/${shop.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline">View All Shops</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Top performing shops by loyalty program usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {adminData.topPerforming.map((shop, index) => (
                    <div key={index} className="flex items-center">
                      <div className="font-medium text-muted-foreground w-6">{index + 1}</div>
                      <div className="flex-1 ml-4">
                        <p className="font-medium">{shop.shop}</p>
                        <p className="text-sm text-muted-foreground">{shop.customers} customers</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="font-medium">{shop.rewards}</p>
                        <p className="text-sm text-muted-foreground">Rewards</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{shop.redemptionRate}</p>
                        <p className="text-sm text-muted-foreground">Redemption</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest shop activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.recentActivity.map((activity, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{activity.shop}</p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrator tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button className="w-full" variant="outline">
                    <Store className="h-4 w-4 mr-2" />
                    Add New Shop
                  </Button>
                  <Button className="w-full" variant="outline">
                    <UserCog className="h-4 w-4 mr-2" />
                    Manage Admins
                  </Button>
                  <Button className="w-full" variant="outline">
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
                      className="h-4 w-4 mr-2"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M12 18v-6"></path>
                      <path d="M8 18v-1"></path>
                      <path d="M16 18v-3"></path>
                    </svg>
                    Generate Report
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Platform Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Platform performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>System Uptime</span>
                      <span className="text-green-600">99.9%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: "99.9%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Database Performance</span>
                      <span className="text-green-600">Excellent</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>API Response Time</span>
                      <span className="text-green-600">120ms</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

