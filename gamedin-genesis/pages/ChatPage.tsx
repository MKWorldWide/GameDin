
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ChatMessage } from '../types';
import { chatWithSerafina } from '../services/serafina';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { PaperPlaneIcon, SparklesIcon } from '../components/Icons';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && messages.length === 0) {
        setMessages([
            {
                role: 'model',
                text: `Greetings, ${user.name}. I am Serafina, your personal AI companion. How may I illuminate your path today?`
            }
        ]);
    }
  }, [user, messages.length]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !user) return;

    const userMessage: ChatMessage = { role: 'user', text: trimmedInput };
    const messagesBeforeSend = messages; // Capture old state
    const messagesWithUser = [...messages, userMessage];
    
    setMessages(messagesWithUser);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const modelResponse = await chatWithSerafina(messagesWithUser, user);
      const modelMessage: ChatMessage = { role: 'model', text: modelResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
      setMessages(messagesBeforeSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-secondary rounded-lg border border-primary shadow-lg">
      <div className="p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-primary">Chat with Serafina</h2>
          <p className="text-sm text-secondary">Your Personal AI Companion</p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tertiary flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-accent" /></div>}
            <div className={`max-w-md p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-accent text-on-accent' : 'bg-secondary text-primary'}`}>
              {msg.text}
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-tertiary flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-accent" /></div>
                 <div className="max-w-md p-3 rounded-lg bg-secondary text-primary">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent"></div>
                 </div>
            </div>
         )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div className="p-4"><ErrorMessage message={error}/></div>}

      <div className="p-4 border-t border-primary">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Serafina anything..."
            rows={1}
            className="flex-1 block w-full rounded-md border-0 bg-tertiary py-2.5 px-3 text-primary ring-1 ring-inset ring-border-primary placeholder:text-tertiary focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm resize-none"
            aria-label="Chat input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-accent text-white shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <PaperPlaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
