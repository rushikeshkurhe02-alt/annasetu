import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'provider' | 'place' | 'ngo';
  badge?: string;
  linkUrl?: string;
  details?: string;
}

interface LeafletMapProps {
  markers: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedMarkerId?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  center = [18.5204, 73.8567], // Pune center
  zoom = 12,
  height = '420px',
  selectedMarkerId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach(marker => {
      let pinColor = '#1F6B3A'; // Provider Green
      let typeLabel = 'Food Provider';

      if (marker.type === 'place') {
        pinColor = '#D97706'; // Place Saffron/Amber
        typeLabel = 'Place in Need';
      } else if (marker.type === 'ngo') {
        pinColor = '#2563EB'; // NGO Blue
        typeLabel = 'NGO Center';
      }

      const isSelected = marker.id === selectedMarkerId;

      // Custom HTML Pin icon to avoid broken default Leaflet image paths
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -28]
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px; min-width: 180px;">
          <div style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; margin-bottom: 2px;">
            ${marker.badge || typeLabel}
          </div>
          <div style="font-weight: 700; color: #111827; font-size: 14px; margin-bottom: 4px;">
            ${marker.title}
          </div>
          ${marker.subtitle ? `<div style="color: #4B5563; font-size: 12px; margin-bottom: 4px;">${marker.subtitle}</div>` : ''}
          ${marker.details ? `<div style="color: #6B7280; font-size: 11px; margin-bottom: 8px; border-top: 1px solid #F3F4F6; padding-top: 4px;">${marker.details}</div>` : ''}
          ${marker.linkUrl ? `<a href="${marker.linkUrl}" style="display: inline-block; font-size: 11px; font-weight: 600; color: #1F6B3A; text-decoration: underline;">View Profile &rarr;</a>` : ''}
        </div>
      `;

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .bindPopup(popupContent);

      markersLayerRef.current?.addLayer(leafletMarker);

      if (isSelected && mapInstanceRef.current) {
        mapInstanceRef.current.setView([marker.lat, marker.lng], 14);
        leafletMarker.openPopup();
      }
    });

    if (markers.length > 1 && !selectedMarkerId && mapInstanceRef.current) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, selectedMarkerId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />
      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-gray-100 z-10 flex items-center gap-3 text-xs font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1F6B3A] inline-block border border-white shadow-xs"></span>
          <span>Providers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D97706] inline-block border border-white shadow-xs"></span>
          <span>Places in Need</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2563EB] inline-block border border-white shadow-xs"></span>
          <span>NGOs</span>
        </div>
      </div>
    </div>
  );
};
