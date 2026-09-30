import Product from "../models/Product.js";
import { initialProducts } from "../utils/seedProducts.js";

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
export async function createProduct(req, res) {
  try {
    const { name, category, price, originalPrice, description, image, images, availableSizes, inStock, featured } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }

    const newProductId = `prod-${Date.now()}`;
    const product = await Product.create({
      productId: newProductId,
      name,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description || "Handcrafted custom boutique design.",
      image: image || "/src/assets/gallery/blouse-1.jpeg",
      images: images || [],
      availableSizes: Array.isArray(availableSizes) ? availableSizes : ["32 (S)", "34 (M)", "36 (L)", "Custom Measurement"],
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
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    let product = await Product.findOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    await product.save();

    const doc = product.toObject();
    res.json({ ...doc, id: doc.productId || doc._id.toString() });
  } catch (error) {
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
