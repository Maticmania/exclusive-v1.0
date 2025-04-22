"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { LayoutDashboard, Package, Tags, BadgePercent, Users, ShoppingCart, Settings, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const { isAdmin, isSuperAdmin, user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Management",
      href: "/admin/management",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      title: "Brands",
      href: "/admin/brands",
      icon: BadgePercent,
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      role: "superadmin",
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const filteredNavItems = navItems.filter(
    (item) => !item.role || (item.role === "superadmin" && isSuperAdmin())
  )

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Desktop Sidebar */}
        <Sidebar
          collapsible="icon"
          className="hidden md:flex w-[240px] border-r bg-white shadow-lg transition-all duration-300"
        >
          <SidebarHeader className="p-6 border-b">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-xl font-bold text-primary">
              <LayoutDashboard className="h-6 w-6" />
              <span>Admin Panel</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                            pathname === item.href || pathname.startsWith(`${item.href}/`)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          )}
                        >
                          <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <span className="truncate">{item.title}</span>
                        </SidebarMenuButton>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-primary text-primary-foreground">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="h-5 w-5" />
                  <span className="truncate">{user?.name || "Admin"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>{user?.email || "Admin"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="mt-2 w-full text-sm"
              onClick={() => (window.location.href = "/")}
            >
              View Store
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Header and Content */}
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] p-0 bg-white">
                <div className="p-6 border-b flex items-center gap-2">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                  <Link href="/admin/dashboard" className="text-xl font-bold text-primary">
                    Admin Panel
                  </Link>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                        pathname === item.href || pathname.startsWith(`${item.href}/`)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => (window.location.href = "/")}
                  >
                    View Store
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <h1 className="text-lg font-semibold md:text-xl">
                {filteredNavItems.find(
                  (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
                )?.title || "Admin"}
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>{user?.email || "Admin"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => (window.location.href = "/")}
            >
              View Store
            </Button>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-white rounded-tl-2xl shadow-inner">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}