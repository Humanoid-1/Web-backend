import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    flat: { type: String, required: true },
    street: { type: String },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
