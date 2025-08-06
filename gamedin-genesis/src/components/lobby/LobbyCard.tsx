import React from 'react';
import { Lobby, NetworkProvider } from '../../types';
import { SteamIcon, XboxIcon, PlaystationIcon, SwordsIcon } from '../Icons';

const ProviderIcon: React.FC<{ provider: NetworkProvider | 'Cross-Platform', className?: string}> = ({ provider, className="w-5 h-5" }) => {
    switch (provider) {
        case 'steam': return <SteamIcon className={className} />;
        case 'xbox': return <XboxIcon className={className} />;
        case 'playstation': return <PlaystationIcon className={className} />;
        case 'Cross-Platform': return <SwordsIcon className={className} />;
        default: return null;
    }
};

const LobbyCard: React.FC<{ lobby: Lobby }> = ({ lobby }) => {
    return (
        <div className="bg-secondary p-4 rounded-lg shadow-lg border border-primary hover:border-accent transition-all duration-300 flex flex-col gap-3 animate-fade-in">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-primary">{lobby.title}</h3>
                    <p className="text-sm text-secondary">{lobby.game}</p>
                </div>
                <ProviderIcon provider={lobby.platform} className="w-6 h-6 text-tertiary" />
            </div>
            <div className="flex items-center gap-4 text-xs text-tertiary">
                <span className="bg-tertiary/50 px-2 py-1 rounded-full">{lobby.skillLevel}</span>
                <span className="bg-tertiary/50 px-2 py-1 rounded-full">{lobby.playstyle}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className="text-sm text-secondary">
                    Players: <span className="font-bold text-primary">{lobby.currentPlayers} / {lobby.maxPlayers}</span>
                </div>
                 <button className="px-4 py-1.5 text-sm font-semibold rounded-md bg-accent text-on-accent hover:bg-accent-hover transition-colors">
                    Join
                </button>
            </div>
        </div>
    );
};

export default LobbyCard;