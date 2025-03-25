import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Exclusive</h3>
            <p className="text-gray-600 mb-4">
              Subscribe to our newsletter for updates on new products and special offers.
            </p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90">Subscribe</button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-600 hover:text-primary">
                  Warranty
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?tag=new" className="text-gray-600 hover:text-primary">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-gray-600 hover:text-primary">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/products?sort=price&order=asc" className="text-gray-600 hover:text-primary">
                  Best Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, City, Country</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@exclusive.com</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-600 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Exclusive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

