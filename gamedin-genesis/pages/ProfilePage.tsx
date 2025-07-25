

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { MOCK_POSTS } from '../constants';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageSelectionModal from '../components/modals/ImageSelectionModal';
import { User, UserSettings, RenderTier, NetworkProvider, ProfileFrame, Post, GameTrophies, Friend } from '../types';
import { MOCK_AVATARS, MOCK_HEADERS } from '../constants';
import { UserPlusIcon, SteamIcon, XboxIcon, PlaystationIcon, SageIcon, SeerIcon, WarriorIcon, ArchitectIcon, SovereignIcon, DiscordIcon, TwitchIcon, TwitterIcon, LinkIcon, UnlinkIcon, MusicalNoteIcon, TrophyIcon } from '../components/Icons';
import { useQuantumFidelity } from '../context/QuantumFidelityContext';
import TrophyConstellation from '../components/trophies/TrophyConstellation';
import FriendsList from '../components/friends/FriendsList';

const PathIcon: React.FC<{ path: string, className?: string}> = ({ path, className }) => {
    switch(path) {
        case 'Sage': return <SageIcon className={className} />;
        case 'Seer': return <SeerIcon className={className} />;
        case 'Warrior': return <WarriorIcon className={className} />;
        case 'Architect': return <ArchitectIcon className={className} />;
        case 'Sovereign': return <SovereignIcon className={className} />;
        default: return null;
    }
};

