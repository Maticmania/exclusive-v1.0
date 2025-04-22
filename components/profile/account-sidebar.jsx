"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User,
  MapPin,
  CreditCard,
  Package,
  RotateCcw,
  XCircle,
  Menu,
  LogOut,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  {
    title: "Manage My Account",
    icon: User,
    items: [
      { title: "My Profile", href: "/account/profile", icon: User },
      { title: "Address Book", href: "/account/addresses", icon: MapPin },
      { title: "My Payment Options", href: "/account/payment", icon: CreditCard },
    ],
  },
  {
    title: "My Orders",
    icon: Package,
    items: [
      { title: "My Orders", href: "/account/orders", icon: Package },
      { title: "My Returns", href: "/account/returns", icon: RotateCcw },
      { title: "My Cancellations", href: "/account/cancellations", icon: XCircle },
    ],
  },
  // {
  //   title: "My Wishlist",
  //   icon: Heart,
  //   items: [{ title: "My Wishlist", href: "/account/wishlist", icon: Heart }],
  // },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState(navItems.map(() => true)) // Track collapsible state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const newState = [...prev]
      newState[index] = !newState[index]
      return newState
    })
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <h2 className="text-lg font-semibold text-primary">My Account</h2>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5 text-primary" />
                <span className="sr-only">Toggle Account Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 bg-gradient-to-b from-white to-gray-50">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Account Menu
                </h3>
              </div>
              <nav className="py-4 space-y-2">
                {navItems.map((section, i) => (
                  <Collapsible
                    key={section.title}
                    open={openSections[i]}
                    onOpenChange={() => toggleSection(i)}
                    className="px-4"
                  >
                    <CollapsibleTrigger className="flex items-center gap-3 w-full py-3 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                      <section.icon className="h-5 w-5" />
                      <span>{section.title}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 py-2 text-sm rounded-md transition-all duration-200",
                            pathname === item.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </nav>
              <div className="p-4 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="h-5 w-5" />
                      <span className="truncate">My Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account/profile" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/auth/signout")}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-[240px] h-[calc(100vh-4rem)] sticky top-16 p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            My Account
          </h2>
          <nav className="space-y-4">
            {navItems.map((section, i) => (
              <Collapsible
                key={section.title}
                open={openSections[i]}
                onOpenChange={() => toggleSection(i)}
              >
                <CollapsibleTrigger className="flex items-center gap-3 w-full py-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                  <section.icon className="h-5 w-5" />
                  <span>{section.title}</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 space-y-1">
                  {section.items.map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 py-2 text-sm rounded-md transition-all duration-200",
                            pathname === item.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-primary text-primary-foreground">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
          {/* <div className="mt-6 pt-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="h-5 w-5" />
                  <span className="truncate">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/auth/signout")}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </div>
      </div>
    </TooltipProvider>
  )
}