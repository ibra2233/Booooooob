
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { getOrders, saveOrders } from '../store';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const AdminView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<Partial<Order> | null>(null);

  useEffect(() => {
    const load = () => setOrders(getOrders());
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const handleSave = () => {
    if (!editingOrder?.orderCode || !editingOrder?.customerName) return;

    const currentOrders = getOrders();
    let newOrders: Order[];

    if (editingOrder.id) {
      // Update
      newOrders = currentOrders.map(o => o.id === editingOrder.id ? { ...o, ...editingOrder } as Order : o);
    } else {
      // Add
      const newOrder: Order = {
        id: crypto.randomUUID(),
        orderCode: editingOrder.orderCode!,
        customerName: editingOrder.customerName!,
        city: editingOrder.city || 'Unknown',
        quantity: Number(editingOrder.quantity) || 1,
        status: editingOrder.status || 'Processing',
        updatedAt: Date.now(),
      };
      if (currentOrders.some(o => o.orderCode === newOrder.orderCode)) {
        alert("Order code already exists!");
        return;
      }
      newOrders = [...currentOrders, newOrder];
    }

    saveOrders(newOrders);
    setOrders(newOrders);
    setEditingOrder(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const filtered = orders.filter(o => o.id !== id);
      saveOrders(filtered);
      setOrders(filtered);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setEditingOrder({ status: 'Processing', quantity: 1 })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Code</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Customer</th>
              <th className="px-6 py-4 font-semibold text-slate-600">City</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-center">Qty</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders found.</td>
              </tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{order.orderCode}</td>
                <td className="px-6 py-4 text-slate-700">{order.customerName}</td>
                <td className="px-6 py-4 text-slate-700">{order.city}</td>
                <td className="px-6 py-4 text-slate-700 text-center">{order.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setEditingOrder(order)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[2000]">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingOrder.id ? 'Edit Order' : 'Create New Order'}
              </h2>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Order Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingOrder.orderCode || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, orderCode: e.target.value })}
                  disabled={!!editingOrder.id}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingOrder.customerName || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editingOrder.city || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, city: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editingOrder.quantity || 1}
                    onChange={e => setEditingOrder({ ...editingOrder, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={editingOrder.status}
                    onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
