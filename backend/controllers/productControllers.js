import Product from "../models/product.js";
import APIFIlters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/order.js";

// get all products
export const getProducts = async (req, res) => {
  const resPerPage = 4;
  const apiFilters = new APIFIlters(Product, req.query).search().filters();

  let products = await apiFilters.query;
  let filteredProductsCount = products.length;

  apiFilters.pagination(resPerPage);
  products = await apiFilters.query.clone();

  res.status(200).json({
    resPerPage,
    filteredProductsCount,
    products,
  });
};

// create new product => /api/v1/admin/products
export const newProduct = async (req, res) => {
  req.body.user = req.user._id;

  const product = await Product.create(req.body);

  res.status(200).json({
    product,
  });
};

// Get single products details
export const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req?.params?.id).populate({
      path: "reviews.user",
      select: "name email role avatar", // Specify the fields you want to include
    });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update product details
export const updateProduct = async (req, res) => {
  let product = await Product.findById(req?.params?.id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({
    product,
  });
};

//Delete Product
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req?.params?.id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    message: "product Deleted",
  });
};

// Create/Upadte product review => /api/v1/reviews
export const createProductReview = async (req, res) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req?.user?._id,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const isReviewed = product?.reviews?.find(
    (r) => r.user.toString() === req?.user?._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review?.user?.toString() === req?.user?._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  product.user = req.user.id;
  await product.save();

  res.status(200).json({ success: true });
};

// Get product reviews => /api/v1/reviews
export const getProductReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({
    reviews: product.reviews,
  });
};

// Can user review => /api/v1/can_review
export const canUserReview = async (req, res) => {
  if (!req?.query?.productId) {
    return res.status(400).json({ error: "Product ID is missing" });
  }

  try {
    const orders = await Order.find({
      user: req.user._id,
      "orderItems.product": req.query.productId,
    });

    if (orders.length === 0) {
      return res.status(200).json({ canReview: false });
    }

    res.status(200).json({ canReview: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
