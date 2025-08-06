

import React from 'react';

export const PawIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className}>
        <path d="M224 256c-61.9 0-112 50.1-112 112s50.1 112 112 112 112-50.1 112-112-50.1-112-112-112zm160-160c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zM64 96C28.7 96 0 124.7 0 160s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm256 224c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zM128 320c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64z"/>
    </svg>
);

export const PaperPlaneIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

export const SearchIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11ZM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9Z" clipRule="evenodd" />
    </svg>
);

export const HeartIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

export const ChatBubbleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM2 10a8 8 0 1116 0 8 8 0 01-16 0zm2.25.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5zM8 10.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM14.25 10a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clipRule="evenodd" />
    </svg>
);

export const ArrowPathIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 01-1.062 0l-2.75-2.75v10.5a.75.75 0 01-1.5 0V2.56l-2.75 2.75a.75.75 0 11-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.062zM4.688 14.688a.75.75 0 011.062 0l2.75 2.75V6.875a.75.75 0 011.5 0v10.56l2.75-2.75a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.062z" clipRule="evenodd" />
    </svg>
);

export const HomeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
);

export const VideoCameraIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM2.5 6.25c0-.414.336-.75.75-.75h7.5c.414 0 .75.336.75.75v7.5c0 .414-.336.75-.75.75h-7.5a.75.75 0 0 1-.75-.75v-7.5Z" />
      <path d="M14.25 5.5a.75.75 0 0 0-.75.75v2.51l-1.01-1.01a.75.75 0 0 0-1.06 1.06L12.94 10l-1.51 1.51a.75.75 0 0 0 1.06 1.06l1.01-1.01v2.51a.75.75 0 0 0 1.5 0V6.25a.75.75 0 0 0-.75-.75Z" />
    </svg>
);

export const ChatBubbleLeftRightIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-4.418 0-8 3.134-8 7 0 2.643 1.53 4.953 3.761 6.162.164.086.239.28.176.45l-1.152 3.455a.75.75 0 0 0 1.06 1.06l3.454-1.152c.17-.057.365.018.45.176A9.967 9.967 0 0 0 10 17c4.418 0 8-3.134 8-7s-3.582-7-8-7Zm0 1c3.866 0 7 2.686 7 6s-3.134 6-7 6a8.955 8.955 0 0 1-2.457-.492.75.75 0 0 0-.693.045l-2.227.742.742-2.227a.75.75 0 0 0 .045-.693A7.957 7.957 0 0 1 3 9c0-3.314 3.134-6 7-6Z" clipRule="evenodd" />
    </svg>
);

export const UserCircleIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
    </svg>
);

export const UserPlusIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8 8a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm2.083.417a.75.75 0 0 0-1.083.25L9.366 10.033a5.003 5.003 0 0 0-4.733 0l-.634-1.366a.75.75 0 0 0-1.083-.251.75.75 0 0 0-.25 1.083l.794 1.701a.75.75 0 0 0 1.258.263l.23-.23A3.5 3.5 0 0 1 8 11.5a3.5 3.5 0 0 1 2.366 1.033l.23.23a.75.75 0 0 0 1.258-.263l.794-1.701a.75.75 0 0 0-.25-1.083ZM16.25 12.75a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" />
    </svg>
);

export const ArrowRightOnRectangleIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
    </svg>
);

export const Bars3Icon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const MusicalNoteIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M7 4a1 1 0 0 1 2 0v7.025A3.488 3.488 0 0 0 8.5 11a3.5 3.5 0 1 0 3.5 3.5V8a1 1 0 1 1 2 0v3.5A5.5 5.5 0 1 1 8 13.025V4Z" />
    </svg>
);

export const TrophyIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M15.5 3A2.5 2.5 0 0 0 13 5.5h-1.5a.75.75 0 0 1 0-1.5H13A1 1 0 0 1 12 3c0-1.1.9-2 2-2s2 .9 2 2h-1.5ZM3.5 3A1.5 1.5 0 0 0 2 4.5v1.5a.75.75 0 0 0 1.5 0V5a1 1 0 0 1 1-1h1.5a.75.75 0 0 0 0-1.5H4.5A1.5 1.5 0 0 0 3.5 3ZM10 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1-.5-.5ZM4 11.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm1.566 2.32a.75.75 0 0 0-.217 1.022l1.25 2.25a.75.75 0 0 0 1.302-.724l-1.25-2.25a.75.75 0 0 0-1.085-.3Z" clipRule="evenodd" />
        <path d="M9.522 18.2h.956a2.75 2.75 0 0 0 2.734-2.254l.323-1.292a.75.75 0 0 0-1.44-.36l-.323 1.292a1.25 1.25 0 0 1-1.242 1.024h-.956a1.25 1.25 0 0 1-1.242-1.024l-.323-1.292a.75.75 0 0 0-1.44.36l.323 1.292A2.75 2.75 0 0 0 9.522 18.2Z" />
    </svg>
);

