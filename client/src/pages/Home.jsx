import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLeaf, FaStar } from 'react-icons/fa';
import Footer from '../components/Footer';
import './Home.css';
import './Marketplace.css'; // For farm-card styles

const Home = () => {
    const [farmers, setFarmers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                // To show *all* farms or featured farms
                const { data } = await axios.get('/api/auth/farmers');
                setFarmers(data);
            } catch (err) {
                console.error("Failed to load farms", err);
            }
        };
        fetchFarmers();
    }, []);

    const categories = [
        {icon:'🍎', name:'Fruits', items:'420+'}, 
        {icon:'🥬', name:'Vegetables', items:'850+'}, 
        {icon:'🥛', name:'Dairy', items:'120+'}, 
        {icon:'🍞', name:'Grains', items:'310+'},
        {icon:'🥩', name:'Meat', items:'95+'}, 
        {icon:'🌱', name:'Organic', items:'2.4k+'}
    ];

    return (
        <div className='home'>
            <section className='hero' style={{ minHeight: '40vh', padding: '4rem 0' }}>
                <div className='hero-overlay'></div>
                <div className='container hero-content'>
                    <h1>Fresh from the Farm <br/><span className="text-secondary">to Your Table</span></h1>
                    <p>Connecting local farmers directly with you for fresh produce, fair prices, and a sustainable future for agriculture.</p>
                </div>
            </section>

            <section className='container py-5 mt-4'>
                <div className='section-header mb-4' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Shop by Category</h2>
                </div>
                
                <div className='categories-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                    {categories.map((cat, i) => (
                        <div 
                            className={`category-card cursor-pointer`} 
                            key={i} 
                            onClick={() => navigate(`/marketplace?category=${cat.name}`)}
                            style={{ textAlign: 'center', padding: '1.5rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f0f0f0' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className='cat-icon-wrapper' style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{cat.icon}</div>
                            <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937' }}>{cat.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{cat.items} items</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className='container py-5'>
                <div className='section-header mb-4' style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <h2>Explore Local Farms</h2>
                </div>

                <div className='farms-list' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {farmers.length === 0 ? <p className="text-gray">No farms are currently listed.</p> : farmers.map(farmer => (
                        <div 
                            className='farm-card' 
                            key={farmer._id} 
                            onClick={() => navigate(`/marketplace?farmerId=${farmer._id}`)} 
                            style={{cursor: 'pointer', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s'}}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className='farm-image' style={{ position: 'relative' }}>
                                {farmer.farmImage ? (
                                    <img src={farmer.farmImage} alt={farmer.farmName || farmer.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                                ) : (
                                    <div className='farm-placeholder' style={{width: '100%', height: '160px', background: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--color-sage)'}}>
                                        {farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}
                                    </div>
                                )}
                                <div className='farm-logo-sm' style={{ position: 'absolute', bottom: '-25px', left: '20px', width: '50px', height: '50px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
                                    {farmer.farmName ? farmer.farmName.substring(0,2).toUpperCase() : 'FF'}
                                </div>
                            </div>
                            <div className='farm-info' style={{ padding: '2.5rem 1.5rem 1.5rem' }}>
                                <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827' }}>{farmer.farmName || farmer.name}</h4>
                                <div className='rating' style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                                    <span className='stars' style={{ color: '#fbbf24' }}>
                                        <FaStar /><FaStar /><FaStar /><FaStar /><FaStar style={{color:'#e5e7eb'}}/>
                                    </span>
                                    <span>4.5 Reviews</span>
                                </div>
                                <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                                    {farmer.location?.address || 'Community-focused organic farm providing fresh daily harvests.'}
                                </p>
                                <button className='btn btn-outline-primary btn-full' style={{ borderRadius: '8px', padding: '0.75rem', fontWeight: '600' }}>
                                    View Farm Products
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
