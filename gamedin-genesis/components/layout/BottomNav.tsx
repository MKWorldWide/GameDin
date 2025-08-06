

import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, UserCircleIcon, VideoCameraIcon, SwordsIcon } from '../Icons';

interface BottomNavProps {
  activePath: string;
}

const NavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode; label: string; }> = ({ href, active, children, label }) => (
    <a href={href} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${active ? 'text-accent' : 'text-secondary hover:text-accent'}`}>
        {children}
        <span className="mt-1">{label}</span>
    </a>
)

const BottomNav: React.FC<BottomNavProps> = ({ activePath }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-secondary/80 backdrop-blur-sm z-10 border-t border-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around h-16">
            <NavLink href="#/" active={activePath === '/'} label="Feed">
                <HomeIcon className="w-6 h-6" />
            </NavLink>
             <NavLink href="#/live" active={activePath.startsWith('/live')} label="Live">
                <VideoCameraIcon className="w-6 h-6" />
            </NavLink>
             <NavLink href="#/matchmaking" active={activePath === '/matchmaking'} label="Lobby">
                <SwordsIcon className="w-6 h-6" />
            </NavLink>
             <NavLink href="#/chat" active={activePath === '/chat'} label="Chat">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </NavLink>
             <NavLink href="#/profile" active={activePath === '/profile'} label="Profile">
                <UserCircleIcon className="w-6 h-6" />
            </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;