import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization ?? req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role_id: decoded.role_id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// Admin verification
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!req.user || req.user.role_id !== 3) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  });
};
