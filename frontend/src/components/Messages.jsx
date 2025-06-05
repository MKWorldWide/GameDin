import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useStore from '../store/useStore';

const Messages = () => {
  const { chatId } = useParams();
  const [newMessage, setNewMessage] = useState('');

  const { messages, addMessage } = useStore(state => ({
    messages: state.messages[chatId] || [],
    addMessage: state.addMessage,
  }));

  const handleSend = () => {
    if (newMessage.trim()) {
      addMessage(chatId, {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-[600px] flex flex-col">
      <div className="card-body flex-1 flex flex-col p-0">
        <div className="p-4 border-b">
          <h2 className="card-title">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`chat ${message.sender === 'user' ? 'chat-end' : 'chat-start'}`}
            >
              <div
                className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-primary' : ''}`}
              >
                {message.text}
              </div>
              <div className="chat-footer opacity-50">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="input input-bordered flex-1"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
