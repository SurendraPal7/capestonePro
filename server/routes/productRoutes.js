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
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, createProduct);
router.route('/myproducts').get(protect, getMyProducts);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct);

export default router;
