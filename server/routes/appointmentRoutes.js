import express from "express";
import { createAppointment, getMyAppointments } from "../controllers/appointmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => createAppointment(req, res));
  }
  return createAppointment(req, res);
});

router.get("/my", protect, getMyAppointments);

export default router;
