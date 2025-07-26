export type Operator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'greater_than' 
  | 'less_than' 
  | 'in' 
  | 'not_in';

export interface SegmentCondition {
  field: string;
  operator: Operator;
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  conditions: SegmentCondition[];
  userCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface SegmentFilter {
  status: 'all' | 'active' | 'inactive';
  tag: string;
  searchQuery: string;
}

export interface SortConfig {
  field: keyof UserSegment;
  direction: 'asc' | 'desc';
}

export interface SegmentTableProps {
  segments: UserSegment[];
  onEdit: (segment: UserSegment) => void;
  onDelete: (segmentId: string) => void;
  onDuplicate: (segment: UserSegment) => void;
  onView: (segment: UserSegment) => void;
  loading: boolean;
  error: string | null;
  sortConfig: SortConfig;
  onSort: (field: keyof UserSegment) => void;
  onFilter: (filter: Partial<SegmentFilter>) => void;
  filter: SegmentFilter;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  totalCount: number;
}
