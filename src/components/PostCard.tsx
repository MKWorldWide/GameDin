import React, { forwardRef } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Box,
  IconButton,
  Button,
  Chip,
  CardHeader,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { FeedItem } from '../types/social';
import { Link } from 'react-router-dom';

interface IPostCardProps {
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatarUrl: string;
      rank?: string;
    };
    createdAt: string;
    likes: number;
    comments: number;
    liked: boolean;
    media?: {
      type: 'image' | 'video';
      url: string;
    }[];
    tags: string[];
  };
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
  onShare?: (postId: string) => void;
}

const PostCard = forwardRef<HTMLDivElement, IPostCardProps>(
  ({ post, onLike, onComment, onShare }, ref) => {
    const handleLike = () => {
      onLike?.(post.id);
    };

    const handleComment = (comment: string) => {
      onComment?.(post.id, comment);
    };

    const handleShare = () => {
      onShare?.(post.id);
    };

    return (
      <Card ref={ref} sx={{ mb: 2 }}>
        <CardHeader
          avatar={
            <Link to={`/profile/${post.author.username}`}>
              <Avatar src={post.author.avatarUrl} />
            </Link>
          }
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Link
                to={`/profile/${post.author.username}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="subtitle1">{post.author.username}</Typography>
              </Link>
              {post.author.rank && (
                <Chip label={post.author.rank} size="small" color="primary" variant="outlined" />
              )}
            </Box>
          }
          subheader={new Date(post.createdAt).toLocaleString()}
        />
        <CardContent>
          <Typography variant="body1" paragraph>
            {post.content}
          </Typography>
          {post.media && post.media.length > 0 && (
            <Box sx={{ mt: 2 }}>
              {post.media.map((media, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Post media ${index + 1}`}
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  ) : (
                    <video src={media.url} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
          {post.tags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {post.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    /* Handle tag click */
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions>
          <Button
            startIcon={<FavoriteIcon color={post.liked ? 'error' : 'inherit'} />}
            onClick={handleLike}
          >
            {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
          </Button>
          <Button startIcon={<CommentIcon />}>
            {post.comments} {post.comments === 1 ? 'Comment' : 'Comments'}
          </Button>
          <IconButton onClick={handleShare}>
            <ShareIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }
);

PostCard.displayName = 'PostCard';

export default PostCard;
