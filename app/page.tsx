import Link from "next/link";
import { Coffee, Map, Star, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b">
          <Link className="flex items-center gap-2 font-bold" href="/">
            <Coffee className="h-6 w-6" />
            <span>BrewRewards</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#testimonials"
            >
              Testimonials
            </Link>
            <Link
              className="text-sm font-medium hover:underline underline-offset-4"
              href="#shops"
            >
              Find Shops
            </Link>
          </nav>
          <div className="ml-4 flex items-center gap-2">
            <ModeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 bg-coffee-pattern bg-cover bg-center">
            <div className="container px-4 md:px-6 flex flex-col items-center text-center gap-4 md:gap-10 max-w-[800px]">
              <div className="space-y-4 bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                  Discover & Reward Your Coffee Journey
                </h1>
                <p className="mx-auto max-w-[600px] text-white md:text-xl">
                  Find your favorite coffee shops, earn loyalty rewards, and
                  experience the perfect brew every time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                  >
                    Join Now
                  </Button>
                </Link>
                <Link href="/shops">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm dark:bg-black/20 dark:hover:bg-black/30"
                  >
                    Browse Coffee Shops
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="features" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700">
                    Features
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Everything You Need
                  </h2>
                  <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A complete platform for coffee lovers and shop owners to
                    connect, reward, and grow.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <Star className="h-10 w-10 text-amber-600" />
                    <div>
                      <h3 className="text-xl font-bold">Loyalty Rewards</h3>
                      <p className="text-gray-500">
                        Earn stamps, points, and exclusive offers at your
                        favorite coffee shops.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Map className="h-10 w-10 text-amber-600" />
                    <div>
                      <h3 className="text-xl font-bold">Shop Discovery</h3>
                      <p className="text-gray-500">
                        Find new coffee shops, view menus, and read reviews from
                        other coffee enthusiasts.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Ticket className="h-10 w-10 text-amber-600" />
                    <div>
                      <h3 className="text-xl font-bold">Digital Stamp Cards</h3>
                      <p className="text-gray-500">
                        Say goodbye to paper cards. Track all your loyalty
                        progress digitally.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <Users className="h-10 w-10 text-amber-600" />
                    <div>
                      <h3 className="text-xl font-bold">Shop Management</h3>
                      <p className="text-gray-500">
                        Powerful tools for coffee shop owners to manage loyalty
                        programs and engage customers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Coffee className="h-10 w-10 text-amber-600" />
                    <div>
                      <h3 className="text-xl font-bold">Menu Management</h3>
                      <p className="text-gray-500">
                        Easily update your shops menu, showcase seasonal items,
                        and highlight specials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
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
                      className="h-10 w-10 text-amber-600"
                    >
                      <path d="M12 2v1"></path>
                      <path d="M12 21v1"></path>
                      <path d="m4.93 4.93-.7-.7"></path>
                      <path d="m19.07 19.07 .7.7"></path>
                      <path d="M2 12h1"></path>
                      <path d="M21 12h1"></path>
                      <path d="m4.93 19.07 -.7.7"></path>
                      <path d="m19.07 4.93 .7-.7"></path>
                      <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"></path>
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold">
                        Analytics & Insights
                      </h3>
                      <p className="text-gray-500">
                        Detailed reports and analytics to understand customer
                        preferences and loyalty program performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            id="shops"
            className="w-full py-12 md:py-24 lg:py-32 bg-gray-50"
          >
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-amber-100 px-3 py-1 text-sm text-amber-700">
                    Featured Shops
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Discover Amazing Coffee Shops
                  </h2>
                  <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join our network of premium coffee shops offering unique
                    experiences and flavors.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl gap-8 py-12 sm:grid-cols-2 md:grid-cols-3">
                {[
                  {
                    name: "Urban Beans",
                    image: "/placeholder.svg?height=300&width=400",
                    rating: 4.8,
                    specialty: "Cold Brew & Pastries",
                  },
                  {
                    name: "Espresso Haven",
                    image: "/placeholder.svg?height=300&width=400",
                    rating: 4.7,
                    specialty: "Single-Origin Espresso",
                  },
                  {
                    name: "Morning Brew Co.",
                    image: "/placeholder.svg?height=300&width=400",
                    rating: 4.9,
                    specialty: "Organic Coffee & Breakfast",
                  },
                ].map((shop, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-lg border"
                  >
                    <Link
                      href={`/shops/${shop.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={shop.image || "/placeholder.svg"}
                          alt={shop.name}
                          className="object-cover transition-transform group-hover:scale-105"
                          width={400}
                          height={300}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold">{shop.name}</h3>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm">{shop.rating}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {shop.specialty}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-amber-600">
                            Loyalty program available
                          </span>
                          <span className="text-xs text-gray-500">
                            View details →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Link href="/shops">
                  <Button
                    variant="outline"
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    View All Coffee Shops
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500">
            © 2025 BrewRewards. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Privacy
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Contact
            </Link>
          </nav>
        </footer>
      </div>
    </ThemeProvider>
  );
}
