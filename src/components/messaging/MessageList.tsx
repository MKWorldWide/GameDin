import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  ImageList,
  ImageListItem,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  ContentCopy as CopyIcon,
  Report as ReportIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { IMessage, IAttachment } from '../../types/social';
import { useAuth } from '../../context/AuthContext';
import ReactionBar from '../post/ReactionBar';
import useStore from '../../store/useStore';

interface MessageListProps {
  messages: IMessage[];
  onEdit?: (message: IMessage, newContent: string) => void;
  onDelete?: (message: IMessage) => void;
  onReply?: (message: IMessage) => void;
  onReactToMessage?: (messageId: string, reaction: string) => void;
  onReportMessage?: (messageId: string, reason: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onEdit,
  onDelete,
  onReply,
  onReactToMessage,
  onReportMessage,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, message: IMessage) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessage(null);
  };

  const handleEditClick = (message: IMessage) => {
    if (message) {
      setEditContent(message.content);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    if (selectedMessage && editContent.trim()) {
      await onEdit?.(selectedMessage, editContent);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteClick = (message: IMessage) => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedMessage) {
      await onDelete?.(selectedMessage);
      setDeleteDialogOpen(false);
    }
  };

  const handleReportClick = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  const handleReportSubmit = async () => {
    if (selectedMessage && reportReason.trim()) {
      await onReportMessage?.(selectedMessage.id, reportReason);
      setReportDialogOpen(false);
      setReportReason('');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    handleMenuClose();
  };

  const renderAttachment = (attachment: IAttachment) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="max-w-sm rounded-lg overflow-hidden">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        );
      case 'video':
        return (
          <div className="max-w-sm rounded-lg overflow-hidden">
            <video src={attachment.url} controls className="w-full h-auto" />
          </div>
        );
      case 'file':
        return (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 p-2 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
          >
            <span className="text-sm">{attachment.name}</span>
          </a>
        );
    }
  };

  const renderMessage = (message: IMessage) => {
    const isOwn = message.sender.id === user?.id;

    if (message.metadata?.isDeleted) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          This message has been deleted
        </Typography>
      );
    }

    return (
      <div
        key={message.id}
        id={`message-${message.id}`}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`flex max-w-[80%] ${
            isOwn ? 'flex-row-reverse items-end' : 'items-start'
          }`}
        >
          {!isOwn && (
            <div className="avatar">
              <div className="w-8 h-8 rounded-full">
                <img src={message.sender.avatar} alt={message.sender.username} />
              </div>
            </div>
          )}

          <div
            className={`flex flex-col space-y-1 ${
              isOwn ? 'items-end mr-2' : 'items-start ml-2'
            }`}
          >
            {!isOwn && (
              <span className="text-sm font-medium">{message.sender.username}</span>
            )}

            <div
              className={`rounded-lg p-3 ${
                isOwn
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>

              {message.attachments?.map((attachment, index) => (
                <div key={index} className="mt-2">
                  {renderAttachment(attachment)}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-xs opacity-60">
              <time>{new Date(message.createdAt).toLocaleString()}</time>
              {typeof onReply === 'function' && (
                <button
                  className="hover:underline"
                  onClick={() => onReply(message)}
                >
                  Reply
                </button>
              )}
              {isOwn && typeof onEdit === 'function' && (
                <IconButton onClick={() => handleEditClick(message)}>
                  <EditIcon />
                </IconButton>
              )}
              {isOwn && typeof onDelete === 'function' && (
                <IconButton onClick={() => handleDeleteClick(message)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
        }}
      >
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showDivider =
            prevMessage &&
            new Date(message.createdAt).getDate() !== new Date(prevMessage.createdAt).getDate();

          return (
            <React.Fragment key={message.id}>
              {showDivider && (
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </Typography>
                </Divider>
              )}
              <div className="message-container">
                {renderMessage(message)}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedMessage && onReply?.(selectedMessage)}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          Reply
        </MenuItem>
        <MenuItem onClick={() => selectedMessage && handleCopyText(selectedMessage.content)}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Copy Text
        </MenuItem>
        {selectedMessage?.sender.id === user?.id && (
          <>
            {typeof onEdit === 'function' && selectedMessage && (
              <MenuItem onClick={() => handleEditClick(selectedMessage)}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                Edit
              </MenuItem>
            )}
            {typeof onDelete === 'function' && selectedMessage && (
              <MenuItem onClick={() => handleDeleteClick(selectedMessage)}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                Delete
              </MenuItem>
            )}
          </>
        )}
        <MenuItem onClick={handleReportClick}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          Report
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Message</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Message</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Please provide a reason for reporting this message..."
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReportSubmit} color="error">
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageList;
