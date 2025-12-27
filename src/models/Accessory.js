import mongoose from "mongoose";

const LaptopSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  added_on: {
    type: Date,
    default: Date.now
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  image_url: {
    type: String,
    default: "https://placehold.co/600x400"
  },
  category: {
    type: String,
    default: "Laptop"
  },
  warranty: {
    type: String
  }
});

export default mongoose.model("Laptop", LaptopSchema);
