import { useState, useEffect } from 'react';
import axios from 'axios';

const ProductForm = ({ onProductAdded, setEditingProduct, product = null }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || '',
        quantity: product?.quantity || '',
        unit: product?.unit || 'kg',
        price: product?.price || '',
        description: product?.description || '',
        location: product?.location?.address || product?.location || '',
        latitude: product?.location?.coordinates?.[1] || '',
        longitude: product?.location?.coordinates?.[0] || '',
        availabilityDate: product?.availabilityDate ? product.availabilityDate.substring(0, 10) : '',
        images: product?.images || []
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationDetected, setLocationDetected] = useState(false);

    // Auto-detect location when adding new product (not editing)
    useEffect(() => {
        if (!product && !locationDetected) {
            console.log('🌍 Auto-detecting location for new product...');
            detectLocation();
        }
    }, [product, locationDetected]);

    // Function to detect location automatically
    const detectLocation = () => {
        if (!navigator.geolocation) {
            console.log('❌ Geolocation not supported');
            return;
        }

        setLocationLoading(true);
        console.log('📍 Requesting location permission...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                console.log('✅ Location detected:', { lat, lng });
                
                // Update coordinates
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));

                // Reverse geocode to get address
                try {
                    console.log('🔍 Reverse geocoding...');
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    
                    if (response.data && response.data.address) {
                        const addr = response.data.address;
                        const city = addr.city || addr.town || addr.village || addr.county || '';
                        const state = addr.state || '';
                        const country = addr.country || '';
                        
                        const fullAddress = `${city}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`;
                        
                        console.log('✅ Address detected:', fullAddress);
                        
                        setFormData(prev => ({
                            ...prev,
                            location: fullAddress
                        }));
                    }
                } catch (error) {
                    console.error('❌ Reverse geocoding failed:', error);
                    // Still keep the coordinates even if reverse geocoding fails
                }
                
                setLocationDetected(true);
                setLocationLoading(false);
            },
            (error) => {
                console.error('❌ Location detection failed:', error);
                setLocationLoading(false);
                
                // Don't show alert for permission denied, just log it
                if (error.code === error.PERMISSION_DENIED) {
                    console.log('ℹ️ Location permission denied. User can manually enter location.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    // Update form data when product prop changes
    useEffect(() => {
        console.log('ProductForm useEffect triggered, product:', product);
        try {
            if (product) {
                console.log('Loading product data into form...');
                console.log('Product location:', product.location);
                console.log('Product availabilityDate:', product.availabilityDate);
                
                setFormData({
                    name: product.name || '',
                    category: product.category || '',
                    quantity: product.quantity || '',
                    unit: product.unit || 'kg',
                    price: product.price || '',
                    description: product.description || '',
                    location: product.location?.address || product.location || '',
                    latitude: product.location?.coordinates?.[1] || '',
                    longitude: product.location?.coordinates?.[0] || '',
                    availabilityDate: product.availabilityDate ? product.availabilityDate.substring(0, 10) : '',
                    images: product.images || []
                });
                
                console.log('Form data set successfully');
            } else {
                console.log('No product, resetting form...');
                // Reset form for new product
                setFormData({
                    name: '',
                    category: '',
                    quantity: '',
                    unit: 'kg',
                    price: '',
                    description: '',
                    location: '',
                    latitude: '',
                    longitude: '',
                    availabilityDate: '',
                    images: []
                });
            }
        } catch (error) {
            console.error('❌ Error loading product data:', error);
            console.error('Error details:', error.message);
            console.error('Product that caused error:', product);
            // Set default values if there's an error
            setFormData({
                name: '',
                category: '',
                quantity: '',
                unit: 'kg',
                price: '',
                description: '',
                location: '',
                latitude: '',
                longitude: '',
                availabilityDate: '',
                images: []
            });
        }
    }, [product]);

    const { name, category, quantity, unit, price, description, location, availabilityDate } = formData;

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            if (product) {
                // Edit mode (not implemented fully in this snippet for brevity, but logic is here)
                await axios.put(`/api/products/${product._id}`, formData, config);
            } else {
                await axios.post('/api/products', formData, config);
            }
            onProductAdded();
            if (setEditingProduct) setEditingProduct(null);
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || 'Error saving product';
            
            if (error.response?.status === 403) {
                alert('Access denied. Please make sure you are logged in as a farmer.');
            } else {
                alert(errorMessage);
            }
        }
    };

    return (
        <div className='card product-form-card'>
            <h3>{product ? 'Edit Listing' : 'Add New Produce'}</h3>
            <form onSubmit={handleSubmit}>
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>Crop Name</label>
                        <input className='input-field' name='name' value={name} onChange={onChange} required placeholder='e.g., Organic Tomatoes' />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Category</label>
                        <select className='input-field' name='category' value={category} onChange={onChange} required>
                            <option value=''>Select Category</option>
                            <option value='Vegetables'>Vegetables</option>
                            <option value='Fruits'>Fruits</option>
                            <option value='Grains'>Grains</option>
                            <option value='Dairy'>Dairy</option>
                            <option value='Meat'>Meat</option>
                            <option value='Other'>Other</option>
                        </select>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>Quantity</label>
                        <input className='input-field' type='number' name='quantity' value={quantity} onChange={onChange} required />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Unit</label>
                        <select className='input-field' name='unit' value={unit} onChange={onChange}>
                            <option value='kg'>kg</option>
                            <option value='ton'>ton</option>
                            <option value='liter'>liter</option>
                            <option value='ml'>ml</option>
                            <option value='basket'>basket</option>
                            <option value='piece'>piece</option>
                        </select>
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Price (₹)</label>
                        <input className='input-field' type='number' name='price' value={price} onChange={onChange} required />
                    </div>
                </div>
                <div className='form-group'>
                    <label className='form-label'>Description</label>
                    <textarea className='input-field' name='description' value={description} onChange={onChange} required rows='3'></textarea>
                </div>

                <div className='form-group'>
                    <label className='form-label'>Image</label>
                    <input
                        type='text'
                        placeholder='Enter image URL'
                        value={formData.images && formData.images[0]}
                        onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                        className='input-field'
                        style={{ marginBottom: '0.5rem' }}
                    />
                    <input
                        type='file'
                        id='image-file'
                        label='Choose File'
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            const formDataUpload = new FormData();
                            formDataUpload.append('image', file);
                            try {
                                const config = {
                                    headers: {
                                        'Content-Type': 'multipart/form-data',
                                    },
                                };
                                const { data } = await axios.post('/api/upload', formDataUpload, config);
                                // Prepend server URL if handled by backend static serving
                                setFormData({ ...formData, images: [`${data.image}`] });
                            } catch (error) {
                                console.error(error);
                                alert('Image upload failed');
                            }
                        }}
                    />
                </div>
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>
                            Location Check
                            {locationLoading && <span style={{ marginLeft: '0.5rem', color: '#3a7d44', fontSize: '0.9rem' }}>🌍 Detecting location...</span>}
                            {locationDetected && !locationLoading && <span style={{ marginLeft: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>✅ Location detected</span>}
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                className='input-field' 
                                name='location' 
                                value={location} 
                                onChange={onChange} 
                                required 
                                placeholder={locationLoading ? "Detecting location..." : "Address / City"}
                                disabled={locationLoading}
                            />
                            <button
                                type="button"
                                className='btn btn-outline'
                                onClick={detectLocation}
                                disabled={locationLoading}
                                style={{ minWidth: '120px' }}
                            >
                                {locationLoading ? '🌍 Detecting...' : '📍 Detect Location'}
                            </button>
                        </div>
                        {!product && !locationDetected && !locationLoading && (
                            <small style={{ color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                                💡 Tip: Allow location access for automatic detection
                            </small>
                        )}
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>Latitude {formData.latitude && <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓</span>}</label>
                        <input 
                            className='input-field' 
                            type="number" 
                            step="any" 
                            name='latitude' 
                            value={formData.latitude || ''} 
                            onChange={onChange} 
                            placeholder="e.g. 28.7041"
                            readOnly={locationLoading}
                        />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Longitude {formData.longitude && <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓</span>}</label>
                        <input 
                            className='input-field' 
                            type="number" 
                            step="any" 
                            name='longitude' 
                            value={formData.longitude || ''} 
                            onChange={onChange} 
                            placeholder="e.g. 77.1025"
                            readOnly={locationLoading}
                        />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Available Date</label>
                        <input className='input-field' type='date' name='availabilityDate' value={availabilityDate} onChange={onChange} />
                    </div>
                </div>

                <button type='submit' className='btn btn-primary'>{product ? 'Update Listing' : 'Post Listing'}</button>
                {setEditingProduct && <button type='button' className='btn btn-outline' style={{ marginLeft: '1rem' }} onClick={() => setEditingProduct(null)}>Cancel</button>}
            </form>
        </div>
    );
};

export default ProductForm;
