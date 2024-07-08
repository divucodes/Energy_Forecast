// ForecastChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
}

interface ApiResponse {
  [key: string]: CsvData[];
}

interface ForecastChartProps {
  data: ApiResponse | CsvData[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    if (Array.isArray(data)) {
      return {
        labels: data.map(d => `${dayjs(d.date, 'YYYYMMDD').format('DD-MM-YY')} ${d.time.padStart(4, '0').slice(0, 2)}:${d.time.padStart(4, '0').slice(2)}`),
        datasets: [{
          label: 'Price Forecast',
          data: data.map(d => parseFloat(d.price_fcst)),
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          fill: false,
        }],
      };
    } else {
      const labels = Object.values(data)[0].map(d => `${dayjs(d.date, 'YYYYMMDD').format('DD-MM-YY')} ${d.time.padStart(4, '0').slice(0, 2)}:${d.time.padStart(4, '0').slice(2)}`);
      return {
        labels,
        datasets: Object.entries(data).map(([key, value]) => ({
          label: `${key} Price Forecast`,
          data: value.map(d => parseFloat(d.price_fcst)),
          borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
          fill: false,
        })),
      };
    }
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Forecast Chart',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date and Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price Forecast',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ForecastChart;