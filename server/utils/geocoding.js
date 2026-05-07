import https from 'https';

/**
 * Geocode an address using Nominatim (OpenStreetMap) API
 * @param {string} address - The address to geocode
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export const geocodeAddress = async (address) => {
    if (!address) return null;
    
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
        
        return new Promise((resolve, reject) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'FarmDirect-App/1.0'
                }
            }, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const results = JSON.parse(data);
                        
                        if (results && results.length > 0) {
                            const result = results[0];
                            resolve({
                                latitude: parseFloat(result.lat),
                                longitude: parseFloat(result.lon)
                            });
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        console.error('Error parsing geocoding response:', error);
                        resolve(null);
                    }
                });
            }).on('error', (error) => {
                console.error('Error geocoding address:', error);
                resolve(null);
            });
        });
    } catch (error) {
        console.error('Error in geocodeAddress:', error);
        return null;
    }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
};

/**
 * Validate coordinates
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const validateCoordinates = (latitude, longitude) => {
    return (
        typeof latitude === 'number' && 
        typeof longitude === 'number' &&
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180
    );
};