import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);


const PieChart = ({ data, title, height, width }) => {

  const options = useMemo(() => ({
    layout: {
     padding: 0, 
   },
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


  if (!data || !data.datasets) {
    return <p>No data available</p>; 
  }
  

  const processedData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      borderWidth: 0,
      backgroundColor: dataset.data.map((value, index) => {
        const total = dataset.data.reduce((a, b) => a + b, 0);
        const percentage = (value / total) * 100;
        return percentage < 5 ? 'red' : (dataset.backgroundColor?.[index] || '#ccc');
      }),
    })),
  };

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
      legend: {
        position: 'top',
      },
      datalabels: {
        display: true,
        color: 'white',
      },
    },
  };

  const combinedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options?.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        ...options?.plugins?.legend,
      },
      datalabels: {
        ...defaultOptions.plugins.datalabels,
        ...options?.plugins?.datalabels,
      },
    },
  };

  return <Pie data={processedData} options={combinedOptions} height={height ? height : 100} width={width ? width : 100} />;
};

export default PieChart;
