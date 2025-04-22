import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import Wishlist from "@/models/wishlist";
import Product from "@/models/product";
import Link from "next/link";
import RelatedProducts from "@/components/products/related-products";

export const metadata = {
  title: "My Wishlist | E-commerce",
  description: "View your wishlist items",
};

async function getWishlist(userId) {
  await connectToDatabase();

  const wishlist = await Wishlist.findOne({ user: userId }).lean();

  if (!wishlist) {
    return { products: [] };
  }

  const products = await Product.find({
    _id: { $in: wishlist.products },
  }).lean();

  return {
    _id: wishlist._id,
    products: products.map((product) => ({
      ...product,
      _id: product._id,
    })),
  };
}

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/account/wishlist");
  }

  const wishlist = await getWishlist(session.user.id);

  
  return (
    <main className="px-[5%]">
      <div className="container mx-auto px-4 py-10">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
          {wishlist.products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                Your wishlist is empty.
              </p>
              <Link
                href="/products"
                className="text-primary hover:underline bg-primary p-2 px-4 rounded-lg text-white"
              >
                Start shopping
              </Link>
            </div>
          ) : (
              <RelatedProducts products={wishlist.products} />
          )}
        </div>
      </div>
    </main>
  );
}
