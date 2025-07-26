import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  useTheme,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { SegmentCondition } from './types';

// Mock data for attribute options
const ATTRIBUTE_OPTIONS = [
  { id: 'role', label: 'User Role', type: 'string', description: 'The role of the user in the system' },
  { id: 'status', label: 'Account Status', type: 'string', description: 'Current status of the user account' },
  { id: 'createdAt', label: 'Signup Date', type: 'date', description: 'When the user signed up' },
  { id: 'lastActive', label: 'Last Active', type: 'date', description: 'When the user was last active' },
  { id: 'totalSpend', label: 'Total Spend', type: 'number', description: 'Total amount spent by the user' },
  { id: 'sessionCount', label: 'Session Count', type: 'number', description: 'Number of user sessions' },
  { id: 'country', label: 'Country', type: 'string', description: 'User\'s country' },
  { id: 'device', label: 'Device Type', type: 'string', description: 'User\'s device type' },
  { id: 'source', label: 'Acquisition Source', type: 'string', description: 'How the user was acquired' },
  { id: 'plan', label: 'Subscription Plan', type: 'string', description: 'User\'s subscription plan' },
  { id: 'emailVerified', label: 'Email Verified', type: 'boolean', description: 'Whether the user has verified their email' },
  { id: 'hasProfilePicture', label: 'Has Profile Picture', type: 'boolean', description: 'Whether the user has uploaded a profile picture' },
];

// Operator options by attribute type
const OPERATOR_OPTIONS = {
  string: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
    { value: 'in', label: 'is one of' },
    { value: 'not_in', label: 'is not one of' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'gte', label: '≥' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '≤' },
    { value: 'between', label: 'is between' },
    { value: 'not_between', label: 'is not between' },
  ],
  date: [
    { value: 'equals', label: 'is on' },
    { value: 'not_equals', label: 'is not on' },
    { value: 'before', label: 'is before' },
    { value: 'after', label: 'is after' },
    { value: 'between', label: 'is between' },
    { value: 'in_last', label: 'in the last' },
    { value: 'not_in_last', label: 'not in the last' },
    { value: 'in_next', label: 'in the next' },
    { value: 'not_in_next', label: 'not in the next' },
  ],
  boolean: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
  ],
};

interface SegmentConditionProps {
  condition: SegmentCondition;
  index: number;
  onUpdate: (index: number, field: keyof SegmentCondition, value: any) => void;
  onRemove: (index: number) => void;
}

