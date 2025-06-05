<<<<<<< HEAD
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
} from '@mui/material';

interface PostEditorProps {
  onSubmit: (content: string) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
=======
import { Box, TextField, Button } from '@mui/material';
import { useState } from 'react';

interface PostEditorProps {
  onSubmit: (content: string) => Promise<void>;
}

export default function PostEditor({ onSubmit }: PostEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setIsSubmitting(false);
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    }
  };

  return (
<<<<<<< HEAD
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!content.trim()}
          >
            Post
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostEditor;
=======
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <TextField
        multiline
        rows={4}
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        fullWidth
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </Box>
    </Box>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
