import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "priyas_boutique_jwt_secret_key_2026_safe_hash";

export async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch full user if DB is connected
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
    } else {
      req.user = decoded; // Fallback to token payload if user not found in DB
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

export default protect;
