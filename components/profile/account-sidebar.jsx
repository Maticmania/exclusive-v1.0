"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Manage My Account",
    items: [
      { title: "My Profile", href: "/account/profile" },
      { title: "Address Book", href: "/account/addresses" },
      { title: "My Payment Options", href: "/account/payment" },
    ],
  },
  {
    title: "My Orders",
    items: [
      { title: "My Orders", href: "/account/orders" },
      { title: "My Returns", href: "/account/returns" },
      { title: "My Cancellations", href: "/account/cancellations" },
    ],
  },
//   {
//     title: "My Wishlist",
//     items: [{ title: "My Wishlist", href: "/account/wishlist" }],
//   },
]

export default function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {navItems.map((section, i) => (
        <div key={i} className="space-y-2">
          <h3 className="font-medium">{section.title}</h3>
          <ul className="space-y-1">
            {section.items.map((item, j) => (
              <li key={j}>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-1 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "text-primary font-medium",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

