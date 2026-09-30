import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  key: String,
  product: {
    id: String,
    name: String,
    category: String,
    price: Number,
    image: String,
  },
  quantity: { type: Number, required: true },
  selectedSize: { type: String, default: "Standard" },
  customMeasurements: { type: Map, of: String, default: {} },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    deliveryType: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    shippingInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
    },
    paymentMethod: {
      type: String,
      default: "cod",
    },
    status: {
      type: String,
      enum: ["Pending", "Placed", "Confirmed", "Processing", "In Stitching", "Completed", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
