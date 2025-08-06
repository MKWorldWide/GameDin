
import React from 'react';
import { GameTrophies, Trophy, NetworkProvider } from '../../types';
import { SteamIcon, XboxIcon, PlaystationIcon, TrophyIcon } from '../Icons';

const ProviderIcon: React.FC<{ provider: NetworkProvider, className?: string }> = ({ provider, className = "w-4 h-4" }) => {
    switch (provider) {
        case 'steam': return <SteamIcon className={className} />;
        case 'xbox': return <XboxIcon className={className} />;
        case 'playstation': return <PlaystationIcon className={className} />;
        default: return null;
    }
};

const rarityConfig = {
    common: { color: 'border-slate-400', shadow: 'shadow-slate-400/50' },
    uncommon: { color: 'border-green-400', shadow: 'shadow-green-400/50' },
    rare: { color: 'border-sky-400', shadow: 'shadow-sky-400/50' },
    epic: { color: 'border-purple-400', shadow: 'shadow-purple-400/50' },
    legendary: { color: 'border-amber-400', shadow: 'shadow-amber-400/50' },
};

const TrophyPlanet: React.FC<{ trophy: Trophy; index: number; total: number; systemRadius: number }> = ({ trophy, index, total, systemRadius }) => {
    const angle = (360 / total) * index;
    const style = {
        '--orbit-radius': `${systemRadius}px`,
        '--orbit-duration': `${15 + index * 2}s`,
        transform: `rotate(${angle}deg) translateX(${systemRadius}px) rotate(-${angle}deg)`,
    } as React.CSSProperties;
    
    const config = rarityConfig[trophy.rarity];

    return (
        <div 
            className="absolute top-1/2 left-1/2 -mt-4 -ml-4 w-8 h-8 trophy-planet group"
            style={style}
        >
            <div className={`w-full h-full rounded-full flex items-center justify-center bg-tertiary border-2 ${config.color} shadow-lg ${config.shadow} cursor-pointer transition-transform group-hover:scale-125`}>
                 <TrophyIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-slate-900 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <p className="font-bold">{trophy.name} ({trophy.rarity})</p>
                <p>{trophy.description}</p>
            </div>
        </div>
    );
};

const GameStarSystem: React.FC<{ gameTrophy: GameTrophies }> = ({ gameTrophy }) => {
    const systemRadius = Math.max(80, 20 + gameTrophy.trophies.length * 10);
    const systemSize = systemRadius * 2 + 40;

    return (
        <div className="relative" style={{ width: systemSize, height: systemSize }}>
            {/* Orbit Paths */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className="border border-slate-700/50 rounded-full"
                    style={{ width: systemRadius * 2, height: systemRadius * 2 }}
                />
            </div>

            {/* Central Star (Game) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-secondary border-2 border-primary game-star shadow-2xl z-10 p-2">
                <ProviderIcon provider={gameTrophy.platform} className="w-5 h-5 mb-1 text-secondary" />
                <p className="text-xs text-center font-bold text-primary leading-tight">{gameTrophy.gameName}</p>
            </div>
            
            {/* Orbiting Planets (Trophies) */}
            {gameTrophy.trophies.map((trophy, index) => (
                <TrophyPlanet key={trophy.id} trophy={trophy} index={index} total={gameTrophy.trophies.length} systemRadius={systemRadius} />
            ))}
        </div>
    );
};


const TrophyConstellation: React.FC<{ gameTrophies: GameTrophies[] }> = ({ gameTrophies }) => {
  return (
    <div className="animate-fade-in p-4 md:p-8 rounded-lg border border-primary constellation-bg min-h-[500px]">
        <div className="flex flex-wrap justify-center items-center gap-12">
           {gameTrophies.map(gt => (
               <GameStarSystem key={gt.gameName} gameTrophy={gt} />
           ))}
        </div>
    </div>
  );
};

export default TrophyConstellation;
