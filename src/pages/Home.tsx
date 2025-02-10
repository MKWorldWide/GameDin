import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import TokenIcon from '@mui/icons-material/Token';
import GamesIcon from '@mui/icons-material/Games';

const VideoBackground = styled('video')({
  position: 'fixed',
  right: 0,
  bottom: 0,
  minWidth: '100%',
  minHeight: '100%',
  width: 'auto',
  height: 'auto',
  zIndex: -1,
  objectFit: 'cover',
});

const ContentOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  borderRadius: '30px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <VideoBackground autoPlay muted loop playsInline>
        <source
          src="https://i.vimeocdn.com/video/1972460452-1c2ff8287f198860ac32fb67ce51f374672a1822471ef484e74746687b6b5b7a-d"
          type="video/mp4"
        />
      </VideoBackground>

      <ContentOverlay>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 15 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', md: '4.5rem' },
              fontWeight: 700,
              mb: 2,
              fontFamily: "'Fredoka One', cursive",
            }}
          >
            GameDin
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              mb: 4,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Revolutionizing Gaming Social Networks
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.2rem' },
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            GameDin is transforming how gamers connect, share, and earn. Our platform combines
            social networking with blockchain technology to create a unique ecosystem where gaming
            achievements translate to real value.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Join Now
            </StyledButton>
            <StyledButton
              variant="outlined"
              onClick={() => navigate('/token')}
              sx={{
                borderColor: '#fff',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: '#fff',
                },
              }}
            >
              Explore Token
            </StyledButton>
          </Box>
        </Container>
      </ContentOverlay>

      <Section>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{ mb: 8, color: '#fff', fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Our Mission
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={0}>
                <ConnectWithoutContactIcon
                  sx={{ fontSize: 60, color: theme => theme.palette.primary.main, mb: 2 }}
                />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Connect & Share
                </Typography>
                <Typography>
                  Build meaningful connections with fellow gamers worldwide. Share your gaming
                  moments, achievements, and stories.
                </Typography>
              </FeatureCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <FeatureCard elevation={0}>
                <TokenIcon
                  sx={{ fontSize: 60, color: theme => theme.palette.primary.main, mb: 2 }}
                />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Earn & Trade
                </Typography>
                <Typography>
                  Turn your gaming passion into value with our GameDin Token. Participate in the
                  gaming economy of the future.
                </Typography>
              </FeatureCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <FeatureCard elevation={0}>
                <GamesIcon
                  sx={{ fontSize: 60, color: theme => theme.palette.primary.main, mb: 2 }}
                />
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Play & Grow
                </Typography>
                <Typography>
                  Discover new games, join communities, and level up your gaming experience with
                  like-minded players.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <StyledButton variant="contained" color="primary" onClick={() => navigate('/about')}>
              Learn More About Us
            </StyledButton>
          </Box>
        </Container>
      </Section>
    </Box>
  );
};

export default Home;
