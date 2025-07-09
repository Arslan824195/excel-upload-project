import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const BarChart = ({ data, title, options }) => {
  const defaultOptions = {
    plugins: {
      title: {
        display: true,
        text: title,
        align: 'center',  // Center align the title
        font: {
          family: 'Arial, sans-serif',
          weight: '600',
          size: 12,
        },
        color: '#666666',
      },
      legend: {
        display:false,
        position: 'top',  // Default position for the legend
      },
      datalabels: {
        display: true,
        color: 'white',
      },
    },
  };

  // Merge defaultOptions with the options passed from the parent, ensuring that default legend settings are applied
  const combinedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
      legend: {
        ...defaultOptions.plugins.legend, // Ensure the legend position is always 'left'
        ...options?.plugins?.legend,
      },
      datalabels: {
        ...defaultOptions.plugins.datalabels, // Ensure the legend position is always 'left'
        ...options?.plugins?.legend,
      },
    },
  };

  return data && <Bar data={data} options={combinedOptions} />;
};

export default BarChart;
