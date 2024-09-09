import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const isAuthenticatedUser = async (req, res, next) => {
  // Extract token from cookies or authorization header

  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json("Login first to access this resource");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return res.status(401).json("Invalid or expired token");
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(`Role ${req.user.role} is not allowed to access this resource`);
    }
    next();
  };
};
