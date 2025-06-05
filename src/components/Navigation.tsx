import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

interface NavigationProps {
  signOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ signOut }) => {
  const { user } = useUser();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              GameDin
            </Link>
            <Link to="/games" className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900">
              Games
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <Link to="/profile" className="px-2 py-2 text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : null}
=======

interface NavigationProps {
  user?: any;
  signOut?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, signOut }) => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">GameDin</span>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={signOut}
                className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            ) : (
              <button className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </button>
            )}
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 