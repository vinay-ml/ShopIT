import exprees from "express";
const router = exprees.Router();
import {
  createProductReview,
  deleteProduct,
  getProducts,
  getProductDetails,
  getProductReviews,
  newProduct,
  updateProduct,
  canUserReview,
} from "../controllers/productControllers.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middlewares/authMiddleware.js";

router.route("/products").get(getProducts);
router
  .route("/admin/products")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);

router.route("/products/:id").get(getProductDetails);

router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct);
router
  .route("/admin/products/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router
  .route("/reviews")
  .put(isAuthenticatedUser, createProductReview)
  .get(isAuthenticatedUser, getProductReviews);

router.route("/can_review").get(isAuthenticatedUser, canUserReview);

export default router;
