import express from "express";
import { createOrder, getOrders, UpdateOrderStatus } from "../controllers/orderController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeOrder = express.Router();

// route statis
routeOrder.get('/', jwtMiddleware, getOrders);

// route dinamis
routeOrder.post('/', jwtMiddleware, createOrder);
routeOrder.put('/:id/status', jwtMiddleware, UpdateOrderStatus);

export default routeOrder;