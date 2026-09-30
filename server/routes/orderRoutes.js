import express from "express";
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public / Auth optional route to place order
router.post("/", (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => createOrder(req, res));
  }
  return createOrder(req, res);
});

router.get("/my", protect, getMyOrders);
router.get("/:id", getOrderById);

export default router;
