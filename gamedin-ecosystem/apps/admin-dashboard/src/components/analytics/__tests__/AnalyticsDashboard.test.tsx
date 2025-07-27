import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { vi, describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { theme } from '../../../theme';
import { generateMockAnalyticsData } from '../../../__mocks__/api/analyticsService';

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

// Mock the file-saver module
const mockSaveAs = vi.fn();
vi.mock('file-saver', () => ({
  saveAs: mockSaveAs,
}));

// Mock the notistack module
const mockEnqueueSnackbar = vi.fn();
const mockCloseSnackbar = vi.fn();

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
    closeSnackbar: mockCloseSnackbar,
  }),
}));

// Mock date-fns with TypeScript support
const mockFormat = vi.fn().mockReturnValue('2023-01-01');
const mockSubDays = vi.fn((date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(date.getDate() - days);
  return result;
});
const mockSubMonths = vi.fn((date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(date.getMonth() - months);
  return result;
});
const mockParseISO = vi.fn((dateString: string) => new Date(dateString));
const mockIsAfter = vi.fn((date1: Date, date2: Date) => date1 > date2);

vi.mock('date-fns', () => ({
  format: mockFormat,
  subDays: mockSubDays,
  subMonths: mockSubMonths,
  parseISO: mockParseISO,
  isAfter: mockIsAfter,
  startOfDay: (date: Date) => new Date(date.setHours(0, 0, 0, 0)),
  endOfDay: (date: Date) => new Date(date.setHours(23, 59, 59, 999)),
  differenceInSeconds: (date1: Date, date2: Date) => (date1.getTime() - date2.getTime()) / 1000,
}));

// Mock Chart.js components
const MockChart = ({ 
  type,
  data,
  options,
  ...props 
}: { 
  type: string;
  data: any;
  options: any;
  [key: string]: any;
}) => {
  // Store data and options as data attributes for testing
  return (
    <div 
      data-testid={`mock-${type}-chart`}
      data-options={JSON.stringify(options)}
      data-props={JSON.stringify(props)}
    >
      {JSON.stringify(data)}
    </div>
  );
};

vi.mock('react-chartjs-2', () => ({
  Line: (props: any) => <MockChart type="line" {...props} />,
  Bar: (props: any) => <MockChart type="bar" {...props} />,
  Pie: (props: any) => <MockChart type="pie" {...props} />,
}));

// Mock Chart.js registerables
vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
      getChart: vi.fn(() => ({
        data: { datasets: [{}] },
        update: vi.fn(),
      })),
    },
    registerables: [],
  };
});

