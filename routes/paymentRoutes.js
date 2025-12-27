import express from "express";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: "rzp_test_xxxxxxxxxx",
  key_secret: "xxxxxxxxxxxxxxx",
});

// Create Razorpay Order
router.post("/create-order", protect, async (req, res) => {
  const { totalAmount } = req.body;

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({ message: "Invalid total amount" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("Razorpay create order error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Save Order after Payment Success
router.post("/save-order", protect, async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalAmount,
      paymentId,
      paymentMethod,
    } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    if (!itemsPrice || totalAmount == null) {
      return res.status(400).json({ message: "Pricing details are required" });
    }

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required" });
    }

    // ✅ FIXED: match Order schema exactly
    const orderProducts = products.map((item) => ({
      productId: item.productId || item._id,
      name: item.name || "",
      model: item.model || "",
      category: item.category || "",
      quantity: Number(item.quantity || item.qty || 1),
      price: Number(item.price || 0),
    }));

    const order = new Order({
      user: req.user._id,
      products: orderProducts,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalAmount,
      paymentMethod: paymentMethod || "Razorpay",
      isPaid: true,
      status: "Processing",
      paymentId,
    });

    await order.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("Save order error:", err);
    res.status(500).json({ message: "Failed to save order: " + err.message });
  }
});

export default router;
