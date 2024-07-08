"use client"
// CsvReader.tsx
import React, { useEffect, useState } from 'react';
import { DatePicker, Tabs, Select } from 'antd';
import 'antd/dist/reset.css';
import dayjs, { Dayjs } from 'dayjs';
import { Column } from 'react-table';
import Spreadsheet from '@/components/Spreadsheet';
import ForecastChart from '@/components/LineChart'

const { RangePicker } = DatePicker;
const { Option } = Select;

interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
}

interface ApiResponse {
  [key: string]: CsvData[];
}

const CsvReader: React.FC = () => {
  const [data, setData] = useState<ApiResponse | CsvData[]>({});
  const [filteredData, setFilteredData] = useState<ApiResponse | CsvData[]>({});
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('all');

  useEffect(() => {
    fetchData(selectedFile);
  }, [selectedFile]);

  const fetchData = async (file: string) => {
    try {
      const url = file === 'all' 
        ? 'http://localhost:3000/api/csv-data'
        : `http://localhost:3000/api/csv-data/${file}`;
      
      const response = await fetch(url);
      const jsonData: ApiResponse | CsvData[] = await response.json();
      setData(jsonData);
      setFilteredData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates) {
      const [start, end] = dates;
      const formattedStart = start.format('YYYYMMDD');
      const formattedEnd = end.format('YYYYMMDD');

      setStartDate(formattedStart);
      setEndDate(formattedEnd);

      const filtered = filterDataByDateRange(data, formattedStart, formattedEnd);
      setFilteredData(filtered);
    } else {
      setStartDate(null);
      setEndDate(null);
      setFilteredData(data);
    }
  };

  const filterDataByDateRange = (data: ApiResponse | CsvData[], start: string, end: string) => {
    if (Array.isArray(data)) {
      return data.filter(row => row.date >= start && row.date <= end);
    } else {
      const filtered: ApiResponse = {};
      Object.entries(data).forEach(([key, value]) => {
        filtered[key] = value.filter(row => row.date >= start && row.date <= end);
      });
      return filtered;
    }
  };

  const formatDate = (date: string) => {
    return dayjs(date, 'YYYYMMDD').format('DD-MM-YY');
  };

  const formatTime = (time: string) => {
    return time.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2');
  };

  const columns: Column<CsvData>[] = React.useMemo(
    () => [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }: { value: string }) => formatDate(value),
      },
      {
        Header: 'Time',
        accessor: 'time',
        Cell: ({ value }: { value: string }) => formatTime(value),
      },
      { Header: 'Price Forecast', accessor: 'price_fcst' },
    ],
    []
  );

  const items = [
    {
      key: '1',
      label: 'Spreadsheet',
      children: <Spreadsheet data={filteredData} columns={columns} />
    },
    {
      key: '2',
      label: 'Graph',
      children: (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Price Forecast Graph</h1>
          <ForecastChart data={filteredData} />
        </div>
      )
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-slate-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-3xl font-bold">Energy Forecast Dashboard</h1>
      </header>
      <div className="flex-grow p-6">
        <div className="flex">
          <div className="w-1/4 p-4 bg-white shadow-lg rounded-lg mr-4">
            <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Select CSV File</label>
              <Select
                className="w-full mt-1"
                value={selectedFile}
                onChange={setSelectedFile}
              >
                <Option value="all">All Files</Option>
                <Option value="t1">T1</Option>
                <Option value="t2">T2</Option>
                <Option value="t3">T3</Option>
                <Option value="t4">T4</Option>
              </Select>
            </div>
            <h2 className="text-lg font-semibold mb-2">Filter by Date Range</h2>
            <RangePicker
              onChange={(dates) => handleDateChange(dates as [Dayjs, Dayjs] | null)}
              value={[
                startDate ? dayjs(startDate) : null,
                endDate ? dayjs(endDate) : null,
              ]}
              className="w-full"
              style={{
                backgroundColor: '',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
          </div>
          <div className="w-3/4 p-4 bg-white shadow-lg rounded-lg">
            <Tabs defaultActiveKey="1" items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvReader;