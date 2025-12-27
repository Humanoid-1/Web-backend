import mongoose from "mongoose";

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }
}, { timestamps: true });

const Part = mongoose.model("Part", partSchema);

export default Part;
