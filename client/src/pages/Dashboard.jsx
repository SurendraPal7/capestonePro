import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import { FaEdit, FaTrash, FaBox, FaSearch, FaAngleRight, FaAngleLeft, FaStar, FaShoppingCart, FaHeart, FaChevronDown } from 'react-icons/fa';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
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
                }
            } catch (error) {
                console.error('Error fetching data', error);
            }
        };
        fetchData();

        const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [user]);

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
                                        {/* Demo static products for mockup accuracy */}
                                        <div className='product-card'>
                                            <div className='product-image-placeholder'>
                                                <span className='stock-badge'>IN STOCK</span>
                                                <button className='heart-btn'><FaHeart /></button>
                                                <img src='https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' alt='Strawberries' className='product-image' />
                                            </div>
                                            <div className='product-info'>
                                                <div className='cat-tag'>ORGANIC FRESH</div>
                                                <h3>Premium Red Strawberries</h3>
                                                <p className='farm-name'>Green Valley Estate</p>
                                                <div className='price-row'>
                                                    <div>
                                                        <span className='price'>$4.50</span> <span className='unit'>/ lb</span>
                                                    </div>
                                                    <button className='add-btn'><FaShoppingCart /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='product-card'>
                                            <div className='product-image-placeholder'>
                                                <span className='stock-badge' style={{background:'#f3f4f6'}}>FEATURED</span>
                                                <button className='heart-btn'><FaHeart /></button>
                                                <img src='https://images.unsplash.com/photo-1627993077651-40efab76ea39?w=500&q=80' alt='Kale' className='product-image' />
                                            </div>
                                            <div className='product-info'>
                                                <div className='cat-tag' style={{color:'#0ea5e9'}}>HYDROPONIC</div>
                                                <h3>Fresh Curly Kale</h3>
                                                <p className='farm-name'>Sky Farms Hydroponics</p>
                                                <div className='price-row'>
                                                    <div>
                                                        <span className='price'>$2.99</span> <span className='unit'>/ bunch</span>
                                                    </div>
                                                    <button className='add-btn'><FaShoppingCart /></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='product-card'>
                                            <div className='product-image-placeholder'>
                                                <span className='stock-badge' style={{background:'#f97316', color:'white'}}>SALE -20%</span>
                                                <button className='heart-btn'><FaHeart /></button>
                                                <img src='https://images.unsplash.com/photo-1587049352847-4d4b1ed748d5?w=500&q=80' alt='Honey' className='product-image' />
                                            </div>
                                            <div className='product-info'>
                                                <div className='cat-tag'>ARTISANAL</div>
                                                <h3>Pure Wildflower Honey</h3>
                                                <p className='farm-name'>BeeKind Apiaries</p>
                                                <div className='price-row'>
                                                    <div>
                                                        <span className='price'>$12.00</span> <span className='unit'>/ 500g</span>
                                                    </div>
                                                    <button className='add-btn'><FaShoppingCart /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='col-right'>
                                    <div className='section-header'>
                                        <h3>Featured Farms</h3>
                                    </div>
                                    <div className='farms-list'>
                                        <div className='farm-card'>
                                            <div className='farm-image'>
                                                <img src='https://images.unsplash.com/photo-1595844730298-b960fad97aa5?w=500&q=80' alt='Farm' />
                                                <div className='farm-logo-sm'>SO</div>
                                            </div>
                                            <div className='farm-info'>
                                                <h4>Sunny Side Organics</h4>
                                                <div className='rating'>
                                                    <span className='stars'>
                                                        <FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star' style={{color:'#e0e0e0'}}/>
                                                    </span>
                                                    4.2 (128 reviews)
                                                </div>
                                                <p>Specializing in heirloom tomatoes and root vegetables grown without synthetic...</p>
                                                <button className='btn btn-outline-primary btn-full' style={{borderRadius:'20px'}}>Visit Shop</button>
                                            </div>
                                        </div>

                                        <div className='farm-card'>
                                            <div className='farm-image'>
                                                <img src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80' alt='Dairy' />
                                                <div className='farm-logo-sm' style={{background:'#1e3a8a'}}>RD</div>
                                            </div>
                                            <div className='farm-info'>
                                                <h4>River Valley Dairy</h4>
                                                <div className='rating'>
                                                    <span className='stars'>
                                                        <FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star'/><FaStar className='star'/>
                                                    </span>
                                                    4.9 (512 reviews)
                                                </div>
                                                <p>Award-winning artisan cheeses and fresh grass-fed milk delivered daily.</p>
                                                <button className='btn btn-outline-primary btn-full' style={{borderRadius:'20px'}}>Visit Shop</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
            )}
        </div>
    );
};

export default Dashboard;
