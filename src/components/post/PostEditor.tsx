import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AttachFile as FileIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  Group as GroupIcon,
  LocalOffer as TagIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import { IPostMedia } from '../../types/social';

interface IPostEditorProps {
  initialContent?: string;
  initialPrivacy?: PostPrivacy;
  initialTags?: string[];
  isEditing?: boolean;
  onSubmit: (post: IPostData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export type PostPrivacy = 'public' | 'private' | 'friends';

export interface IPostData {
  content: string;
  privacy: PostPrivacy;
  tags: string[];
  media: IPostMedia[];
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'code-block'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'link',
  'code-block',
];

const PostEditor: React.FC<IPostEditorProps> = ({
  initialContent = '',
  initialPrivacy = 'public',
  initialTags = [],
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [privacy, setPrivacy] = useState<PostPrivacy>(initialPrivacy);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [media, setMedia] = useState<IPostMedia[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newMedia = acceptedFiles.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 'video',
      file,
      preview: URL.createObjectURL(file)
    })) as IPostMedia[];

    setMedia(prev => [...prev, ...newMedia]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const handlePrivacyChange = (newPrivacy: PostPrivacy) => {
    setPrivacy(newPrivacy);
    setShowPrivacyDialog(false);
  };

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || media.length > 0) {
      const postData: IPostData = {
        content,
        privacy,
        tags,
        media,
      };

      await onSubmit(postData);
      setContent('');
      setPrivacy('public');
      setTags([]);
      setMedia([]);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar src={user?.avatar} alt={user?.username} />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Typography variant="subtitle1">{user?.username}</Typography>
            <Button
              size="small"
              startIcon={
                privacy === 'public' ? (
                  <PublicIcon />
                ) : privacy === 'private' ? (
                  <PrivateIcon />
                ) : (
                  <GroupIcon />
                )
              }
              onClick={() => setShowPrivacyDialog(true)}
            >
              {privacy.charAt(0).toUpperCase() + privacy.slice(1)}
            </Button>
          </Box>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
            />

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-base-300'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>

            {media.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {media.map((item, index) => (
                  <div key={index} className="relative">
                    {item.type === 'image' ? (
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={item.preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="btn btn-circle btn-sm absolute top-2 right-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {tags.map(tag => (
                  <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
                ))}
              </Stack>
              <TextField
                inputRef={tagInputRef}
                size="small"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                sx={{ mt: 1 }}
                InputProps={{
                  startAdornment: <TagIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Box>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading || (!content.trim() && media.length === 0)}
              >
                {isEditing ? 'Save Changes' : 'Post'}
              </Button>
            </div>
          </form>

          {/* Privacy Dialog */}
          <Dialog open={showPrivacyDialog} onClose={() => setShowPrivacyDialog(false)}>
            <DialogTitle>Who can see your post?</DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Button
                  startIcon={<PublicIcon />}
                  onClick={() => handlePrivacyChange('public')}
                  variant={privacy === 'public' ? 'contained' : 'outlined'}
                  fullWidth
                >
                  Public
                </Button>
                <Button
                  startIcon={<GroupIcon />}
                  onClick={() => handlePrivacyChange('friends')}
                  variant={privacy === 'friends' ? 'contained' : 'outlined'}
                  fullWidth
                >
                  Friends Only
                </Button>
                <Button
                  startIcon={<PrivateIcon />}
                  onClick={() => handlePrivacyChange('private')}
                  variant={privacy === 'private' ? 'contained' : 'outlined'}
                  fullWidth
                >
                  Only Me
                </Button>
              </Stack>
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </Paper>
  );
};

export default PostEditor;
