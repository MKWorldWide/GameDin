import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ChartData, ChartOptions } from '../../../../types/analytics';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  data: ChartData;
  options?: ChartOptions;
  height?: number | string;
  width?: number | string;
  cutout?: string | number;
}

const defaultOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.raw as number;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    },
    datalabels: {
      formatter: (value, ctx) => {
        const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
        const percentage = Math.round((value / total) * 100);
        return `${percentage}%`;
      },
      color: '#fff',
      font: {
        weight: 'bold',
        size: 14,
      },
    },
  },
};

const PieChart: React.FC<PieChartProps> = ({
  data,
  options = {},
  height = '100%',
  width = '100%',
  cutout = '70%',
}) => {
  // Process data to ensure we have proper formatting
  const chartData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      borderWidth: 1,
      borderColor: '#fff',
      cutout,
    })),
  };

  // Merge default options with custom options
  const chartOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options.plugins || {}),
    },
  };

  return (
    <div style={{ height, width }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default PieChart;
