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
