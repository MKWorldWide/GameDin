import { useState } from 'react';
import { IConversation, IUser } from '../../types/social';
import {
  EllipsisVerticalIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface ChatHeaderProps {
  conversation: IConversation;
  currentUser: IUser;
  onViewProfile?: (userId: string) => void;
  onLeaveGroup?: () => void;
  onEditGroup?: () => void;
  onMuteConversation?: () => void;
  onBlockUser?: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUser,
  onViewProfile,
  onLeaveGroup,
  onEditGroup,
  onMuteConversation,
  onBlockUser,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getOtherParticipant = (): IUser => {
    return conversation.participants.find(p => p.user.id !== currentUser.id)?.user || currentUser;
  };

  const getHeaderTitle = (): string => {
    if (conversation.type === 'GROUP') {
      return conversation.title || 'Group Chat';
    }
    const otherParticipant = getOtherParticipant();
    return otherParticipant.name || otherParticipant.username;
  };

  const getHeaderSubtitle = (): string => {
    if (conversation.type === 'GROUP') {
      return `${conversation.participants.length} members`;
    }
    const otherParticipant = getOtherParticipant();
    return otherParticipant.status === 'online' ? 'Online' : 'Offline';
  };

  const getHeaderAvatar = (): string => {
    if (conversation.type === 'GROUP') {
      return conversation.groupAvatar || '/default-group-avatar.png';
    }
    const otherParticipant = getOtherParticipant();
    return otherParticipant.picture || otherParticipant.avatar || '/default-avatar.png';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center flex-1 min-w-0">
        <img
          src={getHeaderAvatar()}
          alt={getHeaderTitle()}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {getHeaderTitle()}
          </h2>
          <p className="text-sm text-gray-500 truncate">
            {getHeaderSubtitle()}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Menu"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                {conversation.type === 'GROUP' ? (
                  <>
                    {onEditGroup && (
                      <button
                        onClick={() => {
                          onEditGroup();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Edit Group
                      </button>
                    )}
                    {onLeaveGroup && (
                      <button
                        onClick={() => {
                          onLeaveGroup();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Leave Group
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {onViewProfile && (
                      <button
                        onClick={() => {
                          onViewProfile(getOtherParticipant().id);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        View Profile
                      </button>
                    )}
                    {onBlockUser && (
                      <button
                        onClick={() => {
                          onBlockUser();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Block User
                      </button>
                    )}
                  </>
                )}
                {onMuteConversation && (
                  <button
                    onClick={() => {
                      onMuteConversation();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Mute Conversation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 