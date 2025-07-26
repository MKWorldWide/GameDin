import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Close as CloseIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

import { 
  SegmentCondition, 
  ConditionGroup, 
  SimpleCondition, 
  LogicalOperator,
  SegmentType 
} from './types';

// Available operators for different condition types
const OPERATORS = {
  user: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'exists', label: 'exists' },
    { value: 'not_exists', label: 'does not exist' },
    { value: 'in', label: 'is in list' },
    { value: 'not_in', label: 'is not in list' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
    { value: 'between', label: 'is between' },
  ],
  date: [
    { value: 'before', label: 'is before' },
    { value: 'after', label: 'is after' },
    { value: 'on', label: 'is on' },
    { value: 'not_on', label: 'is not on' },
    { value: 'in_the_last', label: 'in the last' },
    { value: 'not_in_the_last', label: 'not in the last' },
  ],
  boolean: [
    { value: 'is_true', label: 'is true' },
    { value: 'is_false', label: 'is false' },
  ],
};

// Available attributes for user properties
const USER_ATTRIBUTES = [
  { value: 'email', label: 'Email', type: 'user' },
  { value: 'name', label: 'Name', type: 'user' },
  { value: 'role', label: 'Role', type: 'user' },
  { value: 'created_at', label: 'Signup Date', type: 'date' },
  { value: 'last_login', label: 'Last Login', type: 'date' },
  { value: 'login_count', label: 'Login Count', type: 'number' },
  { value: 'is_active', label: 'Is Active', type: 'boolean' },
  { value: 'plan', label: 'Subscription Plan', type: 'user' },
  { value: 'country', label: 'Country', type: 'user' },
  { value: 'language', label: 'Language', type: 'user' },
];

interface ConditionBuilderProps {
  condition: SegmentCondition;
  depth?: number;
  onUpdate: (condition: SegmentCondition) => void;
  onRemove: () => void;
  onAddNested?: (parentId: string, condition: SegmentCondition) => void;
  isRoot?: boolean;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  condition,
  depth = 0,
  onUpdate,
  onRemove,
  onAddNested,
  isRoot = false,
}) => {
  const theme = useTheme();
  const isGroup = 'isGroup' in condition && condition.isGroup;
  const isRootGroup = isRoot && isGroup;
  const showRemove = !isRootGroup && !isRoot;
  const showAddNested = isGroup && depth < 3; // Limit nesting depth

  const handleAttributeChange = (attr: string) => {
    const attrType = USER_ATTRIBUTES.find(a => a.value === attr)?.type || 'user';
    const defaultOperator = OPERATORS[attrType as keyof typeof OPERATORS]?.[0]?.value || 'equals';
    
    onUpdate({
      ...condition,
      attribute: attr,
      type: attrType as SegmentType,
      operator: defaultOperator,
      value: '',
      value2: undefined,
    });
  };

  const handleOperatorChange = (operator: string) => {
    onUpdate({
      ...condition,
      operator,
      // Reset values when operator changes
      value: '',
      value2: undefined,
    });
  };

  const handleValueChange = (value: any) => {
    onUpdate({
      ...condition,
      value,
    });
  };

  const handleValue2Change = (value2: any) => {
    onUpdate({
      ...condition,
      value2,
    });
  };

  const handleAddCondition = () => {
    if (!isGroup) return;
    
    const newCondition: SimpleCondition = {
      id: uuidv4(),
      type: 'user',
      attribute: 'email',
      operator: 'equals',
      value: '',
    };
    
    onUpdate({
      ...condition,
      conditions: [...(condition.conditions || []), newCondition],
    });
  };

  const handleAddGroup = () => {
    if (!isGroup) return;
    
    const newGroup: ConditionGroup = {
      id: uuidv4(),
      isGroup: true,
      logicalOperator: 'AND',
      conditions: [
        {
          id: uuidv4(),
          type: 'user',
          attribute: 'email',
          operator: 'equals',
          value: '',
        },
      ],
    };
    
    onUpdate({
      ...condition,
      conditions: [...(condition.conditions || []), newGroup],
    });
  };

  const handleUpdateNested = (id: string, updatedCondition: SegmentCondition) => {
    if (!isGroup) return;
    
    onUpdate({
      ...condition,
      conditions: (condition.conditions || []).map(c => 
        c.id === id ? updatedCondition : c
      ),
    });
  };

  const handleRemoveNested = (id: string) => {
    if (!isGroup) return;
    
    onUpdate({
      ...condition,
      conditions: (condition.conditions || []).filter(c => c.id !== id),
    });
  };

  const renderConditionInputs = () => {
    if (isGroup) return null;
    
    const attrType = USER_ATTRIBUTES.find(a => a.value === condition.attribute)?.type || 'user';
    const operators = OPERATORS[attrType as keyof typeof OPERATORS] || OPERATORS.user;
    const selectedOperator = operators.find(op => op.value === condition.operator);
    const showSecondValue = selectedOperator?.value === 'between';

    return (
      <>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Attribute</InputLabel>
          <Select
            value={condition.attribute || ''}
            onChange={(e) => handleAttributeChange(e.target.value)}
            label="Attribute"
          >
            {USER_ATTRIBUTES.map(attr => (
              <MenuItem key={attr.value} value={attr.value}>
                {attr.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Operator</InputLabel>
          <Select
            value={condition.operator || ''}
            onChange={(e) => handleOperatorChange(e.target.value)}
            label="Operator"
          >
            {operators.map(op => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          value={condition.value || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Value"
          sx={{ flex: 1 }}
        />

        {showSecondValue && (
          <TextField
            size="small"
            value={condition.value2 || ''}
            onChange={(e) => handleValue2Change(e.target.value)}
            placeholder="And"
            sx={{ flex: 1 }}
          />
        )}
      </>
    );
  };

  if (isGroup) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 1,
        }}
      >
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2">
              {isRootGroup ? 'Match' : 'Group'} where
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={condition.logicalOperator || 'AND'}
                onChange={(e) => 
                  onUpdate({
                    ...condition,
                    logicalOperator: e.target.value as LogicalOperator,
                  })
                }
                sx={{
                  '& .MuiSelect-select': {
                    py: 0.5,
                  },
                }}
              >
                <MenuItem value="AND">All</MenuItem>
                <MenuItem value="OR">Any</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2">of the following are true:</Typography>
            
            <Box flex={1} />
            
            {showRemove && (
              <Tooltip title="Remove group">
                <IconButton size="small" onClick={onRemove}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Stack spacing={2} pl={4}>
            {condition.conditions?.map((childCondition) => (
              <ConditionBuilder
                key={childCondition.id}
                condition={childCondition}
                depth={depth + 1}
                onUpdate={(updated) => handleUpdateNested(childCondition.id, updated)}
                onRemove={() => handleRemoveNested(childCondition.id)}
                onAddNested={onAddNested}
              />
            ))}
            
            <Box display="flex" gap={1} mt={1}>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddCondition}
                variant="outlined"
              >
                Add condition
              </Button>
              
              {showAddNested && (
                <Button
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={handleAddGroup}
                  variant="outlined"
                >
                  Add group
                </Button>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      gap={1}
      p={1}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <DragIndicatorIcon color="action" sx={{ cursor: 'grab' }} />
      
      {renderConditionInputs()}
      
      <Tooltip title="Remove condition">
        <IconButton size="small" onClick={onRemove}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ConditionBuilder;
