type Props = {
  className: string
  description: string
  color: string
  img: string,
  mainNumber: number,
  percentage?: string,
  icon: string
}

const CardsWidget20 = ({ className, description, color, img, mainNumber, percentage, icon }: Props) => (
  <div
    className={`card card-flush bgi-no-repeat bgi-size-contain bgi-position-x-end ${className}`}
    style={{
      backgroundColor: color,
      backgroundImage: `url('${img}')`,
      height: `170px`,
    }}
  >
    <div className='card-header pt-5 d-flex justify-content-between align-items-center'>
      <div className='card-title'>
        <div className="d-flex flex-column">
          <span className='fs-2hx fw-bold text-white me-2 lh-1 ls-n2'>{mainNumber ?? 0}</span>
          <span className='text-white opacity-75 pt-1 fw-semibold fs-6'>{description}</span>
        </div>
      </div>
      <div className='ms-1'>

        <i className={`${icon} fs-1 text-white`}></i>
      </div>
    </div>
    <div className='card-body d-flex align-items-end pt-0'>
      <div className='d-flex align-items-center flex-column mt-3 w-100'>
        <div className='d-flex justify-content-between fw-bold fs-6 text-white opacity-75 w-100 mt-auto mb-2'>
          {/* <span>So với tổng</span> */}
          <span>{percentage}</span>
        </div>

        <div className='h-8px mx-3 w-100 bg-white bg-opacity-50 rounded'>
          <div
            className='bg-white rounded h-8px'
            role='progressbar'
            style={{ width: percentage }}
            aria-valuenow={50}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
      </div>
    </div>
  </div>
)
export { CardsWidget20 }
