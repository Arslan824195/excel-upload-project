import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const TargetArcChart = () => {
    const labels = ['GUJ', 'LHR', 'MUL', 'SAHIWAL', 'FSB', 'ISB', 'JHELUM', 'PSH', 'HYD', 'KHI', 'RYK'];
    const totalPictures = [5, 1, 10, '', 3, 1, 6, 1, 5, 1, 14];
    const correctPictures = [4, 10, 2, '', 7, '', 13, 3, 8, 1, 11];

    const data = {
        labels,
        datasets: [
            {
                label: 'MARCH-TARGET ACH BY UNIQUE RIDER',
                data: totalPictures,
                backgroundColor: '#EBA801',
            },
            {
                label: 'APRIL-TARGET ACH BY UNIQUE RIDER',
                data: correctPictures,
                backgroundColor: '#577DA9',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            datalabels: {
                anchor: 'end',
                align: 'end',
                offset: 4,
                color: '#000',
                font: {
                    size: 12,
                    weight: 'bold',
                },
                formatter: (value) => value,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    maxRotation: 45, // rotate to 45 degrees
                    minRotation: 45, // ensure it rotates
                },
                grid: {
                    display: false,
                },
                autoSkip: false, // show all labels even if overlapping
            },

            y: {
                beginAtZero: true,
                ticks: {
                    color: 'red',
                },
                grid: {
                    borderDash: [5, 5],
                },
            },
        },
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <hr className="border-t-2 border-gray-400 mt-10 w-full rounded" />
            <h2 className="text-3xl font-bold text-center mb-6">
                REGION WISE TARGET-ACH BY UNIQUE RIDERS
            </h2>

            {/* Main Bar Chart */}
            <Bar data={data} options={options} plugins={[ChartDataLabels]} />

        </div>
    );
};

export default TargetArcChart;
