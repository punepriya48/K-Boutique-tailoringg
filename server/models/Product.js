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
<<<<<<< HEAD
      default: "/gallery/blouse-1.jpeg",
=======
      default: "/src/assets/gallery/blouse-1.jpeg",
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
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
