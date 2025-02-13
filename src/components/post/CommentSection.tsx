import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Stack,
  Collapse,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ThumbUp as LikeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../hooks/useUser';

export interface IComment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt?: string;
  likes: number;
  liked: boolean;
  replies: IComment[];
  parentId?: string;
}

interface CommentSectionProps {
  postId: string;
  comments: IComment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

interface CommentProps {
  comment: IComment;
  onReply: (content: string) => Promise<void>;
  onEdit: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onLike: () => Promise<void>;
  level?: number;
}

const MAX_NESTING_LEVEL = 3;

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  level = 0,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showReplies, setShowReplies] = useState(level < 2);
  const editInputRef = useRef<HTMLInputElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    await onEdit(editContent);
    setIsEditing(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    await onReply(replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isEditing, isReplying]);

  return (
    <Box sx={{ ml: level * 4 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Avatar
          src={comment.author.avatarUrl}
          alt={comment.author.username}
          sx={{ width: 32, height: 32 }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2">{comment.author.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
              {comment.updatedAt && ' (edited)'}
            </Typography>
          </Box>

          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                inputRef={editInputRef}
                fullWidth
                multiline
                size="small"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || editContent === comment.content}
                >
                  Save
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2">{comment.content}</Typography>
          )}

          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              startIcon={<LikeIcon color={comment.liked ? 'primary' : undefined} />}
              onClick={onLike}
            >
              {comment.likes > 0 && comment.likes}
            </Button>
            {level < MAX_NESTING_LEVEL && (
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </Button>
            )}
            {user?.username === comment.author.id && (
              <>
                <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
                  <MoreIcon fontSize="small" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      setIsEditing(true);
                    }}
                  >
                    <ListItemIcon>
                      <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onDelete();
                    }}
                  >
                    <ListItemIcon>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {isReplying && (
            <Box sx={{ mt: 1 }}>
              <TextField
                inputRef={replyInputRef}
                fullWidth
                multiline
                size="small"
                placeholder="Write a reply..."
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  onClick={() => {
                    setReplyContent('');
                    setIsReplying(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {comment.replies.length > 0 && (
        <>
          <Button
            size="small"
            startIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowReplies(!showReplies)}
            sx={{ ml: 5, mb: 1 }}
          >
            {showReplies ? 'Hide' : 'Show'} {comment.replies.length}{' '}
            {comment.replies.length === 1 ? 'reply' : 'replies'}
          </Button>
          <Collapse in={showReplies}>
            {comment.replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLike={onLike}
                level={level + 1}
              />
            ))}
          </Collapse>
        </>
      )}
    </Box>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
}) => {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const commentInputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await onAddComment(newComment);
    setNewComment('');
  };

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Please sign in to comment</p>
      </div>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          inputRef={commentInputRef}
          fullWidth
          multiline
          placeholder="Write a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()}>
            Comment
          </Button>
        </Box>
      </Box>

      <Stack spacing={2}>
        {comments
          .filter(comment => !comment.parentId)
          .map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={content => onAddComment(content, comment.id)}
              onEdit={content => onEditComment(comment.id, content)}
              onDelete={() => onDeleteComment(comment.id)}
              onLike={() => onLikeComment(comment.id)}
            />
          ))}
      </Stack>
    </Box>
  );
};

export default CommentSection;
