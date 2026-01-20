'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../lib/axiosClient';
import * as signalR from '@microsoft/signalr';
import { getCookie } from '../lib/axiosClient';
import { Map, MapMarker, MarkerContent, MapRoute } from "@/app/components/map";

interface TrackingEvent {
  trackingEventId: string;
  status: string;
  description: string;
  location: string | null;
  eventTime: string;
  createdAt: string;
}

interface Order {
  shipmentId: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  currentLat?: number;
  currentLng?: number;
  lastLocationUpdate?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryAddress?: string;
  trackingEvents: TrackingEvent[];
  routeCoordinates?: [number, number][]; // Route from shipper to delivery
}

export default function ShipperPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getRouteCoordinates = async (fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<[number, number][] | null> => {
    try {
      // Use Next.js API route to avoid CORS issues
      const url = `/api/route?fromLat=${fromLat}&fromLng=${fromLng}&toLat=${toLat}&toLng=${toLng}`;
      console.log('Fetching route from API:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        let coordinates = data.routes[0].geometry.coordinates as [number, number][];
        
        // Ensure route starts exactly at fromLng, fromLat
        if (coordinates[0][0] !== fromLng || coordinates[0][1] !== fromLat) {
          coordinates = [[fromLng, fromLat], ...coordinates];
        }
        
        // Ensure route ends exactly at toLng, toLat
        const lastIdx = coordinates.length - 1;
        if (coordinates[lastIdx][0] !== toLng || coordinates[lastIdx][1] !== toLat) {
          coordinates = [...coordinates, [toLng, toLat]];
        }
        
        console.log(`Route found: ${coordinates.length} points, distance: ${(data.routes[0].distance / 1000).toFixed(2)}km`);
        return coordinates;
      } else {
        console.error('No route found:', data);
      }
    } catch (error) {
      console.error('Route fetch error:', error);
    }
    return null;
  };

  useEffect(() => {
    loadAssignedOrders();
    setupSignalR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch routes when current location or orders change
  useEffect(() => {
    if (!currentLocation || orders.length === 0) return;

    console.log('Fetching routes for', orders.length, 'orders');
    const fetchRoutes = async () => {
      const updatedOrders = await Promise.all(orders.map(async (order) => {
        if (order.deliveryLat && order.deliveryLng) {
          console.log('Fetching route for order:', order.shipmentId);
          // Always fetch fresh route based on current location
          const route = await getRouteCoordinates(
            currentLocation.lat,
            currentLocation.lng,
            order.deliveryLat,
            order.deliveryLng
          );
          if (route) {
            console.log('Route fetched successfully:', route.length, 'points');
            return { ...order, routeCoordinates: route };
          } else {
            console.log('No route found for order:', order.shipmentId);
          }
        }
        return order;
      }));
      console.log('Setting updated orders with routes');
      setOrders(updatedOrders);
    };

    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation?.lat, currentLocation?.lng, orders.length]);

  const loadAssignedOrders = async () => {
    try {
      const response = await axios.get('/api/Shipper/my-shipments');
      console.log('Shipments response:', response.data);
      if (response.data.success) {
        const orders = response.data.data;
        console.log('Orders from API:', orders);
        setOrders(orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Location updated:', latitude, longitude);
          setCurrentLocation({ lat: latitude, lng: longitude });
          // Send location update via SignalR for active shipments
          if (connectionRef.current) {
            orders.filter(o => o.status === 'In transit').forEach(order => {
              connectionRef.current!.invoke('UpdateLocation', order.shipmentId, latitude, longitude);
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 27000 }
      );
    }
  }, [orders]);

  const setupSignalR = async () => {
    if (connectionRef.current) return; // Prevent multiple setups

    try {
      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5048/hubs/shipment-tracking', {
          accessTokenFactory: () => getCookie('accessToken') || ''
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      newConnection.onclose(() => {
        console.log('SignalR connection closed');
      });

      newConnection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
      });

      newConnection.onreconnected(() => {
        console.log('SignalR reconnected');
      });

      // Listen for location updates
      newConnection.on('LocationUpdate', (shipmentId: string, latitude: number, longitude: number) => {
        console.log(`Location update for shipment ${shipmentId}: ${latitude}, ${longitude}`);
        // Update the order with new location
        setOrders(prev => prev.map(order =>
          order.shipmentId === shipmentId
            ? { ...order, currentLat: latitude, longitude, lastLocationUpdate: new Date().toISOString() }
            : order
        ));
      });

      await newConnection.start();
      console.log('SignalR connected for shipper');

      connectionRef.current = newConnection;
      getCurrentLocation(); // Start location tracking after connection
    } catch (err) {
      console.error('SignalR connection failed:', err);
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        console.log('Retrying SignalR connection...');
        setupSignalR();
      }, 5000);
    }
  };

  const startDelivery = async (shipmentId: string) => {
    try {
      await axios.put(`/api/Shipper/shipments/${shipmentId}/start-delivery`);
      // Update order status
      setOrders(prev => prev.map(order =>
        order.shipmentId === shipmentId ? { ...order, status: 'In transit' } : order
      ));
      // Subscribe to shipment updates
      if (connectionRef.current) {
        await connectionRef.current.invoke('SubscribeToShipment', shipmentId);
        console.log(`Subscribed to shipment ${shipmentId}`);
      }
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  };

  const completeDelivery = async (shipmentId: string) => {
    try {
      await axios.put(`/api/Shipper/shipments/${shipmentId}/deliver`);
      // Update order status
      setOrders(prev => prev.map(order =>
        order.shipmentId === shipmentId ? { ...order, status: 'Delivered' } : order
      ));
      // Unsubscribe from shipment updates
      if (connectionRef.current) {
        await connectionRef.current.invoke('UnsubscribeFromShipment', shipmentId);
        console.log(`Unsubscribed from shipment ${shipmentId}`);
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shipper Dashboard</h1>

      {currentLocation && (
        <div className="mb-4 p-2 bg-blue-100 rounded">
          Vị trí hiện tại: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </div>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.shipmentId} className="border p-4 rounded-lg">
            <h3 className="font-semibold">Shipment #{order.shipmentId}</h3>
            <p>Order ID: {order.orderId}</p>
            <p>Carrier: {order.carrier}</p>
            <p>Tracking: {order.trackingNumber}</p>
            <p>Status: {order.status}</p>
            {order.deliveryAddress && <p>Địa chỉ giao: {order.deliveryAddress}</p>}
            {order.currentLat && order.currentLng && (
              <p>Vị trí hiện tại: {order.currentLat.toFixed(6)}, {order.currentLng.toFixed(6)}</p>
            )}
            {order.lastLocationUpdate && (
              <p>Cập nhật cuối: {new Date(order.lastLocationUpdate).toLocaleString()}</p>
            )}
            {order.status === 'Preparing' && (
              <button
                onClick={() => startDelivery(order.shipmentId)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Bắt đầu giao hàng
              </button>
            )}
            {order.status === 'In transit' && (
              <button
                onClick={() => completeDelivery(order.shipmentId)}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
              >
                Hoàn thành giao hàng
              </button>
            )}
          </div>
        ))}
      </div>

      {currentLocation && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Bản đồ</h2>
          <p className="text-sm text-gray-600 mb-2">Màu xanh lá: Vị trí shipper | Màu đỏ: Vị trí lô hàng hiện tại | Màu xanh dương: Địa điểm giao hàng</p>
          <div className="mb-2 text-sm text-gray-600">
            Số lô hàng có vị trí giao: {orders.filter(o => o.deliveryLat && o.deliveryLng).length} / {orders.length}
          </div>
          <div className="h-96 w-full">
            <Map center={[currentLocation.lng, currentLocation.lat]} zoom={13}>
              {/* Marker for shipper */}
              <MapMarker longitude={currentLocation.lng} latitude={currentLocation.lat}>
                <MarkerContent>
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                </MarkerContent>
              </MapMarker>
              {/* Markers for shipments */}
              {orders.filter(o => o.currentLat && o.currentLng).map(order => {
                console.log('Rendering shipment marker:', order.shipmentId, order.currentLat, order.currentLng);
                return (
                  <MapMarker key={order.shipmentId} longitude={order.currentLng!} latitude={order.currentLat!}>
                    <MarkerContent>
                      <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                    </MarkerContent>
                  </MapMarker>
                );
              })}
              {/* Markers for delivery locations */}
              {orders.filter(o => o.deliveryLat && o.deliveryLng).map(order => {
                console.log('Rendering delivery marker:', order.shipmentId, order.deliveryLat, order.deliveryLng, order.deliveryAddress);
                return (
                  <MapMarker key={`delivery-${order.shipmentId}`} longitude={order.deliveryLng!} latitude={order.deliveryLat!}>
                    <MarkerContent>
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                    </MarkerContent>
                  </MapMarker>
                );
              })}
              {/* Routes from shipper to delivery locations (in transit) - using road routing */}
              {orders.filter(o => o.deliveryLat && o.deliveryLng && o.status === 'In transit' && o.routeCoordinates).map(order => (
                <MapRoute
                  key={`route-${order.shipmentId}`}
                  coordinates={order.routeCoordinates!}
                  color="#3b82f6"
                  width={4}
                  opacity={0.8}
                />
              ))}
              {/* Routes from shipper to pending delivery locations */}
              {orders.filter(o => o.deliveryLat && o.deliveryLng && o.status !== 'In transit' && o.status !== 'Delivered' && o.routeCoordinates).map(order => (
                <MapRoute
                  key={`route-pending-${order.shipmentId}`}
                  coordinates={order.routeCoordinates!}
                  color="#9ca3af"
                  width={3}
                  opacity={0.5}
                  dashArray={[4, 6]}
                />
              ))}
            </Map>
          </div>
        </div>
      )}
    </div>
  );
}