# Analytics Dashboard

A comprehensive, real-time analytics dashboard built with React, Material-UI, and Chart.js. This dashboard provides insights into user activity, engagement metrics, and system performance.

## Features

- **Real-time Data**: Live updates via WebSocket/EventSource
- **Interactive Charts**: Line, bar, and pie charts with zoom/pan capabilities
- **Data Drilldown**: Click on data points to view detailed metrics
- **Custom Date Ranges**: Predefined and custom date range selection
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Export Options**: Download charts as PNG or CSV
- **User Preferences**: Persistent settings for theme, density, and more

## Components

### `AnalyticsDashboard`

The main dashboard component that orchestrates all other components.

**Props**
- `initialDateRange`: Initial date range (default: last 30 days)
- `onDateRangeChange`: Callback when date range changes
- `onDataPointClick`: Callback when a data point is clicked

### `MetricCard`

Displays a single metric with optional trend indicator.

**Props**
- `title`: Metric title
- `value`: Current value
- `change`: Percentage change from previous period (positive or negative)
- `icon`: Material-UI icon component
- `color`: Color theme (default: 'primary')
- `loading`: Show loading state
- `error`: Show error state

### `DrilldownModal`

Displays detailed metrics for a selected data point.

**Props**
- `open`: Whether the modal is open
- `onClose`: Callback when modal is closed
- `data`: Detailed metrics data
- `date`: Selected date for the drilldown

### `AccessibleChart`

An accessible wrapper around Chart.js charts.

**Props**
- `type`: Chart type ('line', 'bar', or 'pie')
- `data`: Chart data
- `options`: Chart options
- `ariaLabel`: Accessibility label
- `onDataPointClick`: Callback when a data point is clicked

## Hooks

### `useAnalytics`

Handles data fetching and state management for the dashboard.

**Returns**
- `data`: Analytics data
- `isLoading`: Loading state
- `error`: Error state
- `dateRange`: Current date range
- `setDateRange`: Update date range
- `refresh`: Manually refresh data

## Services

### `analyticsService`

Handles API communication for analytics data.

**Methods**
- `getAnalytics(dateRange)`: Fetch analytics data for a date range
- `getRealTimeUpdates(callback)`: Subscribe to real-time updates
- `downloadChartData(format)`: Download chart data in specified format

## Styling

Uses Material-UI's theming system with custom overrides in `theme.ts`. The dashboard supports light and dark modes.

## Accessibility

- Full keyboard navigation
- Screen reader support
- High contrast mode
- Reduced motion support
- ARIA attributes for interactive elements

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
yarn install
# or
npm install
```

### Running Locally

```bash
yarn dev
# or
npm run dev
```

### Building for Production

```bash
yarn build
# or
npm run build
```

## Testing

```bash
yarn test
# or
npm test
```

## License

MIT
