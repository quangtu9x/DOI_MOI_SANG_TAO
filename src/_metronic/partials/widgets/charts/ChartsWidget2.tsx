
import { useEffect, useRef, FC } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { getCSS, getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'

type Props = {
  className: string
}

const ChartsWidget2: FC<Props> = ({ className }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const { mode } = useThemeMode()

  const refreshChart = () => {
    if (!chartRef.current) {
      return
    }

    const height = parseInt(getCSS(chartRef.current, 'height'))

    const chart = new ApexCharts(chartRef.current, getChartOptions(height))
    if (chart) {
      chart.render()
    }

    return chart
  }

  useEffect(() => {
    const chart = refreshChart()
    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode])

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className='card-header border-0 p-4'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1 text-white'>Số lượng vi phạm giao thông</span>
          <span className='text-muted fw-semibold fs-7'>cập nhật lúc 17h00 ngày 20/11/2024</span>
        </h3>

        {/* begin::Toolbar */}
        {/* end::Toolbar */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body p-4'>
        {/* begin::Chart */}
        <div ref={chartRef} id='kt_charts_widget_2_chart' style={{ height: '250px' }}></div>
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div>
  )
}

export { ChartsWidget2 }

function getChartOptions(height: number): ApexOptions {
  const labelColor = getCSSVariableValue('--bs-white')
  const borderColor = getCSSVariableValue('--bs-gray-500')
  const baseColor = getCSSVariableValue('--bs-danger')
  const secondaryColor = getCSSVariableValue('--bs-warning')

  return {
    series: [
      {
        name: 'Tổng số',
        data: [76, 85, 101, 98, 87, 105],

      },
      {
        name: 'Đã xử phạt',
        data: [44, 55, 57, 56, 61, 58],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      type: 'bar',
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '80%',
        borderRadius: 5,
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    // states: {
    //   normal: {
    //     filter: {
    //       type: 'none',
    //       value: 0,
    //     },
    //   },
    //   hover: {
    //     filter: {
    //       type: 'none',
    //       value: 0,
    //     },
    //   },
    //   active: {
    //     allowMultipleDataPointsSelection: false,
    //     filter: {
    //       type: 'none',
    //       value: 0,
    //     },
    //   },
    // },
    tooltip: {
      style: {
        fontSize: '12px',
      },
    },
    colors: [baseColor, secondaryColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
  }
}
