import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { checkIsActive, KTIcon, WithChildren } from '../../../../helpers'
import { useLayout } from '../../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
}

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
}) => {
  const { pathname } = useLocation()
  const isActive = checkIsActive(pathname, to)
  const { config } = useLayout()
  const { app } = config
  const submenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submenuRef.current) {
      if (isActive) {
        submenuRef.current.style.display = 'block'
        submenuRef.current.style.overflow = 'visible'
      } else {
        submenuRef.current.style.display = ''
        submenuRef.current.style.overflow = ''
      }
    }
  }, [isActive])

  return (
    <div
      className={clsx('menu-item', { 'here show': isActive }, 'menu-accordion')}
      data-kt-menu-trigger='click'
    >
      <span className='menu-link'>
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {icon && app?.sidebar?.default?.menu?.iconType === 'svg' && (
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
        {/* <span className='menu-arrow'></span> */}
        <span className='menu-arrow'>
          <i className="fa-regular fa-chevron-down"></i>
        </span>
      </span>
      <div
        ref={submenuRef}
        className={clsx('menu-sub menu-sub-accordion', { 'menu-active-bg': isActive })}
      >
        {children}
      </div>
    </div>
  )
}

export { SidebarMenuItemWithSub }
