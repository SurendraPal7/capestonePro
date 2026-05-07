import { useContext } from 'react';
import CartContext from '../context/CartContext';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './ReplaceCartModal.css';

const ReplaceCartModal = () => {
    const { 
        showReplaceCartModal, 
        pendingProduct, 
        handleReplaceCart, 
        handleCancelReplace,
        getCurrentFarmName 
    } = useContext(CartContext);

    if (!showReplaceCartModal || !pendingProduct) return null;

    const currentFarmName = getCurrentFarmName();
    const newFarmName = pendingProduct.product.farmer?.farmName || 
                        pendingProduct.product.farmer?.name || 
                        'this farm';

    return (
        <div className='modal-overlay' onClick={handleCancelReplace}>
            <div className='modal-content replace-cart-modal' onClick={(e) => e.stopPropagation()}>
                <button className='modal-close-btn' onClick={handleCancelReplace}>
                    <FaTimes />
                </button>
                
                <div className='modal-icon warning'>
                    <FaExclamationTriangle />
                </div>
                
                <h2>Replace cart item?</h2>
                
                <p className='modal-message'>
                    Your cart contains items from <strong>{currentFarmName}</strong>. 
                    Do you want to discard the selection and add items from <strong>{newFarmName}</strong>?
                </p>
                
                <div className='modal-actions'>
                    <button 
                        className='btn btn-outline modal-btn'
                        onClick={handleCancelReplace}
                    >
                        No, Keep Current Cart
                    </button>
                    <button 
                        className='btn btn-primary modal-btn'
                        onClick={handleReplaceCart}
                    >
                        Yes, Start Fresh Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReplaceCartModal;
