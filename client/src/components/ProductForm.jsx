import { useState } from 'react';
import axios from 'axios';

const ProductForm = ({ onProductAdded, setEditingProduct, product = null }) => {
    const [formData, setFormData] = useState({
        name: product ? product.name : '',
        category: product ? product.category : '',
        quantity: product ? product.quantity : '',
        unit: product ? product.unit : 'kg',
        price: product ? product.price : '',
        description: product ? product.description : '',
        location: product ? (product.location.address || product.location) : '',
        latitude: product && product.location && product.location.coordinates ? product.location.coordinates[1] : '',
        longitude: product && product.location && product.location.coordinates ? product.location.coordinates[0] : '',
        availabilityDate: product ? product.availabilityDate.substring(0, 10) : '',
    });

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
            alert('Error saving product');
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
                        <label className='form-label'>Location Check</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input className='input-field' name='location' value={location} onChange={onChange} required placeholder="Address / City" />
                            <button
                                type="button"
                                className='btn btn-outline'
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((position) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: position.coords.latitude,
                                                longitude: position.coords.longitude
                                            }));
                                            alert("Location fetched!");
                                        }, (err) => {
                                            console.error(err);
                                            alert("Could not get location. Allow access.");
                                        });
                                    } else {
                                        alert("Geolocation not supported");
                                    }
                                }}
                            >
                                Get Coords
                            </button>
                        </div>
                    </div>
                </div>
                <div className='form-row'>
                    <div className='form-group'>
                        <label className='form-label'>Latitude</label>
                        <input className='input-field' type="number" step="any" name='latitude' value={formData.latitude || ''} onChange={onChange} placeholder="e.g. 28.7041" />
                    </div>
                    <div className='form-group'>
                        <label className='form-label'>Longitude</label>
                        <input className='input-field' type="number" step="any" name='longitude' value={formData.longitude || ''} onChange={onChange} placeholder="e.g. 77.1025" />
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