const ProfilePage: React.FC = () => {
    const { user, updateUser, showToast, toggleFollow, linkNexusAccount, unlinkNexusAccount, refreshNexusData } = useAuth();
    const { activeTier } = useQuantumFidelity();
    const [activeTab, setActiveTab] = useState<'decrees' | 'trophies' | 'friends' | 'nexus' | 'settings'>('decrees');
    
    const [editedUser, setEditedUser] = useState<Partial<User> | null>(user);
    const [isDirty, setIsDirty] = useState(false);

    const [isAvatarModalOpen, setAvatarModalOpen] = useState(false);
    const [isHeaderModalOpen, setHeaderModalOpen] = useState(false);
    
    const [isAnthemPlaying, setAnthemPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isNexusDataLoading, setNexusDataLoading] = useState(true);

    useEffect(() => {
        setEditedUser(user);
    }, [user]);
    
    // Fetch all nexus data when the profile page loads
    useEffect(() => {
        const loadNexusData = async () => {
            setNexusDataLoading(true);
            await refreshNexusData();
            setNexusDataLoading(false);
        }
        loadNexusData();
    }, [refreshNexusData]);

    useEffect(() => {
        if (!user || !editedUser) {
            setIsDirty(false);
            return;
        }
        const hasChanged = user.bio !== editedUser.bio ||
                            user.pronouns !== editedUser.pronouns ||
                            user.status !== editedUser.status ||
                            user.anthemUrl !== editedUser.anthemUrl ||
                            user.avatarUrl !== editedUser.avatarUrl ||
                            user.headerUrl !== editedUser.headerUrl ||
                            JSON.stringify(user.settings) !== JSON.stringify(editedUser.settings);
        setIsDirty(hasChanged);
    }, [user, editedUser]);
    
    const toggleAnthem = () => {
        if (audioRef.current) {
            if(isAnthemPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.error("Anthem playback failed", e));
            }
            setAnthemPlaying(!isAnthemPlaying);
        }
    }

    if (!user || !editedUser?.settings || !editedUser.path) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }
    
    const frameClass = `profile-frame-${editedUser.settings?.profileFrame || 'none'}`;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedUser(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSettingsChange = (key: keyof UserSettings, value: string) => {
        setEditedUser(prev => prev ? ({
            ...prev,
            settings: { ...prev.settings!, [key]: value }
        }) : null);
    };
    
    const handleSave = () => {
        if (editedUser) {
            updateUser({settings: editedUser.settings, ...editedUser});
            showToast('Profile updated successfully!');
            setIsDirty(false);
        }
    };

    const userDecrees = MOCK_POSTS.filter(post => post.handle === `@${user.name.toLowerCase().replace(/\s/g, '')}`);
    const accentColors = [
        { name: 'sky', color: 'bg-sky-500' }, { name: 'pink', color: 'bg-pink-500' },
        { name: 'green', color: 'bg-green-500' }, { name: 'indigo', color: 'bg-indigo-500' },
    ];
    
    const isFollowing = user.following.includes(user.name.toLowerCase().replace(/\s/g, ''));

    return (
        <div className="space-y-6">
            <div className="bg-secondary rounded-lg border border-primary shadow-lg overflow-hidden">
                <div className="h-48 bg-tertiary relative group">
                    <img src={editedUser.headerUrl} alt="Profile header" className="w-full h-full object-cover" />
                    <button onClick={() => setHeaderModalOpen(true)} className="absolute inset-0 bg-black/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">Change Banner</button>
                </div>
                <div className="p-4 relative">
                     <div className="absolute -top-16 left-4 group">
                         <div className={`relative w-28 h-28 rounded-full ${frameClass} transition-all duration-300`}>
                            <img src={editedUser.avatarUrl} alt="User avatar" className="w-full h-full object-cover rounded-full" />
                            <button onClick={() => setAvatarModalOpen(true)} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            disabled={true} 
                            onClick={() => toggleFollow(user.name.toLowerCase().replace(/\s/g, ''))}
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-accent text-on-accent hover:bg-accent-hover transition-colors disabled:bg-tertiary disabled:text-secondary disabled:cursor-not-allowed"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
                        </button>
                    </div>
                    <div className="pt-2 text-left">
                        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                            {editedUser.name}
                             {editedUser.anthemUrl && (
                                <button onClick={toggleAnthem} title={isAnthemPlaying ? "Pause Anthem" : "Play Anthem"} className="text-secondary hover:text-accent transition-colors">
                                    <MusicalNoteIcon className={`w-5 h-5 ${isAnthemPlaying ? 'text-accent animate-pulse' : ''}`} />
                                </button>
                            )}
                        </h2>
                        {editedUser.status && <p className="text-sm text-accent italic mt-1">"{editedUser.status}"</p>}
                        <p className="text-sm text-secondary">@{user.name?.toLowerCase().replace(/\s/g, '')}</p>
                        
                        <div className="mt-4 p-3 bg-tertiary/50 rounded-lg border border-secondary flex items-center gap-4">
                            <PathIcon path={user.path} className="w-8 h-8 text-accent flex-shrink-0" />
                            <div>
                                <p className="text-sm text-accent font-bold">Path of the {user.path}</p>
                                <p className="text-sm text-primary mt-1 italic">Dream: "{user.dream}"</p>
                            </div>
                        </div>

                        {editedUser.pronouns && <p className="text-xs text-tertiary mt-2">{editedUser.pronouns}</p>}
                        <p className="text-sm text-secondary mt-2">{editedUser.bio}</p>
                        <p className="text-xs text-tertiary mt-2">Joined {user.joinedDate}</p>
                    </div>
                </div>
            </div>

            <div>
                <div className="border-b border-primary flex overflow-x-auto">
                    <TabButton name="Decrees" active={activeTab === 'decrees'} onClick={() => setActiveTab('decrees')} />
                    <TabButton name="Trophies" active={activeTab === 'trophies'} onClick={() => setActiveTab('trophies')} />
                    <TabButton name="Friends" active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} />
                    <TabButton name="Nexus" active={activeTab === 'nexus'} onClick={() => setActiveTab('nexus')} />
                    <TabButton name="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </div>
                <div className="py-6">
                    {isNexusDataLoading && ['trophies', 'friends', 'nexus'].includes(activeTab) ? <LoadingSpinner /> : (
                        <>
                            {activeTab === 'decrees' && <UserDecreesView decrees={userDecrees} />}
                            {activeTab === 'trophies' && <UserTrophiesView trophies={user.nexusData?.trophies || []} />}
                            {activeTab === 'friends' && <UserFriendsView friends={user.nexusData?.friends || []} />}
                            {activeTab === 'nexus' && <UserNexusView user={user} />}
                            {activeTab === 'settings' && <UserSettingsView user={editedUser} onInputChange={handleInputChange} onSettingsChange={handleSettingsChange} onSave={handleSave} isDirty={isDirty} accentColors={accentColors} activeTier={activeTier} linkNexusAccount={linkNexusAccount} unlinkNexusAccount={unlinkNexusAccount} />}
                        </>
                    )}
                </div>
            </div>
            <ImageSelectionModal isOpen={isAvatarModalOpen} onClose={() => setAvatarModalOpen(false)} onSelect={(url) => setEditedUser(p => p ? ({...p, avatarUrl: url}) : null)} images={MOCK_AVATARS} title="Choose your Avatar" />
            <ImageSelectionModal isOpen={isHeaderModalOpen} onClose={() => setHeaderModalOpen(false)} onSelect={(url) => setEditedUser(p => p ? ({...p, headerUrl: url}) : null)} images={MOCK_HEADERS} title="Choose your Banner" />
            {editedUser.anthemUrl && <audio ref={audioRef} src={editedUser.anthemUrl} loop onPlay={() => setAnthemPlaying(true)} onPause={() => setAnthemPlaying(false)} />}
        </div>
    );
};

