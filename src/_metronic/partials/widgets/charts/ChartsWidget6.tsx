
import { useEffect, useRef, FC } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { getCSS, getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'

type Props = {
  className: string
}

const ChartsWidget6: FC<Props> = ({ className }) => {
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
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1 text-white'>Số lượng xe quan trạm và doanh thu trạm thu phí</span>

          <span className='text-muted fw-semibold fs-7'>cập nhật lúc 17h00 ngày 19/11/2024</span>
        </h3>

        {/* begin::Toolbar */}
        {/* end::Toolbar */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body'>
        {/* begin::Chart */}
        <div ref={chartRef} id='kt_charts_widget_6_chart' style={{ height: '250px' }}></div>
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div>
  )
}

export { ChartsWidget6 }

function getChartOptions(height: number): ApexOptions {
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')

  const baseColor = getCSSVariableValue('--bs-primary')
  const baseLightColor = getCSSVariableValue('--bs-primary-light')
  const secondaryColor = getCSSVariableValue('--bs-success')

  return {
    series: [
      {
        name: 'Số xe qua trạm',
        type: 'bar',
        data: [4020, 5180, 6500, 7080, 5010, 3050],
      },
      {
        name: 'Doanh thu',
        type: 'area',
        data: [50, 80, 60, 90, 50, 70],
      },
    ],
    chart: {
      fontFamily: 'inherit',
      stacked: true,
      height: height,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        columnWidth: '40%',
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
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
    yaxis: [
      {
        labels: {
          style: {
            colors: '#fff',
          }
        },
        opposite: false, // Y-axis bên trái
      },
      {
        labels: {
          style: {
            colors: '#fff',
          }
        },
        opposite: true, // Y-axis bên phải
      }
    ],
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
    colors: [baseColor, secondaryColor, baseLightColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
  }
}
