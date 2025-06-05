<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams, Routes, Route } from 'react-router-dom';
import { forumsApi } from '../services/api';
import PushPinIcon from '@mui/icons-material/PushPin';
import LockIcon from '@mui/icons-material/Lock';

interface IForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threadsCount: number;
  postsCount: number;
  lastPost?: {
    id: string;
    title: string;
    author: {
      username: string;
      avatar: string;
    };
    createdAt: string;
  };
}

interface IForumThread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
    verified: boolean;
    reputation: number;
  };
  category: {
    id: string;
    name: string;
  };
  game?: {
    name: string;
    icon: string;
  };
  createdAt: string;
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  updatedAt: string;
}

const CategoryCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ThreadCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
}));

const GameChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  margin: theme.spacing(0.5),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const Forums: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [categories, setCategories] = useState<IForumCategory[]>([]);
  const [threads, setThreads] = useState<IForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [createThreadOpen, setCreateThreadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [createThreadDialog, setCreateThreadDialog] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Mock categories data
        const mockCategories: IForumCategory[] = [
          {
            id: '1',
            name: 'General Discussion',
            description: 'General gaming discussions and topics',
            icon: 'chat',
            threadsCount: 150,
            postsCount: 1200,
            lastPost: {
              id: '1',
              title: 'Latest Gaming News',
              author: {
                username: 'GameMaster',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameMaster',
              },
              createdAt: new Date().toISOString(),
            },
          },
          {
            id: '2',
            name: 'Game Strategies',
            description: 'Share and discuss gaming strategies',
            icon: 'strategy',
            threadsCount: 80,
            postsCount: 450,
            lastPost: {
              id: '2',
              title: 'Advanced Valorant Tips',
              author: {
                username: 'ProPlayer',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProPlayer',
              },
              createdAt: new Date().toISOString(),
            },
          },
        ];
        setCategories(mockCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load forum categories',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);
        // Mock threads data
        const mockThreads: IForumThread[] = [
          {
            id: '1',
            title: 'New Valorant Update Discussion',
            content: 'What do you think about the latest patch changes?',
            author: {
              id: '1',
              username: 'ValorantPro',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ValorantPro',
              verified: true,
              reputation: 1500,
            },
            category: {
              id: categoryId,
              name: 'Game Strategies',
            },
            game: {
              name: 'Valorant',
              icon: '🎮',
            },
            createdAt: new Date().toISOString(),
            views: 1200,
            replies: 45,
            likes: 89,
            isPinned: true,
            isLocked: false,
            tags: ['Update', 'Discussion', 'Patch Notes'],
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Looking for Team Members',
            content: 'Competitive team looking for dedicated players',
            author: {
              id: '2',
              username: 'TeamCaptain',
              avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TeamCaptain',
              verified: false,
              reputation: 800,
            },
            category: {
              id: categoryId,
              name: 'Game Strategies',
            },
            game: {
              name: 'League of Legends',
              icon: '🎮',
            },
            createdAt: new Date().toISOString(),
            views: 500,
            replies: 20,
            likes: 35,
            isPinned: false,
            isLocked: false,
            tags: ['Recruitment', 'Competitive', 'Team'],
            updatedAt: new Date().toISOString(),
          },
        ];
        setThreads(mockThreads);
      } catch (error) {
        console.error('Error fetching threads:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load threads',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchThreads();
    }
  }, [categoryId]);

  const handleCreateThread = async () => {
    try {
      if (!categoryId) return;

      const response = await forumsApi.createThread(categoryId, newThread);
      setThreads(prev => [response.data, ...prev]);
      setCreateThreadDialog(false);
      setNewThread({ title: '', content: '', category: '' });
      setSnackbar({
        open: true,
        message: 'Thread created successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create thread',
        severity: 'error',
      });
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame =
      selectedGame === 'all' || (thread.game && thread.game.name === selectedGame);
    const matchesCategory = !selectedCategory || thread.category.id === selectedCategory;
    return matchesSearch && matchesGame && matchesCategory;
  });

  const renderCategories = () => (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Forums & Discussions
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search forums..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {categories
            .filter(
              category =>
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(category => (
              <Grid item xs={12} key={category.id}>
                <StyledPaper
                  onClick={() => navigate(`/forums/category/${category.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                        <ForumIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{category.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {category.description}
                      </Typography>
                      <Box display="flex" gap={2} mt={1}>
                        <Typography variant="caption" color="textSecondary">
                          {category.threadsCount} threads
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {category.postsCount} posts
                        </Typography>
                      </Box>
                    </Grid>
                    {category.lastPost && (
                      <Grid item xs={12} sm="auto">
                        <Box textAlign="right">
                          <Typography variant="caption" color="textSecondary">
                            Latest post by {category.lastPost.author.username}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {new Date(category.lastPost.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </StyledPaper>
              </Grid>
            ))}
        </Grid>
      )}
    </Container>
  );

  const renderThreads = () => (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {categories.find(c => c.id === categoryId)?.name || 'Threads'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateThreadDialog(true)}
          >
            New Thread
          </Button>
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search threads..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredThreads.map(thread => (
            <Card key={thread.id}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6">{thread.title}</Typography>
                    <Box display="flex" gap={1} mb={1}>
                      {thread.game && (
                        <Chip label={thread.game.name} size="small" color="primary" />
                      )}
                      <Chip label={thread.category.name} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Avatar src={thread.author.avatarUrl} />
                    <Box ml={1}>
                      <Typography variant="subtitle2">
                        {thread.author.username}
                        {thread.author.verified && (
                          <Tooltip title="Verified User">
                            <VerifiedIcon fontSize="small" color="primary" sx={{ ml: 0.5 }} />
                          </Tooltip>
                        )}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Posted on {new Date(thread.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {thread.content}
                </Typography>

                <Box display="flex" gap={1} mt={2}>
                  {thread.isPinned && (
                    <Chip icon={<PushPinIcon />} label="Pinned" size="small" color="primary" />
                  )}
                  {thread.isLocked && (
                    <Chip icon={<LockIcon />} label="Locked" size="small" color="error" />
                  )}
                  {thread.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>

                <Box display="flex" gap={2} mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    {thread.views} views
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {thread.replies} replies
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {thread.likes} likes
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      <Dialog
        open={createThreadDialog}
        onClose={() => setCreateThreadDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Thread</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newThread.title}
            onChange={e => setNewThread(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={6}
            value={newThread.content}
            onChange={e => setNewThread(prev => ({ ...prev, content: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateThreadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateThread}
            disabled={!newThread.title || !newThread.content}
          >
            Create Thread
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

  return (
    <Box>
      <Routes>
        <Route path="/" element={renderCategories()} />
        <Route path="/category/:categoryId" element={renderThreads()} />
      </Routes>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
=======
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export const Forums = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <Box p={4}>
      <Grid container spacing={3} alignItems="center" justifyContent="space-between" mb={4}>
        <Grid item>
          <Typography variant="h4">Gaming Forums</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/forums/new')}
          >
            Create Thread
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          No forum threads yet. Be the first to start a discussion!
        </Typography>
      </Paper>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    </Box>
  );
};

<<<<<<< HEAD
export default Forums;
=======
export default Forums; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
