import User from "../models/User.js";
import Order from "../models/Order.js";
import Appointment from "../models/Appointment.js";
import Product from "../models/Product.js";

// @desc Get Admin Dashboard Statistics
// @route GET /api/admin/dashboard
export async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ role: "customer", createdAt: { $gte: thirtyDaysAgo } });

    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["Pending", "Placed", "In Stitching", "Processing"] },
    });
    const completedOrders = await Order.countDocuments({
      status: { $in: ["Completed", "Delivered"] },
    });

    const totalAppointments = await Appointment.countDocuments({});
    const pendingAppointments = await Appointment.countDocuments({
      status: { $in: ["Pending", "Confirmed"] },
    });

    const totalProducts = await Product.countDocuments({});

    // Calculate total revenue from non-cancelled orders
    const orders = await Order.find({ status: { $ne: "Cancelled" } });
    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    res.json({
      totalUsers,
      newUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalAppointments,
      pendingAppointments,
      totalProducts,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to load dashboard statistics" });
  }
}

// @desc Get all registered customer users (Admin)
// @route GET /api/admin/users
export async function getUsers(req, res) {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Failed to fetch registered users" });
  }
}
