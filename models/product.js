import mongoose from "mongoose"

// Review schema as a subdocument
const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

// Variant option schema (for colors, sizes, etc.)
const variantOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  additionalPrice: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
  },
  image: {
    type: String,
  },
})

// Variant type schema (color, size, etc.)
const variantTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  options: [variantOptionSchema],
})

// Dimensions schema
const dimensionsSchema = new mongoose.Schema({
  length: {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  unit: {
    type: String,
    default: "cm",
  },
})

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      trim: true,
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
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: function () {
        if (this.compareAtPrice && this.price) {
          return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100)
        }
        return 0
      },
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // New fields
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    sku: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    weightUnit: {
      type: String,
      default: "kg",
      enum: ["kg", "g", "lb", "oz"],
    },
    dimensions: dimensionsSchema,
    variants: [variantTypeSchema],
    warrantyInformation: {
      type: String,
    },
    shippingInformation: {
      type: String,
    },
    availabilityStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock", "Backorder", "Discontinued"],
      default: function () {
        if (this.stock <= 0) return "Out of Stock"
        if (this.stock < 5) return "Low Stock"
        return "In Stock"
      },
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Calculate average rating when reviews are added or modified
productSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0)
    this.rating = Number.parseFloat((totalRating / this.reviews.length).toFixed(2))
    this.reviewCount = this.reviews.length
  } else {
    this.rating = 0
    this.reviewCount = 0
  }

  // Update availability status based on stock
  if (this.stock <= 0) {
    this.availabilityStatus = "Out of Stock"
  } else if (this.stock < 5) {
    this.availabilityStatus = "Low Stock"
  } else {
    this.availabilityStatus = "In Stock"
  }

  next()
})

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product

