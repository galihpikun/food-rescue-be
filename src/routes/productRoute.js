import express from "express";
import { 
  createProduct, deleteProduct, editProduct, getFlashSalesProducts, 
  getOwnedProducts, getProductByCategory, getProductById, getProducts 
} from "../controllers/productController.js";
import { jwtMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { isMerchant } from "../middlewares/roleMiddleware.js"; 

const routeProduct = express.Router();

// route publik (hanya butuh login)
routeProduct.get('/', jwtMiddleware, getProducts);
routeProduct.get('/flash-sales', getFlashSalesProducts);
routeProduct.get('/category/:id', jwtMiddleware, getProductByCategory);
routeProduct.get('/:id', jwtMiddleware, getProductById); 

// route khusus merchant
routeProduct.get("/owned", jwtMiddleware, isMerchant, getOwnedProducts); 
routeProduct.post('/', jwtMiddleware, isMerchant, upload.single('image'), createProduct);
routeProduct.put('/:id', jwtMiddleware, isMerchant, upload.single('image'), editProduct);
routeProduct.delete('/:id', jwtMiddleware, isMerchant, deleteProduct); 

export default routeProduct;