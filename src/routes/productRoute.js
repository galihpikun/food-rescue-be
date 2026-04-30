import express from "express";
import { createProduct, deleteProduct, editProduct, getFlashSalesProducts, getProductByCategory, getProductById, getProducts } from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeProduct = express.Router();

routeProduct.get('/', jwtMiddleware, getProducts);
routeProduct.get('/flash-sales', getFlashSalesProducts);
routeProduct.post('/', jwtMiddleware, createProduct);
routeProduct.put('/:id', jwtMiddleware, editProduct);
routeProduct.delete('/:id', jwtMiddleware, deleteProduct);
routeProduct.get('/:id', jwtMiddleware, getProductById)
routeProduct.get('/category/:id', jwtMiddleware, getProductByCategory)

export default routeProduct;