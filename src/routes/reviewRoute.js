import express from "express";
import { createReview, getReviews } from "../controllers/reviewController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeReview = express.Router();

// route protected
routeReview.post('/create', jwtMiddleware, createReview);

// route public
routeReview.get('/:id', getReviews);

export default routeReview; 