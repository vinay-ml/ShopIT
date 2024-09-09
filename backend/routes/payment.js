import express from "express";
import {
  stripeCheckoutSession,
  stripeWebhook,
} from "../controllers/paymentControllers.js";
import { isAuthenticatedUser } from "../middlewares/authMiddleware.js";
const router = express.Router();

router
  .route("/payment/checkout_session")
  .post(isAuthenticatedUser, stripeCheckoutSession);

router.route("/payment/webhook").post(stripeWebhook);

export default router;
