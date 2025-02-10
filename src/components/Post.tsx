import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CommentIcon from '@mui/icons-material/Comment';
import { useAuth } from '../context/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
  marginBottom: theme.spacing(3),
}));

const PostImage = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '500px',
  objectFit: 'cover',
});

interface PostProps {
  post: {
    id: string;
    author: {
      username: string;
      avatar?: string;
    };
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
  };
  onDelete?: (postId: string) => void;
}

const Post: React.FC<PostProps> = ({ post, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const { user } = useAuth();
  const isAuthor = user?.username === post.author.username;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleLike = async () => {
    try {
      // Replace with actual API call
      setLiked(!liked);
      setLikesCount(prev => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author.username}`,
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <StyledCard elevation={0}>
      <CardHeader
        avatar={
          <Avatar src={post.author.avatar} sx={{ bgcolor: 'primary.main' }}>
            {post.author.username[0].toUpperCase()}
          </Avatar>
        }
        action={
          isAuthor && (
            <>
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
              </Menu>
            </>
          )
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {post.author.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        }
      />

      <CardContent>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {post.content}
        </Typography>
      </CardContent>

      {post.imageUrl && (
        <Box sx={{ px: 2, pb: 2 }}>
          <PostImage src={post.imageUrl} alt="Post" />
        </Box>
      )}

      <CardActions disableSpacing>
        <IconButton
          onClick={handleLike}
          sx={{
            color: liked ? 'error.main' : 'inherit',
          }}
        >
          <FavoriteIcon />
        </IconButton>
        <Typography sx={{ mr: 2 }}>{likesCount}</Typography>

        <IconButton>
          <CommentIcon />
        </IconButton>
        <Typography sx={{ mr: 2 }}>{post.comments}</Typography>

        <IconButton onClick={handleShare}>
          <ShareIcon />
        </IconButton>
      </CardActions>
    </StyledCard>
  );
};

export default Post;
