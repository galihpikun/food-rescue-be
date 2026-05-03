import express from "express";
import { 
  createProduct, 
  deleteProduct, 
  editProduct, 
  getFlashSalesProducts, 
  getOwnedProducts, 
  getProductByCategory, 
  getProductById, 
  getProducts 
} from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const routeProduct = express.Router();

// route statis (tanpa :id) ditaruh atas
routeProduct.get('/', jwtMiddleware, getProducts);
routeProduct.get('/flash-sales', getFlashSalesProducts);
routeProduct.get("/owned", jwtMiddleware, getOwnedProducts); 

// route dengan aksi spesifik
routeProduct.post('/', jwtMiddleware, upload.single('image'), createProduct);
routeProduct.put('/:id', jwtMiddleware, upload.single('image'), editProduct);
routeProduct.delete('/:id', jwtMiddleware, deleteProduct); 

// route dinamis
routeProduct.get('/category/:id', jwtMiddleware, getProductByCategory);
routeProduct.get('/:id', jwtMiddleware, getProductById); 

export default routeProduct;