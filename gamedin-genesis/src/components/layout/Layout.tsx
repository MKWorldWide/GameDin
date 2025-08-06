import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import { useRouter } from '../../hooks/useRouter';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { path } = useRouter();

  return (
    <div className="min-h-screen bg-primary text-primary font-sans">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
         <div className="animate-fade-in">
            {children}
         </div>
      </main>
      <BottomNav activePath={path}/>
    </div>
  );
};

export default Layout;