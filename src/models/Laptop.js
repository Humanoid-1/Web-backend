import mongoose from "mongoose";

const laptopSchema = new mongoose.Schema(
  {
    specs: { type: String, trim: true },
    processor: { type: String, trim: true },
    cpu: { type: String, trim: true },
    ram: { type: String, trim: true },
    storage: { type: String, trim: true },
    gpu: { type: String, trim: true },
    image: { type: String, trim: true },
    image_url: { type: String, trim: true },

    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },

    price: { type: Number, required: true },
    available: { type: Boolean, default: true },

    added_on: { type: Date, default: Date.now },
    ratings: { type: Number, min: 0, max: 5, default: 0 }
  },
  { timestamps: true, collection: "laptops" }  // 👈 force collection name
);

const Laptop = mongoose.model("Laptop", laptopSchema);
export default Laptop;
