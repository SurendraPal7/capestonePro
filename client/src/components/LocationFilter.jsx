import { useState } from 'react';
import { FaMapMarkerAlt, FaSpinner, FaExclamationTriangle, FaFilter, FaTimes } from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';
import './LocationFilter.css';

const LocationFilter = ({ onFilterChange, showNearbyOnly, setShowNearbyOnly }) => {
    const {
        userLocation,
        locationName,
        locationPermission,
        isLoadingLocation,
        locationError,
        nearbyRadius,
        setNearbyRadius,
        getCurrentLocation,
        resetLocation
    } = useLocation();

    const [isExpanded, setIsExpanded] = useState(false);

    const handleGetLocation = async () => {
        try {
            await getCurrentLocation();
            if (onFilterChange) {
                onFilterChange(true);
            }
        } catch (error) {
            console.error('Failed to get location:', error);
        }
    };

    const handleToggleNearby = () => {
        const newShowNearby = !showNearbyOnly;
        setShowNearbyOnly(newShowNearby);
        if (onFilterChange) {
            onFilterChange(newShowNearby);
        }
    };

    const handleRadiusChange = (newRadius) => {
        setNearbyRadius(newRadius);
        if (showNearbyOnly && onFilterChange) {
            onFilterChange(true);
        }
    };

    const handleResetLocation = () => {
        resetLocation();
        setShowNearbyOnly(false);
        if (onFilterChange) {
            onFilterChange(false);
        }
    };

    return (
        <div className="location-filter">
            <div className="location-filter-header">
                <button
                    className="location-toggle-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <FaFilter className="filter-icon" />
                    <span>Location Filter</span>
                    {userLocation && (
                        <span className="location-status active">
                            <FaMapMarkerAlt />
                        </span>
                    )}
                </button>
            </div>

            {isExpanded && (
                <div className="location-filter-content">
                    {!userLocation ? (
                        <div className="location-request">
                            <div className="location-info">
                                <FaMapMarkerAlt className="location-icon" />
                                <div>
                                    <h4>Find Nearby Farms</h4>
                                    <p>Allow location access to see farms within {nearbyRadius}km of you</p>
                                </div>
                            </div>
                            
                            {locationError && (
                                <div className="location-error">
                                    <FaExclamationTriangle />
                                    <span>{locationError}</span>
                                </div>
                            )}

                            <button
                                className="btn btn-primary location-btn"
                                onClick={handleGetLocation}
                                disabled={isLoadingLocation}
                            >
                                {isLoadingLocation ? (
                                    <>
                                        <FaSpinner className="spinner" />
                                        Getting Location...
                                    </>
                                ) : (
                                    <>
                                        <FaMapMarkerAlt />
                                        Get My Location
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="location-controls">
                            <div className="location-status-info">
                                <FaMapMarkerAlt className="location-icon active" />
                                <div className="location-details">
                                    <span className="location-text">
                                        {locationName || 'Location detected'}
                                    </span>
                                    {!locationName && userLocation && (
                                        <small>Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}</small>
                                    )}
                                </div>
                                <button
                                    className="reset-location-btn"
                                    onClick={handleResetLocation}
                                    title="Reset location"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="filter-options">
                                <div className="nearby-toggle">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={showNearbyOnly}
                                            onChange={handleToggleNearby}
                                        />
                                        <span className="toggle-slider"></span>
                                        <span className="toggle-text">
                                            Show only nearby farms ({nearbyRadius}km)
                                        </span>
                                    </label>
                                </div>

                                {showNearbyOnly && (
                                    <div className="radius-selector">
                                        <label>Search Radius:</label>
                                        <div className="radius-options">
                                            {[5, 10, 20, 50].map(radius => (
                                                <button
                                                    key={radius}
                                                    className={`radius-btn ${nearbyRadius === radius ? 'active' : ''}`}
                                                    onClick={() => handleRadiusChange(radius)}
                                                >
                                                    {radius}km
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationFilter;