import express from "express";
import { createRestaurant, getRestaurantById } from "../controllers/restaurantController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeRestaurant = express.Router();

// route statis
routeRestaurant.post('/', jwtMiddleware, createRestaurant);

// route dinamis
routeRestaurant.get('/:id', getRestaurantById);

export default routeRestaurant;