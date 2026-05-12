import express from "express";
import { createRestaurant, getHotRestaurants, getRestaurantById } from "../controllers/restaurantController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";

const routeRestaurant = express.Router();

// route statis
routeRestaurant.post('/', jwtMiddleware, createRestaurant);
routeRestaurant.get("/hot", jwtMiddleware,getHotRestaurants);
// route dinamis
routeRestaurant.get('/:id', jwtMiddleware, getRestaurantById);

export default routeRestaurant;