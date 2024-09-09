import express from "express";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middlewares/authMiddleware.js";
import {
  allOrders,
  deleteOrder,
  getOrderDetails,
  myOrders,
  newOrder,
  updateOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/orders/new").post(isAuthenticatedUser, newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails);
router.route("/me/orders").get(isAuthenticatedUser, myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);
router
  .route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router;
