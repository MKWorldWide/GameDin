import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import { IMessage, IUser, IConversation, IAttachment } from '../../types/social';

interface ChatSidebarProps {
  conversation: IConversation;
  messages: IMessage[];
  currentUser: IUser;
  onViewProfile?: (userId: string) => void;
  onClose?: () => void;
}

interface MediaItem extends IAttachment {
  message: IMessage;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversation,
  messages,
  currentUser,
  onViewProfile,
  onClose
}) => {
  const darkMode = useStore((state) => state.darkMode);
  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links' | 'search'>('media');
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized media items
  const mediaItems = useMemo(() => {
    return messages
      .flatMap(message => 
        message.attachments
          ?.filter(att => att.type === 'image' || att.type === 'video')
          .map(att => ({ ...att, message })) || []
      )
      .sort((a, b) => new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime());
  }, [messages]);

  // Memoized file items
  const fileItems = useMemo(() => {
    return messages
      .flatMap(message => 
        message.attachments
          ?.filter(att => att.type === 'file')
          .map(att => ({ ...att, message })) || []
      )
      .sort((a, b) => new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime());
  }, [messages]);

  // Memoized links
  const links = useMemo(() => {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return messages
      .flatMap(message => {
        const matches = message.content.match(linkRegex) || [];
        return matches.map(url => ({
          url,
          message,
          title: url // TODO: Implement link preview
        }));
      })
      .sort((a, b) => new Date(b.message.createdAt).getTime() - new Date(a.message.createdAt).getTime());
  }, [messages]);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return messages
      .filter(message => 
        message.content.toLowerCase().includes(query) ||
        message.author.name.toLowerCase().includes(query)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [messages, searchQuery]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  return (
    <div
      className={`
        w-80 border-l flex flex-col
        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chat Info</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search in conversation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`
            w-full px-3 py-2 rounded-lg
            ${darkMode 
              ? 'bg-gray-700 text-white placeholder-gray-400' 
              : 'bg-gray-100 text-gray-900 placeholder-gray-500'}
          `}
        />
      </div>

      <div className="flex border-b">
        {(['media', 'files', 'links', 'search'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 p-3 text-sm font-medium
              ${activeTab === tab
                ? darkMode
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-blue-600 border-b-2 border-blue-500'
                : darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-2">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-end p-2">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                    {format(new Date(item.message.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
            {mediaItems.length === 0 && (
              <p className="col-span-2 text-center text-gray-500">No media shared</p>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            {fileItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  block p-3 rounded-lg
                  ${darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                  </div>
                </div>
              </a>
            ))}
            {fileItems.length === 0 && (
              <p className="text-center text-gray-500">No files shared</p>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-2">
            {links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  block p-3 rounded-lg
                  ${darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                <p className="text-sm font-medium truncate">{link.title}</p>
                <p className="text-xs text-gray-500 truncate">{link.url}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(link.message.createdAt), 'MMM d, yyyy')}
                </p>
              </a>
            ))}
            {links.length === 0 && (
              <p className="text-center text-gray-500">No links shared</p>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            {searchResults.map((message) => (
              <div
                key={message.id}
                className={`
                  p-3 rounded-lg
                  ${darkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'}
                `}
              >
                <div className="flex items-center mb-2">
                  <img
                    src={message.author.picture || message.author.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="ml-2 text-sm font-medium">{message.author.name}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {format(new Date(message.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-center text-gray-500">No messages found</p>
            )}
          </div>
        )}
      </div>

      {conversation.type === 'GROUP' && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium mb-2">Participants</h3>
          <div className="space-y-2">
            {conversation.participants.map((participant) => (
              <div
                key={participant.user.id}
                className="flex items-center"
              >
                <img
                  src={participant.user.picture || participant.user.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 text-sm">{participant.user.name}</span>
                {participant.role === 'ADMIN' && (
                  <span className="ml-auto text-xs text-gray-500">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ChatSidebar.displayName = 'ChatSidebar'; 