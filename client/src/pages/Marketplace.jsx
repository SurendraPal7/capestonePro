import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaSearch, FaFilter, FaMinus, FaPlus, FaAngleLeft, FaAngleRight, FaHeart, FaStar } from 'react-icons/fa';
import './Marketplace.css';
import './Dashboard.css'; // Leverage the existing responsive layout CSS from Dashboard

const ProductItem = ({ product, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleQtyChange = (e) => {
        let value = parseInt(e.target.value);
        if (value < 1) value = 1;
        if (value > product.quantity) value = product.quantity;
        setQty(value);
    };

    return (
        <div className='card product-card'>
            <div className='product-image-placeholder'>
                {/* Placeholder generic image if no image provided or use abstract css pattern */}
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className='product-image' />
                ) : (
                    <span>{product.category}</span>
                )}
            </div>
            <div className='product-content'>
                <h3>{product.name}</h3>
                <p className='farm-name'>By {product.farmer?.name || 'Local Farmer'}</p>
                <p className='price-tag'>₹{product.price} / {product.unit}</p>
                <p className='stock'>Stock: {product.quantity} {product.unit}</p>
                <p className='location'>{product.location?.address || product.location || 'Unknown Location'}</p>

                {product.quantity > 0 && (
                    <div className='qty-selector'>
                        <label>Buy ({product.unit}):</label>
                        {!isExpanded ? (
                            <button
                                className='qty-btn-circle-add'
                                onClick={() => setIsExpanded(true)}
                                aria-label="Start adding to cart"
                            >
                                <FaPlus />
                            </button>
                        ) : (
                            <div className='qty-stepper slide-in'>
                                <button
                                    className='qty-btn'
                                    onClick={() => {
                                        if (qty > 1) {
                                            setQty(prev => prev - 1);
                                        } else {
                                            setIsExpanded(false);
                                            setQty(1); // Reset for next time
                                        }
                                    }}
                                >
                                    <FaMinus />
                                </button>
                                <input
                                    type='number'
                                    className='qty-display'
                                    value={qty}
                                    min='1'
                                    max={product.quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setQty('');
                                        } else {
                                            let num = parseInt(val);
                                            if (num > product.quantity) num = product.quantity;
                                            setQty(num);
                                        }
                                    }}
                                    onBlur={() => {
                                        let num = parseInt(qty);
                                        if (!num || num < 1) setQty(1);
                                    }}
                                />
                                <button
                                    className='qty-btn'
                                    onClick={() => setQty(prev => Math.min(product.quantity, (parseInt(prev) || 0) + 1))}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {product.quantity > 0 && (
                    <p className='total-price-preview'>
                        Total: <strong>₹{product.price * qty}</strong>
                    </p>
                )}

                <button
                    className='btn btn-primary btn-full'
                    onClick={() => onAddToCart(product, qty)}
                    disabled={product.quantity <= 0}
                >
                    {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

const Marketplace = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialFarmerId = query.get('farmerId') || '';
    const initialKeyword = query.get('category') || '';

    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState(initialFarmerId);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [coords, setCoords] = useState(null); // { lat, lng }
    const { addToCart, cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                const { data } = await axios.get('/api/auth/farmers');
                setFarmers(data);
            } catch (err) {
                console.error("Failed to load featured farmers", err);
            }
        };
        fetchFarmers();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            let url = `/api/products?keyword=${keyword}`;
            if (coords) {
                url += `&lat=${coords.lat}&lng=${coords.lng}`;
            }
            if (selectedFarmerId) {
                url += `&farmerId=${selectedFarmerId}`;
            }
            const { data } = await axios.get(url);
            setProducts(data.products);
        };
        fetchProducts();

        const interval = setInterval(fetchProducts, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [keyword, coords, selectedFarmerId]);

    const handleNearMe = () => {
        if (coords) {
            setCoords(null); // Toggle off
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                alert("Showing products within 10km.");
            }, (err) => {
                console.error(err);
                alert("Could not access location.");
            });
        } else {
            alert("Geolocation not supported");
        }
    };

    const handleAddToCart = (product, qty) => {
        addToCart(product, qty);
        alert(`Added ${qty} ${product.unit} of ${product.name} to cart!`);
    };

    return (
        <div className='container py-4 marketplace'>
            <div className='dash-hero' style={{ borderRadius: '12px' }}>
                        <span className='tag-season'>Harvest Season 2024</span>
                        <h1>Direct from Farm to Your Table</h1>
                        <p>Freshly harvested organic produce delivered directly to businesses and homes within 24 hours.</p>
                        
                        <div className='dash-search'>
                            <input 
                                type='text' 
                                placeholder='Search for organic fruits, vegetables, or farms...'
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)} 
                            />
                            <button className='btn btn-primary'>Search Marketplace</button>
                        </div>
                        <div className='hero-tags'>
                            <span>✔ 100% Certified Organic</span>
                            <span>🚚 Same-day Delivery</span>
                        </div>
                    </div>



                    {!selectedFarmerId ? (
                        <div className='farms-section mt-5'>
                            <div className='section-header mb-4 d-flex justify-content-between align-items-center'>
                                <h2>{keyword ? `Farms supplying "${keyword}"` : 'Explore Local Farms'}</h2>
                                {keyword && (
                                    <button className='btn btn-sm btn-outline-danger' onClick={() => setKeyword('')}>
                                        Clear Search/Category
                                    </button>
                                )}
                            </div>
                            <div className='farms-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
                                {(() => {
                                    let displayedFarmers = farmers;
                                    if (keyword) {
                                        const farmIdsWithProducts = new Set(products.map(p => p.farmer._id || p.farmer));
                                        displayedFarmers = farmers.filter(f => farmIdsWithProducts.has(f._id));
                                    }
                                    
                                    if (displayedFarmers.length === 0) {
                                        return <p className='text-gray'>No farms found handling this category.</p>;
                                    }
                                    
                                    return displayedFarmers.map(farmer => (
                                        <div className='farm-card' key={farmer._id} onClick={() => setSelectedFarmerId(farmer._id)} style={{cursor: 'pointer', border: selectedFarmerId === farmer._id ? '2px solid var(--color-primary)' : '', overflow: 'hidden'}}>
                                            <div className='farm-image' style={{ position: 'relative' }}>
                                            {farmer.farmImage ? (
                                                <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                            ) : (
                                                <div className='farm-placeholder' style={{width: '100%', height: '180px', background: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--color-sage)'}}>
                                                    {farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}
                                                </div>
                                            )}
                                            <div className='farm-logo-sm' style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '60px', height: '60px', fontSize: '1.2rem', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>{farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}</div>
                                        </div>
                                        <div className='farm-info' style={{ padding: '3rem 1.5rem 1.5rem'}}>
                                            <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{farmer.farmName || farmer.name}</h4>
                                            <div className='rating' style={{ marginBottom: '1rem', color: '#6b7280' }}>
                                                <span className='stars' style={{ color: '#fbbf24', marginRight: '5px' }}>
                                                    <FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star' style={{color:'#e0e0e0'}}/>
                                                </span>
                                                4.5 Reviews
                                            </div>
                                            <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>{farmer.location?.address || 'Local organic community farm. Committed to sustainable and fresh harvests every season.'}</p>
                                            <button className='btn btn-outline-primary btn-full' style={{borderRadius:'8px', padding: '0.75rem', fontWeight: 'bold'}}>View Farm Products</button>
                                        </div>
                                    </div>
                                ))})()}
                            </div>
                        </div>
                    ) : (
                         <div className='products-section mt-5'>
                            <div className='section-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Showing products from Farm</h3>
                                <div style={{display:'flex', gap:'0.5rem'}}>
                                    <button className='btn btn-sm btn-outline-danger' onClick={() => setSelectedFarmerId('')}>
                                        Back to Farms
                                    </button>
                                    <button className={`btn btn-sm ${coords ? 'btn-primary' : 'btn-outline'}`} onClick={handleNearMe}>
                                        {coords ? 'Clear Near Me Filter' : 'Near Me (10km)'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className='product-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                {products.length === 0 ? <p>No products found based on your filters.</p> : products.map((product) => (
                                    <ProductItem key={product._id} product={product} onAddToCart={handleAddToCart} />
                                ))}
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default Marketplace;
