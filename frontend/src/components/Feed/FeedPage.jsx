import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Divider,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  SportsEsports as GamingIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';
import { feedService } from '../../services/feedService';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [error, setError] = useState(null);
  const user = useStore(state => state.user);

  // Mock data for initial development
  const mockPosts = [
    {
      id: 1,
      user: {
        id: 1,
        username: 'ProGamer123',
        avatar: 'https://mui.com/static/images/avatar/1.jpg',
        games: ['Valorant', 'CS:GO'],
      },
      content: 'Looking for a competitive Valorant team! Ranked Diamond, can play any role.',
      type: 'team_request',
      likes: 15,
      comments: 5,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      user: {
        id: 2,
        username: 'GameStudio',
        avatar: 'https://mui.com/static/images/avatar/2.jpg',
        verified: true,
      },
      content: 'We\'re hiring! Looking for Unity developers with 3+ years of experience.',
      type: 'job_posting',
      likes: 45,
      comments: 12,
      timestamp: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // For now, use mock data
        // const data = await feedService.fetchPosts(user?.id);
        setPosts(mockPosts);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        console.error('Error fetching posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user?.id]);

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;

    try {
      const post = {
        id: posts.length + 1,
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        },
        content: newPost.trim(),
        type: 'general',
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
      };

      // For now, just add to local state
      // await feedService.createPost(post);
      setPosts([post, ...posts]);
      setNewPost('');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      // For now, just update local state
      // await feedService.likePost(postId, user?.id);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'team_request':
        return <GamingIcon color="primary" />;
      case 'job_posting':
        return <WorkIcon color="secondary" />;
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box py={4}>
        {/* Create Post */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="What's on your gaming mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              variant="outlined"
            />
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePostSubmit}
                disabled={!newPost.trim() || !user}
              >
                Post
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Feed */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <Card>
                  <CardHeader
                    avatar={
                      <Avatar src={post.user.avatar} alt={post.user.username}>
                        {post.user.username[0]}
                      </Avatar>
                    }
                    title={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {post.user.username}
                        </Typography>
                        {post.user.verified && (
                          <Chip size="small" color="primary" label="Verified" />
                        )}
                      </Box>
                    }
                    subheader={new Date(post.timestamp).toLocaleString()}
                    action={getPostTypeIcon(post.type)}
                  />
                  <CardContent>
                    <Typography variant="body1">{post.content}</Typography>
                    {post.user.games && (
                      <Box mt={1}>
                        {post.user.games.map((game) => (
                          <Chip
                            key={game}
                            label={game}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <IconButton onClick={() => handleLike(post.id)}>
                      <FavoriteIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {post.likes}
                    </Typography>
                    <IconButton>
                      <CommentIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {post.comments}
                    </Typography>
                    <IconButton>
                      <ShareIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default FeedPage; 