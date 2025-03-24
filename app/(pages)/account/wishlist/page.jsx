import AccountSidebar from "@/components/profile/account-sidebar"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {connectToDatabase} from "@/lib/mongodb"
import Wishlist from "@/models/wishlist"
import Product from "@/models/product"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export const metadata = {
  title: "My Wishlist | E-commerce",
  description: "View your wishlist items",
};

async function getWishlist(userId) {
  await connectToDatabase()

  const wishlist = await Wishlist.findOne({ user: userId }).lean()

  if (!wishlist) {
    return { products: [] }
  }

  const products = await Product.find({
    _id: { $in: wishlist.products },
  }).lean()

  return {
    _id: wishlist._id.toString(),
    products: products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    })),
  }
}

export default async function WishlistPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/wishlist")
  }

  const wishlist = await getWishlist(session.user.id)

  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <AccountSidebar />
        </div>

        <div className="w-full md:w-3/4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>

            {wishlist.products.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                <Link href="/products" className="text-primary hover:underline">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.products.map((product) => (
                  <div key={product._id} className="border rounded-lg overflow-hidden group">
                    <div className="relative">
                      <Link href={`/products/${product._id}`}>
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <form action="/api/wishlist/remove" className="absolute top-2 right-2">
                        <input type="hidden" name="productId" value={product._id} />
                        <Button type="submit" size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                      </form>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <p className="font-bold">${product.price.toFixed(2)}</p>
                        <form action="/api/cart/add">
                          <input type="hidden" name="productId" value={product._id} />
                          <input type="hidden" name="quantity" value="1" />
                          <Button type="submit" size="sm" variant="outline">
                            Add to cart
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

