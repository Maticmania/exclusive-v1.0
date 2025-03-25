"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { LayoutDashboard, Package, Tags, BadgePercent, Users, ShoppingCart, Settings, Menu } from "lucide-react"
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

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const { isAdmin, isSuperAdmin } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Update the navItems array to include the management page
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
      role: "superadmin", // Only superadmin can access
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => !item.role || (item.role === "superadmin" && isSuperAdmin()))

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex border-r bg-white">
        <SidebarHeader className="p-6">
          <Link href="/admin/dashboard" className="text-xl font-bold">
            Admin Panel
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    className="cursor-pointer transition-colors hover:bg-gray-100"
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/")}>
            <span>View Store</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0">
              <div className="p-6 border-b">
                <Link href="/admin/dashboard" className="text-xl font-bold">
                  Admin Panel
                </Link>
              </div>
              <nav className="flex-1 space-y-1 px-4 py-2">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors cursor-pointer ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1 md:ml-0">
            <h1 className="text-lg font-semibold md:text-xl">
              {filteredNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.title ||
                "Admin"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden md:flex" onClick={() => (window.location.href = "/")}>
              View Store
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

