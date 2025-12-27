import mongoose from "mongoose";

const laptopSchema = new mongoose.Schema({
  brand: String,
  model: String,
  price: Number,
  category: String,
  connectivity: String,
  availability: String,
  currency: String,
  features: Array,
  cpu: String,
  ram: String,
  storage: String,
  ratings: Number,
  warranty: String,
  description: String,
  image_url: [String],
  added_on: { type: Date, default: Date.now }
});

export default mongoose.model("Laptop", laptopSchema);
