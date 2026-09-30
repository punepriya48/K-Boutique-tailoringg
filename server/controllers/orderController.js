import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// @desc Create a new order
// @route POST /api/orders
export async function createOrder(req, res) {
  try {
    const { items, subtotal, shippingFee, grandTotal, deliveryType, shippingInfo, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided in order" });
    }

    if (!shippingInfo || !shippingInfo.name || !shippingInfo.phone) {
      return res.status(400).json({ message: "Customer name and phone number are required" });
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const order = await Order.create({
      orderId,
      user: userId,
      items,
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee || 0),
      grandTotal: Number(grandTotal),
      deliveryType: deliveryType || "delivery",
      shippingInfo,
      paymentMethod: paymentMethod || "cod",
      status: "Placed",
    });

    // Clear cart in DB if user was logged in
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: error.message || "Failed to place order" });
  }
}

// @desc Get logged-in user's orders
// @route GET /api/orders/my
export async function getMyOrders(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
}

// @desc Get order by ID
// @route GET /api/orders/:id
export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
}

// @desc Admin get all orders
// @route GET /api/admin/orders or /api/orders
export async function getAllOrders(req, res) {
  try {
    const orders = await Order.find({}).populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
}

// @desc Admin update order status
// @route PUT /api/admin/orders/:id/status
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
}
