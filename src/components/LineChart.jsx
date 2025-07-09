import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);


const LineChart = ({ data, title, width }) => {
  
 const options = useMemo(() => ({
  plugins: {
    datalabels: {
      display: true,
    },
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    title: {
      display: true,
      text: title,
      align: 'center',
      font: {
        size: 14,
        weight: '600',
      },
    },
  },
}), [title]);


  const defaultOptions = {
    plugins: {
      title: {
        display: true,
        text: title,
        align: 'center',  
        font: {
          family: 'Arial, sans-serif',
          weight: '600',
          size: 12,
        },
        color: '#666666',
      },
      datalabels: {
        display: true,
        color: 'white',
      },
    },
    responsive: true,
  };


  const combinedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
    },
  };

  if (!data || !data.datasets) {
    return <p>No data available</p>; 
  }
  return data && <Line data={data} options={combinedOptions} width={width ? width : 500} />;
};

export default React.memo(LineChart);
