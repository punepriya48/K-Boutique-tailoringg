import express from "express";
import { getDashboardStats, getUsers } from "../controllers/adminController.js";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { getAllAppointments, updateAppointmentStatus } from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);

router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);

router.get("/appointments", getAllAppointments);
router.put("/appointments/:id/status", updateAppointmentStatus);

export default router;
