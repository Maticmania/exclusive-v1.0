import mongoose from "mongoose"

const flashSaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Flash sale name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 1,
      max: 99,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Add a method to convert the document to a plain object with string IDs
flashSaleSchema.methods.toJSON = function () {
  const flashSale = this.toObject()
  flashSale._id = flashSale._id.toString()

  if (flashSale.products) {
    flashSale.products = flashSale.products.map((product) =>
      typeof product === "object" && product._id ? { ...product, _id: product._id.toString() } : product.toString(),
    )
  }

  return flashSale
}

const FlashSale = mongoose.models.FlashSale || mongoose.model("FlashSale", flashSaleSchema)

export default FlashSale

