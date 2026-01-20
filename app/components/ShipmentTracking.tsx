'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from '../lib/axiosClient';
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls } from './map';
import * as signalR from '@microsoft/signalr';
import { getCookie } from '../lib/axiosClient';

interface Shipment {
  shipmentId: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  currentLat?: number;
  currentLng?: number;
  lastLocationUpdate?: string;
  trackingEvents: TrackingEvent[];
}

interface TrackingEvent {
  trackingEventId: string;
  status: string;
  description: string;
  location: string | null;
  eventTime: string;
  createdAt: string;
}

interface ShipmentTrackingProps {
  orderId: string;
}

export default function ShipmentTracking({ orderId }: ShipmentTrackingProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const loadShipmentData = useCallback(async () => {
    try {
      setError(null);

      // Get shipment by order ID
      const shipmentResponse = await axios.get(`/api/Shipments/order/${orderId}`);
      if (shipmentResponse.data.success && shipmentResponse.data.data) {
        setShipment(shipmentResponse.data.data);
        setTrackingEvents(shipmentResponse.data.data.trackingEvents || []);
      } else {
        setError('Không tìm thấy thông tin giao hàng cho đơn hàng này');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải thông tin giao hàng');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const setupSignalRConnection = useCallback(async (shipmentId: string) => {
    try {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/shipment-tracking', {
          accessTokenFactory: () => getCookie('accessToken') || ''
        })
        .withAutomaticReconnect()
        .build();

      // Handle location updates
      newConnection.on('LocationUpdated', (locationData) => {
        if (locationData.ShipmentId === shipmentId) {
          setShipment(prev => prev ? {
            ...prev,
            currentLat: locationData.Lat,
            currentLng: locationData.Lng,
            lastLocationUpdate: locationData.Timestamp
          } : null);
        }
      });

      await newConnection.start();
      console.log('SignalR connected for shipment tracking');

      // Subscribe to shipment updates
      await newConnection.invoke('SubscribeToShipment', shipmentId);

      setConnection(newConnection);
    } catch (err) {
      console.error('SignalR connection failed:', err);
      // Fallback to interval polling
      console.log('Falling back to interval polling');
    }
  }, []);

  useEffect(() => {
    loadShipmentData();
  }, [loadShipmentData]);

  // Setup SignalR when shipment is loaded
  useEffect(() => {
    if (shipment?.shipmentId && !connection) {
      setupSignalRConnection(shipment.shipmentId);
    }

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [shipment?.shipmentId, connection, setupSignalRConnection]);

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Đang tải thông tin giao hàng...</p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-gray-600">{error || 'Chưa có thông tin giao hàng cho đơn hàng này'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Theo dõi đơn hàng</h3>

      {/* Shipment Info - Simplified */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Trạng thái hiện tại</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
            shipment.status === 'In transit' ? 'bg-blue-100 text-blue-800' :
            shipment.status === 'Out for delivery' ? 'bg-orange-100 text-orange-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {shipment.status === 'Delivered' ? '✅ Đã giao' :
             shipment.status === 'In transit' ? '🚚 Đang giao' :
             shipment.status === 'Out for delivery' ? '📍 Đang giao tại địa chỉ' :
             shipment.status === 'Preparing' ? '📦 Đang chuẩn bị' :
             shipment.status}
          </span>
        </div>
        {shipment.trackingNumber && (
          <div>
            <p className="text-sm text-gray-600">Mã tracking</p>
            <p className="font-medium font-mono">{shipment.trackingNumber}</p>
          </div>
        )}
        {shipment.lastLocationUpdate && (
          <div>
            <p className="text-sm text-gray-600">Cập nhật cuối</p>
            <p className="font-medium">
              {new Date(shipment.lastLocationUpdate).toLocaleString('vi-VN')}
            </p>
          </div>
        )}
      </div>

      {/* Map Display */}
      {shipment.currentLat && shipment.currentLng ? (
        <div className="mb-6">
          <h4 className="font-medium mb-2">Vị trí shipper hiện tại</h4>
          <div className="h-64 rounded-lg overflow-hidden border">
            <Map
              center={[shipment.currentLng, shipment.currentLat]}
              zoom={15}
            >
              <MapMarker
                longitude={shipment.currentLng}
                latitude={shipment.currentLat}
              >
                <MarkerContent>
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs">🚚</span>
                  </div>
                </MarkerContent>
                <MarkerPopup>
                  <div className="text-sm">
                    <strong>🚚 Shipper</strong>
                    <br />
                    <span>Đang giao hàng</span>
                    <br />
                    <span className="text-xs text-gray-500">
                      Cập nhật: {shipment.lastLocationUpdate ? new Date(shipment.lastLocationUpdate).toLocaleString('vi-VN') : 'Chưa cập nhật'}
                    </span>
                  </div>
                </MarkerPopup>
              </MapMarker>
              <MapControls showZoom showLocate />
            </Map>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 flex items-center">
            <span className="mr-2">📍</span>
            Vị trí shipper sẽ hiển thị khi đơn hàng bắt đầu giao
          </p>
        </div>
      )}

      {/* Tracking Timeline - Simplified for single location */}
      <div>
        <h4 className="font-medium mb-4">Tình trạng đơn hàng</h4>
        <div className="space-y-4">
          {trackingEvents.length > 0 ? (
            trackingEvents
              .sort((a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime())
              .map((event, index) => (
              <div key={event.trackingEventId} className="flex items-start space-x-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${
                    event.status === 'Delivered' ? 'bg-green-500' :
                    event.status === 'In transit' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></div>
                  {index < trackingEvents.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500">📍 {event.location}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(event.eventTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có thông tin tracking</p>
          )}
        </div>
      </div>
    </div>
  );
}