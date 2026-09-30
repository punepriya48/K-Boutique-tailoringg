import Product from "../models/Product.js";
import { initialProducts } from "../utils/seedProducts.js";

<<<<<<< HEAD
/**
 * Convert a multer file buffer to a Base64 data URI.
 * e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 * This is stored in MongoDB and rendered directly in <img src=...> on the frontend.
 */
function fileToBase64(file) {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

=======
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
// @desc Get all products (seeds defaults if DB is empty)
// @route GET /api/products
export async function getProducts(req, res) {
  try {
    let products = await Product.find({}).sort({ createdAt: -1 });

    if (products.length === 0) {
      console.log("No products found in MongoDB. Seeding initial catalog...");
      products = await Product.insertMany(initialProducts);
    }

    // Map _id to id property for frontend compatibility
    const mapped = products.map((p) => {
      const doc = p.toObject();
      return { ...doc, id: doc.productId || doc._id.toString() };
    });

    res.json(mapped);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

// @desc Get single product by ID
// @route GET /api/products/:id
export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    let product = await Product.findOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const doc = product.toObject();
    res.json({ ...doc, id: doc.productId || doc._id.toString() });
  } catch (error) {
    res.status(500).json({ message: "Error loading product" });
  }
}

// @desc Create a new product (Admin)
// @route POST /api/products
<<<<<<< HEAD
// Handles both multipart/form-data (with image file) and application/json
export async function createProduct(req, res) {
  try {
    const { name, category, price, originalPrice, description, image, images, availableSizes, inStock, featured } =
      req.body;
=======
export async function createProduct(req, res) {
  try {
    const { name, category, price, originalPrice, description, image, images, availableSizes, inStock, featured } = req.body;
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }

<<<<<<< HEAD
    // If a file was uploaded via multer, convert it to Base64 data URI
    // Otherwise fall back to the image string sent in the body
    let imageValue = "/gallery/blouse-1.jpeg";
    if (req.file) {
      imageValue = fileToBase64(req.file);
    } else if (image && typeof image === "string" && image.trim()) {
      imageValue = image.trim();
    }

=======
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
    const newProductId = `prod-${Date.now()}`;
    const product = await Product.create({
      productId: newProductId,
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description || "Handcrafted custom boutique design.",
<<<<<<< HEAD
      image: imageValue,
      images: images || [imageValue],
      availableSizes: Array.isArray(availableSizes)
        ? availableSizes
        : typeof availableSizes === "string" && availableSizes.trim()
        ? availableSizes.split(",").map((s) => s.trim()).filter(Boolean)
        : ["32 (S)", "34 (M)", "36 (L)", "Custom Measurement"],
=======
      image: image || "/src/assets/gallery/blouse-1.jpeg",
      images: images || [],
      availableSizes: Array.isArray(availableSizes) ? availableSizes : ["32 (S)", "34 (M)", "36 (L)", "Custom Measurement"],
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      featured: featured !== undefined ? Boolean(featured) : false,
    });

    const doc = product.toObject();
    res.status(201).json({ ...doc, id: doc.productId || doc._id.toString() });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
}

// @desc Update product (Admin)
// @route PUT /api/products/:id
<<<<<<< HEAD
// Handles both multipart/form-data (with image file) and application/json
=======
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    let product = await Product.findOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

<<<<<<< HEAD
    // Build the update object from body fields
    const updateData = { ...req.body };

    // Handle image: if a new file is uploaded, convert to Base64
    // If no new file, keep whatever was sent in the body (or the existing value)
    if (req.file) {
      updateData.image = fileToBase64(req.file);
    } else if (!updateData.image) {
      // No new file and no image string provided — keep existing image
      delete updateData.image;
    }

    // Parse availableSizes if it came as a comma-separated string
    if (typeof updateData.availableSizes === "string") {
      updateData.availableSizes = updateData.availableSizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse price fields
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice);

    Object.assign(product, updateData);
=======
    Object.assign(product, req.body);
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
    await product.save();

    const doc = product.toObject();
    res.json({ ...doc, id: doc.productId || doc._id.toString() });
  } catch (error) {
<<<<<<< HEAD
    console.error("Update Product Error:", error);
=======
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
    res.status(500).json({ message: "Failed to update product" });
  }
}

// @desc Delete product (Admin)
// @route DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const result = await Product.deleteOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
}
