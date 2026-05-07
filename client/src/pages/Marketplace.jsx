import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import LocationFilter from '../components/LocationFilter';
import FarmMap from '../components/FarmMap';
import { useLocation as useLocationContext } from '../context/LocationContext';
import { FaShoppingCart, FaSearch, FaFilter, FaMinus, FaPlus, FaAngleLeft, FaAngleRight, FaHeart, FaStar, FaBox, FaMap, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
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
    const [selectedRadius, setSelectedRadius] = useState(10); // Default 10km
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    
    const { addToCart, cartItems } = useContext(CartContext);
    const { 
        userLocation,
        locationName,
        getCurrentLocation,
        isLoadingLocation,
        setNearbyRadius
    } = useLocationContext();
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                let url = '/api/auth/farmers';
                const params = new URLSearchParams();
                
                // Don't send keyword to backend - we'll filter client-side
                // Only add location filter if nearby is enabled
                if (showNearbyOnly && userLocation) {
                    params.append('lat', userLocation.latitude);
                    params.append('lng', userLocation.longitude);
                }
                
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
                
                const { data } = await axios.get(url);
                setFarmers(data);
            } catch (err) {
                console.error("Failed to load featured farmers", err);
                setFarmers([]);
            }
        };
        fetchFarmers();
    }, [showNearbyOnly, userLocation]); // Removed keyword from dependencies

    // Filter farmers based on location and search
    useEffect(() => {
        if (!farmers || farmers.length === 0) {
            setFilteredFarmers([]);
            return;
        }
        
        let result = [...farmers];
        
        // Client-side search filter for farm names
        if (keyword && keyword.trim()) {
            const searchTerms = keyword.toLowerCase().trim().split(/\s+/); // Split by spaces
            result = result.filter(farm => {
                const farmName = (farm.farmName || farm.name || '').toLowerCase();
                const farmerName = (farm.name || '').toLowerCase();
                const location = (farm.location?.city || '').toLowerCase();
                const state = (farm.location?.state || '').toLowerCase();
                
                // Check if any search term matches
                return searchTerms.some(term => 
                    farmName.includes(term) || 
                    farmerName.includes(term) || 
                    location.includes(term) ||
                    state.includes(term)
                );
            });
        }
        
        // Add distance information to all farms
        if (userLocation) {
            result = result.map(farm => {
                if (!farm.location || !farm.location.coordinates) {
                    return { ...farm, distance: null };
                }
                
                const farmLat = farm.location.coordinates.latitude || farm.location.latitude;
                const farmLon = farm.location.coordinates.longitude || farm.location.longitude;
                
                if (!farmLat || !farmLon) {
                    return { ...farm, distance: null };
                }
                
                // Calculate distance using Haversine formula
                const R = 6371; // Earth's radius in kilometers
                const dLat = (farmLat - userLocation.latitude) * Math.PI / 180;
                const dLon = (farmLon - userLocation.longitude) * Math.PI / 180;
                const a = 
                    Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(farmLat * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;
                
                return { ...farm, distance: Math.round(distance * 10) / 10 };
            });
        }
        
        // Filter by selected radius if location is enabled
        if (showNearbyOnly && userLocation) {
            result = result.filter(farm => {
                if (farm.distance === null || farm.distance === undefined) return false;
                return farm.distance <= selectedRadius;
            });
        }
        
        // Sort by distance if user location is available
        if (userLocation) {
            result.sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }
        
        setFilteredFarmers(result);
    }, [farmers, userLocation, showNearbyOnly, selectedRadius, keyword]);

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

    const handleDetectLocation = async () => {
        setIsDetectingLocation(true);
        try {
            await getCurrentLocation();
            setShowNearbyOnly(true);
            alert('Location detected successfully!');
        } catch (error) {
            console.error('Location detection error:', error);
            alert(error.message || 'Failed to detect location');
        } finally {
            setIsDetectingLocation(false);
        }
    };

    const handleRadiusChange = (radius) => {
        setSelectedRadius(radius);
        setNearbyRadius(radius);
    };

    const handleFilterChange = (nearbyOnly) => {
        setShowNearbyOnly(nearbyOnly);
    };

    const handleFarmSelect = (farm) => {
        setSelectedFarm(farm);
        setSelectedFarmerId(farm._id);
    };

    const handleAddToCart = (product, qty) => {
        if (user?.role !== 'buyer') return; // Prevent farmers from adding to cart
        
        const added = addToCart(product, qty);
        
        // Only show success message if item was actually added
        if (added) {
            alert(`Added ${qty} ${product.unit} of ${product.name} to cart!`);
        }
        // If not added, the modal will be shown automatically by CartContext
    };

    return (
        <div className='marketplace-simple'>
            {/* Simple Search Bar */}
            <div className='simple-search-container'>
                <div className='simple-search-box'>
                    <FaSearch className='search-icon' />
                    <input 
                        type='text' 
                        placeholder='Search for organic fruits, vegetables, or farms...'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className='simple-search-input'
                    />
                </div>
                
                {/* Location Filter */}
                <div className='location-filter-simple'>
                    {!showNearbyOnly ? (
                        <button 
                            className='location-btn'
                            onClick={handleDetectLocation}
                            disabled={isDetectingLocation || isLoadingLocation}
                        >
                            <FaLocationArrow />
                            {isDetectingLocation || isLoadingLocation 
                                ? 'Detecting Location...' 
                                : 'Detect My Location'
                            }
                        </button>
                    ) : (
                        <div className='location-active-container'>
                            <div className='location-detected'>
                                <div className='location-icon-wrapper'>
                                    <FaMapMarkerAlt />
                                </div>
                                <div className='location-info'>
                                    <span className='location-label'>Your Location</span>
                                    <span className='location-name'>{locationName || 'Location Detected'}</span>
                                </div>
                                <button 
                                    className='change-location-btn'
                                    onClick={() => setShowNearbyOnly(false)}
                                    title='Change location'
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className='radius-options'>
                                <span className='radius-label'>Search Radius:</span>
                                <button 
                                    className={`radius-btn ${selectedRadius === 5 ? 'active' : ''}`}
                                    onClick={() => handleRadiusChange(5)}
                                >
                                    5 km
                                </button>
                                <button 
                                    className={`radius-btn ${selectedRadius === 10 ? 'active' : ''}`}
                                    onClick={() => handleRadiusChange(10)}
                                >
                                    10 km
                                </button>
                                <button 
                                    className={`radius-btn ${selectedRadius === 20 ? 'active' : ''}`}
                                    onClick={() => handleRadiusChange(20)}
                                >
                                    20 km
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className='container py-4'>
                {!selectedFarmerId ? (
                    <div className='farms-section'>
                        {keyword && keyword.trim() && (
                            <div className='search-header'>
                                <div>
                                    <h2>Search results for "{keyword}"</h2>
                                    <p className='results-count'>{filteredFarmers?.length || 0} {filteredFarmers?.length === 1 ? 'farm' : 'farms'} found</p>
                                </div>
                                <button className='clear-btn' onClick={() => setKeyword('')}>
                                    Clear Search
                                </button>
                            </div>
                        )}
                        
                        {showNearbyOnly && userLocation && filteredFarmers && (
                            <div className='location-status'>
                                <FaMapMarkerAlt />
                                <span>Found {filteredFarmers.length} {filteredFarmers.length === 1 ? 'farm' : 'farms'} within {selectedRadius} km</span>
                            </div>
                        )}
                        
                        <div className='farms-grid'>
                            {!filteredFarmers || filteredFarmers.length === 0 ? (
                                <div className='no-results'>
                                    <p>No farms found{keyword ? ` matching "${keyword}"` : ''}.</p>
                                    {keyword && (
                                        <button className='clear-search-btn' onClick={() => setKeyword('')}>
                                            Clear search and show all farms
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredFarmers.map(farmer => (
                                    <div className='farm-card-simple' key={farmer._id} onClick={() => setSelectedFarmerId(farmer._id)}>
                                        <div className='farm-image-simple'>
                                            {farmer.farmImage ? (
                                                <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} />
                                            ) : (
                                                <div className='farm-placeholder-simple'>
                                                    {farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}
                                                </div>
                                            )}
                                            {farmer.distance !== null && farmer.distance !== undefined && (
                                                <div className='distance-badge-simple'>
                                                    {farmer.distance} km
                                                </div>
                                            )}
                                        </div>
                                        <div className='farm-info-simple'>
                                            <h3>{farmer.farmName || farmer.name}</h3>
                                            <p className='farm-location-simple'>
                                                <FaMapMarkerAlt />
                                                {farmer.location?.city && farmer.location?.state 
                                                    ? `${farmer.location.city}, ${farmer.location.state}`
                                                    : 'Local Farm'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='products-section'>
                        <div className='products-header'>
                            <h2>Farm Products</h2>
                            <button className='back-btn' onClick={() => setSelectedFarmerId('')}>
                                ← Back to Farms
                            </button>
                        </div>
                        
                        <div className='product-grid-simple'>
                            {!products || products.length === 0 ? (
                                <p className='no-results'>No products found.</p>
                            ) : (
                                products.map((product) => (
                                    <ProductItem 
                                        key={product._id} 
                                        product={product} 
                                        onAddToCart={handleAddToCart} 
                                        showCartButton={user?.role === 'buyer'}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
