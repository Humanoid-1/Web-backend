import mongoose from "mongoose";

const accessorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Accessory name is required"],
    trim: true
  },
  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true
  },
  category: {
    type: String,
    enum: ["Headphones", "Chargers", "Keyboards", "Other"],
    required: false,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  description: {
    type: String,
    maxlength: 500
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  image_url: {
    type: [String],  // <-- new field for multiple image paths
    default: []      // keeps old documents compatible
  }
}, {
  timestamps: true
});

const Accessory = mongoose.model("Accessory", accessorySchema);

export default Accessory;
