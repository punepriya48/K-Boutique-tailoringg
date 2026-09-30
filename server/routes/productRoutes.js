import express from "express";
<<<<<<< HEAD
import multer from "multer";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
=======
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

<<<<<<< HEAD
// Use memoryStorage so the image stays in memory as a Buffer.
// We convert it to Base64 and store it in MongoDB.
// This avoids the need for any disk storage (which is ephemeral on Render).
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
=======
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
>>>>>>> e7e6b1fdda60d6a018b2b45a096cf4611c31f1a8
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
