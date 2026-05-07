import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import LocationFilter from '../components/LocationFilter';
import FarmMap from '../components/FarmMap';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { FaShoppingCart, FaSearch, FaFilter, FaMinus, FaPlus, FaAngleLeft, FaAngleRight, FaHeart, FaStar, FaBox, FaMap, FaMapMarkerAlt } from 'react-icons/fa';
import './Marketplace.css';
import './Dashboard.css'; // Leverage the existing responsive layout CSS from Dashboard

const ProductItem = ({ product, onAddToCart, showCartButton = true }) => {
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
                    {showCartButton && (
                        !showQty ? (
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
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const Marketplace = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const initialFarmerId = query.get('farmerId') || '';
    const initialKeyword = query.get('category') || '';

    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [filteredFarmers, setFilteredFarmers] = useState([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState(initialFarmerId);
    const [keyword, setKeyword] = useState(initialKeyword);
    const [showNearbyOnly, setShowNearbyOnly] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState(null);
    
    const { addToCart, cartItems } = useContext(CartContext);
    const { 
        userLocation, 
        filterFarmsByDistance, 
        addDistanceToFarms 
    } = useLocationContext();
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                let url = '/api/auth/farmers';
                const params = new URLSearchParams();
                
                // Add category filter if provided in URL
                if (keyword) {
                    params.append('category', keyword);
                }
                
                // Add location filter if nearby is enabled
                if (showNearbyOnly && userLocation) {
                    params.append('lat', userLocation.latitude);
                    params.append('lng', userLocation.longitude);
                }
                
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
                
                const { data } = await axios.get(url);
                setFarmers(data);
                setFilteredFarmers(data);
            } catch (err) {
                console.error("Failed to load featured farmers", err);
            }
        };
        fetchFarmers();
    }, [keyword, showNearbyOnly, userLocation]);

    // Filter farmers based on location and search
    useEffect(() => {
        let result = farmers;
        
        // Add distance information to all farms
        result = addDistanceToFarms(result);
        
        // Sort by distance if user location is available
        if (userLocation) {
            result.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }
        
        setFilteredFarmers(result);
    }, [farmers, userLocation, addDistanceToFarms]);

    useEffect(() => {
        const fetchProducts = async () => {
            let url = `/api/products?keyword=${keyword}`;
            
            // Add location-based filtering if enabled
            if (showNearbyOnly && userLocation) {
                url += `&lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
            }
            
            if (selectedFarmerId) {
                url += `&farmerId=${selectedFarmerId}`;
            }
            
            try {
                const { data } = await axios.get(url);
                setProducts(data.products);
            } catch (err) {
                console.error("Failed to load products", err);
            }
        };
        fetchProducts();

        const interval = setInterval(fetchProducts, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [keyword, showNearbyOnly, userLocation, selectedFarmerId]);

    const handleFilterChange = (nearbyOnly) => {
        setShowNearbyOnly(nearbyOnly);
    };

    const handleFarmSelect = (farm) => {
        setSelectedFarm(farm);
        setSelectedFarmerId(farm._id);
    };

    const handleAddToCart = (product, qty) => {
        if (user?.role !== 'buyer') return; // Prevent farmers from adding to cart
        addToCart(product, qty);
        alert(`Added ${qty} ${product.unit} of ${product.name} to cart!`);
    };

    return (
        <div className='container py-4 marketplace'>
            <div className='dash-hero' style={{ borderRadius: '12px' }}>
                        <span className='tag-season'>🌾 Winter Harvest Season 2026</span>
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
                        <>
                            {/* Location Filter */}
                            <LocationFilter 
                                onFilterChange={handleFilterChange}
                                showNearbyOnly={showNearbyOnly}
                                setShowNearbyOnly={setShowNearbyOnly}
                            />

                            {/* Map Toggle and Status */}
                            <div className='map-toggle-section' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <button 
                                    className={`btn ${showMap ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setShowMap(!showMap)}
                                >
                                    <FaMap style={{ marginRight: '0.5rem' }} />
                                    {showMap ? 'Hide Map' : 'Show Map'}
                                </button>
                                {showNearbyOnly && userLocation && (
                                    <span className='filter-status' style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.9rem', padding: '0.5rem 1rem', background: 'rgba(58, 125, 68, 0.1)', borderRadius: '20px', border: '1px solid rgba(58, 125, 68, 0.2)' }}>
                                        Showing {filteredFarmers.length} farms nearby
                                    </span>
                                )}
                            </div>

                            {/* Farm Map */}
                            {showMap && (
                                <FarmMap 
                                    farms={filteredFarmers}
                                    userLocation={userLocation}
                                    onFarmSelect={handleFarmSelect}
                                    selectedFarm={selectedFarm}
                                />
                            )}

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
                                    {filteredFarmers.length === 0 ? (
                                        <p className='text-gray'>
                                            {showNearbyOnly 
                                                ? 'No farms found in your area. Try increasing the search radius or browse all farms.'
                                                : 'No farms found handling this category.'
                                            }
                                        </p>
                                    ) : (
                                        filteredFarmers.map(farmer => (
                                            <div className='farm-card' key={farmer._id} onClick={() => setSelectedFarmerId(farmer._id)} style={{cursor: 'pointer', border: selectedFarmerId === farmer._id ? '2px solid var(--color-primary)' : '', overflow: 'hidden'}}>
                                                <div className='farm-image' style={{ position: 'relative' }}>
                                                    {farmer.farmImage ? (
                                                        <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div className='farm-placeholder' style={{width: '100%', height: '180px', background: 'linear-gradient(135deg, var(--color-sage-light) 0%, var(--color-sage) 50%, var(--color-primary-light) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--color-white)'}}>
                                                            {farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}
                                                        </div>
                                                    )}
                                                    {farmer.distance !== null && farmer.distance !== undefined && (
                                                        <div className='distance-badge' style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'linear-gradient(135deg, var(--color-accent) 0%, #F4D03F 100%)', color: 'var(--color-text-dark)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', boxShadow: '0 2px 6px rgba(218, 165, 32, 0.3)', zIndex: 3 }}>
                                                            {farmer.distance}km away
                                                        </div>
                                                    )}
                                                    <div className='farm-logo-sm' style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '60px', height: '60px', fontSize: '1.2rem', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>{farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}</div>
                                                </div>
                                                <div className='farm-info' style={{ padding: '3rem 1.5rem 1.5rem'}}>
                                                    <h4 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{farmer.farmName || farmer.name}</h4>
                                                    <div className='farmer-location' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                                        <FaMapMarkerAlt />
                                                        <span>
                                                            {farmer.location?.city && farmer.location?.state 
                                                                ? `${farmer.location.city}, ${farmer.location.state}`
                                                                : farmer.location?.address || 'Local Farm'
                                                            }
                                                        </span>
                                                    </div>
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
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className='products-section mt-5'>
                            <div className='section-header' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Showing products from Farm</h3>
                                <div style={{display:'flex', gap:'0.5rem'}}>
                                    <button className='btn btn-sm btn-outline-danger' onClick={() => setSelectedFarmerId('')}>
                                        Back to Farms
                                    </button>
                                    <button 
                                        className={`btn btn-sm ${showMap ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setShowMap(!showMap)}
                                    >
                                        <FaMap style={{ marginRight: '0.25rem' }} />
                                        {showMap ? 'Hide Map' : 'Show Map'}
                                    </button>
                                </div>
                            </div>

                            {/* Show map for selected farm */}
                            {showMap && selectedFarm && (
                                <FarmMap 
                                    farms={[selectedFarm]}
                                    userLocation={userLocation}
                                    onFarmSelect={handleFarmSelect}
                                    selectedFarm={selectedFarm}
                                />
                            )}
                            
                            <div className='product-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                {products.length === 0 ? <p>No products found based on your filters.</p> : products.map((product) => (
                                    <ProductItem 
                                        key={product._id} 
                                        product={product} 
                                        onAddToCart={handleAddToCart} 
                                        showCartButton={user?.role === 'buyer'}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default Marketplace;
