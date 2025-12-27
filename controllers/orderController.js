import Order from "../models/Order.js";

/**
 * SAVE ORDER AFTER PAYMENT
 * POST /api/save
 */
export const saveOrder = async (req, res) => {
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

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products found" });
    }

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID missing" });
    }

    const formattedProducts = products.map((p) => ({
      productId: p.productId,
      name: p.name || `${p.brand || ""} ${p.model || ""}`.trim(),
      model: p.model || "",
      category: p.category || "",
      quantity: Number(p.quantity || 1),
      price: Number(p.price || 0),
    }));

    const order = new Order({
      user: req.user?._id || null,
      products: formattedProducts,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      totalAmount,
      paymentId,
      paymentMethod,
      status: "Pending",
      isPaid: true,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("SAVE ORDER ERROR:", error);
    res.status(500).json({ message: "Order saving failed" });
  }
};



/**
 * GET MY ORDERS
 * GET /api/orders/my
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/**
 * GET ORDER BY ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

/**
 * UPDATE ORDER STATUS (ADMIN)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};
