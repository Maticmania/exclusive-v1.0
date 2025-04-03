import mongoose from "mongoose"

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product.variants",
  },
})

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    total: {
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
  },
)

// Calculate total before saving
cartSchema.pre("save", function (next) {
  this.total = this.items.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)
  next()
})

// Helper method to convert MongoDB ObjectId to string
// cartSchema.methods.toJSON = function () {
//   const cart = this.toObject()
//   cart._id = cart._id.toString()
//   cart.user = cart.user.toString()

//   if (cart.items && cart.items.length > 0) {
//     cart.items = cart.items.map((item) => {
//       const serializedItem = {
//         ...item,
//         _id: item._id.toString(),
//         product:
//           typeof item.product === "object" && item.product._id ? item.product._id.toString() : item.product.toString(),
//       }

//       if (item.variant) {
//         serializedItem.variant = item.variant.toString()
//       }

//       return serializedItem
//     })
//   }

//   return cart
// }

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema)

export default Cart

