import express from "express";
import { 
  createProduct, deleteProduct, 
  getOwnedProducts, getProductByCategory, getProductById, getProducts, editProduct
} from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isMerchant } from "../middlewares/roleMiddleware.js"; 

const routeProduct = express.Router();

// route publik (hanya butuh login)
routeProduct.get('/', jwtMiddleware, getProducts);
routeProduct.get('/category/:id', jwtMiddleware, getProductByCategory);
routeProduct.get('/:id', jwtMiddleware, getProductById); 

// route khusus merchant
routeProduct.get("/owned", jwtMiddleware, isMerchant, getOwnedProducts); 
routeProduct.post('/', jwtMiddleware, isMerchant, upload.single('image'), createProduct);
routeProduct.delete('/:id', jwtMiddleware, isMerchant, deleteProduct); 
routeProduct.put('/:id', jwtMiddleware, isMerchant, upload.single('image'), editProduct);

export default routeProduct;