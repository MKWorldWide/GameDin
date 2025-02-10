import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SecurityIcon from '@mui/icons-material/Security';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import GroupWorkIcon from '@mui/icons-material/GroupWork';

const PageContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(8),
}));

const TokenCard = styled(Paper)(({ theme }) => ({
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

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(8, 95, 128, 0.05)',
  borderRadius: '15px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}));

const BuyButton = styled(MuiButton)<{ component?: React.ElementType }>(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  borderRadius: '30px',
  textTransform: 'none',
  marginTop: theme.spacing(2),
}));

const Token: React.FC = () => {
  return (
    <PageContainer>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{ mb: 3, color: '#fff', fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            GameDin Token (GDT)
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            The native cryptocurrency powering the GameDin ecosystem
          </Typography>
          <Box
            component="a"
            href="https://pancakeswap.finance"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none' }}
          >
            <BuyButton variant="contained" color="primary" fullWidth>
              Buy GDT Token
            </BuyButton>
          </Box>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <StatsCard elevation={0}>
              <MonetizationOnIcon
                sx={{ fontSize: 40, color: theme => theme.palette.primary.main, mb: 1 }}
              />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Total Supply
              </Typography>
              <Typography variant="h4" sx={{ color: theme => theme.palette.primary.main }}>
                1,000,000,000
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>GDT Tokens</Typography>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatsCard elevation={0}>
              <AccountBalanceIcon
                sx={{ fontSize: 40, color: theme => theme.palette.primary.main, mb: 1 }}
              />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Market Cap
              </Typography>
              <Typography variant="h4" sx={{ color: theme => theme.palette.primary.main }}>
                $10M+
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>USD</Typography>
            </StatsCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <StatsCard elevation={0}>
              <ShowChartIcon
                sx={{ fontSize: 40, color: theme => theme.palette.primary.main, mb: 1 }}
              />
              <Typography variant="h6" sx={{ color: '#fff' }}>
                Current Price
              </Typography>
              <Typography variant="h4" sx={{ color: theme => theme.palette.primary.main }}>
                $0.01
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>USD</Typography>
            </StatsCard>
          </Grid>
        </Grid>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <TokenCard elevation={0}>
              <SecurityIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Security
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Built on BSC with audited smart contracts. Your tokens are safe and secure on the
                blockchain.
              </Typography>
            </TokenCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <TokenCard elevation={0}>
              <SwapHorizIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Utility
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Use GDT for platform transactions, rewards, and exclusive features within the
                GameDin ecosystem.
              </Typography>
            </TokenCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <TokenCard elevation={0}>
              <GroupWorkIcon
                sx={{ fontSize: 48, color: theme => theme.palette.primary.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ mb: 2, color: '#fff' }}>
                Community
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Governance rights for token holders. Shape the future of GameDin through community
                voting.
              </Typography>
            </TokenCard>
          </Grid>
        </Grid>

        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ mb: 4, color: '#fff' }}>
            Token Distribution
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 3, color: '#fff' }}>
                  Initial Distribution
                </Typography>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <Typography sx={{ mb: 1 }}>• 40% - Public Sale</Typography>
                  <Typography sx={{ mb: 1 }}>• 20% - Platform Development</Typography>
                  <Typography sx={{ mb: 1 }}>• 15% - Team & Advisors</Typography>
                  <Typography sx={{ mb: 1 }}>• 15% - Marketing & Partnerships</Typography>
                  <Typography sx={{ mb: 1 }}>• 10% - Community Rewards</Typography>
                </Box>
              </TokenCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 3, color: '#fff' }}>
                  Token Utility
                </Typography>
                <Box sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <Typography sx={{ mb: 1 }}>• Platform Transaction Fees</Typography>
                  <Typography sx={{ mb: 1 }}>• Governance Voting Rights</Typography>
                  <Typography sx={{ mb: 1 }}>• Exclusive Feature Access</Typography>
                  <Typography sx={{ mb: 1 }}>• Staking Rewards</Typography>
                  <Typography sx={{ mb: 1 }}>• NFT Marketplace Currency</Typography>
                </Box>
              </TokenCard>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h3" sx={{ mb: 4, color: '#fff' }}>
            Roadmap
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.primary.main }}>
                  Q1 2024
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  • Token Launch
                  <br />
                  • Exchange Listings
                  <br />• Community Building
                </Typography>
              </TokenCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.primary.main }}>
                  Q2 2024
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  • Staking Platform
                  <br />
                  • Governance System
                  <br />• Mobile App Beta
                </Typography>
              </TokenCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.primary.main }}>
                  Q3 2024
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  • NFT Marketplace
                  <br />
                  • Game Partnerships
                  <br />• Cross-chain Bridge
                </Typography>
              </TokenCard>
            </Grid>
            <Grid item xs={12} md={3}>
              <TokenCard elevation={0}>
                <Typography variant="h6" sx={{ mb: 2, color: theme => theme.palette.primary.main }}>
                  Q4 2024
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  • Metaverse Integration
                  <br />
                  • Game SDK Release
                  <br />• Global Expansion
                </Typography>
              </TokenCard>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default Token;
