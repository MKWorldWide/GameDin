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
    }
  };

  return (
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
