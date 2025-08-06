import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const ACCENT_COLORS: { [key: string]: string } = {
    sky: '56 189 248',
    pink: '236 72 153',
    green: '34 197 94',
    indigo: '99 102 241',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    useEffect(() => {
        const theme = user?.settings?.theme || 'dark';
        const accent = user?.settings?.accentColor || 'sky';
        
        const root = document.documentElement;
        document.body.dataset.theme = theme;
        
        const accentRgb = ACCENT_COLORS[accent] || ACCENT_COLORS['sky'];
        const accentHoverRgb = accentRgb.split(' ').map(c => Math.min(parseInt(c) + 20, 255)).join(' ');

        root.style.setProperty('--color-accent', accentRgb);
        root.style.setProperty('--color-accent-hover', accentHoverRgb);

    }, [user]);

    return <>{children}</>;
};