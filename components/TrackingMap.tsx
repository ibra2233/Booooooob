
import React, { useEffect, useRef } from 'react';
import { Location } from '../types';
// Import Leaflet as L to provide the required namespace and functions
import * as L from 'leaflet';
// Import Leaflet CSS to ensure the map renders correctly
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  driverLoc?: Location;
  customerLoc?: Location;
  isSimulating?: boolean;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ driverLoc, customerLoc, isSimulating }) => {
  // Use L namespace for type definitions
  const mapRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([24.7136, 46.6753], 12); // Default to Riyadh
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Driver Marker
    if (driverLoc) {
      if (!driverMarkerRef.current) {
        const driverIcon = L.divIcon({
          html: '<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 13.1V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>',
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        driverMarkerRef.current = L.marker([driverLoc.lat, driverLoc.lng], { icon: driverIcon }).addTo(map).bindPopup('Driver Location');
      } else {
        driverMarkerRef.current.setLatLng([driverLoc.lat, driverLoc.lng]);
      }
    }

    // Customer Marker
    if (customerLoc) {
      if (!customerMarkerRef.current) {
        const customerIcon = L.divIcon({
          html: '<div class="bg-red-600 p-2 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>',
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        customerMarkerRef.current = L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon }).addTo(map).bindPopup('Delivery Point');
      } else {
        customerMarkerRef.current.setLatLng([customerLoc.lat, customerLoc.lng]);
      }
    }

    // Auto-fit bounds
    if (driverLoc || customerLoc) {
      const group = L.featureGroup([
        ...(driverMarkerRef.current ? [driverMarkerRef.current] : []),
        ...(customerMarkerRef.current ? [customerMarkerRef.current] : [])
      ]);
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 15 });
      }
    }

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [driverLoc, customerLoc]);

  return (
    <div className="relative h-full w-full">
      <div id="map" className="z-0 border shadow-inner h-full w-full min-h-[400px]"></div>
      {isSimulating && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full animate-pulse z-[1000]">
          Live Tracking Active
        </div>
      )}
    </div>
  );
};

export default TrackingMap;