export const SwordsIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.22 11.72a.75.75 0 0 0 1.06 1.06l5.22-5.22a.75.75 0 0 0-1.06-1.06l-5.22 5.22Z" />
      <path d="M12.969 3.234a.75.75 0 0 1 1.06 0l1.25 1.25a.75.75 0 0 1-1.06 1.06L13.16 4.485a.75.75 0 0 1 0-1.06l-.19-.19ZM11.439 8.25a.75.75 0 0 0-1.06-1.06L5.16 12.409a.75.75 0 0 0 1.06 1.06l5.22-5.22ZM6.47 13.53a.75.75 0 0 1 0-1.06l-1.25-1.25a.75.75 0 0 1 1.06-1.06l1.25 1.25a.75.75 0 0 1-1.06 1.06l-.19.19-.19-.19ZM10.25 3.5a.75.75 0 0 0-1.06 0L8.16 4.561a.75.75 0 0 0 1.06 1.06l1.03-1.03a.75.75 0 0 0 0-1.06l-.19-.19Z" />
      <path fillRule="evenodd" d="M10 2a.75.75 0 0 1 .685.46l.123.287.123-.287A.75.75 0 0 1 11.615 2h.02a.75.75 0 0 1 .75.75v.02a.75.75 0 0 1-.218.53l-.287.398.287.398a.75.75 0 0 1 .218.53v.02a.75.75 0 0 1-.75.75h-.02a.75.75 0 0 1-.685-.46l-.123-.287-.123.287a.75.75 0 0 1-.685.46h-.02a.75.75 0 0 1-.75-.75v-.02a.75.75 0 0 1 .218-.53l.287-.398-.287-.398a.75.75 0 0 1-.218-.53v-.02A.75.75 0 0 1 8.385 2h.02a.75.75 0 0 1 .685.46l.123.287.123-.287A.75.75 0 0 1 10 2Zm-5.518 8.44a.75.75 0 0 1 .685.46l.123.287.123-.287a.75.75 0 0 1 .685-.46h.02a.75.75 0 0 1 .75.75v.02a.75.75 0 0 1-.218.53l-.287.398.287.398a.75.75 0 0 1 .218.53v.02a.75.75 0 0 1-.75.75h-.02a.75.75 0 0 1-.685-.46l-.123-.287-.123.287a.75.75 0 0 1-.685.46h-.02a.75.75 0 0 1-.75-.75v-.02a.75.75 0 0 1 .218-.53l.287-.398-.287-.398a.75.75 0 0 1-.218-.53v-.02a.75.75 0 0 1 .75-.75h.02ZM14.018 9h.02a.75.75 0 0 1 .75.75v.02a.75.75 0 0 1-.218.53l-.287.398.287.398a.75.75 0 0 1 .218.53v.02a.75.75 0 0 1-.75-.75h-.02a.75.75 0 0 1-.685-.46l-.123-.287-.123.287a.75.75 0 0 1-.685.46h-.02a.75.75 0 0 1-.75-.75v-.02a.75.75 0 0 1 .218-.53l.287-.398-.287-.398a.75.75 0 0 1-.218-.53v-.02a.75.75 0 0 1 .75-.75h.02a.75.75 0 0 1 .685.46l.123.287.123-.287a.75.75 0 0 1 .685-.46Z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c.321.64.321 1.415 0 2.055l-1.428 2.858a1 1 0 00.707 1.707l2.858 1.428c.64.321 1.415.321 2.055 0l2.858-1.428a1 1 0 00.707-1.707l-1.428-2.858c-.321-.64-.321-1.415 0-2.055l1.428-2.858a1 1 0 00-.707-1.707l-2.858-1.428c-.64-.321-1.415-.321-2.055 0l-2.858 1.428a1 1 0 00-.707 1.707l1.428 2.858Zm-7 7.707c.321.64.321 1.415 0 2.055l-1.428 2.858a1 1 0 00.707 1.707l2.858 1.428c.64.321 1.415.321 2.055 0l2.858-1.428a1 1 0 00.707-1.707l-1.428-2.858c-.321-.64-.321-1.415 0-2.055l1.428-2.858a1 1 0 00-.707-1.707l-2.858-1.428c-.64-.321-1.415-.321-2.055 0L3.16 7.82a1 1 0 00-.707 1.707l1.428 2.858Z" clipRule="evenodd" />
    </svg>
);

