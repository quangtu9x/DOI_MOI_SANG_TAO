import { FC } from 'react'
import { useLocation, Link } from 'react-router-dom'
import clsx from 'clsx'
import { checkIsActive, KTIcon } from '../../../../helpers'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasArrow?: boolean
  hasBullet?: boolean,
  classNameMenuItem?: string,
  dataTour?: string
}

const MenuItem: FC<Props> = ({
  to,
  title,
  icon,
  fontIcon,
  hasArrow = false,
  hasBullet = false,
  classNameMenuItem = '',
  dataTour = '',
}) => {
  const { pathname } = useLocation()

  return (
    <div className={`menu-item me-lg-1 ${classNameMenuItem}`} data-tour={dataTour}>
      <Link
        className={clsx('menu-link py-3', {
          'active menu-here': checkIsActive(pathname, to),
        })}
        to={to}
      >
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}

        {icon && (
          <span className='menu-icon'>
            <KTIcon iconName={icon} className='fs-2' />
          </span>
        )}

        {fontIcon && (
          <span className='menu-icon'>
            <i className={clsx('fs-3', fontIcon)}></i>
          </span>
        )}

        <span className='menu-title'>{title}</span>

        {hasArrow && <span className='menu-arrow'></span>}
      </Link>
    </div>
  )
}

export { MenuItem }
