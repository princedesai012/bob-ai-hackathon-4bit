import React from 'react';
import { Bell, UserCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

// Breadcrumb labels per route
const ROUTE_LABELS = {
  '/dashboard':   'Command Center',
  '/disruptions': 'Disruptions',
  '/shipments':   'Shipments',
  '/fleet':       'Fleet',
  '/cold-chain':  'Cold Chain',
  '/plans':       'Recovery Plans',
  '/copilot':     'AI Copilot',
  '/recovery':    'Recovery Workspace',
};

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const pathLabel = Object.entries(ROUTE_LABELS).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || '';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      {/* Page label / breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-gray-700 truncate">{pathLabel}</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          3 Active Disruptions
        </div>

        {/* Notification */}
        <button className="text-gray-500 hover:text-gray-700 relative transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-gray-900">{user?.name || 'Operations Manager'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ') || 'Operator'}</p>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Sign Out"
          >
            <UserCircle className="w-7 h-7" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
