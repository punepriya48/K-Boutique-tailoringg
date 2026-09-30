/**
 * Migration script: Updates existing MongoDB products that have
 * old /src/assets/gallery/ image paths to the new /gallery/ paths.
 *
 * Run once from the server directory:
 *   node server/utils/migrateImagePaths.js
 *
 * Requires MONGODB_URI to be set in environment (or .env file).
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not set in environment.");
  process.exit(1);
}

// Minimal product schema for migration
const productSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    image: String,
    images: [String],
  },
  { strict: false }
);

const Product = mongoose.model("Product", productSchema);

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    const products = await Product.find({});
    console.log(`Found ${products.length} products.`);

    let updated = 0;

    for (const product of products) {
      let changed = false;

      // Fix the primary image
      if (
        product.image &&
        typeof product.image === "string" &&
        product.image.startsWith("/src/assets/gallery/")
      ) {
        const oldPath = product.image;
        product.image = product.image.replace("/src/assets/gallery/", "/gallery/");
        console.log(`  image: ${oldPath} -> ${product.image}`);
        changed = true;
      }

      // Fix the images array
      if (Array.isArray(product.images)) {
        const newImages = product.images.map((img) => {
          if (typeof img === "string" && img.startsWith("/src/assets/gallery/")) {
            return img.replace("/src/assets/gallery/", "/gallery/");
          }
          return img;
        });

        if (JSON.stringify(newImages) !== JSON.stringify(product.images)) {
          product.images = newImages;
          changed = true;
        }
      }

      if (changed) {
        await product.save();
        updated++;
        console.log(`  Updated: ${product.name}`);
      }
    }

    console.log(`\nMigration complete. Updated ${updated} out of ${products.length} products.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrate();
