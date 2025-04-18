import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CSVDataViewer = ({ data, columns }) => {
  const [selectedColumn, setSelectedColumn] = useState(columns[0]);
  const [chartType, setChartType] = useState('line');

  const prepareChartData = () => {
    if (!data || !selectedColumn) return null;

    return {
      labels: data.map((_, index) => index + 1),
      datasets: [
        {
          label: selectedColumn,
          data: data.map(row => row[selectedColumn]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedColumn} Data Visualization`
      }
    }
  };

  return (
    <div className="csv-viewer">
      <div className="controls">
        <select 
          value={selectedColumn} 
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="column-select"
        >
          {columns.map(column => (
            <option key={column} value={column}>{column}</option>
          ))}
        </select>
        
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value)}
          className="chart-type-select"
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
        </select>
      </div>

      <div className="chart-container">
        {chartType === 'line' ? (
          <Line data={prepareChartData()} options={chartOptions} />
        ) : (
          <Bar data={prepareChartData()} options={chartOptions} />
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(column => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map(column => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CSVDataViewer;