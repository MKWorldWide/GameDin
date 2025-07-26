// Test setup imports
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { createElement, ReactElement } from 'react';
import { setupServer } from 'msw/node';

// Import handlers for MSW
import { handlers } from './test/mocks/handlers';

// Setup MSW server for API mocking
const server = setupServer(...handlers);

// Setup server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after tests are done
afterAll(() => server.close());

// Mock window.matchMedia with proper TypeScript types
interface MockMediaQueryList extends MediaQueryList {
  addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
  removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any) => void;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
}

const createMatchMedia = (query: string): MockMediaQueryList => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => createMatchMedia(query),
});

// Mock ResizeObserver with proper TypeScript types
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// @ts-ignore - Adding to global scope for testing
global.ResizeObserver = ResizeObserver;

// Mock react-chartjs-2 with proper TypeScript types
vi.mock('react-chartjs-2', () => ({
  Line: (): ReactElement => createElement('div', { 'data-testid': 'line-chart' }),
  Bar: (): ReactElement => createElement('div', { 'data-testid': 'bar-chart' }),
  Pie: (): ReactElement => createElement('div', { 'data-testid': 'pie-chart' }),
}));

// Mock date-fns with comprehensive mocks for all used functions
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  const fixedDate = new Date('2023-01-01T00:00:00.000Z');
  
  // Create a mock implementation that can be spied on
  const mockDateFns = {
    // Formatting
    format: (date: Date, formatStr: string): string => {
      if (formatStr === 'MMM d, yyyy') {
        return 'Jan 1, 2023';
      }
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    },
    
    // Date manipulation
    addDays: (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    subDays: (date: Date, days: number): Date => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    },
    subMonths: (date: Date, months: number): Date => {
      const result = new Date(date);
      result.setMonth(result.getMonth() - months);
      return result;
    },
    
    // Date comparison
    isAfter: (date: Date, dateToCompare: Date): boolean => date > dateToCompare,
    isBefore: (date: Date, dateToCompare: Date): boolean => date < dateToCompare,
    isSameDay: (date1: Date, date2: Date): boolean => 
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate(),
    
    // Date parts
    startOfDay: (date: Date): Date => new Date(date.setHours(0, 0, 0, 0)),
    endOfDay: (date: Date): Date => new Date(date.setHours(23, 59, 59, 999)),
    
    // Parsing
    parseISO: (dateString: string): Date => new Date(dateString),
    
    // Date differences
    differenceInDays: (dateLeft: Date, dateRight: Date): number => {
      const diffTime = dateLeft.getTime() - dateRight.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Current date
    now: (): number => fixedDate.getTime(),
  };

  // Spy on all methods and merge with actual date-fns
  const spies = Object.entries(mockDateFns).reduce((acc, [key, fn]) => {
    return {
      ...acc,
      [key]: vi.fn(fn as any),
    };
  }, {});

  return {
    ...actual,
    ...spies,
  };
});

// Mock @tanstack/react-query with proper TypeScript types
const mockQueryData = {
  data: {
    metrics: {
      totalUsers: 1245,
      activeUsers: 845,
      avgSession: '2m 45s',
      bounceRate: '23%',
    },
    charts: {
      users: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Users',
            data: [65, 59, 80, 81, 56, 55],
          },
        ],
      },
    },
  },
  isLoading: false,
  isError: false,
  error: null,
};

// Mock @tanstack/react-query with proper TypeScript types
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQuery: vi.fn(() => mockQueryData),
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});
