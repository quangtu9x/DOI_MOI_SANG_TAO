import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface TaskCountByYear {
  year: number;
  count: number;
}

interface Props {
  className?: string;
  data: TaskCountByYear[];
}

const TaskBarChart: React.FC<Props> = ({ className, data }) => {
  const years = data.map((item) => item.year.toString());
  const counts = data.map((item) => item.count);

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Số lượng nhiệm vụ KHCN theo năm',
    },
    xAxis: {
      categories: years,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Số lượng',
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    series: [
      {
        type: 'column',
        name: 'Nhiệm vụ',
        data: counts,
        color: '#009ef7', // Metronic primary color
      },
    ],
    credits: {
      enabled: false,
    },
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Thống kê 5 năm gần nhất</span>
        </h3>
      </div>
      <div className="card-body py-3">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    </div>
  );
};

export { TaskBarChart };
