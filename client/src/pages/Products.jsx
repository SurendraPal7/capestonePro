import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import AuthContext from '../context/AuthContext';
import ProductForm from '../components/ProductForm';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Products = () => {
    const { user, loading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'farmer') return;
        
        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const { data } = await axios.get('/api/products/myproducts', config);
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products', err);
            }
        };

        fetchProducts();
    }, [user]);

    const handleProductAdded = () => {
        setShowForm(false);
        setEditingProduct(null);
        window.location.reload();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setProducts(products.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !user) return <div className='container'>Loading...</div>;

    if (user.role !== 'farmer') {
        return (
            <DashboardLayout>
                <div className="dashboard-section card">
                    <h2>Products</h2>
                    <p>Only sellers can manage products.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className='dash-header-row mb-3'>
                <button className='btn btn-primary' onClick={() => { setShowForm(!showForm); setEditingProduct(null); }}>
                    {showForm ? 'Close Form' : '+ Add New Listing'}
                </button>
            </div>

            {(showForm || editingProduct) && (
                <div className='form-section card mb-4'>
                    <ProductForm onProductAdded={handleProductAdded} product={editingProduct} setEditingProduct={setEditingProduct} />
                </div>
            )}

            <div className="dashboard-section card">
                <div className='section-header'>
                    <h2>All Listed Products</h2>
                </div>
                
                {products.length === 0 ? <p className="text-gray py-4">You have no listed products.</p> : (
                    <div className='product-grid' style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'1.5rem', marginTop:'1rem' }}>
                        {products.map((product) => (
                            <div key={product._id} className='card product-card' style={{ border: '1px solid #e5e7eb', padding:'1rem', borderRadius:'8px' }}>
                                <div className='product-header' style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                                    <h4 style={{ margin:0, fontSize:'1.1rem', color:'#111827' }}>{product.name}</h4>
                                    <span style={{ fontSize:'0.75rem', background:'#e0f2fe', color:'#0284c7', padding:'0.2rem 0.5rem', borderRadius:'999px', fontWeight:'600' }}>{product.category}</span>
                                </div>
                                <p style={{ fontSize:'1.25rem', fontWeight:'700', margin:'0.5rem 0' }}>₹{product.price} <span style={{fontSize:'0.85rem', color:'#6b7280', fontWeight:'500'}}>/ {product.unit}</span></p>
                                <p style={{ fontSize:'0.9rem', color: product.quantity > 10 ? '#059669' : '#dc2626', fontWeight:'600' }}>
                                    {product.quantity > 10 ? 'In Stock' : 'Low Stock'} ({product.quantity} {product.unit} left)
                                </p>
                                <p style={{ fontSize:'0.85rem', color:'#6b7280' }}>Available: {new Date(product.availabilityDate).toLocaleDateString()}</p>
                                <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem' }}>
                                    <button className='btn btn-sm btn-outline' style={{ flex:1 }} onClick={() => { setEditingProduct(product); setShowForm(true); }}><FaEdit /> Edit</button>
                                    <button className='btn btn-sm' style={{ flex:1, border:'1px solid #fee2e2', color:'#dc2626', background:'transparent' }} onClick={() => handleDelete(product._id)}><FaTrash /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Products;
