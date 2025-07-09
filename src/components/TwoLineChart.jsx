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
import { Grid } from '@mui/material';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const TwoLineChart = () => {
    const regions = ['GUJ', 'LHR', 'MUL', 'SAHIWAL', 'FSB', 'ISB', 'JHELUM', 'PSH', 'HYD', 'KHI', 'RYK'];
    const totalPictures = [4120, 6264, 10565, 4604, 6082, 9266, 6062, 11319, 5907, 5795, 6581];
    const correctPictures = [2848, 5073, 7645, 3278, 4604, 7403, 4604, 8897, 4899, 3183, 5360];
    const totalOutlets = [15899, 15012, 25183, 16568, 25488, 15553, 12832, 18420, 18091, 17256, 13852];

    const labels = regions.map((region, index) => `${region}\n${totalOutlets[index]}`);

    const baseOptions = {
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
                        weight: 'bold',
                    },
                    callback: function (value, index) {
                        return this.getLabelForValue(value).split('\n');
                    },
                },
                grid: {
                    display: false,
                },
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

    const data1 = {
        labels,
        datasets: [
            {
                label: 'Total Pictures Taken',
                data: totalPictures,
                backgroundColor: '#1f3e62',
            },
            {
                label: 'Correct ROD Pictures',
                data: correctPictures,
                backgroundColor: '#587eab',
            },
        ],
    };

    const data2 = {
        labels,
        datasets: [
            {
                label: 'Incorrect Pictures',
                data: totalPictures.map((val, idx) => val - correctPictures[idx]),
                backgroundColor: '#d94d4d',
            },
            {
                label: 'Total Pictures Taken',
                data: totalPictures,
                backgroundColor: '#1f3e62',
            },
        ],
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            <Grid container spacing={4} justifyContent="center" alignItems="center" >
                {/* Chart 1 */}
                <Grid item xs={12} md={6} style={{ width: '70vw' }}>
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            REGION WISE ROD PICTURES VS COMPLIANT PICTURES
                        </h2>
                        <hr className="border-t border-gray-300 mb-4" />
                        <Bar data={data1} options={baseOptions} plugins={[ChartDataLabels]} />
                    </div>
                </Grid>

                {/* Chart 2 */}
                <Grid item xs={12} md={6} style={{ width: '70vw' }}>
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                            REGION WISE INCORRECT VS TOTAL PICTURES
                        </h2>
                        <hr className="border-t border-gray-300 mb-4" />
                        <Bar data={data2} options={baseOptions} plugins={[ChartDataLabels]} />
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export default TwoLineChart;
