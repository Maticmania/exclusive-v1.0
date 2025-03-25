import mongoose from "mongoose"
import { slugify } from "@/lib/utils"

// Define the schema for product variants
const variantOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  additionalPrice: {
    type: Number,
    default: 0,
  },
})

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  options: [variantOptionSchema],
})

// Define the schema for flash sale data
const flashSaleSchema = new mongoose.Schema({
  isOnFlashSale: {
    type: Boolean,
    default: false,
  },
  discountPercentage: {
    type: Number,
    min: 1,
    max: 99,
  },
  flashSaleStartDate: {
    type: Date,
  },
  flashSaleEndDate: {
    type: Date,
  },
  flashSaleId: {
    type: String,
  },
})

// Define the schema for products
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],
    flashSale: {
      type: flashSaleSchema,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    shippingClass: {
      type: String,
      enum: ["standard", "express", "free", "none"],
      default: "standard",
    },
    taxClass: {
      type: String,
      enum: ["standard", "reduced", "zero"],
      default: "standard",
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Create a slug from the name before saving
productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name)
  }
  next()
})

// Virtual for current price (considering flash sales)
productSchema.virtual("currentPrice").get(function () {
  if (
    this.flashSale &&
    this.flashSale.isOnFlashSale &&
    new Date(this.flashSale.flashSaleStartDate) <= new Date() &&
    new Date(this.flashSale.flashSaleEndDate) >= new Date()
  ) {
    return Number.parseFloat((this.price * (1 - this.flashSale.discountPercentage / 100)).toFixed(2))
  }
  return this.price
})

// Method to convert the document to a plain object with string IDs
productSchema.methods.toJSON = function () {
  const product = this.toObject({ virtuals: true })

  // Convert ObjectId to string
  if (product._id) {
    product._id = product._id.toString()
  }

  // Convert category ObjectId to string if it exists
  if (product.category && typeof product.category === "object" && product.category._id) {
    product.category._id = product.category._id.toString()
  } else if (product.category) {
    product.category = product.category.toString()
  }

  // Convert brand ObjectId to string if it exists
  if (product.brand && typeof product.brand === "object" && product.brand._id) {
    product.brand._id = product.brand._id.toString()
  } else if (product.brand) {
    product.brand = product.brand.toString()
  }

  // Handle dates
  if (product.createdAt) {
    product.createdAt = product.createdAt.toISOString()
  }

  if (product.updatedAt) {
    product.updatedAt = product.updatedAt.toISOString()
  }

  // Handle flash sale dates
  if (product.flashSale) {
    if (product.flashSale.flashSaleStartDate) {
      product.flashSale.flashSaleStartDate = product.flashSale.flashSaleStartDate.toISOString()
    }

    if (product.flashSale.flashSaleEndDate) {
      product.flashSale.flashSaleEndDate = product.flashSale.flashSaleEndDate.toISOString()
    }
  }

  return product
}

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product

