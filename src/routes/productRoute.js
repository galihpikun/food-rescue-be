import express from "express";
import { createProduct } from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeProduct = express.Router();

// routeProduct.get('/flash-sales', getFlashSalesProduct);
routeProduct.post('/', jwtMiddleware, createProduct);

export default routeProduct;