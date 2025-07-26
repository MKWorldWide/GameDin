import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { ChartData, ChartOptions } from '../../../../types/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: ChartData;
  options?: ChartOptions;
  height?: number | string;
  width?: number | string;
  stacked?: boolean;
}

const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US').format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false,
      },
      ticks: {
        callback: (value) => {
          if (typeof value === 'number' && value >= 1000) {
            return `$${value / 1000}k`;
          }
          return value;
        },
      },
    },
  },
};

const BarChart: React.FC<BarChartProps> = ({
  data,
  options = {},
  height = '100%',
  width = '100%',
  stacked = false,
}) => {
  // Merge default options with custom options
  const chartOptions = {
    ...defaultOptions,
    ...options,
    scales: {
      ...defaultOptions.scales,
      ...(options.scales || {}),
      x: {
        ...(stacked && { stacked: true }),
        ...defaultOptions.scales?.x,
        ...(options.scales?.x || {}),
      },
      y: {
        ...(stacked && { stacked: true }),
        ...defaultOptions.scales?.y,
        ...(options.scales?.y || {}),
      },
    },
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
  };

  return (
    <div style={{ height, width }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

export default BarChart;
