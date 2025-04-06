import mongoose from "mongoose"

// Define the dimensions schema
const dimensionsSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number,
  unit: {
    type: String,
    default: "cm",
  },
})

// Define the variant schema
const variantSchema = new mongoose.Schema({
  color: String,
  size: String,
  stock: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  sku: String,
  images: [String],
})

// Define the review schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Define the product schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    compareAtPrice: {
      type: Number,
      default: 0,
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
      required: true,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    images: [String],
    thumbnail: String,
    variants: [variantSchema],
    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    sku: {
      type: String,
      unique: true,
    },
    tags: [String],
    isPublished : {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["published", "archived"],
      default: "published",
    },
    warrantyInformation: {
      type: String,
      default: "",
    },
    shippingInformation: {
      type: String,
      default: "",
    },
    returnPolicy: {
      type: String,
      default: "",
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
    },
    weight: {
      type: Number,
      default: 0,
    },
    weightUnit: {
      type: String,
      default: "kg",
    },
    dimensions: dimensionsSchema,
    availabilityStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock", "Pre-order"],
      default: "In Stock",
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate average rating before saving
productSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    this.ratings = this.reviews.reduce((acc, item) => item.rating + acc, 0) / this.reviews.length
    this.numReviews = this.reviews.length
  }
  next()
})


const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product

