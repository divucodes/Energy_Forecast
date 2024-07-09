// LineChart.tsx
"use client";
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
  source: string;
}

interface LineChartProps {
  data: CsvData[];
  selectedFiles: string[];
}

const LineChart: React.FC<LineChartProps> = ({ data, selectedFiles }) => {
  const chartData = React.useMemo(() => {
    if (selectedFiles.length === 0) {
      return { labels: [], datasets: [] };
    }

    let datePriceMap: { [date: string]: { [source: string]: number[] } } = {};

    data.forEach(d => {
      if (selectedFiles.includes(d.source)) {
        const date = dayjs(d.date, 'YYYYMMDD').format('DD-MM-YY');
        if (!datePriceMap[date]) {
          datePriceMap[date] = {};
        }
        if (!datePriceMap[date][d.source]) {
          datePriceMap[date][d.source] = [];
        }
        datePriceMap[date][d.source].push(parseFloat(d.price_fcst));
      }
    });

    const labels = Object.keys(datePriceMap).sort((a, b) => dayjs(a, 'DD-MM-YY').unix() - dayjs(b, 'DD-MM-YY').unix());
    const datasets = selectedFiles.map(source => {
      const data = labels.map(date => {
        const prices = datePriceMap[date][source];
        const avgPrice = prices ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        return avgPrice;
      });

      return {
        label: source,
        data,
        borderColor: getRandomColor(),
        backgroundColor: getRandomColor(0.2),
        fill: false,
      };
    });

    return {
      labels,
      datasets,
    };
  }, [data, selectedFiles]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Price Forecast Chart for Selected CSV Files',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
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

  function getRandomColor(alpha = 1) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (selectedFiles.length === 0) {
    return <div> Please select at least one Model to display data.</div>;
  }

  return <Line data={chartData} options={options} />;
};

export default LineChart;