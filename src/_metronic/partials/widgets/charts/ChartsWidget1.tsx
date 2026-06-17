
import { useEffect, useRef, FC } from 'react'
import ApexCharts, { ApexOptions } from 'apexcharts'
import { KTIcon } from '../../../helpers'
import { Dropdown1 } from '../../content/dropdown/Dropdown1'
import { getCSS, getCSSVariableValue } from '../../../assets/ts/_utils'
import { useThemeMode } from '../../layout/theme-mode/ThemeModeProvider'

type Props = {
  className: string
}

const ChartsWidget1: FC<Props> = ({ className }) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const { mode } = useThemeMode()

  useEffect(() => {
    const chart = refreshChart()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode])

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

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className='card-header border-0 p-4'>
        {/* begin::Title */}
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1 text-white'>Số vụ tai nạn giao thông</span>
          <span className='text-muted fw-semibold fs-7'>cập nhật lúc 17h00 ngày 20/11/2024</span>
        </h3>
        {/* end::Title */}

        {/* begin::Toolbar */}
        <div className='card-toolbar'>
          {/* begin::Menu */}
          <button
            type='button'
            className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary'
            data-kt-menu-trigger='click'
            data-kt-menu-placement='bottom-end'
            data-kt-menu-flip='top-end'
          >
            <KTIcon iconName='category' className='fs-2' />
          </button>
          <Dropdown1 />
          {/* end::Menu */}
        </div>
        {/* end::Toolbar */}
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className='card-body p-4'>
        {/* begin::Chart */}
        <div ref={chartRef} id='kt_charts_widget_1_chart' style={{ height: '250px' }} />
        {/* end::Chart */}
      </div>
      {/* end::Body */}
    </div>
  )
}

export { ChartsWidget1 }

function getChartOptions(height: number): ApexOptions {
  const labelColor = getCSSVariableValue('--bs-white')
  const borderColor = getCSSVariableValue('--bs-gray-500')
  const baseColor = getCSSVariableValue('--bs-primary')
  const secondaryColor = getCSSVariableValue('--bs-danger')
  const thirdColor = getCSSVariableValue('--bs-warning')

  return {
    series: [
      {
        name: 'Số vụ',
        data: [44, 55, 57, 56, 61, 58],
      },
      {
        name: 'Số người chết',
        data: [76, 85, 101, 98, 87, 105],
      },
      {
        name: 'Số người bị thương',
        data: [43, 56, 78, 24, 66, 92],
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
    colors: [baseColor, secondaryColor, thirdColor],
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
