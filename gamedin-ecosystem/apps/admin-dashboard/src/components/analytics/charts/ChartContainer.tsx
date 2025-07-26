import React from 'react';
import { Box, Card, CardContent, CardHeader, Divider, useTheme, Skeleton } from '@mui/material';
import { ChartContainerProps } from '../../../types/analytics';

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  height = 400,
  actions,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={title}
        subheader={subtitle}
        titleTypographyProps={{
          variant: 'h6',
          color: 'textPrimary',
        }}
        action={actions}
      />
      <Divider />
      <CardContent
        sx={{
          flex: 1,
          minHeight: height,
          position: 'relative',
          p: 3,
        }}
      >
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
