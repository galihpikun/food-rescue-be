import express from "express";
import { createProduct, deleteProduct, editProduct, getFlashSalesProducts, getProducts } from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeProduct = express.Router();

routeProduct.get('/', jwtMiddleware, getProducts);
routeProduct.get('/flash-sales', getFlashSalesProducts);
routeProduct.post('/', jwtMiddleware, createProduct);
routeProduct.put('/', jwtMiddleware, editProduct);
routeProduct.delete('/:id', jwtMiddleware, deleteProduct);

export default routeProduct;