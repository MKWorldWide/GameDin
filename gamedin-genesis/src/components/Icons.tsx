// Minimal Icons component with all required exports
import React from 'react';

// Utility type for icon props
type IconProps = {
  className?: string;
};

// Basic UI Icons
export const PawIcon = ({ className }: IconProps) => <span className={className}>🐾</span>;
export const SearchIcon = ({ className }: IconProps) => <span className={className}>🔍</span>;
export const HomeIcon = ({ className }: IconProps) => <span className={className}>🏠</span>;

// Social/Platform Icons
export const SteamIcon = ({ className }: IconProps) => <span className={className}>🎮</span>;
export const XboxIcon = ({ className }: IconProps) => <span className={className}>🎮</span>;
export const PlaystationIcon = ({ className }: IconProps) => <span className={className}>🎮</span>;
export const DiscordIcon = ({ className }: IconProps) => <span className={className}>💬</span>;
export const TwitchIcon = ({ className }: IconProps) => <span className={className}>📺</span>;
export const TwitterIcon = ({ className }: IconProps) => <span className={className}>🐦</span>;

// UI Icons
export const ChatBubbleIcon = ({ className }: IconProps) => <span className={className}>💬</span>;
export const ChatBubbleLeftRightIcon = ({ className }: IconProps) => <span className={className}>💬</span>;
export const UserCircleIcon = ({ className }: IconProps) => <span className={className}>👤</span>;
export const VideoCameraIcon = ({ className }: IconProps) => <span className={className}>🎥</span>;
export const Bars3Icon = ({ className }: IconProps) => <span className={className}>☰</span>;
export const TrophyIcon = ({ className }: IconProps) => <span className={className}>🏆</span>;
export const SwordsIcon = ({ className }: IconProps) => <span className={className}>⚔️</span>;
export const SparklesIcon = ({ className }: IconProps) => <span className={className}>✨</span>;
export const PaintBrushIcon = ({ className }: IconProps) => <span className={className}>🎨</span>;
export const PaperPlaneIcon = ({ className }: IconProps) => <span className={className}>✉️</span>;
export const ArrowPathIcon = ({ className }: IconProps) => <span className={className}>🔄</span>;
export const ArrowRightOnRectangleIcon = ({ className }: IconProps) => <span className={className}>🚪</span>;
export const UserPlusIcon = ({ className }: IconProps) => <span className={className}>👥</span>;
export const HeartIcon = ({ className }: IconProps) => <span className={className}>❤️</span>;

// Genesis Icons
export const ScarabIcon = ({ className }: IconProps) => <span className={className}>🐞</span>;
export const SageIcon = ({ className }: IconProps) => <span className={className}>🧙</span>;
export const SeerIcon = ({ className }: IconProps) => <span className={className}>🔮</span>;
export const WarriorIcon = ({ className }: IconProps) => <span className={className}>⚔️</span>;
export const ArchitectIcon = ({ className }: IconProps) => <span className={className}>🏗️</span>;
export const SovereignIcon = ({ className }: IconProps) => <span className={className}>👑</span>;

// Other Icons
export const LinkIcon = ({ className }: IconProps) => <span className={className}>🔗</span>;
export const UnlinkIcon = ({ className }: IconProps) => <span className={className}>🔗❌</span>;

// Export all icons as default
export default {
  PawIcon,
  SearchIcon,
  HomeIcon,
  SteamIcon,
  XboxIcon,
  PlaystationIcon,
  DiscordIcon,
  TwitchIcon,
  TwitterIcon,
  ChatBubbleIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  VideoCameraIcon,
  Bars3Icon,
  TrophyIcon,
  SwordsIcon,
  SparklesIcon,
  PaintBrushIcon,
  PaperPlaneIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  HeartIcon,
  ScarabIcon,
  SageIcon,
  SeerIcon,
  WarriorIcon,
  ArchitectIcon,
  SovereignIcon,
  LinkIcon,
  UnlinkIcon
};
