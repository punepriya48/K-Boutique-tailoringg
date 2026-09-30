import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  key: { type: String, required: true },
  productId: { type: String, required: true },
  product: {
    id: String,
    name: String,
    category: String,
    price: Number,
    originalPrice: Number,
    image: String,
    availableSizes: [String],
    inStock: Boolean,
  },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  selectedSize: { type: String, default: "Standard" },
  customMeasurements: { type: Map, of: String, default: {} },
  addedAt: { type: Date, default: Date.now },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
