import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Product from "@/models/product";
import Category from "@/models/category"; // Your provided Category model
import Brand from "@/models/brand";     // Assuming you have this

function serializeMongoData(data) {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(serializeMongoData);
  if (data?.constructor?.name === "ObjectId") return data.toString();
  if (typeof data === "object" && data !== null) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== "function") result[key] = serializeMongoData(value);
    }
    return result;
  }
  return data;
}

export async function GET(req) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Number.parseInt(url.searchParams.get("limit") || "12"));
    const skip = (page - 1) * limit;
    const sort = url.searchParams.get("sort") || "newest";
    const categorySlug = url.searchParams.get("category");
    const brandSlug = url.searchParams.get("brand");
    const brandsSlug = url.searchParams.get("brands");
    const search = url.searchParams.get("search");
    const minPrice = Number(url.searchParams.get("minPrice"));
    const maxPrice = Number(url.searchParams.get("maxPrice"));

    const query = {};

    // Category by Slug
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug }).lean();
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      query.category = category._id;
    }

    // Brand by Slug (single)
    if (brandSlug) {
      const brand = await Brand.findOne({ slug: brandSlug }).lean();
      if (!brand) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
      query.brand = brand._id;
    } 
    // Brand by Slug (multiple)
    else if (brandsSlug) {
      const brandArray = brandsSlug.split(",").filter(Boolean);
      if (brandArray.length) {
        const brandDocs = await Brand.find({ slug: { $in: brandArray } }).lean();
        if (!brandDocs.length) {
          return NextResponse.json({ error: "No brands found" }, { status: 404 });
        }
        query.brand = { $in: brandDocs.map(b => b._id) };
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        {tags: { $regex: new RegExp(search, "i") } }
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    // Sorting
    const sortOption = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "oldest": { createdAt: 1 },
      "newest": { createdAt: -1 }
    }[sort] || { createdAt: -1 };

    // Query products
    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products: serializeMongoData(products),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}