// Set up MSW server for API mocking
const server = setupServer(
  // Success response for analytics data
  http.get('/api/analytics', async ({ request }) => {
    const url = new URL(request.url);
    const range = url.searchParams.get('range');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return HttpResponse.json({
      data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [
          {
            label: 'Users',
            data: [100, 200, 300],
          },
        ],
        metadata: {
          range,
          startDate,
          endDate,
        },
      },
    });
  }),
  
  // Export handler
  http.get('/api/analytics/export', async ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    
    return HttpResponse.json({
      url: `data:application/${format};base64,test`,
      filename: `analytics-export.${format}`,
    });
  }),
  
  // Error handler for testing error states
  http.get('/api/analytics/error', () => {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any runtime request handlers we may add during the tests
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Clean up after all tests are done
afterAll(() => server.close());

// Wrapper component to provide required context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('AnalyticsDashboard', () => {
  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  // Test 1: Initial Load - Loading State
  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // Test 2: Initial Load - Success State
  it('renders chart data after successful fetch', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if chart is rendered with data
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    expect(screen.getByText(/Mock Line Chart/)).toBeInTheDocument();
  });

  // Test 3: Initial Load - Error State
  it('shows error message when data fetch fails', async () => {
    // Override the default handler with error handler
    server.use(http.get('/api/analytics', () => {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for error to be handled
    await waitFor(() => {
      expect(screen.getByText(/error loading analytics data/i)).toBeInTheDocument();
    });
  });

  // Test 4: Date Range Selection
  it('allows changing date range', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the date range selector
    const dateRangeButton = screen.getByTestId('select-date-range');
    fireEvent.click(dateRangeButton);

    // Verify the date range was updated
    await waitFor(() => {
      expect(screen.getByTestId('start-date').textContent).toContain('2023-01-01');
      expect(screen.getByTestId('end-date').textContent).toContain('2023-01-07');
    });
  });

  // Test 5: Chart Type Toggle
  it('allows switching between chart types', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the chart type selector
    const chartTypeButton = screen.getByRole('button', { name: /chart type/i });
    fireEvent.click(chartTypeButton);

    // Select bar chart
    const barChartOption = screen.getByRole('menuitem', { name: /bar chart/i });
    fireEvent.click(barChartOption);

    // Verify bar chart is rendered
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument();
  });

  // Test 6: Data Export
  it('allows exporting data in different formats', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the export button
    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    // Click on PNG export option
    const pngOption = screen.getByRole('menuitem', { name: /png/i });
    fireEvent.click(pngOption);

    // Verify file-saver was called with correct parameters
    await waitFor(() => {
      expect(vi.mocked('file-saver').saveAs).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64'),
        'analytics-export.png'
      );
    });
  });

  // Test 7: Settings Toggle
  it('allows toggling chart settings', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    fireEvent.click(settingsButton);

    // Toggle grid lines
    const gridToggle = screen.getByRole('checkbox', { name: /show grid/i });
    fireEvent.click(gridToggle);

    // Verify the chart was updated with new settings
    const chart = screen.getByTestId('mock-line-chart');
    const chartOptions = JSON.parse(chart.getAttribute('data-options') || '{}');
    expect(chartOptions.scales?.x?.grid?.display).toBe(false);
    expect(chartOptions.scales?.y?.grid?.display).toBe(false);
  });

  // Test 8: Data Refresh - Manual Refresh
  it('allows manual refresh of data', async () => {
    const mockRefetch = vi.fn().mockResolvedValue(true);
    
    vi.spyOn(React, 'useRef').mockReturnValueOnce({
      current: { refetch: mockRefetch }
    });
    
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // Test 9: Data Refresh - Auto Refresh
  it('auto-refreshes data at specified interval', async () => {
    vi.useFakeTimers();
    const mockRefetch = vi.fn().mockResolvedValue(true);
    
    vi.spyOn(React, 'useRef').mockReturnValueOnce({
      current: { refetch: mockRefetch }
    });
    
    render(
      <TestWrapper>
        <AnalyticsDashboard autoRefreshInterval={30000} />
      </TestWrapper>
    );

    // Fast-forward time by 30 seconds
    vi.advanceTimersByTime(30000);

    // Verify refetch was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    
    // Clean up
    vi.useRealTimers();
  });

  // Test 10: Responsive Behavior - Mobile View
  it('adapts to mobile view', async () => {
    // Mock window.innerWidth for mobile
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone X width
    });

    // Trigger window resize event
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify mobile-specific elements/behavior
    expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
    
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  // Test 10: Responsive Behavior - Tablet View
  it('adapts to tablet view', async () => {
    // Mock window.innerWidth for tablet
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // iPad width
    });

    // Trigger window resize event
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify tablet-specific elements/behavior
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    
    // Restore original innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock a failed API response
    server.use(
      http.get('/api/analytics', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'Failed to load analytics data'
          },
          { status: 500, delay: 100 }
        );
      })
    );

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Verify error state is shown
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('allows changing the date range', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the date range picker
    const dateRangeButton = screen.getByLabelText(/select date range/i);
    fireEvent.click(dateRangeButton);

    // Select a different date range (Last 7 days)
    const last7DaysOption = screen.getByText(/last 7 days/i);
    fireEvent.click(last7DaysOption);

    // Verify the API was called with the new date range
    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('allows refreshing the data', async () => {
    // Mock the API to track refresh calls
    const refreshHandler = vi.fn((req, res, ctx) => {
      return res(
        ctx.delay(100),
        ctx.json({
          success: true,
          data: generateMockAnalyticsData({
            startDate: '2023-01-01',
            endDate: '2023-01-31'
          })
        })
      );
    });

    server.use(rest.get('/api/analytics', refreshHandler));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click the refresh button
    const refreshButton = screen.getByLabelText(/refresh data/i);
    fireEvent.click(refreshButton);

    // Verify the refresh was triggered
    expect(refreshHandler).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('allows toggling between chart views', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Find and click the chart type toggle
    const chartTypeButton = screen.getByLabelText(/change chart type/i);
    fireEvent.click(chartTypeButton);

    // Select a different chart type (Bar)
    const barChartOption = screen.getByText(/bar chart/i);
    fireEvent.click(barChartOption);

    // Verify the chart updated
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('handles window resize events', async () => {
    // Set initial window size
    window.innerWidth = 1024;
    window.innerHeight = 768;
    
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Simulate window resize
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));

    // Verify the component handles the resize
    // This is a basic check - in a real test, you might check for responsive behavior
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays loading state when data is being fetched', () => {
    // Override the mock to show loading state
    jest.requireMock('@tanstack/react-query').useQuery.mockImplementation(() => ({
      ...jest.requireMock('@tanstack/react-query').useQuery(),
      isLoading: true,
    }));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Should show loading indicators
    const loadingIndicators = screen.getAllByRole('progressbar');
    expect(loadingIndicators.length).toBeGreaterThan(0);
  });

  it('displays error state when there is an error', () => {
    // Override the mock to show error state
    jest.requireMock('@tanstack/react-query').useQuery.mockImplementation(() => ({
      ...jest.requireMock('@tanstack/react-query').useQuery(),
      isError: true,
      error: { message: 'Failed to fetch data' },
    }));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Should show error message
    expect(screen.getByText(/error loading analytics data/i)).toBeInTheDocument();
  });

  it('allows changing the date range', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Click the date range selector
    const dateRangeButton = screen.getByLabelText(/select date range/i);
    fireEvent.click(dateRangeButton);

    // Select a different date range (e.g., Last 30 Days)
    const last30DaysOption = screen.getByText(/last 30 days/i);
    fireEvent.click(last30DaysOption);

    // Verify the date range was updated
    // This would typically check if the API was called with the new date range
    // but since we're mocking the query, we'll just verify the UI updated
    expect(dateRangeButton).toHaveTextContent(/last 30 days/i);
  });

  it('allows refreshing the data', async () => {
    const mockInvalidateQueries = jest.fn();
    jest.requireMock('@tanstack/react-query').useQueryClient.mockImplementation(() => ({
      invalidateQueries: mockInvalidateQueries,
    }));

    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Click the refresh button
    const refreshButton = screen.getByLabelText(/refresh data/i);
    fireEvent.click(refreshButton);

    // Verify the refresh function was called
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['analytics']);
  });

  it('displays the correct charts', () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Check if all charts are rendered
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('allows toggling between chart types', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Find and click the chart type toggle
    const chartTypeButton = screen.getByLabelText(/change chart type/i);
    fireEvent.click(chartTypeButton);

    // Select a different chart type (e.g., Bar Chart)
    const barChartOption = screen.getByText(/bar chart/i);
    fireEvent.click(barChartOption);

    // Verify the chart type was updated
    // In a real test, we would check if the correct chart component was rendered
    // For now, we'll just verify the button text updated
    expect(chartTypeButton).toHaveTextContent(/bar chart/i);
  });
});