export const PaintBrushIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M14.243 2.243a1 1 0 0 1 1.414 0l2.103 2.103a1 1 0 0 1 0 1.414l-9.25 9.25a1 1 0 0 1-.499.278l-3.103.886a1 1 0 0 1-1.157-1.157l.886-3.103a1 1 0 0 1 .278-.499l9.25-9.25Zm-1.829 2.134-8.5 8.5.886.253.253.886 8.5-8.5-.253-.886-.886-.253Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M2.22 17.78a.75.75 0 0 0 1.06 1.06l3.666-3.666a.75.75 0 0 0-1.06-1.06L2.22 17.78Z" clipRule="evenodd" />
    </svg>
);


// --- NEXUS ICONS: Social & Gaming ---

export const SteamIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM156.41,88.4a44,44,0,0,0-58.82,0L91.31,94.67a32,32,0,1,1,41.38,41.38l-4.7,4.7a12,12,0,1,0,17,17l4.7-4.7a32,32,0,0,1,0-45.25l6.27-6.28A44.05,44.05,0,0,0,156.41,88.4ZM116,132a12,12,0,1,0-12-12A12,12,0,0,0,116,132Z"></path>
    </svg>
);

export const XboxIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 256 256">
        <path d="M128,24a104,104,0,1,0,232,128,104.12,104.12,0,0,0-128-128Zm0,192a88,88,0,1,1,88-88,88.1,88.1,0,0,1-88,88Zm71.11-137.49C168.22,96.65,134.4,128,134.4,128s-33.82-31.35-64.71-47.49a8,8,0,0,0-9.82,13C86.74,111.46,128,145.54,128,145.54s-41.26,34.08-68.13,51.95a8,8,0,1,0,9.82,13c30.89-16.14,64.71-47.49,64.71-47.49s33.82,31.35,64.71,47.49a8,8,0,0,0,9.82-13C171.26,179.62,128,145.54,128,145.54s41.26-34.08,68.13-51.95a8,8,0,1,0-9.82-13Z"></path>
    </svg>
);

export const PlaystationIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 256 256">
        <path d="M128,24a104,104,0,1,0,232,128,104.12,104.12,0,0,0-128-128Zm0,192a88,88,0,1,1,88-88,88.1,88.1,0,0,1-88,88Zm-40-92a12,12,0,1,1-12-12,12,12,0,0,1,12,12Zm48,0a12,12,0,1,1,12,12,12,12,0,0,1-12-12Zm-24,40a12,12,0,1,1-12,12,12,12,0,0,1,12-12Zm48-28a12,12,0,1,1-12-12,12,12,0,0,1,12,12Zm-45.5-24.93,32-16a8,8,0,1,0-8-14.14l-32,16a8,8,0,0,0,8,14.14Zm-2.3,47.86,32.25,16.13a8,8,0,1,0,8-14.14l-32.25-16.13a8,8,0,1,0-8,14.14Z"></path>
    </svg>
);

export const DiscordIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 28 21">
        <path d="M23.021 1.684a.173.173 0 0 0-.16-.073H4.493a.172.172 0 0 0-.16.073.174.174 0 0 0-.038.163l1.517 14.132a.174.174 0 0 0 .16.14h15.35a.174.174 0 0 0 .16-.14L23.058 1.847a.174.174 0 0 0-.038-.163zm-15.38 11.522a1.442 1.442 0 0 1-1.432-1.446c0-.798.636-1.446 1.432-1.446a1.44 1.44 0 0 1 1.432 1.446c0 .798-.636 1.446-1.432 1.446zm6.338 0a1.442 1.442 0 0 1-1.432-1.446c0-.798.636-1.446 1.432-1.446a1.44 1.44 0 0 1 1.432 1.446c.001.798-.635 1.446-1.432 1.446zm6.338 0a1.442 1.442 0 0 1-1.432-1.446c0-.798.636-1.446 1.432-1.446a1.44 1.44 0 0 1 1.432 1.446c0 .798-.636 1.446-1.432 1.446z" />
    </svg>
);

export const TwitchIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 21 20">
        <path d="M10.485 2.214H2.438v11.83h2.69v2.857h1.793l2.84-2.857h4.48L18.72 9.55V1H9.682l2.692 2.857h-1.89zM16.48 8.84l-2.243 2.244h-3.585L8.41 13.33V11.08H5.13V3.085h10.48v5.754zm-2.691-3.57h-1.793V8.84h1.793V5.27zm-3.585 0H8.41V8.84h1.79v-3.57z" />
    </svg>
);

