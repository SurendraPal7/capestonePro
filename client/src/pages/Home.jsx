import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSeedling, FaStar, FaTractor, FaLeaf, FaHeart, FaShieldAlt, FaClock, FaUsers, FaMapMarkerAlt, FaMap } from 'react-icons/fa';
import Footer from '../components/Footer';
import LocationFilter from '../components/LocationFilter';
import FarmMap from '../components/FarmMap';
import { useLocation } from '../context/LocationContext';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';
import './Home.css';

const Home = () => {
    const [farmers, setFarmers] = useState([]);
    const [filteredFarmers, setFilteredFarmers] = useState([]);
    const [showNearbyOnly, setShowNearbyOnly] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryStats, setCategoryStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const { 
        userLocation, 
        filterFarmsByDistance, 
        addDistanceToFarms 
    } = useLocation();

    // Redirect farmers to dashboard
    useEffect(() => {
        if (user && user.role === 'farmer') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                let url = '/api/auth/farmers';
                const params = new URLSearchParams();
                
                // Add category filter if selected
                if (selectedCategory) {
                    params.append('category', selectedCategory);
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
                console.error("Failed to load farms", err);
            }
        };
        fetchFarmers();
    }, [selectedCategory, showNearbyOnly, userLocation]);

    // Fetch category statistics
    useEffect(() => {
        const fetchCategoryStats = async () => {
            try {
                const { data } = await axios.get('/api/auth/categories/stats');
                setCategoryStats(data.categories);
                setStatsLoading(false);
            } catch (err) {
                console.error("Failed to load category stats", err);
                setStatsLoading(false);
            }
        };
        fetchCategoryStats();
        
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchCategoryStats, 30000);
        return () => clearInterval(interval);
    }, []);

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

    const handleFilterChange = (nearbyOnly) => {
        setShowNearbyOnly(nearbyOnly);
    };

    const handleFarmSelect = (farm) => {
        setSelectedFarm(farm);
        // Scroll to farm card or navigate to marketplace
        navigate(`/marketplace?farmerId=${farm._id}`);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.searchName);
        // Scroll to farmers section
        const farmersSection = document.querySelector('.farmers-section');
        if (farmersSection) {
            farmersSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const clearCategoryFilter = () => {
        setSelectedCategory('');
    };

    const categories = [
        {icon:'🍎', name:'Fresh Fruits', searchName: 'Fruits', color: '#FF6B6B'}, 
        {icon:'🥬', name:'Leafy Greens', searchName: 'Vegetables', color: '#4ECDC4'}, 
        {icon:'🥛', name:'Dairy Products', searchName: 'Dairy', color: '#45B7D1'}, 
        {icon:'🌾', name:'Grains & Cereals', searchName: 'Grains', color: '#F9CA24'},
        {icon:'🥩', name:'Farm Meat', searchName: 'Meat', color: '#F0932B'}, 
        {icon:'🌱', name:'Organic Produce', searchName: 'Other', color: '#6C5CE7'}
    ];

    // Helper function to get item count for a category
    const getCategoryItemCount = (searchName) => {
        if (statsLoading) return 'Loading...';
        
        const count = categoryStats[searchName] || 0;
        if (count === 0) return '0 items';
        if (count === 1) return '1 item';
        if (count < 100) return `${count} items`;
        if (count < 1000) return `${count}+ items`;
        return `${(count / 1000).toFixed(1)}k+ items`;
    };

    const features = [
        {
            icon: <FaLeaf />,
            title: "100% Organic",
            description: "All our produce is certified organic, grown without harmful pesticides or chemicals."
        },
        {
            icon: <FaTractor />,
            title: "Direct from Farm",
            description: "Skip the middleman. Get fresh produce directly from local farmers to your table."
        },
        {
            icon: <FaHeart />,
            title: "Support Local",
            description: "Every purchase supports local farming communities and sustainable agriculture."
        },
        {
            icon: <FaShieldAlt />,
            title: "Quality Guaranteed",
            description: "We guarantee the freshness and quality of every product delivered to you."
        }
    ];

    return (
        <div className='home'>
            {/* Hero Section */}
            <section className='hero'>
                <div className='hero-overlay'></div>
                <div className='container hero-content'>
                    <div className='hero-badge'>
                        <FaSeedling className='badge-icon' />
                        <span>🌾 Winter Harvest Season 2026 • Farm Fresh • Locally Sourced</span>
                    </div>
                    <h1>
                        Fresh from the <span className="text-accent">Farm</span><br/>
                        Straight to Your <span className="text-primary">Table</span>
                    </h1>
                    <p className='hero-description'>
                        Connect directly with local farmers for the freshest produce, fair prices, 
                        and a sustainable future. Experience the taste of authentic, farm-fresh food.
                    </p>
                    <div className='hero-buttons'>
                        <Link to='/marketplace' className='btn btn-primary btn-lg'>
                            <FaLeaf className='btn-icon' />
                            Shop Fresh Produce
                        </Link>
                        <Link to='/register' className='btn btn-outline btn-lg'>
                            <FaTractor className='btn-icon' />
                            Join as Farmer
                        </Link>
                    </div>
                    <div className='hero-stats'>
                        <div className='stat-item'>
                            <span className='stat-number'>500+</span>
                            <span className='stat-label'>Local Farmers</span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-number'>10k+</span>
                            <span className='stat-label'>Fresh Products</span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-number'>25k+</span>
                            <span className='stat-label'>Happy Customers</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='features-section'>
                <div className='container'>
                    <div className='section-header'>
                        <h2>Why Choose Farm Direct?</h2>
                        <p>Experience the difference of truly fresh, locally-sourced produce</p>
                    </div>
                    <div className='features-grid'>
                        {features.map((feature, index) => (
                            <div key={index} className='feature-card'>
                                <div className='feature-icon'>
                                    {feature.icon}
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className='categories-section'>
                <div className='container'>
                    <div className='section-header'>
                        <h2>Shop by Category</h2>
                        <p>Discover fresh produce from our network of local farms</p>
                    </div>
                    
                    <div className='categories-grid'>
                        {categories.map((category, index) => (
                            <div 
                                className={`category-card ${selectedCategory === category.searchName ? 'selected' : ''}`}
                                key={index} 
                                onClick={() => handleCategorySelect(category)}
                            >
                                <div className='category-icon' style={{backgroundColor: `${category.color}20`}}>
                                    <span style={{color: category.color}}>{category.icon}</span>
                                </div>
                                <h4>{category.name}</h4>
                                <p className={statsLoading ? 'loading' : ''}>{getCategoryItemCount(category.searchName)} available</p>
                                <div className='category-arrow'>→</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Farmers Section */}
            <section className='farmers-section'>
                <div className='container'>
                    <div className='section-header'>
                        <h2>
                            {selectedCategory 
                                ? `Farms Growing ${categories.find(cat => cat.searchName === selectedCategory)?.name || selectedCategory}` 
                                : 'Meet Our Local Farmers'
                            }
                        </h2>
                        <p>
                            {selectedCategory 
                                ? `Discover farms specializing in ${(categories.find(cat => cat.searchName === selectedCategory)?.name || selectedCategory).toLowerCase()}` 
                                : 'Get to know the passionate farmers who grow your food'
                            }
                        </p>
                    </div>

                    {/* Category Filter Status */}
                    {selectedCategory && (
                        <div className='category-filter-status'>
                            <div className='filter-info'>
                                <span className='filter-label'>Filtering by category:</span>
                                <span className='filter-value'>{categories.find(cat => cat.searchName === selectedCategory)?.name || selectedCategory}</span>
                                <button 
                                    className='clear-filter-btn'
                                    onClick={clearCategoryFilter}
                                    title='Clear category filter'
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Location Filter */}
                    <LocationFilter 
                        onFilterChange={handleFilterChange}
                        showNearbyOnly={showNearbyOnly}
                        setShowNearbyOnly={setShowNearbyOnly}
                    />

                    {/* Map Toggle */}
                    <div className='map-toggle-section'>
                        <button 
                            className={`btn ${showMap ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setShowMap(!showMap)}
                        >
                            <FaMap className='btn-icon' />
                            {showMap ? 'Hide Map' : 'Show Map'}
                        </button>
                        {showNearbyOnly && userLocation && (
                            <span className='filter-status'>
                                Showing {filteredFarmers.length} farms nearby
                            </span>
                        )}
                        {selectedCategory && (
                            <span className='filter-status'>
                                Found {filteredFarmers.length} farms with {categories.find(cat => cat.searchName === selectedCategory)?.name || selectedCategory}
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

                    <div className='farmers-grid'>
                        {filteredFarmers.length === 0 ? (
                            <div className='no-farmers'>
                                <FaTractor className='no-farmers-icon' />
                                <p>
                                    {selectedCategory 
                                        ? `No farms found growing ${categories.find(cat => cat.searchName === selectedCategory)?.name || selectedCategory}. Try browsing other categories or all farms.`
                                        : showNearbyOnly 
                                            ? 'No farms found in your area. Try increasing the search radius or browse all farms.'
                                            : 'No farms are currently listed. Be the first to join our farming community!'
                                    }
                                </p>
                                {!showNearbyOnly && !selectedCategory && (
                                    <Link to='/register' className='btn btn-primary'>
                                        Register Your Farm
                                    </Link>
                                )}
                                {selectedCategory && (
                                    <button 
                                        className='btn btn-outline'
                                        onClick={clearCategoryFilter}
                                    >
                                        View All Farms
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredFarmers.slice(0, 6).map(farmer => (
                                <div 
                                    className='farmer-card' 
                                    key={farmer._id} 
                                    onClick={() => navigate(`/marketplace?farmerId=${farmer._id}`)}
                                >
                                    <div className='farmer-image'>
                                        {farmer.farmImage ? (
                                            <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} />
                                        ) : (
                                            <div className='farmer-placeholder'>
                                                <FaTractor />
                                            </div>
                                        )}
                                        <div className='farmer-badge'>
                                            <FaSeedling />
                                        </div>
                                        {farmer.distance !== null && farmer.distance !== undefined && (
                                            <div className='distance-badge'>
                                                {farmer.distance}km away
                                            </div>
                                        )}
                                    </div>
                                    <div className='farmer-info'>
                                        <h4>{farmer.farmName || farmer.name}</h4>
                                        <div className='farmer-location'>
                                            <FaMapMarkerAlt />
                                            <span>
                                                {farmer.location?.city && farmer.location?.state 
                                                    ? `${farmer.location.city}, ${farmer.location.state}`
                                                    : farmer.location?.address || 'Local Farm'
                                                }
                                            </span>
                                        </div>
                                        <div className='farmer-rating'>
                                            <div className='stars'>
                                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                            </div>
                                            <span>4.8 (124 reviews)</span>
                                        </div>
                                        <p className='farmer-description'>
                                            Organic farming specialist with 15+ years of experience in sustainable agriculture.
                                        </p>
                                        <div className='farmer-stats'>
                                            <div className='stat'>
                                                <FaLeaf />
                                                <span>Organic Certified</span>
                                            </div>
                                            <div className='stat'>
                                                <FaClock />
                                                <span>Same Day Delivery</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {filteredFarmers.length > 6 && (
                        <div className='section-footer'>
                            <Link to='/marketplace' className='btn btn-outline btn-lg'>
                                View All Farmers
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className='cta-section'>
                <div className='container'>
                    <div className='cta-content'>
                        <div className='cta-icon'>
                            <FaUsers />
                        </div>
                        <h2>Join Our Growing Community</h2>
                        <p>
                            Whether you're a farmer looking to sell directly to consumers or a buyer seeking 
                            the freshest produce, our platform connects you with your local food community.
                        </p>
                        <div className='cta-buttons'>
                            <Link to='/register?role=farmer' className='btn btn-primary btn-lg'>
                                <FaTractor className='btn-icon' />
                                Start Selling
                            </Link>
                            <Link to='/register?role=buyer' className='btn btn-accent btn-lg'>
                                <FaLeaf className='btn-icon' />
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
