import React from 'react';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';

const PageContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
}));

const VisionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(8, 95, 128, 0.2)',
  },
}));

const About: React.FC = () => {
  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{ mb: 6, color: '#fff', fontSize: { xs: '2.5rem', md: '3.5rem' } }}
        >
          About GameDin
        </Typography>

        <Typography
          variant="h5"
          align="center"
          sx={{
            mb: 8,
            maxWidth: '800px',
            mx: 'auto',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: 1.6,
          }}
        >
          We're building the future of gaming social networks by combining community engagement with
          blockchain technology.
        </Typography>

        <Grid container spacing={6} sx={{ mb: 10 }}>
          <Grid item xs={12} md={4}>
            <VisionCard elevation={0}>
              <TimelineIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Our Vision
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                To create a decentralized gaming ecosystem where players can truly own their digital
                assets, achievements, and social connections.
              </Typography>
            </VisionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <VisionCard elevation={0}>
              <EmojiEventsIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Our Mission
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                To empower gamers by providing a platform where gaming achievements and social
                interactions have real-world value through our GameDin Token.
              </Typography>
            </VisionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <VisionCard elevation={0}>
              <GroupsIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Our Community
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                A vibrant ecosystem of gamers, content creators, and developers working together to
                shape the future of gaming social networks.
              </Typography>
            </VisionCard>
          </Grid>
        </Grid>

        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ mb: 4, color: '#fff' }}>
            Our Story
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              mb: 3,
            }}
          >
            GameDin was born from a simple observation: while gaming has become increasingly social,
            the platforms connecting gamers haven't evolved to match the industry's potential. We
            saw an opportunity to create something revolutionary – a platform that not only connects
            gamers but also rewards them for their participation and achievements.
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
            }}
          >
            By integrating blockchain technology and our native GameDin Token, we're creating a
            self-sustaining ecosystem where social interactions, content creation, and gaming
            achievements all contribute to a player's digital value. Our platform isn't just about
            sharing gaming moments – it's about building a future where gaming communities thrive
            and players are rewarded for their passion.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h3" sx={{ mb: 4, color: '#fff' }}>
            The Future
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.8,
            }}
          >
            We're constantly innovating and expanding our platform. Our roadmap includes features
            like NFT integration for gaming achievements, cross-game asset trading, and advanced
            social features that will revolutionize how gamers connect and interact. With GameDin,
            we're not just building a social network – we're creating the future of gaming
            communities.
          </Typography>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default About;
