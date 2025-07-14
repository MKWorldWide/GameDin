// Quantum-detailed documentation and modernization applied throughout
// Timeline.jsx - User timeline/feed component for GameDin Profile
// - Modernized for React 19+ (Suspense, useTransition, concurrent rendering)
// - Accessibility: ARIA labels, keyboard navigation, screen reader support, focus management
// - Webflow design: Clean layout, whitespace, rounded corners, shadows, modern typography, accessible color palette, consistent button/card styles
// - Novasanctum AI/Divina-L3: Placeholders for AI moderation, blockchain post verification
// - Usage: <Timeline userId={userId} />
// - Dependencies: MUI, useStore, date-fns, Novasanctum/Divina-L3 clients (future)
// - Changelog: v5.0.0 - Modernized, accessible, quantum-documented, design updated
//
// Example usage:
// <Timeline userId={currentUser.id} />
//
// Performance: Uses React 19+ concurrent rendering for smooth updates
// Security: Placeholder for blockchain post verification
import React, { useState, Suspense, useTransition } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

const Timeline = ({ userId }) => {
  const [newStatus, setNewStatus] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState('');
  
  const { user, posts, addPost, deletePost, likePost, addComment, sharePost } = useStore();
  
  const handlePostStatus = () => {
    if (newStatus.trim()) {
      addPost(newStatus.trim());
      setNewStatus('');
    }
  };

  const handleOpenMenu = (event, post) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPost(post);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedPost(null);
  };

  const handleDeletePost = () => {
    if (selectedPost) {
      deletePost(selectedPost.id);
      handleCloseMenu();
    }
  };

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleSubmitComment = (postId) => {
    if (newComment.trim()) {
      addComment(postId, newComment.trim());
      setNewComment('');
    }
  };

  const userPosts = posts.filter((post) => !userId || post.userId === userId);
  const [isPending, startTransition] = useTransition();

  return (
    <Stack spacing={3}>
      {/* Status Update Input */}
      {(!userId || userId === user.id) && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: 'background.paper',
            p: 2,
            mb: 2,
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
          aria-label="Status update input card"
        >
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={user.avatar} alt={user.username} aria-label="User avatar" />
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="What's on your mind?"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  variant="outlined"
                  inputProps={{
                    'aria-label': "What's on your mind?",
                    tabIndex: 0,
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => startTransition(handlePostStatus)}
                    disabled={!newStatus.trim() || isPending}
                    aria-label="Post status update"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    {isPending ? 'Posting...' : 'Post'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <Suspense fallback={<div>Loading posts...</div>}>
        {userPosts.map((post) => (
          <Card
            key={post.id}
            sx={{
              borderRadius: 3,
              boxShadow: 2,
              bgcolor: 'background.paper',
              mb: 2,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 5 },
            }}
            aria-label={`Post by ${post.username}`}
            tabIndex={0}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar src={post.avatar} alt={post.username} aria-label="Post user avatar" />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {post.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
                {post.userId === user.id && (
                  <>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, post)}
                      aria-label="Open post menu"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={handleCloseMenu}
                      aria-label="Post options menu"
                    >
                      <MenuItem onClick={handleDeletePost} aria-label="Delete post">Delete</MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                {post.content}
              </Typography>
              {/* Placeholder: Novasanctum AI moderation and Divina-L3 blockchain verification */}
              {/* TODO: Integrate AI moderation and blockchain verification here */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  startIcon={<ThumbUpIcon />}
                  onClick={() => likePost(post.id)}
                  size="small"
                  aria-label="Like post"
                  sx={{ borderRadius: 2 }}
                >
                  {post.likes} Likes
                </Button>
                <Button
                  startIcon={<CommentIcon />}
                  onClick={() => handleToggleComments(post.id)}
                  size="small"
                  aria-label="Show comments"
                  sx={{ borderRadius: 2 }}
                >
                  {post.comments.length} Comments
                </Button>
                <Button
                  startIcon={<ShareIcon />}
                  onClick={() => sharePost(post.id)}
                  size="small"
                  aria-label="Share post"
                  sx={{ borderRadius: 2 }}
                >
                  {post.shares} Shares
                </Button>
              </Box>
              {showComments[post.id] && (
                <Box sx={{ mt: 2 }}>
                  <Divider />
                  <Box sx={{ mt: 2, mb: 2 }}>
                    {post.comments.map((comment) => (
                      <Box key={comment.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar
                          src={comment.avatar}
                          alt={comment.username}
                          sx={{ width: 32, height: 32 }}
                          aria-label="Comment user avatar"
                        />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {comment.username}
                          </Typography>
                          <Typography variant="body2">{comment.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(comment.timestamp), {
                              addSuffix: true,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                      src={user.avatar}
                      alt={user.username}
                      sx={{ width: 32, height: 32 }}
                      aria-label="Current user avatar"
                    />
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitComment(post.id);
                          }
                        }}
                        inputProps={{
                          'aria-label': 'Write a comment',
                          tabIndex: 0,
                        }}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => startTransition(() => handleSubmitComment(post.id))}
                      disabled={!newComment.trim() || isPending}
                      aria-label="Post comment"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >
                      {isPending ? 'Posting...' : 'Post'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Suspense>
    </Stack>
  );
};

export default Timeline; 