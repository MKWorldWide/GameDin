import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { UserSegment, SegmentCondition, Operator } from '../../types/segment';

interface SegmentEditorProps {
  segment?: UserSegment | null;
  onSave: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const defaultCondition: SegmentCondition = {
  field: 'user.status',
  operator: 'equals',
  value: 'active',
};

const operatorOptions = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
  { value: 'in', label: 'is in' },
  { value: 'not_in', label: 'is not in' },
];

const fieldOptions = [
  { value: 'user.status', label: 'User Status' },
  { value: 'user.role', label: 'User Role' },
  { value: 'user.createdAt', label: 'Signup Date' },
  { value: 'user.lastActive', label: 'Last Active' },
  { value: 'user.email', label: 'Email' },
  { value: 'user.country', label: 'Country' },
  { value: 'user.subscription', label: 'Subscription Plan' },
  { value: 'user.device', label: 'Device Type' },
  { value: 'user.browser', label: 'Browser' },
  { value: 'user.os', label: 'Operating System' },
];

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segment,
  onSave,
  onCancel,
  loading = false,
}) => {
  const theme = useTheme();
  const [name, setName] = useState(segment?.name || '');
  const [description, setDescription] = useState(segment?.description || '');
  const [tags, setTags] = useState<string[]>(segment?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [conditions, setConditions] = useState<SegmentCondition[]>(
    segment?.conditions?.length ? [...segment.conditions] : [{ ...defaultCondition }]
  );
  const [isActive, setIsActive] = useState(segment?.isActive ?? true);

  useEffect(() => {
    if (segment) {
      setName(segment.name);
      setDescription(segment.description || '');
      setTags(segment.tags || []);
      setConditions(
        segment.conditions?.length ? [...segment.conditions] : [{ ...defaultCondition }]
      );
      setIsActive(segment.isActive ?? true);
    } else {
      // Reset form for new segment
      setName('');
      setDescription('');
      setTags([]);
      setConditions([{ ...defaultCondition }]);
      setIsActive(true);
    }
  }, [segment]);

  const handleAddCondition = () => {
    setConditions([...conditions, { ...defaultCondition }]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = [...conditions];
      newConditions.splice(index, 1);
      setConditions(newConditions);
    }
  };

  const handleConditionChange = (
    index: number,
    field: keyof SegmentCondition,
    value: any
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    const segmentData = {
      name: name.trim(),
      description: description.trim(),
      tags,
      conditions,
      isActive,
      userCount: segment?.userCount || 0,
    };

    onSave(segmentData);
  };

  return (
    <Card>
      <CardHeader
        title={segment ? 'Edit Segment' : 'Create New Segment'}
        action={
          <IconButton onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        }
      />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Segment Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                margin="normal"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                variant="outlined"
                placeholder="Describe what this segment is used for..."
              />

              <Box mt={3} mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Conditions
                </Typography>
                <Divider />
              </Box>

              {conditions.map((condition, index) => (
                <Box key={index} mb={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        select
                        fullWidth
                        label="Field"
                        value={condition.field}
                        onChange={(e) =>
                          handleConditionChange(index, 'field', e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      >
                        {fieldOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        select
                        fullWidth
                        label="Operator"
                        value={condition.operator}
                        onChange={(e) =>
                          handleConditionChange(
                            index,
                            'operator',
                            e.target.value as Operator
                          )
                        }
                        variant="outlined"
                        size="small"
                      >
                        {operatorOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Value"
                        value={condition.value as string}
                        onChange={(e) =>
                          handleConditionChange(index, 'value', e.target.value)
                        }
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => handleRemoveCondition(index)}
                        disabled={conditions.length <= 1}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddCondition}
                color="primary"
                size="small"
                sx={{ mt: 1 }}
              >
                Add Condition
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => handleRemoveTag(tag)}
                    />
                  ))}
                </Stack>
                <Box display="flex">
                  <TextField
                    fullWidth
                    size="small"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Box>

              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={!name.trim() || loading}
                >
                  {loading ? 'Saving...' : 'Save Segment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </Card>
  );
};

export default SegmentEditor;
