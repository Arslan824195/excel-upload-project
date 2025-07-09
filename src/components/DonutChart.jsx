// components/DonutChart.jsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ percentage, label }) => {
    const value = Number(percentage.replace('%', '')); // Convert "51%" to 51

    const data = {
        datasets: [
            {
                data: [value, 100 - value], // Show % and rest as transparent
                backgroundColor: ['#1F3E62', '#E0E0E0'], // dark + light grey
                borderWidth: 1,
                borderRadius: 20,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: true, // Hide legend
            },
        },
        rotation: 1, // Start from top
        circumference: 360, // Full circle
    };

    return (
        <div className="w-[250px] h-[250px] text-center mx-4 relative">
            <Doughnut data={data} options={options} />
            <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xl font-extrabold text-[black]">{percentage}</p>
            </div>
            <p className='mt-2 text-md font-semibold text-[#1F3E62]'>{label}</p>
        </div>
    );
};

export default DonutChart;
