import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        model: { type: String },
        category: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    shippingAddress: {
      type: Object,
      required: true,
    },

    itemsPrice: Number,
    shippingPrice: Number,
    totalAmount: Number,

    paymentId: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    status: {
      type: String,
      default: "Pending",
    },

    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
