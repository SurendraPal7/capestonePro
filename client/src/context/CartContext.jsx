import { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [showReplaceCartModal, setShowReplaceCartModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cartItems')) || [];
        setCartItems(items);
    }, []);

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Get the current farm ID from cart
    const getCurrentFarmId = () => {
        if (cartItems.length === 0) return null;
        return cartItems[0].farmer?._id || cartItems[0].farmer;
    };

    // Get the current farm name from cart
    const getCurrentFarmName = () => {
        if (cartItems.length === 0) return null;
        return cartItems[0].farmer?.farmName || cartItems[0].farmer?.name || 'Unknown Farm';
    };

    const addToCart = (product, qty, onDifferentFarm = null) => {
        const currentFarmId = getCurrentFarmId();
        const newFarmId = product.farmer?._id || product.farmer;

        // Check if adding from a different farm
        if (currentFarmId && newFarmId && currentFarmId !== newFarmId) {
            // Store the pending product and show modal
            setPendingProduct({ product, qty, onDifferentFarm });
            setShowReplaceCartModal(true);
            return false; // Indicate that item was not added
        }

        // Add to cart normally
        const existItem = cartItems.find((x) => x.product === product._id);

        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    x.product === existItem.product ? { ...product, product: product._id, qty: existItem.qty + qty } : x
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, product: product._id, qty }]);
        }
        return true; // Indicate that item was added
    };

    const handleReplaceCart = () => {
        if (pendingProduct) {
            // Clear cart and add new product
            setCartItems([{ 
                ...pendingProduct.product, 
                product: pendingProduct.product._id, 
                qty: pendingProduct.qty 
            }]);
            
            // Call the callback if provided
            if (pendingProduct.onDifferentFarm) {
                pendingProduct.onDifferentFarm();
            }
        }
        setShowReplaceCartModal(false);
        setPendingProduct(null);
    };

    const handleCancelReplace = () => {
        setShowReplaceCartModal(false);
        setPendingProduct(null);
    };

    const removeFromCart = (id) => {
        setCartItems(cartItems.filter((x) => x.product !== id));
    };

    const updateCartItemQty = (productId, newQty) => {
        setCartItems(
            cartItems.map((item) =>
                item.product === productId ? { ...item, qty: newQty } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateCartItemQty, 
            clearCart,
            showReplaceCartModal,
            pendingProduct,
            handleReplaceCart,
            handleCancelReplace,
            getCurrentFarmName
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
