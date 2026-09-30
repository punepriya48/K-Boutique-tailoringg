import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      default: "/gallery/blouse-1.jpeg",
    },
    images: [{ type: String }],
    details: {
      type: Map,
      of: String,
      default: {},
    },
    availableSizes: {
      type: [String],
      default: ["S", "M", "L", "XL", "Custom Measurement"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewCount: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);