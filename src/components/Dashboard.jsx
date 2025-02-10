import { Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, Container, Grid } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import useStore from '../store/useStore';

const Dashboard = () => {
  const user = useStore(state => state.user);
  const matches = useStore(state => state.matches || []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Welcome {user?.username || 'Gamer'}!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Find your perfect gaming match today.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/matches"
                  variant="contained"
                  color="primary"
                  startIcon={<PeopleIcon />}
                >
                  Find Matches
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Recent Matches
              </Typography>
              {matches?.length > 0 ? (
                <List>
                  {matches.slice(0, 5).map(match => (
                    <ListItem
                      key={match.id}
                      component={Link}
                      to={`/messages/${match.id}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={match.avatar} alt={match.username} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={match.username}
                        secondary={`Level ${match.level || '1'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No matches yet. Start browsing to find gaming partners!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
