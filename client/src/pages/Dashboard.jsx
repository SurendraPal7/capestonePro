import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import ProductForm from '../components/ProductForm';
import { FaEdit, FaTrash, FaBox, FaSearch, FaAngleRight, FaAngleLeft, FaStar, FaShoppingCart, FaHeart, FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const DashboardProductCard = ({ product, onAddToCart }) => {
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

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!user) return; // Wait for user
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                if (user.role === 'farmer') {
                    const prodRes = await axios.get('/api/products/myproducts', config);
                    setProducts(prodRes.data);

                    const orderRes = await axios.get('/api/orders/farmerorders', config);
                    setOrders(orderRes.data);
                } else {
                    const orderRes = await axios.get('/api/orders/myorders', config);
                    setOrders(orderRes.data);

                    const prodRes = await axios.get('/api/products');
                    setProducts(prodRes.data.products || []);

                    const farmerRes = await axios.get('/api/auth/farmers');
                    setFarmers(farmerRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleAddToCart = (product, qty = 1) => {
        addToCart(product, qty);
        alert(`Added ${qty} ${product.unit || 'item'} of ${product.name} to cart!`);
    };

    const handleProductAdded = () => {
        setShowForm(false);
        setEditingProduct(null);
        // Refresh products
        // Simplified: reload page or refetch. 
        window.location.reload();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`/api/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        }
    };

    const salesData = [
        { name: 'Oct 27', sales: 150 },
        { name: 'Nov 18', sales: 400 },
        { name: 'Nov 21', sales: 250 },
        { name: 'Dec 07', sales: 650 },
        { name: 'Jan 19', sales: 1000 },
    ];

    if (loading || !user) return <div className='container'>Loading...</div>;

    if (user.role === 'farmer') {
        return (
            <div className='dashboard-layout'>
                <Sidebar />
                <div className='main-content'>
                    <Topbar />
                    <div className='seller-dashboard-container'>
                        <div className='dash-header-row'>
                            <button className='btn btn-primary' onClick={() => { setShowForm(!showForm); setEditingProduct(null); }}>
                                {showForm ? 'Close Form' : '+ Add New Listing'}
                            </button>
                        </div>

                        {(showForm || editingProduct) && (
                            <div className='form-section card mb-4'>
                                <ProductForm onProductAdded={handleProductAdded} product={editingProduct} setEditingProduct={setEditingProduct} />
                            </div>
                        )}

                        <div className='stats-grid'>
                            <div className='stat-card'>
                                <div className='stat-title'>Total Orders</div>
                                <div className='stat-value text-green'>{orders.length}</div>
                            </div>
                            <div className='stat-card'>
                                <div className='stat-title'>Pending Orders</div>
                                <div className='stat-value text-red'>{orders.filter(o => o.status === 'Pending').length}</div>
                            </div>
                            <div className='stat-card'>
                                <div className='stat-title'>Total Earnings</div>
                                <div className='stat-value text-blue'>₹{orders.reduce((acc, o) => acc + (o.totalPrice || o.totalAmount || 0), 0).toLocaleString()}</div>
                            </div>
                            <div className='stat-card'>
                                <div className='stat-title'>Products in Stock</div>
                                <div className='stat-value text-yellow'>{products.length}</div>
                            </div>
                        </div>

                        <div className='dashboard-section card'>
                            <div className='section-header'>
                                <h3>Order Management</h3>
                                <a href='#' className='view-all'>View All &gt;</a>
                            </div>
                            <div className='table-responsive'>
                                <table className='data-table'>
                                    <tbody>
                                        {orders.length === 0 ? <tr><td colSpan="5" className="text-center py-4">No recent orders</td></tr> :
                                        orders.slice(0, 5).map(order => (
                                            <tr key={order._id}>
                                                <td className='text-blue font-weight-bold'>#{order._id.substring(order._id.length - 4)}</td>
                                                <td>{order.buyerName || 'John Kumar'}</td>
                                                <td className='font-weight-bold'>₹{order.totalAmount || 450}</td>
                                                <td><span className={`status-badge status-${(order.status || 'Delivered').toLowerCase()}`}>{order.status || 'Delivered'}</span></td>
                                                <td className='text-right text-gray cursor-pointer'><FaChevronDown /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className='dashboard-section card'>
                            <div className='section-header'>
                                <h3>Sales Overview</h3>
                                <button className='btn btn-sm btn-outline'>This Week &gt;</button>
                            </div>
                            <div className='chart-container'>
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} dx={-10} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.6} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className='dashboard-section card'>
                            <div className='section-header'>
                                <h3>Manage Your Products</h3>
                            </div>
                            <div className='table-responsive'>
                                <table className='data-table'>
                                    <tbody>
                                        {products.length === 0 ? <tr><td colSpan="4" className="text-center py-4">No products found.</td></tr> : null}
                                        {products.map(product => (
                                            <tr key={product._id}>
                                                <td className='font-weight-bold text-dark'>{product.name}</td>
                                                <td className='font-weight-bold'>₹{product.price}</td>
                                                <td><span className={product.quantity > 10 ? 'text-green font-weight-bold' : 'text-red font-weight-bold'}>{product.quantity > 10 ? 'In Stock' : 'Low Stock'}</span></td>
                                                <td className='text-right'>
                                                    <button className='btn btn-text text-blue' onClick={() => { setEditingProduct(product); setShowForm(true); }}>Edit</button> | 
                                                    <button className='btn btn-text text-blue' onClick={() => handleDelete(product._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container dashboard'>
            {user.role === 'buyer' && (
                <div className='dashboard-container'>
                            <div className='dash-hero'>
                                <span className='tag-season'>Harvest Season 2024</span>
                                <h1>Direct from Farm to Your Table</h1>
                                <p>Freshly harvested organic produce delivered directly to businesses and homes within 24 hours.</p>
                                
                                <div className='dash-search'>
                                    <FaSearch className='search-icon' />
                                    <input type='text' placeholder='Search for organic fruits, vegetables, or farms...' />
                                    <button className='btn btn-primary'>Search Marketplace</button>
                                </div>
                                <div className='hero-tags'>
                                    <span>✔ 100% Certified Organic</span>
                                    <span>🚚 Same-day Delivery</span>
                                </div>
                            </div>

                            <div className='mt-4 section-header'>
                                <h3>Shop by Category</h3>
                                <a href='#' className='view-all'>View all categories</a>
                            </div>

                            <div className='categories-grid'>
                                {/* Static category data for demo */}
                                {[{icon:'🍎', name:'Fruits', items:'420+'}, {icon:'🥬', name:'Vegetables', items:'850+'}, 
                                  {icon:'🥛', name:'Dairy', items:'120+'}, {icon:'🍞', name:'Grains', items:'310+'},
                                  {icon:'🥩', name:'Meat', items:'95+'}, {icon:'🌱', name:'Organic', items:'2.4k+'}].map((cat, i) => (
                                    <div className={`category-card ${i===1?'active':''}`} key={i}>
                                        <div className='cat-icon-wrapper'>{cat.icon}</div>
                                        <h4>{cat.name}</h4>
                                        <p>{cat.items} items</p>
                                    </div>
                                ))}
                            </div>

                            <div className='mt-4 two-cols'>
                                <div className='col-left'>
                                    <div className='section-header'>
                                        <h3>New Arrivals</h3>
                                        <div className='nav-arrows'>
                                            <button><FaAngleLeft /></button>
                                            <button><FaAngleRight /></button>
                                        </div>
                                    </div>
                                    
                                    <div className='products-grid-3'>
                                        {products.slice(0, 3).map((product) => (
                                            <DashboardProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                                        ))}
                                    </div>
                                </div>

                                <div className='col-right'>
                                    <div className='section-header'>
                                        <h3>Featured Farms</h3>
                                    </div>
                                    <div className='farms-list'>
                                        {farmers.slice(0, 2).map((farmer) => (
                                            <div className='farm-card' key={farmer._id}>
                                                <div className='farm-image'>
                                                    {farmer.farmImage ? (
                                                        <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#dcfce7' }}></div>
                                                    )}
                                                    <div className='farm-logo-sm' style={{ background: farmer.farmImage ? '#4a5d23' : '#1e3a8a' }}>
                                                        {farmer.farmName ? farmer.farmName.substring(0, 2).toUpperCase() : (farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'FF')}
                                                    </div>
                                                </div>
                                                <div className='farm-info'>
                                                    <h4>{farmer.farmName || farmer.name}</h4>
                                                    <div className='rating'>
                                                        <span className='stars'>
                                                            <FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star' style={{color:'#e0e0e0'}}/>
                                                        </span>
                                                        4.5 (Reviews)
                                                    </div>
                                                    <p>{farmer.location?.address?.substring(0, 60) || 'Local organic community farm. Committed to sustainable and fresh harvests every season.'}...</p>
                                                    <button className='btn btn-outline-primary btn-full' style={{borderRadius:'20px'}} onClick={() => navigate('/marketplace?farmerId=' + farmer._id)}>Visit Shop</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
            )}
        </div>
    );
};

export default Dashboard;
