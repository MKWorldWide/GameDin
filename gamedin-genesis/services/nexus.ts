

import { NetworkProvider, LinkedAccount, NexusData, Lobby, Path, Friend, GameTrophies, Trophy } from "../types";

// --- MOCK NEXUS SERVICE ---
// In a real application, these functions would handle OAuth flows,
// secure API calls to third-party services, and data transformation.

const MOCK_FRIENDS_LIST: Omit<Friend, 'id' | 'bondScore'>[] = [
    { soulName: 'Isis', path: 'Seer', avatarUrl: 'https://i.pravatar.cc/150?u=isis', isOnline: true, currentGame: "Aethelgard's Fall", platform: 'playstation' },
    { soulName: 'Thoth', path: 'Sage', avatarUrl: 'https://i.pravatar.cc/150?u=thoth', isOnline: true, currentGame: 'Starlight Sepulcher', platform: 'steam' },
    { soulName: 'Set', path: 'Warrior', avatarUrl: 'https://i.pravatar.cc/150?u=set', isOnline: false, platform: 'xbox' },
    { soulName: 'Bastet', path: 'Warrior', avatarUrl: 'https://i.pravatar.cc/150?u=bastet', isOnline: true, currentGame: 'Celestial Arena', platform: 'discord' },
    { soulName: 'Nut', path: 'Architect', avatarUrl: 'https://i.pravatar.cc/150?u=nut', isOnline: false, platform: 'steam' },
];

const MOCK_TROPHIES: (Omit<GameTrophies, 'trophies'> & { trophies: Omit<Trophy, 'id'>[] })[] = [
    {
        gameName: "Aethelgard's Fall", platform: 'playstation',
        trophies: [
            { name: 'First Steps', description: 'Complete the tutorial.', iconUrl: 'trophy-icon', rarity: 'common', platform: 'playstation' },
            { name: 'Temple Reclaimed', description: 'Liberate the Sunken Temple.', iconUrl: 'trophy-icon', rarity: 'rare', platform: 'playstation' },
            { name: 'Dragon Slayer', description: 'Defeat the final boss.', iconUrl: 'trophy-icon', rarity: 'epic', platform: 'playstation' },
            { name: 'Aethelgard Perfected', description: 'Unlock all other trophies.', iconUrl: 'trophy-icon', rarity: 'legendary', platform: 'playstation' },
        ]
    },
    {
        gameName: "StarSailor's Odyssey", platform: 'steam',
        trophies: [
            { name: 'Lift Off', description: 'Leave your home planet.', iconUrl: 'trophy-icon', rarity: 'common', platform: 'steam' },
            { name: 'Galaxy Mapper', description: 'Visit every star system.', iconUrl: 'trophy-icon', rarity: 'epic', platform: 'steam' },
        ]
    },
    {
        gameName: "Celestial Arena", platform: 'xbox',
        trophies: [
            { name: 'First Blood', description: 'Win your first match.', iconUrl: 'trophy-icon', rarity: 'common', platform: 'xbox' },
            { name: 'Mythic Rank', description: 'Achieve Mythic rank in competitive.', iconUrl: 'trophy-icon', rarity: 'legendary', platform: 'xbox' },
            { name: 'Penta Kill', description: 'Defeat 5 enemies in quick succession.', iconUrl: 'trophy-icon', rarity: 'epic', platform: 'xbox' },
        ]
    }
];


/**
 * Mocks connecting a new third-party account.
 * @param provider The network to connect to.
 * @param gamedinUsername The current user's name for mock data generation.
 * @returns A promise that resolves to a new LinkedAccount object.
 */
export const connectAccount = (provider: NetworkProvider, gamedinUsername: string): Promise<LinkedAccount> => {
    console.log(`[Nexus Mock] Initiating connection for ${provider}...`);
    return new Promise(resolve => {
        setTimeout(() => {
            const mockUsernames: Record<NetworkProvider, string> = {
                steam: `${gamedinUsername}_steam`,
                xbox: `X_${gamedinUsername}_X`,
                playstation: `ps_${gamedinUsername}`,
                discord: `${gamedinUsername}#${Math.floor(1000 + Math.random() * 9000)}`,
                twitch: `${gamedinUsername}_tv`,
                twitter: `@${gamedinUsername}_tweets`,
            }
            const newAccount: LinkedAccount = {
                provider,
                userId: `nexus_${provider}_${Date.now()}`,
                username: mockUsernames[provider],
                linkedAt: new Date().toISOString(),
            };
            console.log(`[Nexus Mock] Account for ${provider} created:`, newAccount);
            resolve(newAccount);
        }, 1000); // Simulate network delay
    });
};

/**
 * Mocks fetching aggregated data from all linked networks.
 * @param accounts The user's array of linked accounts.
 * @returns A promise that resolves to a NexusData object.
 */
