"use client";

import React, { useEffect, useState } from "react";

interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressAutocompleteProps {
  onSelectAddress: (address: string, placeId: string, latitude?: number | null, longitude?: number | null) => void;
  value: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onSelectAddress, value }) => {
  const [query, setQuery] = useState(value);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  // Keep internal query in sync when parent sets `value` (e.g., when clicking Edit in settings)
  useEffect(() => {
    setQuery(value || '');
    // mark as selected so suggestions don't show immediately when value is programmatically set
    setIsSelected(Boolean(value));
  }, [value]);

  useEffect(() => {
    const searchPlaces = async () => {
      if (query.length < 3 || isSelected) {
        setPlaces([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          setErrorStatus(response.status);
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setErrorStatus(null);
        if (data.status === "OK" || data.status === "ZERO_RESULTS") {
          setPlaces(data.predictions || []);
        } else {
          throw new Error(data.error_message || "API returned an error");
        }
      } catch (error) {
        console.error("Error fetching places:", error);
        setPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [query, isSelected]);

  const handleSelect = async (place: Place) => {
    setQuery(place.description);
    setPlaces([]);
    setIsSelected(true);

    // fetch place details to get geometry
    try {
      const resp = await fetch(
        `/api/places/details?placeid=${place.place_id}`
      );

      if (!resp.ok) throw new Error("Failed to fetch place details");
      const details = await resp.json();
      const location = details?.result?.geometry?.location;
      const lat = location?.lat ?? null;
      const lng = location?.lng ?? null;
      onSelectAddress(place.description, place.place_id, lat, lng);
    } catch (err) {
      console.error("Error fetching place details", err);
      onSelectAddress(place.description, place.place_id, null, null);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsSelected(false);
        }}
        placeholder="Nhập địa chỉ tại Việt Nam..."
        className="w-full p-3 border rounded-lg"
      />

      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
        </div>
      )}

      {places.length > 0 && !isSelected && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {places.map((place) => (
            <div
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="p-3 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{place.structured_formatting.main_text}</div>
              <div className="text-sm text-gray-600">{place.structured_formatting.secondary_text}</div>
            </div>
          ))}
        </div>
      )}

      {errorStatus === 429 && !isSelected && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-yellow-400 p-3 rounded-lg shadow-lg text-sm text-yellow-700">
          ⚠️ Tìm kiếm đang bận hoặc quá tải (429). Vui lòng thử lại sau vài giây.
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
