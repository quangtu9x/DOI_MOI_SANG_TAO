import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const PieChart = (props) => {
  const { className, title, data } = props;

  const options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false, // Disable the Highcharts watermark
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        borderRadius: 5,
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b><br>{point.percentage:.1f} %",
          distance: -50,
          filter: {
            property: "percentage",
            operator: ">",
            value: 4,
          },
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: "Tỷ lệ",
        colorByPoint: true,
        data: data,
      },
    ],
  };
  return (
    <>
      <div className={`card ${className}`}>
        {/* begin::Header */}
        <div className="card-header border-0 pt-5">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">{title}</span>
          </h3>
        </div>
        {/* end::Header */}
        {/* begin::Body */}
        <div className="card-body py-3">
          {/* begin::Table container */}
          <HighchartsReact highcharts={Highcharts} options={options} />

          {/* end::Table container */}
        </div>
      </div>
    </>
  );
};

export { PieChart };
