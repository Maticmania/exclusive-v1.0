import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product";
import mongoose from "mongoose";

// export async function GET(req) {
//   try {
//     await connectToDatabase(); // Ensure DB is connected

//     const url = new URL(req.url);
//     const category = url.searchParams.get("category");
//     const brand = url.searchParams.get("brand");
//     const featured = url.searchParams.get("featured");
//     const search = url.searchParams.get("search");
//     const sort = url.searchParams.get("sort") || "newest";
//     const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
//     const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "12"));
//     const skip = (page - 1) * limit;
//     const minPrice = parseFloat(url.searchParams.get("minPrice") || "0");
//     const maxPrice = parseFloat(url.searchParams.get("maxPrice") || "10000");

//     // Base query
//     const query = { isPublished: true };

//     if (category && mongoose.Types.ObjectId.isValid(category)) {
//       query.category = new mongoose.Types.ObjectId(category);
//     }

//     if (brand && mongoose.Types.ObjectId.isValid(brand)) {
//       query.brand = new mongoose.Types.ObjectId(brand);
//     }

//     if (featured === "true") {
//       query.featured = true;
//     }

//     if (!isNaN(minPrice) && !isNaN(maxPrice)) {
//       query.price = { $gte: minPrice, $lte: maxPrice }; // Filter by price range
//     }

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     // Sorting options
//     const sortOption = {
//       "price-asc": { price: 1 },
//       "price-desc": { price: -1 },
//       oldest: { createdAt: 1 },
//       newest: { createdAt: -1 },
//     }[sort] || { createdAt: -1 };

//     // Fetch products
//     const products = await Product.find(query)
//       .populate("category", "name slug")
//       .populate("brand", "name slug")
//       .sort(sortOption)
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     // Get total count
//     const total = await Product.countDocuments(query);

//     return NextResponse.json({
//       products,
//       pagination: {
//         total,
//         page,
//         limit,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


export async function GET() {
  try {
    await connectToDatabase(); // Ensure DB is connected
    const product = await Product.find()
    const productCount = await Product.countDocuments();


    return NextResponse.json({success: true, 
      products: product,
      totalProducts: productCount,
    })
    } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }

}