// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
// }, { timestamps: true });

// export default mongoose.models.User || mongoose.model("User", UserSchema);
// // 

import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: {
    type: Boolean,
    default: false,
  },
})

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    addresses: [addressSchema],
    paymentOptions: [
      {
        cardName: {
          type: String,
          required: true,
          trim: true,
        },
        cardNumber: {
          type: String,
          required: true,
          trim: true,
        },
        expiryMonth: {
          type: String,
          required: true,
          trim: true,
        },
        expiryYear: {
          type: String,
          required: true,
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
        type: String,
        enum: ["user", "admin", "superadmin"],
        default: "user",
      },
  },
  {
    timestamps: true,
  },
)

// **Hash card number before saving**
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("paymentOptions")) return next();

//   try {
//     this.paymentOptions = await Promise.all(
//       this.paymentOptions.map(async (payment) => {
//         if (!payment.cardNumber.startsWith("$2a$")) { // Check if already hashed
//           const salt = await bcrypt.genSalt(10);
//           payment.cardNumber = await bcrypt.hash(payment.cardNumber, salt);
//         }
//         return payment;
//       })
//     );
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // **Method to compare hashed card number**
// userSchema.methods.compareCardNumber = async function (plainCardNumber, hashedCardNumber) {
//   return bcrypt.compare(plainCardNumber, hashedCardNumber);
// };


// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User