export const fetchNexusData = (accounts: LinkedAccount[]): Promise<NexusData> => {
    console.log('[Nexus Mock] Fetching data for all linked accounts...');
    return new Promise(resolve => {
        setTimeout(() => {
            const data: NexusData = {
                friends: [],
                trophies: [],
            };
            const linkedProviders = accounts.map(a => a.provider);

            for (const account of accounts) {
                if (account.provider === 'steam') {
                    data.steam = {
                        activities: [
                            { game: 'Aethelgard\'s Fall', hoursPlayed: 142, lastPlayed: 'Yesterday' },
                            { game: 'StarSailor\'s Odyssey', hoursPlayed: 88, lastPlayed: '3 days ago' },
                            { game: 'Celestial Arena', hoursPlayed: 301, lastPlayed: 'Last week' },
                        ]
                    };
                }
                if (account.provider === 'twitch') {
                    const isLive = Math.random() > 0.7; // 30% chance of being live
                    data.twitch = {
                        isLive,
                        ...(isLive && {
                           title: 'Climbing the Divine Ladder | Path of the Warrior',
                           game: 'Celestial Arena',
                           viewers: Math.floor(Math.random() * 5000) + 100,
                        })
                    };
                }
            }
            
            // Add friends if their platform is linked
            data.friends = MOCK_FRIENDS_LIST
                .filter(friend => linkedProviders.includes(friend.platform))
                .map(friend => ({
                    ...friend,
                    id: `friend_${friend.soulName}`,
                    bondScore: Math.floor(Math.random() * 80) + 20, // Random bond score from 20 to 100
                }));
            
            // Add trophies if their platform is linked
            data.trophies = MOCK_TROPHIES
                .filter(game => linkedProviders.includes(game.platform))
                .map(game => ({
                    ...game,
                    trophies: game.trophies
                        .filter(() => Math.random() > 0.3) // Simulate not all trophies being unlocked
                        .map(trophy => ({
                        ...trophy,
                        id: `trophy_${game.gameName}_${trophy.name}`.replace(/\s/g, '')
                    }))
                }));

            console.log('[Nexus Mock] Fetched data:', data);
            resolve(data);
        }, 1200);
    });
};

/**
 * Mocks posting a message to a social network.
 * @param provider The network to post to.
 * @param message The content to post.
 */
export const postToNetwork = (provider: NetworkProvider, message: string): void => {
    console.log(`[Nexus Mock] Syndicating post to ${provider}...`);
    console.log(`> Message: "${message}"`);
    console.log(`> Post successful!`);
};

/**
 * Mocks finding game lobbies based on filters.
 */
export const findLobbies = (filters: any): Promise<Lobby[]> => {
    console.log('[Nexus Mock] Finding lobbies with filters:', filters);
    const mockLobbies: Lobby[] = [
        { id: 'lobby1', game: "Aethelgard's Fall", platform: 'Cross-Platform', title: "Final Boss Run (Need Healer)", currentPlayers: 3, maxPlayers: 4, skillLevel: "Divine", playstyle: "Co-op" },
        { id: 'lobby2', game: "Celestial Arena", platform: 'Cross-Platform', title: "Ranked Grind to Mythic", currentPlayers: 1, maxPlayers: 2, skillLevel: "Mythic+", playstyle: "Competitive" },
        { id: 'lobby3', game: "StarSailor's Odyssey", platform: 'steam', title: "Chill Exploration & Mining", currentPlayers: 5, maxPlayers: 8, skillLevel: "Casual", playstyle: "Social" },
        { id: 'lobby4', game: "Desert of Storms", platform: 'xbox', title: "Weekly Raid - Quick Clear", currentPlayers: 7, maxPlayers: 8, skillLevel: "Veteran", playstyle: "Co-op" },
        { id: 'lobby5', game: "Celestial Arena", platform: 'playstation', title: "Casual Matches, Noobs Welcome", currentPlayers: 4, maxPlayers: 10, skillLevel: "Beginner", playstyle: "Social" },
    ];
    
    return new Promise(resolve => {
        setTimeout(() => {
            const { query, skill, playstyle } = filters;
            let filtered = mockLobbies;
            if (query) {
                filtered = filtered.filter(l => l.game.toLowerCase().includes(query.toLowerCase()) || l.title.toLowerCase().includes(query.toLowerCase()));
            }
            if (skill && skill !== 'any') {
                 filtered = filtered.filter(l => l.skillLevel.toLowerCase() === skill.toLowerCase());
            }
            if (playstyle && playstyle !== 'any') {
                 filtered = filtered.filter(l => l.playstyle.toLowerCase() === playstyle.toLowerCase());
            }
            resolve(filtered);
        }, 500);
    });
};