interface MessageInputProps {
  onSubmit: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSubmit, disabled }) => {
  // ... existing code ...
} 