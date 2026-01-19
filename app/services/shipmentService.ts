import axiosClient from '../lib/axiosClient';

export interface ShipmentResponse {
  shipmentId: string;
  orderId: string;
  shipperId?: string;
  shipper?: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  };
  carrier: string;
  trackingNumber: string;
  status: string;
  createdAt: string;
  currentLat?: number;
  currentLng?: number;
  lastLocationUpdate?: string;
  trackingEvents: TrackingEventResponse[];
}

export interface TrackingEventResponse {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
}

export interface UpdateShipmentRequest {
  shipperId?: string;
  status?: string;
  carrier?: string;
  trackingNumber?: string;
}

export const createShipment = async (request: CreateShipmentRequest): Promise<ShipmentResponse> => {
  const response = await axiosClient.post('/api/shipments', request);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to create shipment');
};

export const fetchAllShipments = async (): Promise<ShipmentResponse[]> => {
  const response = await axiosClient.get('/api/shipments');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch shipments');
};

export const fetchShipmentById = async (id: string): Promise<ShipmentResponse> => {
  const response = await axiosClient.get(`/api/shipments/${id}`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch shipment');
};

export const updateShipment = async (id: string, request: UpdateShipmentRequest): Promise<void> => {
  const response = await axiosClient.put(`/api/shipments/${id}`, request);
  if (!response.data.success) {
    throw new Error('Failed to update shipment');
  }
};

export const deleteShipment = async (id: string): Promise<void> => {
  const response = await axiosClient.delete(`/api/shipments/${id}`);
  if (!response.data.success) {
    throw new Error('Failed to delete shipment');
  }
};

export const fetchShipmentsByStatus = async (status: string): Promise<ShipmentResponse[]> => {
  const response = await axiosClient.get(`/api/shipments/status/${status}`);
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch shipments by status');
};