import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product";

// Helper function to serialize MongoDB documents and handle ObjectIds
function serializeMongoData(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeMongoData(item));
  }

  // Handle ObjectId (direct check)
  if (
    data &&
    typeof data === "object" &&
    data.constructor &&
    data.constructor.name === "ObjectId"
  ) {
    return data.toString();
  }

  // Handle plain objects (including those with ObjectId properties)
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip functions
      if (typeof value !== "function") {
        result[key] = serializeMongoData(value);
      }
    }
    return result;
  }

  // Return primitive values as is
  return data;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const brand = url.searchParams.get("brand");
    const featured = url.searchParams.get("featured");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "newest";
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    const minPrice = Number(url.searchParams.get("minPrice") || 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") || 1000);

    const query = {
      isPublished: true,
    };

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (featured === "true") {
      query.featured = true;
    }
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      query.price = { $gte: minPrice, $lte: maxPrice }; // Filter by price range
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case "price-asc":
        sortOption = { price: 1 };
        break;
      case "price-desc":
        sortOption = { price: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    await connectToDatabase();

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(query);

    // Serialize products to handle ObjectId and other MongoDB-specific types
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(), // Convert ObjectId to string
      category: product.category ? { ...product.category, _id: product.category._id.toString() } : null,
      brand: product.brand ? { ...product.brand, _id: product.brand._id.toString() } : null,
    }));
    
    return NextResponse.json({
      products: serializedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
