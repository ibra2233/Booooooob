
import { Order } from './types';

const STORAGE_KEY = 'logitrack_orders';

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  // Dispatch a storage event so other tabs/components can react
  window.dispatchEvent(new Event('storage'));
};

export const updateOrderLocation = (orderCode: string, role: 'driver' | 'customer', location: { lat: number, lng: number }) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.orderCode === orderCode);
  if (index !== -1) {
    if (role === 'driver') {
      orders[index].driverLocation = location;
    } else {
      orders[index].customerLocation = location;
    }
    orders[index].updatedAt = Date.now();
    saveOrders(orders);
  }
};
