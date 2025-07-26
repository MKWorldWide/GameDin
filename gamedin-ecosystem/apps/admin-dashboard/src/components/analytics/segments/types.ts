// Types for User Segmentation feature

export type SegmentType = 'user' | 'event' | 'property' | 'date' | 'custom';

export type LogicalOperator = 'AND' | 'OR';

export interface BaseCondition {
  id: string;
  type: SegmentType;
  isGroup?: boolean;
  operator?: string;
  attribute?: string;
  value?: any;
  value2?: any;
  logicalOperator?: LogicalOperator;
  conditions?: SegmentCondition[];
}

export interface SimpleCondition extends BaseCondition {
  isGroup?: false;
  attribute: string;
  operator: string;
  value: any;
  value2?: any;
}

export interface ConditionGroup extends BaseCondition {
  isGroup: true;
  logicalOperator: LogicalOperator;
  conditions: SegmentCondition[];
}

export type SegmentCondition = SimpleCondition | ConditionGroup;

export interface UserSegment {
  id: string;
  name: string;
  description?: string;
  filter: ConditionGroup; // Root condition group
  userCount: number;
  isActive: boolean;
  isSystem?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  metadata?: Record<string, any>;
  version?: number; // For optimistic concurrency control
}

export interface UserSegmentStats {
  totalUsers: number;
  matchedUsers: number;
  matchRate: number;
  lastUpdated: string;
  changeFromPrevious?: number;
  userDistribution?: {
    byPlatform?: Record<string, number>;
    byCountry?: Record<string, number>;
    byDevice?: Record<string, number>;
  };
}

export interface UserSegmentActivity {
  id: string;
  action: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  details?: Record<string, any>;
}

export interface UserSegmentIntegration {
  id: string;
  type: string;
  name: string;
  description?: string;
  isActive: boolean;
  config: Record<string, any>;
  lastSynced?: string;
  syncStatus?: 'success' | 'failed' | 'in-progress' | 'pending';
  error?: string;
}

export interface UserSegmentTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  filter: SegmentCondition[];
  tags?: string[];
  isSystem?: boolean;
  isPremium?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSegmentPermission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: 'viewer' | 'editor' | 'admin';
  grantedAt: string;
  grantedBy: string;
}

export interface UserSegmentSchedule {
  id: string;
  isActive: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  timezone: string;
  dayOfWeek?: number[];
  dayOfMonth?: number;
  customCron?: string;
  nextRun?: string;
  lastRun?: string;
  lastRunStatus?: 'success' | 'failed' | 'in-progress';
  lastRunError?: string;
  createdAt: string;
  updatedAt: string;
}
