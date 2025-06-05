<<<<<<< HEAD
import { useState, FormEvent } from 'react';
import {
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';

interface MessageInputProps {
  onSubmit: (content: string) => void;
}

export default function MessageInput({ onSubmit }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      <TextField
        fullWidth
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={!content.trim()}
        sx={{
          alignSelf: 'center',
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
=======
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { IMessageInput } from '../../types/social';
import { debounce } from '../../utils/debounce';
import type { Store } from '../../types/store';

interface MessageInputProps {
  onSubmit: (message: IMessageInput) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSubmit,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
  conversationId
}) => {
  const darkMode = useStore((state: Store) => state.darkMode);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedTyping = useCallback(
    debounce((isTyping: boolean) => {
      onTyping?.(isTyping);
    }, 500),
    [onTyping]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxLength) {
      setContent(newContent);
      debouncedTyping(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;
    if (isSubmitting || disabled) return;

    try {
      setIsSubmitting(true);
      const mentions = extractMentions(content);
      
      await onSubmit({
        content: content.trim(),
        recipientId: conversationId,
        attachments,
        metadata: {
          mentions,
          replyTo: undefined // Add reply-to functionality later
        }
      });

      setContent('');
      setAttachments([]);
      debouncedTyping(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(match => match.slice(1)) : [];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const remainingChars = maxLength - content.length;
  const isNearLimit = remainingChars <= 50;
  const hasError = !!error;

  return (
    <form
      onSubmit={handleSubmit}
      className={`message-input-container ${darkMode ? 'dark' : ''}`}
      aria-label="Message input form"
    >
      {attachments.length > 0 && (
        <div className="attachments-preview" role="list" aria-label="Selected attachments">
          {attachments.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="attachment-item"
              role="listitem"
            >
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                aria-label={`Remove ${file.name}`}
                className="remove-attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="input-actions">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          maxLength={maxLength}
          rows={1}
          aria-label="Message input"
          className={`message-textarea ${darkMode ? 'dark' : ''}`}
        />
        
        <div className="action-buttons">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Attach files"
            accept="image/*,video/*,application/*"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="attach-button"
            aria-label="Add attachment"
            disabled={disabled || isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <button
            type="submit"
            className="send-button"
            disabled={(!content.trim() && attachments.length === 0) || disabled || isSubmitting}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {content.length > 0 && (
        <div className="character-count" aria-live="polite">
          {content.length}/{maxLength} characters
        </div>
      )}

      {hasError && (
        <p
          id="message-error"
          className="mt-2 text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
      {isNearLimit && (
        <p
          className={`mt-2 text-sm ${
            remainingChars === 0
              ? 'text-red-500'
              : darkMode
              ? 'text-gray-400'
              : 'text-gray-500'
          }`}
        >
          {remainingChars} characters remaining
        </p>
      )}
    </form>
  );
};

MessageInput.displayName = 'MessageInput'; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