const SegmentCondition: React.FC<SegmentConditionProps> = ({
  condition,
  index,
  onUpdate,
  onRemove,
}) => {
  const theme = useTheme();

  // Get the selected attribute
  const selectedAttribute = ATTRIBUTE_OPTIONS.find(
    (attr) => attr.id === condition.attribute
  );

  // Get operators for the selected attribute type
  const getOperatorsForAttribute = (attributeId: string) => {
    const attribute = ATTRIBUTE_OPTIONS.find((attr) => attr.id === attributeId);
    if (!attribute) return [];
    return OPERATOR_OPTIONS[attribute.type as keyof typeof OPERATOR_OPTIONS] || [];
  };

  // Handle attribute change
  const handleAttributeChange = (e: SelectChangeEvent) => {
    const attributeId = e.target.value;
    const attribute = ATTRIBUTE_OPTIONS.find((attr) => attr.id === attributeId);
    
    // Reset operator and value when attribute changes
    onUpdate(index, 'attribute', attributeId);
    
    if (attribute) {
      const operators = getOperatorsForAttribute(attributeId);
      if (operators.length > 0) {
        onUpdate(index, 'operator', operators[0].value);
      }
      onUpdate(index, 'value', '');
      onUpdate(index, 'value2', undefined);
    }
  };

  // Handle operator change
  const handleOperatorChange = (e: SelectChangeEvent) => {
    onUpdate(index, 'operator', e.target.value);
  };

  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, 'value', e.target.value);
  };

  // Handle second value change (for between operators)
  const handleValue2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, 'value2', e.target.value);
  };

  // Render the appropriate input based on attribute type
  const renderValueInput = () => {
    if (!selectedAttribute) return null;
    
    // Don't render value input for operators that don't need it
    if (['is_empty', 'is_not_empty'].includes(condition.operator)) {
      return null;
    }

    // Render date picker for date fields
    if (selectedAttribute.type === 'date') {
      return (
        <TextField
          type="date"
          size="small"
          fullWidth
          value={condition.value || ''}
          onChange={handleValueChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
      );
    }

    // Render number input for number fields
    if (selectedAttribute.type === 'number') {
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={condition.value || ''}
          onChange={handleValueChange}
          inputProps={{
            step: 'any',
          }}
        />
      );
    }

    // Render select for boolean fields
    if (selectedAttribute.type === 'boolean') {
      return (
        <Select
          size="small"
          fullWidth
          value={condition.value || ''}
          onChange={(e) => onUpdate(index, 'value', e.target.value === 'true')}
        >
          <MenuItem value="true">True</MenuItem>
          <MenuItem value="false">False</MenuItem>
        </Select>
      );
    }

    // Default text input for string fields
    return (
      <TextField
        type="text"
        size="small"
        fullWidth
        value={condition.value || ''}
        onChange={handleValueChange}
        placeholder={`Enter ${selectedAttribute.label.toLowerCase()}`}
      />
    );
  };

  // Render the second value input for 'between' operators
  const renderSecondValueInput = () => {
    if (!['between', 'not_between'].includes(condition.operator) || !selectedAttribute) {
      return null;
    }

    // Render date picker for date fields
    if (selectedAttribute.type === 'date') {
      return (
        <TextField
          type="date"
          size="small"
          fullWidth
          value={condition.value2 || ''}
          onChange={handleValue2Change}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 1 }}
        />
      );
    }

    // Render number input for number fields
    if (selectedAttribute.type === 'number') {
      return (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={condition.value2 || ''}
          onChange={handleValue2Change}
          inputProps={{
            step: 'any',
          }}
          sx={{ mt: 1 }}
        />
      );
    }

    // Default text input for string fields
    return (
      <TextField
        type="text"
        size="small"
        fullWidth
        value={condition.value2 || ''}
        onChange={handleValue2Change}
        placeholder={`Enter ${selectedAttribute.label.toLowerCase()}`}
        sx={{ mt: 1 }}
      />
    );
  };

  // Get the operator options for the selected attribute
  const operatorOptions = selectedAttribute
    ? getOperatorsForAttribute(selectedAttribute.id)
    : [];

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        position: 'relative',
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box display="flex" alignItems="flex-start" gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
          <InputLabel id={`attribute-${index}-label`}>Attribute</InputLabel>
          <Select
            labelId={`attribute-${index}-label`}
            id={`attribute-${index}`}
            value={condition.attribute || ''}
            onChange={handleAttributeChange}
            label="Attribute"
            fullWidth
          >
            <MenuItem value="">
              <em>Select an attribute</em>
            </MenuItem>
            {ATTRIBUTE_OPTIONS.map((attr) => (
              <MenuItem key={attr.id} value={attr.id}>
                {attr.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
          <InputLabel id={`operator-${index}-label">Operator</InputLabel>
          <Select
            labelId={`operator-${index}-label`}
            id={`operator-${index}`}
            value={condition.operator || ''}
            onChange={handleOperatorChange}
            label="Operator"
            disabled={!condition.attribute}
            fullWidth
          >
            {operatorOptions.map((op) => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Box flex={1} minWidth={200}>
          {renderValueInput()}
          {renderSecondValueInput()}
        </Box>
        
        <Tooltip title="Remove condition">
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            color="error"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {selectedAttribute && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: 'block',
            mt: 1,
            fontStyle: 'italic',
          }}
        >
          {selectedAttribute.description}
        </Typography>
      )}
    </Box>
  );
};

export default SegmentCondition;
