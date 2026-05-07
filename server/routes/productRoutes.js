import express from 'express';
const router = express.Router();
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getMyProducts,
} from '../controllers/productController.js';
import { protect, approvedFarmerOnly } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, approvedFarmerOnly, createProduct);
router.route('/myproducts').get(protect, getMyProducts);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, approvedFarmerOnly, updateProduct)
    .delete(protect, approvedFarmerOnly, deleteProduct);

export default router;