export const TwitterIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className} viewBox="0 0 24 24">
        <path d="M22.46 6c-.64.28-1.32.47-2.03.56.73-.44 1.29-1.13 1.55-1.95-.68.4-1.45.7-2.26.86-.64-.68-1.55-1.1-2.56-1.1-1.94 0-3.52 1.58-3.52 3.52 0 .28.03.55.09.81-2.92-.15-5.51-1.55-7.24-3.67-.3.52-.48 1.13-.48 1.77 0 1.22.62 2.3 1.57 2.93-.58-.02-1.12-.18-1.6-.44v.04c0 1.71 1.22 3.13 2.82 3.45-.3.08-.6.12-.94.12-.22 0-.44-.02-.65-.06.45 1.4 1.75 2.42 3.3 2.45-1.2 1-2.7 1.5-4.35 1.5-.28 0-.56-.02-.83-.05 1.55 1 3.4 1.6 5.4 1.6 6.5 0 10.05-5.37 10.05-10.05 0-.15 0-.3-.01-.45.7-.5 1.3-1.12 1.78-1.85z"/>
    </svg>
);


// --- GENESIS ICONS ---

export const ScarabIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2Zm5,14H7a1,1,0,0,1,0-2h4V12H7a1,1,0,0,1,0-2h4V8H7A1,1,0,0,1,7,6H17a1,1,0,0,1,1,1V15A1,1,0,0,1,17,16Z" opacity="0.1"/>
        <path d="M20.94,11a1,1,0,0,0-1.15-.36l-2.43.81,1.48-1.85a1,1,0,0,0-1.6-1.28l-2,2.5a1,1,0,0,0,1.52,1.23l2.42-.81-1.48,1.85a1,1,0,1,0,1.6,1.28l2-2.5A1,1,0,0,0,20.94,11ZM8.74,12.09l-2-2.5A1,1,0,0,0,5.1,10.87L3.62,12.72l2.43-.81a1,1,0,1,0-.76-1.86l-3.37,1.12a1,1,0,0,0-.68,1.27,1,1,0,0,0,1.15.72l2.42-.81-1.48,1.85a1,1,0,1,0,1.6,1.28l2-2.5A1,1,0,0,0,8.74,12.09Z"/>
        <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-6H13v2a1,1,0,0,1-2,0V14H8a1,1,0,0,1,0-2h3V10H8a1,1,0,0,1,0-2h3V7a1,1,0,0,1,2,0V8h3a1,1,0,0,1,0,2H13v2h3a1,1,0,0,1,0,2Z"/>
    </svg>
);


export const SageIcon = ({ className = 'w-10 h-10' }: { className?: string }) => ( // Wisdom
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export const SeerIcon = ({ className = 'w-10 h-10' }: { className?: string }) => ( // Vision
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export const WarriorIcon = ({ className = 'w-10 h-10' }: { className?: string }) => ( // Strength
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.83 2.17 4 11l7 7 8.83-8.83a2.41 2.41 0 0 0 0-3.41l-3.58-3.58a2.41 2.41 0 0 0-3.42 0z"></path>
        <path d="M12 11H4"></path>
        <path d="m17 6 3 3"></path>
    </svg>
);

export const ArchitectIcon = ({ className = 'w-10 h-10' }: { className?: string }) => ( // Creation
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="2"></circle>
        <line x1="12" y1="22" x2="12" y2="14"></line>
        <line x1="12" y1="2" x2="12" y2="10"></line>
        <line x1="2" y1="12" x2="10" y2="12"></line>
        <line x1="22" y1="12" x2="14" y2="12"></line>
        <line x1="19.07" y1="4.93" x2="13.41" y2="10.59"></line>
        <line x1="4.93" y1="4.93" x2="10.59" y2="10.59"></line>
        <line x1="19.07" y1="19.07" x2="13.41" y2="13.41"></line>
        <line x1="4.93" y1="19.07" x2="10.59" y2="13.41"></line>
    </svg>
);

export const SovereignIcon = ({ className = 'w-10 h-10' }: { className?: string }) => ( // Leadership
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
    </svg>
);

export const LinkIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
      <path d="M8.603 14.97a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.665l-3 3Z" />
    </svg>
);

export const UnlinkIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3ZM8.603 14.97a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.665l-3 3Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z" clipRule="evenodd" />
    </svg>
);