import Cart from "../models/Cart.js";

// @desc Get current user's cart
// @route GET /api/cart
export async function getCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    res.json(cart.items || []);
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
}

// @desc Add item to user's cart
// @route POST /api/cart
export async function addToCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { product, quantity = 1, selectedSize = "Standard", customMeasurements = {} } = req.body;

    if (!product || !product.id) {
      return res.status(400).json({ message: "Product is required" });
    }

    const itemKey = `${product.id}-${selectedSize}`;
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingIndex = cart.items.findIndex((item) => item.key === itemKey);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      if (customMeasurements && Object.keys(customMeasurements).length > 0) {
        cart.items[existingIndex].customMeasurements = {
          ...(cart.items[existingIndex].customMeasurements || {}),
          ...customMeasurements,
        };
      }
    } else {
      cart.items.push({
        key: itemKey,
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          availableSizes: product.availableSizes,
          inStock: product.inStock,
        },
        quantity: Number(quantity),
        selectedSize,
        customMeasurements,
        addedAt: new Date(),
      });
    }

    await cart.save();
    res.json(cart.items);
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
}

// @desc Update quantity for a cart item
// @route PUT /api/cart/:key
export async function updateCartItem(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { key } = req.params;
    const { delta, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const index = cart.items.findIndex((item) => item.key === key);
    if (index === -1) return res.status(404).json({ message: "Item not found in cart" });

    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
    } else if (delta !== undefined) {
      const newQty = cart.items[index].quantity + delta;
      if (newQty <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = newQty;
      }
    }

    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart item" });
  }
}

// @desc Remove item from cart
// @route DELETE /api/cart/:key
export async function removeCartItem(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { key } = req.params;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.key !== key);
    await cart.save();

    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
}

// @desc Clear current user's cart
// @route DELETE /api/cart
export async function clearCart(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json([]);
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
}
