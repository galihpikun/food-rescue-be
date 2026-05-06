import express from "express";
import { createReview, updateReview, deleteReview, getRestaurantReviews, getProductReviews } from "../controllers/reviewController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeReview = express.Router();

// route protected
routeReview.post('/create', jwtMiddleware, createReview);
routeReview.put("/:id", jwtMiddleware, updateReview);
routeReview.delete("/:id", jwtMiddleware, deleteReview);

// route public
routeReview.get('/product/:productId', getProductReviews);
routeReview.get('/restaurant/:restaurantId', getRestaurantReviews);

export default routeReview;