import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const AreaChart = (props) => {
    const options = {
        chart: {
            type: "column",
        },
        title: {
            text: "",
        },
        credits: {
            enabled: false, // Disable the Highcharts watermark
        },
        xAxis: {
            categories: [
                "Cơ sở lưu trú",
                "Cửa hàng đố lưu niệm",
                "Danh lam thắng cảnh",
                "Di tích lịch sử",
                "Khu điểm du lịch",
            ],
            crosshair: true,
            accessibility: {
                description: "KCN",
            },
        },
        yAxis: {
            min: 0,
            title: {
                text: "",
            },
        },
        tooltip: {
            valueSuffix: "",
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
            },
        },
        series: [
            {
                name: "Tài nguyên du lịch",
                data: [89, 65, 40, 75, 20],
            },
        ],
        accessibility: {
            enabled: false, // Disable accessibility module
        },
    };

    return (
        <>
            <div className={`card `}>
                {/* begin::Header */}
                <div className="card-header border-0 pt-5">
                    <h3 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bold fs-3 mb-1">
                            Tài nguyên du lịch
                        </span>
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

export { AreaChart };
