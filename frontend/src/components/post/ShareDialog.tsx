import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Reddit as RedditIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Repeat as RepostIcon,
} from '@mui/icons-material';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  postUrl: string;
  onRepost?: (content: string) => Promise<void>;
}

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: (url: string, title: string) => void;
}

const shareOptions: ShareOption[] = [
  {
    name: 'Facebook',
    icon: <FacebookIcon />,
    color: '#1877f2',
    onClick: url => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank'
      );
    },
  },
  {
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1da1f2',
    onClick: (url, title) => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`,
        '_blank'
      );
    },
  },
  {
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    color: '#0a66c2',
    onClick: (url, title) => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank'
      );
    },
  },
  {
    name: 'Reddit',
    icon: <RedditIcon />,
    color: '#ff4500',
    onClick: (url, title) => {
      window.open(
        `https://reddit.com/submit?url=${encodeURIComponent(
          url
        )}&title=${encodeURIComponent(title)}`,
        '_blank'
      );
    },
  },
  {
    name: 'WhatsApp',
    icon: <WhatsAppIcon />,
    color: '#25d366',
    onClick: (url, title) => {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank');
    },
  },
  {
    name: 'Telegram',
    icon: <TelegramIcon />,
    color: '#0088cc',
    onClick: (url, title) => {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        '_blank'
      );
    },
  },
  {
    name: 'Email',
    icon: <EmailIcon />,
    color: '#ea4335',
    onClick: (url, title) => {
      window.location.href = `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(`Check this out: ${url}`)}`;
    },
  },
];

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  postId,
  postTitle,
  postUrl,
  onRepost,
}) => {
  const [repostContent, setRepostContent] = useState('');
  const [showRepost, setShowRepost] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error',
      });
    }
  };

  const handleRepost = async () => {
    if (!repostContent.trim() || !onRepost) return;

    try {
      await onRepost(repostContent);
      setSnackbar({
        open: true,
        message: 'Post shared successfully',
        severity: 'success',
      });
      setRepostContent('');
      setShowRepost(false);
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to share post',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Share Post</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {showRepost ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add your thoughts..."
                value={repostContent}
                onChange={e => setRepostContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Sharing: {postTitle}
              </Typography>
            </Box>
          ) : (
            <>
              <List>
                {shareOptions.map(option => (
                  <ListItem
                    key={option.name}
                    button
                    onClick={() => option.onClick(postUrl, postTitle)}
                  >
                    <ListItemIcon sx={{ color: option.color }}>{option.icon}</ListItemIcon>
                    <ListItemText primary={option.name} />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'action.hover',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={postUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy link">
                  <IconButton onClick={handleCopyLink} color="primary">
                    <LinkIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {onRepost && (
                <Button
                  fullWidth
                  startIcon={<RepostIcon />}
                  onClick={() => setShowRepost(true)}
                  sx={{ mt: 2 }}
                >
                  Repost
                </Button>
              )}
            </>
          )}
        </DialogContent>

        {showRepost && (
          <DialogActions>
            <Button onClick={() => setShowRepost(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleRepost} disabled={!repostContent.trim()}>
              Share
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareDialog;
