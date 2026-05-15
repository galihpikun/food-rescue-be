import express from "express";
import { createOrder, getOrderById, getOrders, getUserOrders, UpdateOrderStatus } from "../controllers/orderController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeOrder = express.Router();

// route statis
routeOrder.get('/', jwtMiddleware, getOrders);
routeOrder.get('/user-orders',jwtMiddleware, getUserOrders);
// route dinamis
routeOrder.post('/', jwtMiddleware, createOrder);
routeOrder.get("/:id", jwtMiddleware, getOrderById);
routeOrder.put('/:id/status', jwtMiddleware, UpdateOrderStatus);


export default routeOrder;