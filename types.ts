
export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Location {
  lat: number;
  lng: number;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  city: string;
  quantity: number;
  status: OrderStatus;
  customerLocation?: Location;
  driverLocation?: Location;
  updatedAt: number;
}

export type AppView = 'admin' | 'user' | 'driver';
