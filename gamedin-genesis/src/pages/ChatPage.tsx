import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GlobalChatMessage } from '../types';
import * as db from '../services/database';
import { PaperPlaneIcon } from '../components/Icons';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(() => {
    const newMessages = db.getChatMessages();
    setMessages(newMessages);
  }, []);

  // Fetch messages on initial load and set up polling
  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !user) return;

    const newMessage: GlobalChatMessage = {
      id: `chat_${Date.now()}`,
      authorHandle: user.handle,
      authorName: user.name,
      authorAvatarUrl: user.avatarUrl,
      text: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    
    db.addChatMessage(newMessage);
    fetchMessages(); // Immediately fetch to show own message
    setInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-secondary rounded-lg border border-primary shadow-lg">
      <div className="p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-primary">Nexus Chat</h2>
          <p className="text-sm text-secondary">Global communication channel</p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.authorHandle === user?.handle ? 'justify-end' : ''}`}>
             {msg.authorHandle !== user?.handle && (
                <a href={`#/profile/${msg.authorHandle}`} className="flex-shrink-0">
                    <img src={msg.authorAvatarUrl} alt={msg.authorName} className="w-8 h-8 rounded-full"/>
                </a>
             )}
            <div className={`max-w-md p-3 rounded-lg whitespace-pre-wrap ${msg.authorHandle === user?.handle ? 'bg-accent text-on-accent' : 'bg-tertiary text-primary'}`}>
                {msg.authorHandle !== user?.handle && (
                    <a href={`#/profile/${msg.authorHandle}`} className="font-bold text-xs text-accent mb-1 block hover:underline">
                        {msg.authorName}
                    </a>
                )}
                <p>{msg.text}</p>
                 <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
             {msg.authorHandle === user?.handle && (
                <a href={`#/profile/${msg.authorHandle}`} className="flex-shrink-0">
                    <img src={msg.authorAvatarUrl} alt={msg.authorName} className="w-8 h-8 rounded-full"/>
                </a>
             )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-primary">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to the Nexus..."
            rows={1}
            className="flex-1 block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm resize-none"
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-accent text-white shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <PaperPlaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;