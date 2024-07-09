// components/statistics.ts

interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
  source: string;
}

interface StatisticsResult {
  NOBS: number;
  MAPE: string;
  RMSE: string;
  PEAK: string;
  AVERAGE: string;
  ENERGY: string;
}

const calculateStatistics = (data: CsvData[], selectedFiles: string[]): StatisticsResult => {
  const filteredData = data.filter(row => selectedFiles.includes(row.source));
  
  if (filteredData.length === 0) {
    return {
      NOBS: 0,
      MAPE: '0.00',
      RMSE: '0.00',
      PEAK: '0.00',
      AVERAGE: '0.00',
      ENERGY: '0.00',
    };
  }

  const prices = filteredData.map(row => parseFloat(row.price_fcst));

  const NOBS = prices.length;
  const average = prices.reduce((sum, price) => sum + price, 0) / NOBS;
  const mape = (prices.reduce((sum, price) => sum + Math.abs(price - average) / average, 0) / NOBS) * 100;
  const rmse = Math.sqrt(prices.reduce((sum, price) => sum + (price - average) ** 2, 0) / NOBS);
  const peak = Math.max(...prices);
  const energy = prices.reduce((sum, price) => sum + price, 0);

  return {
    NOBS,
    MAPE: mape.toFixed(2),
    RMSE: rmse.toFixed(2),
    PEAK: peak.toFixed(2),
    AVERAGE: average.toFixed(2),
    ENERGY: energy.toFixed(2),
  };
};

export default calculateStatistics;