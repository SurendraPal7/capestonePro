import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { FaShoppingCart, FaSearch, FaFilter, FaMinus, FaPlus, FaAngleLeft, FaAngleRight, FaHeart, FaStar, FaBox } from 'react-icons/fa';
import './Marketplace.css';
import './Dashboard.css'; // Leverage the existing responsive layout CSS from Dashboard

const ProductItem = ({ product, onAddToCart }) => {
    const [qty, setQty] = useState(1);
    const [showQty, setShowQty] = useState(false);

    return (
        <div className='product-card'>
            <div className='product-image-placeholder'>
                {product.quantity > 0 ? (
                    <span className='stock-badge'>IN STOCK</span>
                ) : (
                    <span className='stock-badge' style={{background:'#ef4444', color:'white'}}>OUT OF STOCK</span>
                )}
                <button className='heart-btn'><FaHeart /></button>
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className='product-image' />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#9ca3af' }}>
                        <FaBox />
                    </div>
                )}
            </div>
            <div className='product-info'>
                <div className='cat-tag'>{product.category?.toUpperCase() || 'GENERAL'}</div>
                <h3>{product.name}</h3>
                <p className='farm-name'>{product.farmer?.farmName || product.farmer?.name || 'Local Farm'}</p>
                <p className='stock' style={{fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', marginTop: '-0.2rem'}}>Stock: {product.quantity} {product.unit}</p>
                <div className='price-row'>
                    <div>
                        <span className='price'>₹{product.price}</span> <span className='unit'>/ {product.unit}</span>
                    </div>
                    {!showQty ? (
                        <button 
                            className='add-btn' 
                            onClick={() => setShowQty(true)}
                            disabled={product.quantity <= 0}
                        >
                            <FaShoppingCart />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '20px', padding: '2px' }}>
                            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.3rem 0.5rem', color: '#666' }}><FaMinus size={10} /></button>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{qty}</span>
                            <button onClick={() => setQty(Math.min(product.quantity, qty + 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.3rem 0.5rem', color: '#666' }}><FaPlus size={10} /></button>
                            <button 
                                className='add-btn' 
                                onClick={() => { onAddToCart(product, qty); setShowQty(false); setQty(1); }}
                                style={{ width: '28px', height: '28px', marginLeft: '5px' }}
                            >
                                <FaShoppingCart size={12} />
                            </button>
                        </div>
                    )}
                </div>
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