const TabButton: React.FC<{ name: string; active: boolean; onClick: () => void; }> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-medium transition-colors flex-shrink-0 ${active ? 'border-b-2 border-accent text-accent' : 'border-b-2 border-transparent text-secondary hover:border-tertiary hover:text-primary'}`}>
        {name}
    </button>
);

const UserDecreesView: React.FC<{ decrees: Post[] }> = ({ decrees }) => (
    <div className="space-y-4 animate-fade-in">
        {decrees.length > 0 ? (
            decrees.map(post => <PostCard key={post.id} post={post} />)
        ) : (
            <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg">
                <h3 className="text-lg font-semibold">No Decrees yet</h3>
                <p className="mt-2">Your proclamations will appear here once you make them.</p>
            </div>
        )}
    </div>
);

const UserTrophiesView: React.FC<{trophies: GameTrophies[]}> = ({ trophies }) => {
    if (trophies.length === 0) {
        return (
            <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg animate-fade-in">
                <TrophyIcon className="w-16 h-16 mx-auto text-tertiary mb-4" />
                <h3 className="text-lg font-semibold">The Trophy Hall is Empty</h3>
                <p className="mt-2">Connect your gaming accounts in Settings to sync your achievements.</p>
            </div>
        );
    }
    return <TrophyConstellation gameTrophies={trophies} />;
};

const UserFriendsView: React.FC<{friends: Friend[]}> = ({ friends }) => {
     if (friends.length === 0) {
        return (
            <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg animate-fade-in">
                <UserPlusIcon className="w-16 h-16 mx-auto text-tertiary mb-4" />
                <h3 className="text-lg font-semibold">No Allies Yet</h3>
                <p className="mt-2">Connect your gaming accounts in Settings to find your friends in the Nexus.</p>
            </div>
        );
    }
    return <FriendsList friends={friends} />;
};

const UserNexusView: React.FC<{user: User}> = ({ user }) => {
    const { nexusData, linkedAccounts } = user;
    
    if (linkedAccounts.length === 0) {
        return (
            <div className="text-center py-12 text-secondary bg-secondary/50 rounded-lg animate-fade-in">
                <h3 className="text-lg font-semibold">The Nexus is Dormant</h3>
                <p className="mt-2">Connect your gaming and social accounts in Settings to see your activity here.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
             <h2 className="text-2xl font-bold text-primary">Nexus Activity Feed</h2>
             {nexusData?.steam && (
                <div className="bg-secondary p-4 rounded-lg border border-primary">
                    <div className="flex items-center gap-3 mb-3">
                        <SteamIcon className="w-8 h-8 text-secondary"/>
                        <h3 className="text-xl font-bold">Steam Activity</h3>
                    </div>
                    <div className="space-y-3">
                    {nexusData.steam.activities.map(act => (
                        <div key={act.game} className="p-3 bg-tertiary/50 rounded-md">
                            <p className="font-semibold text-primary">{act.game}</p>
                            <p className="text-sm text-secondary">{act.hoursPlayed} hours on record - Last played: {act.lastPlayed}</p>
                        </div>
                    ))}
                    </div>
                </div>
             )}
             {nexusData?.twitch && (
                 <div className="bg-secondary p-4 rounded-lg border border-primary">
                    <div className="flex items-center gap-3 mb-3">
                        <TwitchIcon className="w-7 h-7 text-secondary"/>
                        <h3 className="text-xl font-bold">Twitch Status</h3>
                    </div>
                     {nexusData.twitch.isLive ? (
                        <div className="p-3 bg-tertiary/50 rounded-md">
                            <p className="text-red-500 font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>LIVE</p>
                            <p className="font-semibold text-primary mt-1">{nexusData.twitch.title}</p>
                            <p className="text-sm text-secondary">Streaming {nexusData.twitch.game} for {nexusData.twitch.viewers} viewers</p>
                        </div>
                     ) : (
                         <p className="text-secondary">Not currently live.</p>
                     )}
                 </div>
             )}
             {!nexusData?.steam && !nexusData?.twitch && (
                <div className="text-center py-12 text-secondary">
                    <p>No recent activity detected from your connected accounts.</p>
                </div>
             )}
        </div>
    );
};

const UserSettingsView: React.FC<{ user: Partial<User>, onInputChange: any, onSettingsChange: any, onSave: any, isDirty: boolean, accentColors: any[], activeTier: RenderTier, linkNexusAccount: (p: NetworkProvider) => void, unlinkNexusAccount: (p: NetworkProvider) => void }> = ({ user, onInputChange, onSettingsChange, onSave, isDirty, accentColors, activeTier, linkNexusAccount, unlinkNexusAccount }) => {
    const inputClasses = "mt-1 block w-full rounded-md border-0 bg-tertiary py-2 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm";
    const renderTiers = [
        { name: 'auto', label: 'Auto-Detect', description: 'System automatically selects the best profile for your device.' },
        { name: 'stellar', label: 'Stellar', description: 'Full volumetrics, real-time lighting, and dynamic effects. For high-end desktops.' },
        { name: 'grove', label: 'Grove', description: 'Balanced visuals and performance. For tablets and most laptops.' },
        { name: 'aethercore', label: 'Aethercore', description: 'Optimized for performance. For mobile and low-end devices.' },
    ];
    
    const allProviders: { provider: NetworkProvider, icon: React.FC<{className?:string}>, name: string }[] = [
        { provider: 'steam', icon: SteamIcon, name: 'Steam' },
        { provider: 'xbox', icon: XboxIcon, name: 'Xbox' },
        { provider: 'playstation', icon: PlaystationIcon, name: 'PlayStation' },
        { provider: 'discord', icon: DiscordIcon, name: 'Discord' },
        { provider: 'twitch', icon: TwitchIcon, name: 'Twitch' },
        { provider: 'twitter', icon: TwitterIcon, name: 'Twitter' },
    ];

    const profileFrames: { id: ProfileFrame, name: string, style?: string }[] = [
        { id: 'none', name: 'None' },
        { id: 'celestial', name: 'Celestial', style: 'text-yellow-400 font-bold' },
        { id: 'runic', name: 'Runic', style: 'text-indigo-400 font-bold' },
        { id: 'verdant', name: 'Verdant', style: 'text-green-400 font-bold' },
        { id: 'void', name: 'Void', style: 'text-purple-400 font-bold' },
    ];
    
    const linkedProviders = user.linkedAccounts?.map(a => a.provider) || [];

    return (
        <div className="bg-secondary p-6 rounded-lg border border-primary animate-fade-in space-y-8">
             <div className="space-y-6">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary">Soul Name</label>
                    <input type="text" id="name" name="name" value={user.name} disabled className={`${inputClasses} disabled:bg-tertiary/50 disabled:cursor-not-allowed`} />
                    <p className="text-xs text-tertiary mt-1">Your Soul Name is eternal and cannot be changed.</p>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-secondary">Status</label>
                    <input type="text" id="status" name="status" value={user.status || ''} onChange={onInputChange} placeholder="A fleeting thought..." className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="pronouns" className="block text-sm font-medium text-secondary">Pronouns</label>
                    <input type="text" id="pronouns" name="pronouns" value={user.pronouns || ''} onChange={onInputChange} placeholder="e.g., they/them" className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-secondary">Bio</label>
                    <textarea id="bio" name="bio" rows={3} value={user.bio} onChange={onInputChange} className={inputClasses} />
                </div>
                <div>
                    <label htmlFor="anthemUrl" className="block text-sm font-medium text-secondary">Profile Anthem URL</label>
                    <input type="url" id="anthemUrl" name="anthemUrl" value={user.anthemUrl || ''} onChange={onInputChange} placeholder="https://.../song.mp3" className={inputClasses} />
                     <p className="text-xs text-tertiary mt-1">Set a song to play on your profile. (Direct .mp3 link)</p>
                </div>
             </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary pt-6 border-t border-primary pb-2">Appearance</h3>
                 <div>
                   <label className="block text-sm font-medium text-secondary">Profile Frame</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                         {profileFrames.map(frame => (
                            <button
                                key={frame.id}
                                type="button"
                                onClick={() => onSettingsChange('profileFrame', frame.id)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${user.settings?.profileFrame === frame.id ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary hover:bg-border-primary'}`}
                            >
                                <span className={frame.style}>{frame.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-secondary">Theme</label>
                   <div className="mt-2 flex gap-4">
                      <button type="button" onClick={() => onSettingsChange('theme', 'light')} className={`px-4 py-2 rounded-md text-sm font-semibold ${user.settings?.theme === 'light' ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary'}`}>Light</button>
                      <button type="button" onClick={() => onSettingsChange('theme', 'dark')} className={`px-4 py-2 rounded-md text-sm font-semibold ${user.settings?.theme === 'dark' ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary'}`}>Dark</button>
                   </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary">Accent Color</label>
                    <div className="mt-2 flex gap-3">
                        {accentColors.map(({ name, color }) => (
                            <button key={name} type="button" onClick={() => onSettingsChange('accentColor', name as any)} className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 ring-offset-secondary ${user.settings?.accentColor === name ? 'ring-white' : 'ring-transparent'}`} aria-label={`Set accent color to ${name}`} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-primary pt-6 border-t border-primary pb-2">Nexus Integrations</h3>
                <div className="space-y-3">
                    <p className="text-sm text-secondary">Manage your connected social and gaming accounts.</p>
                    {user.linkedAccounts?.map(account => {
                        const providerInfo = allProviders.find(p => p.provider === account.provider);
                        const Icon = providerInfo?.icon || LinkIcon;
                        return (
                            <div key={account.provider} className="flex items-center justify-between p-3 bg-tertiary rounded-md">
                                <div className="flex items-center gap-3">
                                    <Icon className="w-6 h-6 text-primary"/>
                                    <div>
                                        <p className="font-semibold text-primary">{providerInfo?.name}</p>
                                        <p className="text-xs text-secondary">{account.username}</p>
                                    </div>
                                </div>
                                <button onClick={() => unlinkNexusAccount(account.provider)} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold">
                                    <UnlinkIcon className="w-4 h-4"/>
                                    Disconnect
                                </button>
                            </div>
                        );
                    })}
                    <div className="pt-2">
                        <p className="text-sm font-medium text-secondary mb-2">Connect new account:</p>
                        <div className="flex flex-wrap gap-2">
                            {allProviders.filter(p => !linkedProviders.includes(p.provider)).map(provider => (
                                <button key={provider.provider} onClick={() => linkNexusAccount(provider.provider)} className="flex items-center gap-2 p-2 rounded-md bg-tertiary hover:bg-border-primary text-secondary hover:text-primary transition-colors">
                                    <provider.icon className="w-5 h-5"/>
                                    <span className="text-sm">{provider.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-primary pt-6 border-t border-primary pb-2">Quantum Mesh Rendering</h3>
                <div className="space-y-2">
                    <p className="text-sm text-secondary">Adapt visual fidelity for performance. Your active profile is: <span className="font-bold text-accent">{activeTier}</span></p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {renderTiers.map(tier => (
                             <button
                                key={tier.name}
                                type="button"
                                onClick={() => onSettingsChange('renderTier', tier.name)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold ${user.settings?.renderTier === tier.name ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary'}`}
                                title={tier.description}
                            >
                                {tier.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-primary">
                <button onClick={onSave} disabled={!isDirty} className="w-full flex justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent shadow-sm hover:bg-accent-hover disabled:bg-tertiary disabled:cursor-not-allowed disabled:text-secondary transition-colors">
                    Update Profile
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;