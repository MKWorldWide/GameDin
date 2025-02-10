import React from 'react';
import { IConversation, IConversationParticipant } from '../../types/social';
import useStore from '../../store/useStore';

interface ConversationsListProps {
  conversations: IConversation[];
  activeConversationId?: string;
  onSelectConversation: (conversation: IConversation) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  const user = useStore(state => state.user);

  const getOtherParticipant = (conversation: IConversation): IConversationParticipant | undefined => {
    return conversation.participants.find(p => p.user.id !== user?.id);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-base-300">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>

      <div className="divide-y divide-base-300">
        {conversations.map(conversation => {
          const otherParticipant = getOtherParticipant(conversation);
          const isActive = conversation.id === activeConversationId;

          return (
            <div
              key={conversation.id}
              className={`p-4 cursor-pointer hover:bg-base-200 transition-colors ${
                isActive ? 'bg-base-200' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={otherParticipant?.user.avatar} alt={otherParticipant?.user.username} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{otherParticipant?.user.username}</h3>
                  {conversation.lastMessage && (
                    <div className="flex items-center space-x-1">
                      <p className="text-sm text-base-content/60 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <span className="text-xs text-base-content/40">
                        • {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {conversation.unreadCount > 0 && (
                  <div className="badge badge-primary badge-sm">{conversation.unreadCount}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {conversations.length === 0 && (
        <div className="p-4 text-center text-base-content/60">No conversations yet</div>
      )}
    </div>
  );
};

export default ConversationsList;
