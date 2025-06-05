import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext';

interface IJob {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
    location: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  skills: string[];
  postedAt: string;
  deadline: string;
  applicants: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const CategoryChip = styled(Chip)<{ category: string }>(({ theme, category }) => {
  const categoryColors = {
    gaming: theme.palette.primary.main,
    esports: theme.palette.secondary.main,
    content: theme.palette.success.main,
    development: theme.palette.info.main,
    management: theme.palette.warning.main,
  };
  return {
    backgroundColor: categoryColors[category as keyof typeof categoryColors],
    color: '#fff',
  };
});

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    // Mock jobs data
    const mockJobs: IJob[] = [
      {
        id: '1',
        title: 'Esports Tournament Manager',
        company: {
          name: 'GameDin Esports',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GameDinEsports',
          location: 'Remote',
        },
        type: 'full-time',
        salary: {
          min: 50000,
          max: 80000,
          currency: 'USD',
        },
        description:
          "We're looking for an experienced Tournament Manager to organize and oversee our competitive gaming events.",
        requirements: [
          'Previous experience in esports tournament management',
          'Strong understanding of competitive gaming scenes',
          'Excellent organizational and communication skills',
        ],
        benefits: [],
        skills: ['Tournament Management', 'Event Planning', 'Team Leadership'],
        postedAt: '2024-03-15',
        deadline: '2024-04-15',
        applicants: 0,
      },
      {
        id: '2',
        title: 'Gaming Content Creator',
        company: {
          name: 'StreamHub',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StreamHub',
          location: 'Los Angeles, CA',
        },
        type: 'contract',
        salary: {
          min: 3000,
          max: 8000,
          currency: 'USD',
        },
        description:
          'Join our team of content creators and produce engaging gaming content for our platforms.',
        requirements: [
          'Proven track record in content creation',
          'Strong presence on social media platforms',
          'Video editing skills',
        ],
        benefits: [],
        skills: ['Content Creation', 'Video Editing', 'Social Media Management'],
        postedAt: '2024-03-20',
        deadline: '2024-04-20',
        applicants: 0,
      },
    ];
    setJobs(mockJobs);
  }, []);

  const handleCreateJob = () => {
    setCreateDialogOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.skills.includes(selectedCategory);
    const matchesType = selectedType === 'all' || job.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gaming Industry Jobs
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              size="small"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="gaming">Gaming</MenuItem>
                <MenuItem value="esports">Esports</MenuItem>
                <MenuItem value="content">Content Creation</MenuItem>
                <MenuItem value="development">Game Development</MenuItem>
                <MenuItem value="management">Management</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedType}
                label="Type"
                onChange={e => setSelectedType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="freelance">Freelance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateJob}>
              Post Job
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Jobs Grid */}
      <Grid container spacing={3}>
        {filteredJobs.map(job => (
          <Grid item xs={12} key={job.id}>
            <StyledCard>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item>
                    <Avatar src={job.company.logo} sx={{ width: 64, height: 64 }} />
                  </Grid>
                  <Grid item xs>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h5" gutterBottom>
                          {job.title}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                          {job.company.name}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <CategoryChip label={job.skills[0]} size="small" category={job.skills[0]} />
                        <Chip label={job.type} size="small" variant="outlined" />
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOnIcon color="action" />
                          <Typography variant="body2">{job.company.location}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoneyIcon color="action" />
                          <Typography variant="body2">
                            {job.salary.currency} {job.salary.min.toLocaleString()} -{' '}
                            {job.salary.max.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <WorkIcon color="action" />
                          <Typography variant="body2">{job.skills.join(', ')}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AccessTimeIcon color="action" />
                          <Typography variant="body2">
                            Posted {new Date(job.postedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography variant="body2" paragraph>
                      {job.description}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap">
                      {job.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button variant="outlined" size="small">
                  View Details
                </Button>
                <Button variant="contained" size="small">
                  Apply Now
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Create Job Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Post a Job</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField fullWidth label="Job Title" margin="normal" />
            <TextField fullWidth label="Company Name" margin="normal" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select label="Category">
                    <MenuItem value="gaming">Gaming</MenuItem>
                    <MenuItem value="esports">Esports</MenuItem>
                    <MenuItem value="content">Content Creation</MenuItem>
                    <MenuItem value="development">Game Development</MenuItem>
                    <MenuItem value="management">Management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Job Type</InputLabel>
                  <Select label="Job Type">
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                    <MenuItem value="freelance">Freelance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField fullWidth label="Location" margin="normal" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Minimum Salary" type="number" margin="normal" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Maximum Salary" type="number" margin="normal" />
              </Grid>
            </Grid>
            <TextField fullWidth label="Description" multiline rows={4} margin="normal" />
            <TextField
              fullWidth
              label="Requirements (one per line)"
              multiline
              rows={4}
              margin="normal"
            />
            <TextField fullWidth label="Skills (comma separated)" margin="normal" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>
            Post Job
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Jobs;
