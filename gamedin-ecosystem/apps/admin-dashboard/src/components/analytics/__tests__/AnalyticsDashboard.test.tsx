import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import AnalyticsDashboard from '../AnalyticsDashboard';
import { generateMockAnalyticsData } from '../../../__mocks__/api/analyticsService';

// Mock the date-fns functions that are used in the component
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => formatStr,
  subDays: (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
  subMonths: (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() - months, date.getDate()),
  parseISO: (dateString: string) => new Date(dateString),
  isAfter: (date1: Date, date2: Date) => date1 > date2,
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

// Create a test theme to match the app's theme
const testTheme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
  },
});

// Mock date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: vi.fn().mockReturnValue('2023-01-01'),
    subDays: vi.fn((date, days) => new Date(2023, 0, 1 - days)),
    subMonths: vi.fn((date, months) => new Date(2023 - Math.floor(months / 12), 0, 1)),
    isAfter: vi.fn().mockReturnValue(true),
    parseISO: vi.fn((dateString) => new Date(dateString)),
  };
});

// Set up MSW server for API mocking
const server = setupServer(
  http.get('/api/analytics', () => {
    return HttpResponse.json({
      success: true,
      data: generateMockAnalyticsData({
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      })
    }, { delay: 100 });
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
      <ThemeProvider theme={testTheme}>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the dashboard with all metric cards', async () => {
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Check if all metric cards are rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Avg. Session')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
  });

  it('loads and displays real API data', async () => {
    const mockData = generateMockAnalyticsData({
      startDate: '2023-01-01',
      endDate: '2023-01-31'
    });

    // Render the component
    render(
      <TestWrapper>
        <AnalyticsDashboard />
      </TestWrapper>
    );

    // Verify loading state is shown initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify data is displayed
    expect(screen.getByText(/total users/i)).toBeInTheDocument();
    expect(screen.getByText(/active users/i)).toBeInTheDocument();
    expect(screen.getByText(/avg. session/i)).toBeInTheDocument();
    expect(screen.getByText(/bounce rate/i)).toBeInTheDocument();
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
