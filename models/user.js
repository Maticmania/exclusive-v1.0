import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: { type: Boolean, default: false },
});

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1, default: 1 },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    addresses: [addressSchema],
    paymentOptions: [
      {
        cardName: { type: String, required: true, trim: true },
        cardNumber: { type: String, required: true, trim: true },
        expiryMonth: { type: String, required: true, trim: true },
        expiryYear: { type: String, required: true, trim: true },
        isDefault: { type: Boolean, default: false },
        lastUpdated: { type: Date, default: Date.now },
      },
    ],
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    cart: [cartItemSchema], // Stores cart items
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Stores wishlist items
  },
  { timestamps: true }
);

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
