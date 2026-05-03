import express from "express";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";
import { createCategory, getCategories } from "../controllers/categoryController.js";

const routeCategory = express.Router();

// route statis
routeCategory.get('/', getCategories); // bisa diakses tanpa login
routeCategory.post('/', jwtMiddleware, createCategory);

export default routeCategory;