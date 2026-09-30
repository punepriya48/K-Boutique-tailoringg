import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "priyas_boutique_jwt_secret_key_2026_safe_hash";

function generateToken(id, email, role) {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: "7d" });
}

// @desc Register new user
// @route POST /api/auth/register
export async function registerUser(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password" });
    }

    // Check existing user
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Create user in MongoDB
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      role: email.toLowerCase() === "admin@priyasboutique.com" ? "admin" : "customer",
    });

    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
}

// @desc Login user
// @route POST /api/auth/login
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const cleanEmail = email.toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    // Auto-create initial admin user if logging in as admin for the first time
    if (!user && cleanEmail === "admin@priyasboutique.com" && (password === "admin123" || password === "admin")) {
      user = await User.create({
        name: "Priya (Admin)",
        email: cleanEmail,
        password: password,
        role: "admin",
      });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.email, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Login failed" });
  }
}

// @desc Get current logged-in user profile
// @route GET /api/auth/me
export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user._id || req.user.id).select("-password");
    if (!user) {
      return res.json({ user: req.user });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
}

// @desc Logout user
// @route POST /api/auth/logout
export async function logoutUser(req, res) {
  res.json({ success: true, message: "Logged out successfully" });
}
