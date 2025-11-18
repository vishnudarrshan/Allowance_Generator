import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  User,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin, isManager } = useAuth();

  const navigation = [
    { name: 'Calendar', href: '/', icon: Calendar },
    { name: 'Allowance History', href: '/allowance-history', icon: DollarSign },
    ...(isManager ? [
      { name: 'Team View', href: '/team', icon: Users },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 }
    ] : []),
    ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: Settings }] : []),
  ];

  return (
    <div className="flex h-full flex-col bg-gray-900">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-shrink-0 items-center px-4 py-6">
          <div className="h-8 w-auto text-white font-bold text-xl">
            Allowance System
          </div>
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <User className="h-8 w-8 rounded-full bg-gray-700 p-1 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs font-medium text-gray-300">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="ml-auto text-gray-300 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;