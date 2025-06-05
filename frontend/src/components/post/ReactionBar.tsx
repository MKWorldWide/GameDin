import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Button,
  Tooltip,
  Popover,
  Paper,
  Typography,
  Badge,
  Zoom,
  styled,
  keyframes,
} from '@mui/material';
import {
  ThumbUp as LikeIcon,
  Favorite as LoveIcon,
  EmojiEmotions as HappyIcon,
  SentimentVeryDissatisfied as SadIcon,
  Celebration as CelebrationIcon,
  Whatshot as FireIcon,
  Share as ShareIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

export type ReactionType = 'like' | 'love' | 'happy' | 'sad' | 'celebrate' | 'fire';

interface IReaction {
  type: ReactionType;
  count: number;
  reacted: boolean;
  icon: React.ReactNode;
  label: string;
  color: string;
}

interface ReactionBarProps {
  reactions: {
    [K in ReactionType]: {
      count: number;
      reacted: boolean;
    };
  };
  commentCount: number;
  shareCount: number;
  onReact: (type: ReactionType) => Promise<void>;
  onComment: () => void;
  onShare: () => void;
  showCommentButton?: boolean;
  showShareButton?: boolean;
}

const popAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const AnimatedIconButton = styled(IconButton)`
  &.pop {
    animation: ${popAnimation} 0.3s ease-in-out;
  }
`;

const reactionConfig: { [K in ReactionType]: Omit<IReaction, 'count' | 'reacted'> } = {
  like: {
    type: 'like',
    icon: <LikeIcon />,
    label: 'Like',
    color: '#2196f3',
  },
  love: {
    type: 'love',
    icon: <LoveIcon />,
    label: 'Love',
    color: '#e91e63',
  },
  happy: {
    type: 'happy',
    icon: <HappyIcon />,
    label: 'Happy',
    color: '#ffc107',
  },
  sad: {
    type: 'sad',
    icon: <SadIcon />,
    label: 'Sad',
    color: '#9e9e9e',
  },
  celebrate: {
    type: 'celebrate',
    icon: <CelebrationIcon />,
    label: 'Celebrate',
    color: '#4caf50',
  },
  fire: {
    type: 'fire',
    icon: <FireIcon />,
    label: 'Fire',
    color: '#ff5722',
  },
};

const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions,
  commentCount,
  shareCount,
  onReact,
  onComment,
  onShare,
  showCommentButton = true,
  showShareButton = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [animatingButton, setAnimatingButton] = useState<ReactionType | null>(null);

  const handleReactionClick = async (type: ReactionType) => {
    setAnchorEl(null);
    setAnimatingButton(type);
    await onReact(type);
    setTimeout(() => setAnimatingButton(null), 300);
  };

  const totalReactions = Object.values(reactions).reduce(
    (sum, reaction) => sum + reaction.count,
    0
  );

  const userReaction = Object.entries(reactions).find(([_, reaction]) => reaction.reacted)?.[0] as
    | ReactionType
    | undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box>
        <AnimatedIconButton
          className={animatingButton === userReaction ? 'pop' : ''}
          onClick={e => setAnchorEl(e.currentTarget)}
          color={userReaction ? 'primary' : undefined}
          sx={{
            color: userReaction ? reactionConfig[userReaction].color : undefined,
          }}
        >
          {userReaction ? reactionConfig[userReaction].icon : reactionConfig.like.icon}
        </AnimatedIconButton>
        {totalReactions > 0 && (
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 0.5 }}>
            {totalReactions}
          </Typography>
        )}
      </Box>

      {showCommentButton && (
        <Button
          size="small"
          startIcon={<CommentIcon />}
          onClick={onComment}
          sx={{ minWidth: 'auto' }}
        >
          {commentCount > 0 && commentCount}
        </Button>
      )}

      {showShareButton && (
        <Button size="small" startIcon={<ShareIcon />} onClick={onShare} sx={{ minWidth: 'auto' }}>
          {shareCount > 0 && shareCount}
        </Button>
      )}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 1,
            display: 'flex',
            gap: 0.5,
            bgcolor: 'background.default',
          },
        }}
      >
        {Object.entries(reactionConfig).map(([type, config]) => {
          const reaction = reactions[type as ReactionType];
          return (
            <Tooltip
              key={type}
              title={
                <Box>
                  <Typography variant="body2">{config.label}</Typography>
                  {reaction.count > 0 && (
                    <Typography variant="caption">
                      {reaction.count} {reaction.count === 1 ? 'person' : 'people'}
                    </Typography>
                  )}
                </Box>
              }
            >
              <IconButton
                size="small"
                onClick={() => handleReactionClick(type as ReactionType)}
                className={animatingButton === type ? 'pop' : ''}
                sx={{
                  color: reaction.reacted ? config.color : undefined,
                  '&:hover': {
                    color: config.color,
                  },
                }}
              >
                {config.icon}
              </IconButton>
            </Tooltip>
          );
        })}
      </Popover>
    </Box>
  );
};

export default ReactionBar;
