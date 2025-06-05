import React, { useState } from 'react';
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

  return (
    <Stack spacing={3}>
      {/* Status Update Input */}
      {(!userId || userId === user.id) && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={user.avatar} alt={user.username} />
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="What's on your mind?"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handlePostStatus}
                    disabled={!newStatus.trim()}
                  >
                    Post
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      {userPosts.map((post) => (
        <Card key={post.id}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={post.avatar} alt={post.username} />
                <Box>
                  <Typography variant="subtitle1">{post.username}</Typography>
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
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {post.content}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                startIcon={<ThumbUpIcon />}
                onClick={() => likePost(post.id)}
                size="small"
              >
                {post.likes} Likes
              </Button>
              <Button
                startIcon={<CommentIcon />}
                onClick={() => handleToggleComments(post.id)}
                size="small"
              >
                {post.comments.length} Comments
              </Button>
              <Button
                startIcon={<ShareIcon />}
                onClick={() => sharePost(post.id)}
                size="small"
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
                      />
                      <Box>
                        <Typography variant="subtitle2">
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
                    />
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSubmitComment(post.id)}
                    disabled={!newComment.trim()}
                  >
                    Post
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

export default Timeline; 