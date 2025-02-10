import React, { useState } from 'react';
import { Box, TextField, Button, IconButton, Stack, Typography } from '@mui/material';
import {
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

interface ICreatePostProps {
  onSubmit: (content: string) => Promise<void>;
}

const CreatePost: React.FC<ICreatePostProps> = ({ onSubmit }) => {
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
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="What's on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
        }}
      />

      <Stack direction="row" spacing={2} alignItems="center">
        <Box>
          <IconButton size="small" color="primary" disabled>
            <ImageIcon />
          </IconButton>
          <IconButton size="small" color="primary" disabled>
            <VideoIcon />
          </IconButton>
          <IconButton size="small" color="primary" disabled>
            <LinkIcon />
          </IconButton>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Attachment support coming soon
        </Typography>

        <Button variant="contained" type="submit" disabled={!content.trim() || isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </Stack>
    </Box>
  );
};

export default CreatePost;
