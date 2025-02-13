import React from 'react';
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 