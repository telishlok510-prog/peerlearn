import jwt from "jsonwebtoken";
import User from "../models/User.js";

// "protect" runs before protected routes. It checks the login token sent by
// the frontend and, if valid, attaches the user to the request (req.user).
export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Tokens arrive as:  Authorization: Bearer <token>
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized. Please log in." });
    }

    // Verify the token and find the matching user.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = user;
    next(); // allow the request to continue
  } catch (error) {
    return res.status(401).json({ message: "Not authorized. Invalid or expired token." });
  }
};

// "adminOnly" runs after "protect" to restrict admin routes.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access only." });
};
