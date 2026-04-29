import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeOrder = express.Router();

routeOrder.post('/', jwtMiddleware, createOrder);

routeOrder.get('/', jwtMiddleware, getOrders);

// routeOrder.put('/:id/status', jwtMiddleware, updateOrderStatus);

export default routeOrder;