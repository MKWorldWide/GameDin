# AnalyticsDashboard Component Props

## Overview

This document provides detailed documentation for all props available in the `AnalyticsDashboard` component. The component is highly customizable and can be tailored to fit various analytics display needs.

## Basic Props

### `onDateRangeChange`
- **Type**: `(range: '7d' | '30d' | '90d' | '12m' | 'custom') => void`
- **Required**: No
- **Description**: Callback function that is called when the date range is changed.
- **Example**:
  ```tsx
  const handleDateRangeChange = (range) => {
    console.log('Selected date range:', range);
  };
  
  <AnalyticsDashboard onDateRangeChange={handleDateRangeChange} />
  ```

### `onDataPointClick`
- **Type**: `(data: any) => void`
- **Required**: No
- **Description**: Callback function that is called when a data point is clicked on any chart.
- **Example**:
  ```tsx
  const handleDataPointClick = (data) => {
    console.log('Data point clicked:', data);
  };
  
  <AnalyticsDashboard onDataPointClick={handleDataPointClick} />
  ```

### `onRefresh`
- **Type**: `() => void`
- **Required**: No
- **Description**: Callback function that is called when the refresh button is clicked.
- **Example**:
  ```tsx
  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Add refresh logic here
  };
  
  <AnalyticsDashboard onRefresh={handleRefresh} />
  ```

## Data Fetching Props

### `fetchData`
- **Type**: `(dateRange: { start: Date, end: Date }) => Promise<any>`
- **Required**: No (defaults to internal data fetching)
- **Description**: Custom function to fetch analytics data. If not provided, the component will use its internal data fetching logic.
- **Example**:
  ```tsx
  const fetchAnalyticsData = async ({ start, end }) => {
    const response = await fetch(`/api/analytics?start=${start.toISOString()}&end=${end.toISOString()}`);
    return response.json();
  };
  
  <AnalyticsDashboard fetchData={fetchAnalyticsData} />
  ```

### `initialData`
- **Type**: `any`
- **Required**: No
- **Description**: Initial data to display while the component is loading.
- **Example**:
  ```tsx
  const initialData = {
    // Your initial data structure here
  };
  
  <AnalyticsDashboard initialData={initialData} />
  ```

## Customization Props

### `theme`
- **Type**: `'light' | 'dark' | 'system'`
- **Default**: `'system'`
- **Description**: The color theme for the dashboard.
- **Example**:
  ```tsx
  <AnalyticsDashboard theme="dark" />
  ```

### `density`
- **Type**: `'comfortable' | 'compact' | 'spacious'`
- **Default**: `'comfortable'`
- **Description**: The density of UI elements.
- **Example**:
  ```tsx
  <AnalyticsDashboard density="compact" />
  ```

### `defaultView`
- **Type**: `'line' | 'bar' | 'pie'`
- **Default**: `'line'`
- **Description**: The default chart view type.
- **Example**:
  ```tsx
  <AnalyticsDashboard defaultView="bar" />
  ```

### `defaultDateRange`
- **Type**: `'7d' | '30d' | '90d' | '12m' | 'custom'`
- **Default**: `'30d'`
- **Description**: The default date range for the dashboard.
- **Example**:
  ```tsx
  <AnalyticsDashboard defaultDateRange="90d" />
  ```

### `autoRefresh`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to automatically refresh the data at regular intervals.
- **Example**:
  ```tsx
  <AnalyticsDashboard autoRefresh={true} />
  ```

### `refreshInterval`
- **Type**: `number`
- **Default**: `300` (5 minutes)
- **Description**: The interval in seconds between automatic refreshes.
- **Example**:
  ```tsx
  <AnalyticsDashboard autoRefresh={true} refreshInterval={60} /> // Refresh every minute
  ```

## Feature Toggle Props

### `showNotifications`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show toast notifications for user actions.
- **Example**:
  ```tsx
  <AnalyticsDashboard showNotifications={false} />
  ```

### `showEmptyStates`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show empty state placeholders when no data is available.
- **Example**:
  ```tsx
  <AnalyticsDashboard showEmptyStates={false} />
  ```

### `showDataLabels`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show data labels on charts.
- **Example**:
  ```tsx
  <AnalyticsDashboard showDataLabels={false} />
  ```

### `showGridLines`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show grid lines on charts.
- **Example**:
  ```tsx
  <AnalyticsDashboard showGridLines={false} />
  ```

### `showLegend`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to show chart legends.
- **Example**:
  ```tsx
  <AnalyticsDashboard showLegend={false} />
  ```

## Advanced Props

