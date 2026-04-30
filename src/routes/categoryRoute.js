import express from "express";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";
import { createCategory, getCategories } from "../controllers/categoryController.js";

const routeCategory = express.Router();

routeCategory.post('/', jwtMiddleware, createCategory);
routeCategory.get('/', getCategories);

export default routeCategory;