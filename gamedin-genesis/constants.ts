import { Post, Stream } from './types';

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    author: 'Ra',
    handle: '@sun_god',
    avatarUrl: 'https://i.pravatar.cc/150?u=ra',
    content: "A new dawn breaks over the digital realm. The Genesis is upon us. Let there be light. ✨ #GamedinGenesis #NewDawn",
    timestamp: '2h ago',
    likes: 1250,
    commentsCount: 180,
    sharesCount: 55,
  },
  {
    id: 'post2',
    author: 'Isis',
    handle: '@magic_queen',
    avatarUrl: 'https://i.pravatar.cc/150?u=isis',
    content: "Seeking skilled warriors to reclaim the lost temple in 'Aethelgard's Fall'. We move at dusk.",
    timestamp: '5h ago',
    likes: 890,
    commentsCount: 112,
    sharesCount: 42,
    lfg: {
        game: "Aethelgard's Fall",
        skillLevel: "Divine"
    }
  },
    {
    id: 'post6',
    author: 'Set',
    handle: '@chaos_lord',
    avatarUrl: 'https://i.pravatar.cc/150?u=set',
    content: "Just single-handedly cleared the 'Desert of Storms' raid boss. Pathetic. None can match my power. 🌪️ #unrivaled",
    timestamp: '8h ago',
    likes: 666,
    commentsCount: 250,
    sharesCount: 15,
  },
  {
    id: 'post3',
    author: 'Thoth',
    handle: '@scribe_of_divinity',
    avatarUrl: 'https://i.pravatar.cc/150?u=thoth',
    content: 'I have deciphered the ancient runes. The next celestial alignment will unlock a new area in the \'Starlight Sepulcher\'. Prepare yourselves.',
    timestamp: '1d ago',
    likes: 989,
    commentsCount: 177,
    sharesCount: 83,
  },
  {
    id: 'post4',
    author: 'Bastet',
    handle: '@guardian_cat',
    avatarUrl: 'https://i.pravatar.cc/150?u=bastet',
    content: "LFG for some late-night ranked in 'Celestial Arena'. Need an agile partner to climb the divine ladder. I play assassin.",
    timestamp: '1d ago',
    likes: 710,
    commentsCount: 91,
    sharesCount: 39,
    lfg: {
        game: "Celestial Arena",
        skillLevel: "Mythic+"
    }
  },
    {
    id: 'post7',
    author: 'Nut',
    handle: '@sky_goddess',
    avatarUrl: 'https://i.pravatar.cc/150?u=nut',
    content: "The cosmos within 'StarSailor's Odyssey' is simply breathtaking. A canvas of infinite possibility.",
    timestamp: '2d ago',
    likes: 1820,
    commentsCount: 210,
    sharesCount: 150,
  },
  {
    id: 'post5',
    author: 'The Oracle',
    handle: '@oracle_ai',
    avatarUrl: 'https://i.pravatar.cc/150?u=oracle',
    content: "I have observed the threads of fate. A surge of 'Architect' path users are reshaping the starter zones. Their creativity is... potent. #AI #GenesisInsights",
    timestamp: '2d ago',
    likes: 1999,
    commentsCount: 350,
    sharesCount: 188,
  }
];

export const MOCK_STREAMS: Stream[] = [
    {
        id: 'stream1',
        streamerName: 'Isis',
        streamerAvatar: 'https://i.pravatar.cc/150?u=isis',
        game: "Aethelgard's Fall",
        title: "Temple Reclamation | Path of the Seer",
        viewers: 12500,
        thumbnailUrl: "https://images.unsplash.com/photo-1593305842131-295b9a79c94f?q=80&w=1932&auto=format&fit=crop"
    },
    {
        id: 'stream2',
        streamerName: 'Thoth',
        streamerAvatar: 'https://i.pravatar.cc/150?u=thoth',
        game: "Starlight Sepulcher",
        title: "Deciphering the Cosmic Glyphs | !lore",
        viewers: 8700,
        thumbnailUrl: "https://images.unsplash.com/photo-1612287230202-95a041628d26?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 'stream3',
        streamerName: 'Nut',
        streamerAvatar: 'https://i.pravatar.cc/150?u=nut',
        game: "StarSailor's Odyssey",
        title: "Chill journey through the cosmos ✨",
        viewers: 5300,
        thumbnailUrl: "https://images.unsplash.com/photo-1545156521-77bd85671d30?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 'stream4',
        streamerName: 'Bastet',
        streamerAvatar: 'https://i.pravatar.cc/150?u=bastet',
        game: "Celestial Arena",
        title: "LFG for Mythic+ Grind! | Assassin Main",
        viewers: 7100,
        thumbnailUrl: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?q=80&w=1992&auto=format&fit=crop"
    },
];

export const MOCK_AVATARS: string[] = [
    'https://i.pravatar.cc/150?u=mario',
    'https://i.pravatar.cc/150?u=luigi',
    'https://i.pravatar.cc/150?u=peach',
    'https://i.pravatar.cc/150?u=bowser',
    'https://i.pravatar.cc/150?u=yoshi',
    'https://i.pravatar.cc/150?u=toad',
    'https://i.pravatar.cc/150?u=dk',
    'https://i.pravatar.cc/150?u=koopa',
    'https://i.pravatar.cc/150?u=shyguy',
    'https://i.pravatar.cc/150?u=waluigi',
    'https://i.pravatar.cc/150?u=kingboo',
    'https://i.pravatar.cc/150?u=isabelle',
];

export const MOCK_HEADERS: string[] = [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614850715697-94d4d62024ea?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596753177308-48605333d7b3?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587399438997-3c3e3a479a0b?q=80&w=2070&auto=format&fit=crop',
];