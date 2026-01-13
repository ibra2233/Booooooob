
import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { getOrders, updateOrderLocation, saveOrders } from '../store';
import { Truck, Navigation, PackageCheck, AlertCircle } from 'lucide-react';

const DriverView: React.FC = () => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDriving, setIsDriving] = useState(false);
  const driverPosRef = useRef({ lat: 24.7136, lng: 46.6753 });
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const load = () => {
      const all = getOrders();
      setOrders(all.filter(o => o.status === 'Out for Delivery'));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const startDelivery = (order: Order) => {
    setActiveOrder(order);
    // Initialize customer position if not set (randomized nearby)
    if (!order.customerLocation) {
        const custLoc = {
            lat: 24.7136 + (Math.random() - 0.5) * 0.1,
            lng: 46.6753 + (Math.random() - 0.5) * 0.1
        };
        updateOrderLocation(order.orderCode, 'customer', custLoc);
    }
    
    setIsDriving(true);
    
    // Simple simulation: move driver toward customer
    intervalRef.current = window.setInterval(() => {
        const currentOrders = getOrders();
        const currentOrder = currentOrders.find(o => o.id === order.id);
        if (!currentOrder || !currentOrder.customerLocation) return;

        const cust = currentOrder.customerLocation;
        const dLat = (cust.lat - driverPosRef.current.lat) * 0.05;
        const dLng = (cust.lng - driverPosRef.current.lng) * 0.05;
        
        driverPosRef.current = {
            lat: driverPosRef.current.lat + dLat,
            lng: driverPosRef.current.lng + dLng
        };

        updateOrderLocation(order.orderCode, 'driver', { ...driverPosRef.current });

        // Check proximity
        const dist = Math.sqrt(Math.pow(cust.lat - driverPosRef.current.lat, 2) + Math.pow(cust.lng - driverPosRef.current.lng, 2));
        if (dist < 0.001) {
            clearInterval(intervalRef.current!);
            setIsDriving(false);
            alert("Reached Destination!");
        }
    }, 2000);
  };

  const completeDelivery = () => {
    if (!activeOrder) return;
    const all = getOrders();
    const updated = all.map(o => o.id === activeOrder.id ? { ...o, status: 'Delivered' as const } : o);
    saveOrders(updated);
    setActiveOrder(null);
    setIsDriving(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-black text-slate-800">Driver Portal</h1>
      </div>

      {!activeOrder ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-700">Available Deliveries</h2>
          {orders.length === 0 ? (
            <div className="bg-white border-2 border-dashed rounded-2xl p-12 text-center text-slate-400">
                <PackageCheck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No orders ready for delivery.</p>
                <p className="text-xs">Mark an order as "Out for Delivery" in Admin panel.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-mono text-blue-600 font-bold">{o.orderCode}</p>
                    <p className="text-lg font-bold text-slate-800">{o.customerName}</p>
                    <p className="text-slate-500 text-sm">{o.city}</p>
                  </div>
                  <button 
                    onClick={() => startDelivery(o)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" /> Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-4 border-blue-600 p-8 shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">ON ROUTE</span>
              <h2 className="text-3xl font-black text-slate-800">{activeOrder.orderCode}</h2>
              <p className="text-slate-500 font-medium">Customer: {activeOrder.customerName}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-slate-400">DESTINATION</p>
                <p className="text-xl font-bold text-slate-800">{activeOrder.city}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border flex items-center gap-4">
             <div className={`p-4 rounded-full ${isDriving ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-green-100 text-green-600'}`}>
                {isDriving ? <Navigation className="w-8 h-8" /> : <PackageCheck className="w-8 h-8" />}
             </div>
             <div>
                <p className="font-bold text-slate-800 text-lg">
                    {isDriving ? 'GPS Navigation Active' : 'Arrived at Destination'}
                </p>
                <p className="text-sm text-slate-500">
                    {isDriving ? 'Moving towards customer location...' : 'Verify customer and hand over package.'}
                </p>
             </div>
          </div>

          <div className="flex flex-col gap-4">
             <button 
                onClick={completeDelivery}
                className="w-full py-5 bg-green-600 text-white rounded-2xl font-black text-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-green-200"
             >
                <PackageCheck className="w-6 h-6" /> Complete Delivery
             </button>
             <button 
                onClick={() => {
                    setIsDriving(false);
                    if(intervalRef.current) clearInterval(intervalRef.current);
                    setActiveOrder(null);
                }}
                className="w-full py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors"
             >
                Cancel / Return to Depot
             </button>
          </div>
        </div>
      )}

      <div className="mt-12 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Driver Instructions:</strong> Please ensure your GPS is active. The user is currently watching your progress on their live tracking map. Accuracy is key to a great customer experience.
        </p>
      </div>
    </div>
  );
};

export default DriverView;
