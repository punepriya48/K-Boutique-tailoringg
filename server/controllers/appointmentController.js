import Appointment from "../models/Appointment.js";

// @desc Book a new tailoring appointment
// @route POST /api/appointments
export async function createAppointment(req, res) {
  try {
    const { name, phone, email, service, preferredDate, preferredTime, bust, waist, hip, blouseLength, shoulder, fabricType, designNotes } = req.body;

    if (!name || !phone || !preferredDate) {
      return res.status(400).json({ message: "Name, phone number, and preferred date are required" });
    }

    const bookingId = `BOOK-${Math.floor(100000 + Math.random() * 900000)}`;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const appointment = await Appointment.create({
      bookingId,
      user: userId,
      name,
      phone,
      email: email || "",
      service: service || "Blouse Stitching",
      preferredDate,
      preferredTime: preferredTime || "10:30 AM - 12:00 PM",
      bust: bust || "",
      waist: waist || "",
      hip: hip || "",
      blouseLength: blouseLength || "",
      shoulder: shoulder || "",
      fabricType: fabricType || "",
      designNotes: designNotes || "",
      status: "Pending",
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({ message: error.message || "Failed to book appointment" });
  }
}

// @desc Get logged-in user's appointments
// @route GET /api/appointments/my
export async function getMyAppointments(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const appointments = await Appointment.find({ user: userId }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Get My Appointments Error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
}

// @desc Admin get all appointments
// @route GET /api/admin/appointments or /api/appointments
export async function getAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find({}).populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error("Get All Appointments Error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
}

// @desc Admin update appointment status
// @route PUT /api/admin/appointments/:id/status
export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const appointment = await Appointment.findOne({
      $or: [{ bookingId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    console.error("Update Appointment Status Error:", error);
    res.status(500).json({ message: "Failed to update appointment status" });
  }
}
