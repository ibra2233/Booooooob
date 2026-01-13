
import React, { useState } from 'react';
import { AppView } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import DriverView from './components/DriverView';
import { LayoutDashboard, User, Truck } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('user');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b sticky top-0 z-[3000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Truck className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Logi<span className="text-blue-600">Track</span></span>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button
                onClick={() => setView('user')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === 'user' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-4 h-4" /> User
              </button>
              <button
                onClick={() => setView('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin
              </button>
              <button
                onClick={() => setView('driver')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  view === 'driver' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Truck className="w-4 h-4" /> Driver
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {view === 'admin' && <AdminView />}
        {view === 'user' && <UserView />}
        {view === 'driver' && <DriverView />}
      </main>

      {/* Footer / Mobile Hint */}
      <footer className="bg-white border-t py-6 px-4 text-center">
        <p className="text-slate-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} LogiTrack Systems. All rights reserved. 
          <span className="mx-2">|</span> 
          <button className="hover:text-blue-600">Privacy Policy</button>
        </p>
      </footer>
    </div>
  );
};

export default App;
