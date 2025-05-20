import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet'; // For custom marker icons
import { Box, Text, Heading } from '@chakra-ui/react';

// Define a custom icon for markers to ensure they load correctly in Vite
const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
});

function MapComponent({ data }) {
    // Default center on New York City if no data, or center on first result
    const center = data.length > 0 ? [data[0].coordinates[1], data[0].coordinates[0]] : [40.7128, -74.0060];

    return (
        <Box h="100%" w="100%" borderRadius="md" overflow="hidden" boxShadow="md">
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {data.map((point, idx) => (
                    <Marker key={idx} position={[point.coordinates[1], point.coordinates[0]]} icon={customIcon}>
                        <Popup>
                            <Box p={2} maxW={200} bg="white" borderRadius="md">
                                <Heading as="h3" size="sm" mb={2}>
                                    {new Date(point.date).toLocaleDateString()}
                                </Heading>
                                <Text fontSize="sm">Temp: {point.temperature}°C</Text>
                                <Text fontSize="sm">Rain: {point.precipitation}mm</Text>
                                <Text fontSize="sm">Humidity: {point.humidity}%</Text>
                                <Text fontSize="sm">Solar: {point.solar} W/m²</Text>
                            </Box>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </Box>
    );
}

export default MapComponent;
