import express from "express";
import { createRestaurant, getRestaurantById } from "../controllers/restaurantController.js";
import {jwtMiddleware} from "../middlewares/authMiddleware.js";

const routeRestaurant = express.Router();

routeRestaurant.post('/', jwtMiddleware, createRestaurant);
routeRestaurant.get('/:id', getRestaurantById);

export default routeRestaurant;