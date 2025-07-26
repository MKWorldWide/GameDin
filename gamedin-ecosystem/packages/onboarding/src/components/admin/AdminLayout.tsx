import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheckIcon, UsersIcon, KeyIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@gamedin/auth';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon, current: true },
  { name: 'Users', href: '/admin/users', icon: UsersIcon, current: false },
  { name: 'Invite Codes', href: '/admin/invites', icon: KeyIcon, current: false },
  { name: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheckIcon, current: false },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Update current navigation item based on route
  const updatedNavigation = navigation.map((item) => ({
    ...item,
    current: location.pathname === item.href,
  }));

  if (!user || !user.roles?.includes('admin')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-2xl font-bold">GameDin Admin</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-600',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-indigo-300' : 'text-indigo-200',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block h-9 w-9 rounded-full"
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || '')}&background=4f46e5&color=fff`}
                  alt={user.displayName || 'User'}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.displayName}</p>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-indigo-200 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
