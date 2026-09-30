import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    email: {
      type: String,
      default: "",
    },
    service: {
      type: String,
      required: [true, "Service is required"],
    },
    preferredDate: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    preferredTime: {
      type: String,
      required: [true, "Appointment time slot is required"],
    },
    bust: String,
    waist: String,
    hip: String,
    blouseLength: String,
    shoulder: String,
    fabricType: String,
    designNotes: String,
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
