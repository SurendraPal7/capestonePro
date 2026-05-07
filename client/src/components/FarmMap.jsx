import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTractor, FaMapMarkerAlt } from 'react-icons/fa';
import './FarmMap.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FarmMap = ({ farms, userLocation, onFarmSelect, selectedFarm }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Create custom icons
    const createFarmIcon = () => {
        return L.divIcon({
            html: `<div class="custom-farm-marker">
                     <div class="marker-icon">🚜</div>
                   </div>`,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    };

    const createUserIcon = () => {
        return L.divIcon({
            html: `<div class="custom-user-marker">
                     <div class="marker-icon">📍</div>
                   </div>`,
            className: 'custom-marker',
            iconSize: [25, 25],
            iconAnchor: [12.5, 25],
            popupAnchor: [0, -25]
        });
    };

    const createSelectedFarmIcon = () => {
        return L.divIcon({
            html: `<div class="custom-farm-marker selected">
                     <div class="marker-icon">🚜</div>
                   </div>`,
            className: 'custom-marker',
            iconSize: [35, 35],
            iconAnchor: [17.5, 35],
            popupAnchor: [0, -35]
        });
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current, {
            center: userLocation ? [userLocation.latitude, userLocation.longitude] : [39.8283, -98.5795], // Center of US
            zoom: userLocation ? 12 : 4,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => {
            mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];

        const bounds = L.latLngBounds();
        let hasValidBounds = false;

        // Add user location marker
        if (userLocation) {
            const userMarker = L.marker(
                [userLocation.latitude, userLocation.longitude],
                { icon: createUserIcon() }
            ).addTo(mapInstanceRef.current);

            userMarker.bindPopup(`
                <div class="map-popup user-popup">
                    <h4>Your Location</h4>
                    <p>This is your current location</p>
                </div>
            `);

            markersRef.current.push(userMarker);
            bounds.extend([userLocation.latitude, userLocation.longitude]);
            hasValidBounds = true;
        }

        // Add farm markers
        farms.forEach(farm => {
            const farmLat = farm.location?.coordinates?.latitude || farm.location?.latitude;
            const farmLon = farm.location?.coordinates?.longitude || farm.location?.longitude;

            if (farmLat && farmLon) {
                const isSelected = selectedFarm && selectedFarm._id === farm._id;
                const farmIcon = isSelected ? createSelectedFarmIcon() : createFarmIcon();
                
                const farmMarker = L.marker([farmLat, farmLon], { icon: farmIcon })
                    .addTo(mapInstanceRef.current);

                const distanceText = farm.distance !== null && farm.distance !== undefined 
                    ? `<p><strong>Distance:</strong> ${farm.distance}km away</p>` 
                    : '';

                farmMarker.bindPopup(`
                    <div class="map-popup farm-popup">
                        <h4>${farm.farmName || farm.name}</h4>
                        <p><strong>Location:</strong> ${farm.location?.address || 'Local Farm'}</p>
                        ${distanceText}
                        <button class="popup-btn" onclick="window.selectFarm('${farm._id}')">
                            View Farm Details
                        </button>
                    </div>
                `);

                farmMarker.on('click', () => {
                    if (onFarmSelect) {
                        onFarmSelect(farm);
                    }
                });

                markersRef.current.push(farmMarker);
                bounds.extend([farmLat, farmLon]);
                hasValidBounds = true;
            }
        });

        // Fit map to bounds if we have valid coordinates
        if (hasValidBounds && bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, { 
                padding: [20, 20],
                maxZoom: 15 
            });
        }

        // Global function for popup buttons
        window.selectFarm = (farmId) => {
            const farm = farms.find(f => f._id === farmId);
            if (farm && onFarmSelect) {
                onFarmSelect(farm);
            }
        };

        return () => {
            window.selectFarm = null;
        };
    }, [farms, userLocation, selectedFarm, onFarmSelect]);

    return (
        <div className="farm-map-container">
            <div className="map-header">
                <h3>Farm Locations</h3>
                <div className="map-legend">
                    <div className="legend-item">
                        <span className="legend-icon user">📍</span>
                        <span>Your Location</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-icon farm">🚜</span>
                        <span>Farms</span>
                    </div>
                </div>
            </div>
            <div ref={mapRef} className="leaflet-map" />
        </div>
    );
};

export default FarmMap;