### `customComponents`
- **Type**: `object`
- **Description**: Override default components with custom implementations.
- **Properties**:
  - `MetricCard`: Custom metric card component
  - `Chart`: Custom chart component
  - `DateRangePicker`: Custom date range picker component
- **Example**:
  ```tsx
  const CustomMetricCard = ({ title, value }) => (
    <div className="custom-metric">
      <h3>{title}</h3>
      <div className="value">{value}</div>
    </div>
  );
  
  <AnalyticsDashboard 
    customComponents={{
      MetricCard: CustomMetricCard
    }} 
  />
  ```

### `locale`
- **Type**: `string`
- **Default**: `'en-US'`
- **Description**: The locale to use for formatting dates and numbers.
- **Example**:
  ```tsx
  <AnalyticsDashboard locale="fr-FR" />
  ```

### `timezone`
- **Type**: `string`
- **Default**: User's local timezone
- **Description**: The timezone to use for date/time display.
- **Example**:
  ```tsx
  <AnalyticsDashboard timezone="America/New_York" />
  ```

## Event Handlers

### `onError`
- **Type**: `(error: Error) => void`
- **Description**: Callback function that is called when an error occurs.
- **Example**:
  ```tsx
  const handleError = (error) => {
    console.error('Analytics dashboard error:', error);
    // Show error notification, etc.
  };
  
  <AnalyticsDashboard onError={handleError} />
  ```

### `onLoadingChange`
- **Type**: `(isLoading: boolean) => void`
- **Description**: Callback function that is called when the loading state changes.
- **Example**:
  ```tsx
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
  };
  
  <>
    {isLoading && <LoadingOverlay />}
    <AnalyticsDashboard onLoadingChange={handleLoadingChange} />
  </>
  ```

## Styling Props

### `className`
- **Type**: `string`
- **Description**: Additional CSS class name for the root element.
- **Example**:
  ```tsx
  <AnalyticsDashboard className="custom-analytics-dashboard" />
  ```

### `style`
- **Type**: `React.CSSProperties`
- **Description**: Inline styles for the root element.
- **Example**:
  ```tsx
  <AnalyticsDashboard style={{ padding: '20px' }} />
  ```

## Example: Complete Usage

```tsx
import React from 'react';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';

const App = () => {
  // Custom data fetching
  const fetchAnalyticsData = async ({ start, end }) => {
    const response = await fetch(`/api/analytics?start=${start.toISOString()}&end=${end.toISOString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    return response.json();
  };

  // Event handlers
  const handleDateRangeChange = (range) => {
    console.log('Date range changed to:', range);
  };

  const handleDataPointClick = (data) => {
    console.log('Data point clicked:', data);
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleError = (error) => {
    console.error('Analytics error:', error);
  };

  return (
    <div className="app">
      <h1>My Analytics Dashboard</h1>
      <AnalyticsDashboard
        // Basic props
        onDateRangeChange={handleDateRangeChange}
        onDataPointClick={handleDataPointClick}
        onRefresh={handleRefresh}
        onError={handleError}
        
        // Data fetching
        fetchData={fetchAnalyticsData}
        
        // Customization
        theme="dark"
        density="compact"
        defaultView="bar"
        defaultDateRange="30d"
        
        // Feature toggles
        autoRefresh={true}
        refreshInterval={300}
        showNotifications={true}
        showEmptyStates={true}
        showDataLabels={true}
        showGridLines={true}
        showLegend={true}
        
        // Styling
        className="custom-dashboard"
        style={{ borderRadius: '8px' }}
      />
    </div>
  );
};

export default App;
```

## TypeScript Support

The component is fully typed with TypeScript. You can import the prop types as follows:

```typescript
import { AnalyticsDashboardProps } from './components/analytics/AnalyticsDashboard';

// Use the type for your props
const MyComponent: React.FC<AnalyticsDashboardProps> = (props) => {
  // ...
};
```

## Browser Support

The AnalyticsDashboard component supports all modern browsers, including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

The component is built with accessibility in mind and includes:
- ARIA attributes for screen readers
- Keyboard navigation
- High contrast support
- Focus management

## Performance Considerations

For optimal performance:
1. Use `React.memo()` for custom components
2. Implement proper data caching
3. Use the `initialData` prop for server-side rendering
4. Consider implementing virtualization for large datasets

## Troubleshooting

### Charts not rendering
1. Ensure all required chart dependencies are installed
2. Check the browser console for errors
3. Verify that the data format matches the expected structure

### Data not updating
1. Check your `fetchData` implementation
2. Verify that the date range is being passed correctly
3. Check for network errors in the browser console

### Styling issues
1. Ensure your theme provider is properly set up
2. Check for CSS conflicts with global styles
3. Verify that all required theme variables are defined
