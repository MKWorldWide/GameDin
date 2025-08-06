
import React from 'react';
import { Friend, NetworkProvider } from '../../types';
import { SteamIcon, XboxIcon, PlaystationIcon, DiscordIcon } from '../Icons';

const ProviderIcon: React.FC<{ provider: NetworkProvider, className?: string}> = ({ provider, className="w-5 h-5" }) => {
    switch (provider) {
        case 'steam': return <SteamIcon className={className} />;
        case 'xbox': return <XboxIcon className={className} />;
        case 'playstation': return <PlaystationIcon className={className} />;
        case 'discord': return <DiscordIcon className={className} />;
        default: return null;
    }
};

const FriendsList: React.FC<{friends: Friend[]}> = ({ friends }) => {
    const onlineFriends = friends.filter(f => f.isOnline);
    const offlineFriends = friends.filter(f => !f.isOnline);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Online ({onlineFriends.length})</h3>
                <div className="space-y-3">
                    {onlineFriends.map(friend => <FriendCard key={friend.id} friend={friend} />)}
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Offline ({offlineFriends.length})</h3>
                <div className="space-y-3">
                    {offlineFriends.map(friend => <FriendCard key={friend.id} friend={friend} />)}
                </div>
            </div>
        </div>
    );
};

const FriendCard: React.FC<{friend: Friend}> = ({ friend }) => {
    return (
        <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg border border-primary hover:border-accent transition-colors">
            <div className="relative">
                <img src={friend.avatarUrl} alt={friend.soulName} className="w-12 h-12 rounded-full"/>
                {friend.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-secondary"></span>}
            </div>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-primary">{friend.soulName}</p>
                    <ProviderIcon provider={friend.platform} />
                </div>
                <p className="text-sm text-secondary">
                    {friend.isOnline ? `Playing ${friend.currentGame}` : 'Offline'}
                </p>
            </div>
            <div className="flex-shrink-0 w-24 text-right">
                 <p className="text-xs text-tertiary">Bond Score</p>
                 <div className="w-full bg-tertiary rounded-full h-2.5 mt-1">
                    <div className="bg-accent h-2.5 rounded-full" style={{width: `${friend.bondScore}%`}} title={`${friend.bondScore}%`}></div>
                </div>
            </div>
        </div>
    );
};

export default FriendsList;
