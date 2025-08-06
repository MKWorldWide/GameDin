
import React, { useState, useEffect, useRef } from 'react';
import { ScarabIcon, Bars3Icon, UserCircleIcon, ArrowRightOnRectangleIcon } from '../Icons';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();
  const { navigate } = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-secondary/80 backdrop-blur-sm z-20 border-b border-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
             <ScarabIcon className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Gamedin</span>
              <span className="text-accent">Genesis</span>
            </h1>
          </a>
          <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-2 rounded-md text-secondary hover:bg-tertiary hover:text-primary transition-colors" 
                aria-label="Menu"
                aria-haspopup="true"
                aria-expanded={menuOpen}
            >
                <Bars3Icon className="w-6 h-6" />
            </button>
            {menuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in border border-primary" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                    <div className="py-1" role="none">
                        <a href="#/profile" onClick={() => handleNavigate('/profile')} className="flex items-center gap-3 text-secondary hover:bg-tertiary hover:text-primary block px-4 py-2 text-sm" role="menuitem">
                            <UserCircleIcon className="w-5 h-5"/>
                            <span>Profile</span>
                        </a>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 text-secondary hover:bg-tertiary hover:text-primary block px-4 py-2 text-sm" role="menuitem">
                           <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                           <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
