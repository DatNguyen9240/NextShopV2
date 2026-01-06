"use client";

import React, { useEffect, useState } from "react";
import { RAPIDAPI_CONFIG } from "@/app/config/rapidapi";

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
          `https://${RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST}/maps/api/place/queryautocomplete/json?input=${encodeURIComponent(
            query
          )}&language=vi&components=country:vn&location=21.028511,105.804817&radius=10000`,
          {
            headers: {
              "x-rapidapi-host": RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST,
              "x-rapidapi-key": RAPIDAPI_CONFIG.GOOGLE_PLACES.API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
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
        `https://${RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST}/maps/api/place/details/json?placeid=${place.place_id}&language=vi`,
        {
          headers: {
            "x-rapidapi-host": RAPIDAPI_CONFIG.GOOGLE_PLACES.HOST,
            "x-rapidapi-key": RAPIDAPI_CONFIG.GOOGLE_PLACES.API_KEY,
          },
        }
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
    </div>
  );
};

export default AddressAutocomplete;
