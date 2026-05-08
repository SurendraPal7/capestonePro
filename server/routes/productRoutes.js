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
import { protect, requireRole } from '../middleware/authMiddleware.js';

router.route('/').get(getProducts).post(protect, requireRole('farmer'), createProduct);
router.route('/myproducts').get(protect, getMyProducts);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, requireRole('farmer'), updateProduct)
    .delete(protect, requireRole('farmer'), deleteProduct);

export default router;
