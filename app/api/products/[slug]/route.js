import { NextResponse } from "next/server"
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware"
import {connectToDatabase} from "@/lib/mongodb"
import Product from "@/models/product"
import Brand from "@/models/brand"
import Category from "@/models/category"


// Get a single product (public)
export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { slug } = await params;

    let product = await Product.findOne({ slug }).lean();

    if (!product) {
      return NextResponse.json({ error: `Product not found: ${slug}` }, { status: 404 });
    }

    // Manually fetch category and brand details
    const category = await Category.findById(product.category).select("name slug").lean();
    const brand = await Brand.findById(product.brand).select("name slug").lean();

    product.category = category || product.category;
    product.brand = brand || product.brand;

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// Update a product (admin and superadmin only)
export async function PUT(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    const productData = await req.json()

    await connectToDatabase()

    const product = await Product.findOne({ slug: params.slug })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update slug if name is changed and slug is not provided
    if (productData.name && !productData.slug && productData.name !== product.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }

    // Check if new slug already exists (if slug is being changed)
    if (productData.slug && productData.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: productData.slug })
      if (existingProduct && existingProduct._id.toString() !== product._id.toString()) {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
      }
    }

    // Update product with all fields from request
    Object.keys(productData).forEach((key) => {
      product[key] = productData[key]
    })

    await product.save()

    // Serialize the product to handle ObjectIds
    const serializedProduct = product

    return NextResponse.json({
      message: "Product updated successfully",
      product: serializedProduct,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a product (admin and superadmin only)
export async function DELETE(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"])

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden()
    }

    await connectToDatabase()

    const product = await Product.findOneAndDelete({ slug: params.slug })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

