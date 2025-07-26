import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { ChartData, ChartOptions } from '../../../../types/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: ChartData;
  options?: ChartOptions;
  height?: number | string;
  width?: number | string;
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

const LineChart: React.FC<LineChartProps> = ({
  data,
  options = {},
  height = '100%',
  width = '100%',
}) => {
  // Merge default options with custom options
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
    scales: {
      ...defaultOptions.scales,
      ...(options.scales || {}),
    },
  };

  return (
    <div style={{ height, width }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
};

export default LineChart;
