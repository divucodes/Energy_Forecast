// Spreadsheet.tsx
"use client"
import React from 'react';
import { useTable, Column } from 'react-table';
import dayjs from 'dayjs';

export interface CsvData {
  date: string;
  time: string;
  price_fcst: string;
}

interface ApiResponse {
  [key: string]: CsvData[];
}

interface Props {
  data: ApiResponse | CsvData[];
  columns: Column<CsvData>[];
}

const Spreadsheet: React.FC<Props> = ({ data, columns }) => {
  const flattenedData = React.useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    } else {
      return Object.entries(data).flatMap(([key, value]) => 
        value.map(item => ({ ...item, source: key }))
      );
    }
  }, [data]);

  const allColumns: Column<CsvData>[] = React.useMemo(() => {
    if (!Array.isArray(data)) {
      return [
        {
          Header: 'Source',
          accessor: 'source',
        } as Column<CsvData>,
        ...columns,
      ];
    }
    return columns;
  }, [columns, data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable<CsvData>({ columns: allColumns, data: flattenedData });

  const formatDate = (date: string) => dayjs(date, 'YYYYMMDD').format('DD-MM-YY');
  const formatTime = (time: string) => time.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2');

  return (
    <div className="overflow-x-auto">
      <table {...getTableProps()} className="min-w-full bg-white border border-gray-300">
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200" key={`header-${i}`}>
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
                    {cell.column.id === 'date' ? formatDate(cell.value) :
                     cell.column.id === 'time' ? formatTime(cell.value) :
                     cell.render('Cell')}
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