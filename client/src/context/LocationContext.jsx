import { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export const LocationProvider = ({ children }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [nearbyRadius, setNearbyRadius] = useState(10); // Default 10km
    const [locationName, setLocationName] = useState(null); // Human-readable location name

    // Reverse geocode coordinates to get location name
    const reverseGeocode = async (latitude, longitude) => {
        try {
            // Using OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();
            
            // Extract meaningful location name with priority for city/town
            const address = data.address || {};
            let locationParts = [];
            
            // Priority 1: City, Town, or Village
            if (address.city) {
                locationParts.push(address.city);
            } else if (address.town) {
                locationParts.push(address.town);
            } else if (address.village) {
                locationParts.push(address.village);
            } else if (address.municipality) {
                locationParts.push(address.municipality);
            } else if (address.county) {
                locationParts.push(address.county);
            } else if (address.suburb) {
                locationParts.push(address.suburb);
            } else if (address.neighbourhood) {
                locationParts.push(address.neighbourhood);
            }
            
            // Priority 2: State/Region (always add if available)
            if (address.state) {
                locationParts.push(address.state);
            } else if (address.region) {
                locationParts.push(address.region);
            }
            
            // If we have location parts, join them
            if (locationParts.length > 0) {
                return locationParts.join(', ');
            }
            
            // Fallback: Use first 2-3 parts of display name
            if (data.display_name) {
                const parts = data.display_name.split(',').slice(0, 3).map(p => p.trim());
                return parts.join(', ');
            }
            
            // Last resort
            return 'Your Location';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return null;
        }
    };

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

    // Get user's current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            setIsLoadingLocation(true);
            setLocationError(null);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setUserLocation(location);
                    setLocationPermission('granted');
                    
                    // Get human-readable location name
                    const name = await reverseGeocode(location.latitude, location.longitude);
                    setLocationName(name);
                    
                    setIsLoadingLocation(false);
                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Unable to get your location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            setLocationPermission('denied');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred';
                            break;
                    }
                    setLocationError(errorMessage);
                    setIsLoadingLocation(false);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    };

    // Filter farms by distance
    const filterFarmsByDistance = (farms, maxDistance = nearbyRadius) => {
        if (!userLocation || !farms) return farms;

        return farms.filter(farm => {
            // Check if farm has location data
            if (!farm.location || !farm.location.coordinates) {
                return true; // Include farms without location data
            }

            const farmLat = farm.location.coordinates.latitude || farm.location.latitude;
            const farmLon = farm.location.coordinates.longitude || farm.location.longitude;

            if (!farmLat || !farmLon) {
                return true; // Include farms with incomplete location data
            }

            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                farmLat,
                farmLon
            );

            return distance <= maxDistance;
        });
    };

    // Add distance to farms
    const addDistanceToFarms = (farms) => {
        if (!userLocation || !farms) return farms;

        return farms.map(farm => {
            if (!farm.location || !farm.location.coordinates) {
                return { ...farm, distance: null };
            }

            const farmLat = farm.location.coordinates.latitude || farm.location.latitude;
            const farmLon = farm.location.coordinates.longitude || farm.location.longitude;

            if (!farmLat || !farmLon) {
                return { ...farm, distance: null };
            }

            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                farmLat,
                farmLon
            );

            return { ...farm, distance: Math.round(distance * 10) / 10 }; // Round to 1 decimal
        });
    };

    // Reset location
    const resetLocation = () => {
        setUserLocation(null);
        setLocationName(null);
        setLocationPermission('prompt');
        setLocationError(null);
    };

    const value = {
        userLocation,
        locationName,
        locationPermission,
        isLoadingLocation,
        locationError,
        nearbyRadius,
        setNearbyRadius,
        getCurrentLocation,
        calculateDistance,
        filterFarmsByDistance,
        addDistanceToFarms,
        resetLocation
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;