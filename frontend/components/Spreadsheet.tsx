// Spreadsheet.tsx
"use client";
import React, { useMemo } from 'react';
import { useTable, Column } from 'react-table';
import dayjs from 'dayjs';

export interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
  source: string;
}

interface Props {
  data: CsvData[];
  selectedFiles: string[];
}

const Spreadsheet: React.FC<Props> = ({ data, selectedFiles }) => {
  const formatDate = (date: string) => dayjs(date, 'YYYYMMDD').format('DD-MM-YY');
  const formatTime = (time: string) => time.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2');

  const transformedData = useMemo(() => {
    const dataMap: { [key: string]: { date: string, time: string, [key: string]: string } } = {};

    data.forEach(row => {
      const key = `${row.date}-${row.time}`;
      if (!dataMap[key]) {
        dataMap[key] = { date: row.date, time: row.time };
      }
      dataMap[key][row.source] = row.price_fcst;
    });

    return Object.values(dataMap);
  }, [data]);

  const dynamicColumns = useMemo(() => {
    const baseColumns: Column<any>[] = [
      {
        Header: 'Date',
        accessor: 'date',
        Cell: ({ value }: { value: string }) => formatDate(value),
      },
      {
        Header: 'Time',
        accessor: 'time',
        Cell: ({ value }: { value: string }) => formatTime(value),
      }
    ];

    const sourceColumns: Column<any>[] = selectedFiles
      .filter(file => file !== 'all')
      .map(source => ({
        Header: `Price Forecast (${source})`,
        accessor: source,
      }));

    return [...baseColumns, ...sourceColumns];
  }, [selectedFiles]);

  const tableInstance = useTable({ columns: dynamicColumns, data: transformedData });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  if (selectedFiles.length === 0 || (selectedFiles.length === 1 && selectedFiles[0] === 'all')) {
    return <div>Please select at least one Model to display data.</div>;
  }

  return (
    <div className="overflow-auto h-full">
      <table {...getTableProps()} className="min-w-full bg-white border border-gray-300">
        <thead className="sticky top-0 bg-gray-200">
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`header-${i}`}>
              {headerGroup.headers.map((column, j) => (
                <th {...column.getHeaderProps()} key={`header-${i}-${j}`} className="py-2 px-4 border-b text-left">
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`row-${i}`} className="hover:bg-gray-100">
                {row.cells.map((cell, j) => (
                  <td {...cell.getCellProps()} key={`cell-${i}-${j}`} className="py-2 px-4 border-b text-left">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;