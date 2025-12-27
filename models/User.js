import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address"
    ]
  },

  password: {
    type: String,
    required: [true, "Password is required"]
  },

  phone: {
    type: String,
    default: null,
    trim: true,
    match: [
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit phone number"
    ]
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
