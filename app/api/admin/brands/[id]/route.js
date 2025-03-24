import { NextResponse } from "next/server";
import { hasRole, unauthorized, forbidden } from "@/lib/auth-middleware";
import { connectToDatabase } from "@/lib/mongodb";
import Brand from "@/models/brand";
import Product from "@/models/product";
import { slugify } from "@/lib/utils";
import {
  uploadSingleImage,
  deleteImageFromCloudinary,
} from "@/lib/cloudinaryUpload";

// Get a single brand
export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const brand = await Brand.findById(params.id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a brand (admin and superadmin only)
export async function PUT(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"]);

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden();
    }

    const { name, description, logo, featured } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const brand = await Brand.findById(params.id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Check if name is changed and if the new name already exists
    if (name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });

      if (existingBrand && existingBrand._id.toString() !== params.id) {
        return NextResponse.json(
          { error: "Brand with this name already exists" },
          { status: 409 }
        );
      }

      // Update slug if name changes
      brand.slug = slugify(name);
    }

    // Upload new logo if provided
    if (logo && logo !== brand.logo) {
      if (brand.logo) {
        await deleteImageFromCloudinary(brand.logo); // Delete old logo
      }
      brand.logo = await uploadSingleImage(logo); // Upload new logo
    }

    brand.name = name;
    brand.description = description;
    brand.featured = featured;

    await brand.save();

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a brand (admin and superadmin only)
export async function DELETE(req, { params }) {
  try {
    const { authorized, error } = await hasRole(["admin", "superadmin"]);

    if (!authorized) {
      return error === "Unauthorized" ? unauthorized() : forbidden();
    }

    await connectToDatabase();

    // Check if brand is used in any products
    const productsUsingBrand = await Product.countDocuments({
      brand: params.id,
    });

    if (productsUsingBrand > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete brand that is used by products",
          productsCount: productsUsingBrand,
        },
        { status: 400 }
      );
    }

    const brand = await Brand.findByIdAndDelete(params.id);

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Delete brand logo from Cloudinary
    if (brand.logo) {
      await deleteImageFromCloudinary(brand.logo);
    }

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
