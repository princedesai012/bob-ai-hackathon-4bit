import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertOctagon, Package, Truck, Snowflake, Shield, MessageSquare, Settings, User } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Disruptions', icon: AlertOctagon, path: '/disruptions' },
    { name: 'Shipments', icon: Package, path: '/shipments' },
    { name: 'Fleet', icon: Truck, path: '/fleet' },
    { name: 'Cold Chain', icon: Snowflake, path: '/cold-chain' },
    { name: 'Recovery Plans', icon: Shield, path: '/plans' },
    { name: 'AI Copilot', icon: MessageSquare, path: '/copilot' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col hidden md:flex fixed top-0 left-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Shield className="w-8 h-8 text-blue-600 mr-2" />
        <span className="text-xl font-bold text-gray-800">SupplyShield AI</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <button className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Settings</span>
            </button>
          </li>
          <li>
            <button className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              <User className="w-5 h-5 mr-3" />
              <span className="font-medium">Profile</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
