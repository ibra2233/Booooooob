
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { getOrders } from '../store';
import { Search, MapPin, Package, Clock, Truck } from 'lucide-react';
import TrackingMap from './TrackingMap';

const UserView: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    const orders = getOrders();
    const order = orders.find(o => o.orderCode.trim().toUpperCase() === searchCode.trim().toUpperCase());
    
    if (order) {
      setFoundOrder(order);
    } else {
      setFoundOrder(null);
      setError('Order not found. Please check your code.');
    }
  };

  // Sync with background updates (from admin or driver tabs)
  useEffect(() => {
    const sync = () => {
      if (foundOrder) {
        const orders = getOrders();
        const updated = orders.find(o => o.id === foundOrder.id);
        if (updated) setFoundOrder(updated);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [foundOrder]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-800 mb-2">Track Your Package</h1>
        <p className="text-slate-500">Enter your unique order code to see live status and delivery location.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g. ORD-12345"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold uppercase tracking-widest"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            Check Status
          </button>
        </div>
        {error && <p className="mt-3 text-red-500 text-sm font-medium px-2">{error}</p>}
      </div>

      {foundOrder && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                <p className="text-lg font-bold text-slate-800">{foundOrder.status}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Destination</p>
                <p className="text-lg font-bold text-slate-800">{foundOrder.city}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Customer</p>
                <p className="text-lg font-bold text-slate-800 truncate">{foundOrder.customerName}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">Live Delivery Route</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border">CODE: {foundOrder.orderCode}</span>
            </div>
            
            <div className="h-[400px]">
              {foundOrder.status === 'Out for Delivery' ? (
                <TrackingMap 
                  driverLoc={foundOrder.driverLocation} 
                  customerLoc={foundOrder.customerLocation}
                  isSimulating={!!foundOrder.driverLocation}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
                  <Package className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg font-semibold">Live Map Unavailable</p>
                  <p className="text-sm max-w-xs">Tracking map will activate once the package is "Out for Delivery".</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 py-4">
            <div className={`flex flex-col items-center gap-2 ${foundOrder.status !== 'Cancelled' ? 'text-blue-600' : 'text-slate-300'}`}>
               <div className="w-4 h-4 rounded-full bg-current"></div>
               <span className="text-[10px] font-bold uppercase">Processing</span>
            </div>
            <div className={`flex-1 h-[2px] ${['Shipped', 'Out for Delivery', 'Delivered'].includes(foundOrder.status) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center gap-2 ${['Shipped', 'Out for Delivery', 'Delivered'].includes(foundOrder.status) ? 'text-blue-600' : 'text-slate-300'}`}>
               <div className="w-4 h-4 rounded-full bg-current"></div>
               <span className="text-[10px] font-bold uppercase">Shipped</span>
            </div>
            <div className={`flex-1 h-[2px] ${['Out for Delivery', 'Delivered'].includes(foundOrder.status) ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center gap-2 ${['Out for Delivery', 'Delivered'].includes(foundOrder.status) ? 'text-blue-600' : 'text-slate-300'}`}>
               <div className="w-4 h-4 rounded-full bg-current"></div>
               <span className="text-[10px] font-bold uppercase">On Way</span>
            </div>
            <div className={`flex-1 h-[2px] ${foundOrder.status === 'Delivered' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex flex-col items-center gap-2 ${foundOrder.status === 'Delivered' ? 'text-green-600' : 'text-slate-300'}`}>
               <div className="w-4 h-4 rounded-full bg-current"></div>
               <span className="text-[10px] font-bold uppercase">Delivered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserView;
