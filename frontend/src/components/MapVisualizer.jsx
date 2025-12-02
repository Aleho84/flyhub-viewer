import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Componente para auto-centrar el mapa
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng]);
        }
    }, [lat, lng, map]);
    return null;
};

// Icono personalizado para punto individual (círculo azul)
const createCustomIcon = () => {
    return L.divIcon({
        className: 'bg-transparent',
        html: `<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8], // Centro del icono
        popupAnchor: [0, -10]
    });
};

// Función para crear icono de cluster personalizado (números oscuros)
const createClusterCustomIcon = (cluster) => {
    return L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-slate-200 text-slate-900 rounded-full font-bold border-2 border-slate-400 shadow-md opacity-90 hover:opacity-100 transition-opacity">
                 ${cluster.getChildCount()}
               </div>`,
        className: 'bg-transparent',
        iconSize: L.point(32, 32, true),
    });
};

const MapVisualizer = ({ filters, onImageClick }) => {
    const [markers, setMarkers] = useState([]);
    const [center, setCenter] = useState([-34.6037, -58.3816]); // Por defecto: Buenos Aires
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMapData();
    }, [filters]);

    const fetchMapData = async () => {
        setLoading(true);
        try {
            // Obtener TODAS las imágenes para el mapa (límite=0 o un número alto)
            const params = {
                ...filters,
                limit: 5000,
                page: 1
            };

            const response = await axios.get('http://localhost:5000/api/images', { params });
            const images = response.data.images;

            // Filtrar imágenes con coordenadas válidas
            const validMarkers = images.filter(img =>
                img.location &&
                img.location.coordinates &&
                img.location.coordinates.length === 2
            ).map(img => ({
                ...img,
                lat: img.location.coordinates[1], // Mongo es [long, lat]
                lng: img.location.coordinates[0]
            }));

            setMarkers(validMarkers);

            // Calcular centro
            if (validMarkers.length > 0) {
                const avgLat = validMarkers.reduce((sum, m) => sum + m.lat, 0) / validMarkers.length;
                const avgLng = validMarkers.reduce((sum, m) => sum + m.lng, 0) / validMarkers.length;
                setCenter([avgLat, avgLng]);
            }

        } catch (error) {
            console.error("Error fetching map data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full relative z-0 bg-slate-800">
            {loading && (
                <div className="absolute inset-0 bg-slate-900/50 z-[1000] flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RecenterAutomatically lat={center[0]} lng={center[1]} />

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                >
                    {markers.map((marker) => (
                        <Marker
                            key={marker._id}
                            position={[marker.lat, marker.lng]}
                            icon={createCustomIcon()}
                            eventHandlers={{
                                click: () => onImageClick(marker),
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <img
                                        src={`http://localhost:5000/images/${marker.filePath}`}
                                        alt={marker.filename}
                                        className="w-24 h-24 object-cover mb-2 rounded"
                                    />
                                    <p className="text-xs font-bold">{marker.filename}</p>
                                    <p className="text-xs text-gray-500">{new Date(marker.captureDate).toLocaleDateString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default MapVisualizer;
