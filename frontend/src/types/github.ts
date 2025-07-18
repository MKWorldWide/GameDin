/**
 * GitHub Event Types and Interfaces
 * 
 * This module defines TypeScript interfaces for GitHub webhook events,
 * API responses, and AI analysis results used in the GitHub integration.
 */

// GitHub Event Types
export type GitHubEvent = 
  | 'push'
  | 'pull_request' | 'issues'
  | 'issue_comment' | 'create' | 'delete' | 'fork'
  | 'star'
  | 'watch';

// Base GitHub User interface
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  type: string;
}

// Base GitHub Repository interface
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_discussions: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
}

// Commit interface
export interface GitHubCommit {
  id: string;
  tree_id: string;
  distinct: boolean;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
  };
  committer: {
    name: string;
    email: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

// Push Event Payload
export interface PushPayload {
  ref: string;
  before: string;
  after: string;
  created: boolean;
  deleted: boolean;
  forced: boolean;
  base_ref: string | null;
  compare: string;
  commits: GitHubCommit | null;
  repository: GitHubRepository;
  pusher: {
    name: string;
    email: string;
  };
  sender: GitHubUser;
}

// Pull Request interface
export interface GitHubPullRequest {
  id: number;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: any[];
  labels: any[];
  milestone: any | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: GitHubUser;
    repo: GitHubRepository;
  };
  _links: {
    self: { href: string };
    html: { href: string };
    issue: { href: string };
    comments: { href: string };
    review_comments: { href: string };
    review_comment: { href: string };
    commits: { href: string };
    statuses: { href: string };
  };
  author_association: string;
  auto_merge: any | null;
  active_lock_reason: string | null;
}

// Pull Request Event Payload
export interface PullRequestPayload {
  action: string;
  number: number;
  pull_request: GitHubPullRequest;
  repository: GitHubRepository;
  sender: GitHubUser;
  installation?: {
    id: number;
    node_id: string;
  };
}

// Issue interface
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  user: GitHubUser;
  labels: any[];
  state: string;
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: any | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author_association: string;
  active_lock_reason: string | null;
  body: string | null;
  reactions: {
    url: string;
    total_count: number;
    +1: number;
    -1: number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
  timeline_url: string;
  performed_via_github_app: any | null;
  state_reason: string | null;
  draft?: boolean;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    merged_at: string | null;
  };
}

// Issue Event Payload
export interface IssuePayload {
  action: string;
  issue: GitHubIssue;
  repository: GitHubRepository;
  sender: GitHubUser;
  installation?: {
    id: number;
    node_id: string;
  };
  changes?: {
    title?: {
      from: string;
    };
    body?: {
      from: string;
    };
  };
  assignee?: GitHubUser;
  label?: {
    id: number;
    name: string;
    color: string;
    description: string | null;
  };
}

// Comment interface
export interface GitHubComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  author_association: string;
  performed_via_github_app: any | null;
}

// Issue Comment Event Payload
export interface IssueCommentPayload {
  action: string;
  issue: GitHubIssue;
  comment: GitHubComment;
  repository: GitHubRepository;
  sender: GitHubUser;
  installation?: {
    id: number;
    node_id: string;
  };
}

// AI Analysis Result
export interface AIAnalysisResult {
  eventType: GitHubEvent;
  repository: string;
  analysis: string;
  securityAnalysis: string;
  action: GitHubAction;
  timestamp: string;
  prNumber?: number;
  issueNumber?: number;
}

// GitHub Action types
export interface GitHubAction {
  type: 'comment' | 'approve' | 'request_changes' | 'none';
  shouldComment: boolean;
  comment?: string;
  confidence?: number;
}

// Webhook Payload Union Type
export type WebhookPayload = {
  push: PushPayload;
  pull_request: PullRequestPayload;
  issues: IssuePayload;
  issue_comment: IssueCommentPayload;
};

// GitHub API Response interfaces
export interface GitHubAPIResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Rate Limiting interface
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

// Webhook Configuration
export interface WebhookConfig {
  url: string;
  content_type: 'json' | 'form';
  secret?: string;
  insecure_ssl?: '0' | '1';
  events: GitHubEvent[];
  active: boolean;
}

// Repository Webhook
export interface RepositoryWebhook {
  id: number;
  name: string;
  events: GitHubEvent[];
  config: WebhookConfig;
  updated_at: string;
  created_at: string;
  url: string;
  test_url: string;
  ping_url: string;
  deliveries_url: string;
  last_response: {
    code: number | null;
    status: string | null;
    message: string | null;
  };
}

// Error Response
export interface GitHubError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// Security Analysis Result
export interface SecurityAnalysis {
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    file?: string;
    line?: number;
    recommendation: string;
  }>;
  summary: string;
  risk_score: number;
}

// Code Quality Analysis
export interface CodeQualityAnalysis {
  overall_score: number;
  maintainability: number;
  reliability: number;
  security: number;
  issues: Array<{
    type: string;
    severity: string;
    message: string;
    file?: string;
    line?: number;
  }>;
  suggestions: string[];
} 