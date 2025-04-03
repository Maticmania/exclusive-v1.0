import mongoose from "mongoose"

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
      ref: "Category" 
    }, // ✅ Must be ObjectId
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
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
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

// Helper method to convert MongoDB ObjectId to string
// productSchema.methods.toJSON = function () {
//   const product = this.toObject()
//   product._id = product._id.toString()

//   if (product.category) {
//     product.category = product.category.toString()
//   }

//   if (product.brand) {
//     product.brand = product.brand.toString()
//   }

//   if (product.variants && product.variants.length > 0) {
//     product.variants = product.variants.map((variant) => {
//       return {
//         ...variant,
//         _id: variant._id.toString(),
//       }
//     })
//   }

//   if (product.reviews && product.reviews.length > 0) {
//     product.reviews = product.reviews.map((review) => {
//       return {
//         ...review,
//         _id: review._id.toString(),
//         user: review.user.toString(),
//       }
//     })
//   }

//   return product
// }

const Product = mongoose.models.Product || mongoose.model("Product", productSchema)

export default Product

