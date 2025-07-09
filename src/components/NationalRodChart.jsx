import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const NationalRodChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'National Rod Chart',
        font: {
          size: 30,
          weight: 'bold',
        },
        color: '#383E64',
        padding: 30,
      },
      datalabels: {
        display: true,
        formatter: (value, context) => {
          // dataIndex: 0,1,2,3,4,5
          const isMarch = context.dataIndex % 2 === 0;
          const month = isMarch ? 'March' : 'April';
          return `${value}\n${month}`; // Show number and month both
        },
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: {
          weight: 'bold',
          size: 12,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          display: true,
          color: '#383E64',
          font: {
            weight: 'bold',
            size: 12,
          },

          autoSkip: false,        // Show all labels, no skipping
          maxRotation: 0,         // ❌ Don't rotate labels
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div>
    <hr className="border-t-2 border-gray-400 mt-10 w-full rounded" />
      <Bar options={options} data={data} />
    </div>
  );
};

export default NationalRodChart;
