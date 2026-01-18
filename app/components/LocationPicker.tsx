"use client";
import React, { useState, useCallback } from 'react';
import { Map, MapMarker, MarkerContent, MapControls, useMap } from "@/app/components/map";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  positionLat?: number | null;
  positionLng?: number | null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const { map } = useMap();

  const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  React.useEffect(() => {
    if (!map) return;
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng, positionLat, positionLng }: LocationPickerProps) {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLng, initialLat] : null
  );

  // Update marker position when props change
  React.useEffect(() => {
    if (positionLat !== null && positionLng !== null && positionLat !== undefined && positionLng !== undefined) {
      setMarkerPosition([positionLng, positionLat]);
    }
  }, [positionLat, positionLng]);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    setMarkerPosition([lng, lat]);
    onLocationSelect(lat, lng);
  }, [onLocationSelect]);

  const center: [number, number] = markerPosition || [105.8542, 21.0285]; // Hanoi as default

  return (
    <div className="h-64 w-full">
      <Map center={center} zoom={13}>
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        {markerPosition && (
          <MapMarker longitude={markerPosition[0]} latitude={markerPosition[1]}>
            <MarkerContent>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            </MarkerContent>
          </MapMarker>
        )}
        <MapControls showZoom showLocate />
      </Map>
    </div>
  );
}