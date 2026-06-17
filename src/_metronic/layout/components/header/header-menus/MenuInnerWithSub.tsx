import { FC, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { checkIsActive, KTIcon, WithChildren } from '../../../../helpers'
import { useTourGuide } from '@/context/TourGuideProvider'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string // dùng cho fontawesome hoặc bootstrap icons
  menuTrigger?: 'click' | `{default:'click', lg: 'hover'}`
  menuPlacement?: 'right-start' | 'bottom-start' | 'left-start'
  hasArrow?: boolean
  hasBullet?: boolean
  isMega?: boolean,
  dataTour?: string
}

const MenuInnerWithSub: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  menuTrigger,
  menuPlacement,
  hasArrow = false,
  hasBullet = false,
  isMega = false,
  dataTour = '',
}) => {
  const menuItemRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const { currentStep, isRunning } = useTourGuide()

  // Kiểm tra xem step hiện tại có target menu này hoặc bất kỳ child nào không
  const checkIsTourTarget = (): boolean => {
    if (!isRunning || !currentStep) return false

    const targetSelector = currentStep.target as string
    if (!targetSelector) return false

    // Check nếu target là chính menu cha này: [data-tour='menu-admin']
    if (dataTour && targetSelector.includes(`[data-tour="${dataTour}"]`)) {
      return true
    }

    // Check nếu target là bất kỳ element nào BÊN TRONG dropdown này
    if (menuItemRef.current) {
      try {
        const element = menuItemRef.current.querySelector(targetSelector)
        return element !== null
      } catch (e) {
        // Invalid selector
        return false
      }
    }

    return false
  }

  const [isCurrentTourTarget, setIsCurrentTourTarget] = useState(false)

  // Update tour target status khi step thay đổi
  useEffect(() => {
    const isTourTarget = checkIsTourTarget()
    setIsCurrentTourTarget(isTourTarget)
  }, [currentStep, isRunning, dataTour])

  useEffect(() => {
    if (menuItemRef.current && menuTrigger && menuPlacement) {
      menuItemRef.current.setAttribute('data-kt-menu-trigger', menuTrigger)
      menuItemRef.current.setAttribute('data-kt-menu-placement', menuPlacement)
    }
  }, [menuTrigger, menuPlacement])

  // Ngăn chặn menu đóng khi tour guide đang active
  useEffect(() => {
    if (!menuItemRef.current || !isCurrentTourTarget) return

    const menuElement = menuItemRef.current
    const subMenu = menuElement.querySelector('.menu-sub') as HTMLElement
    if (!subMenu) return

    // Force mở menu bằng cách thêm class 'show'
    subMenu.classList.add('show')
    menuElement.classList.add('hover', 'show')

    // Handler để ngăn đóng menu KHI CLICK RA NGOÀI
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Nếu click BÊN TRONG menu hoặc submenu → CHO PHÉP (không làm gì)
      if (menuElement.contains(target)) {
        // Click vào menu item → cho phép navigate
        return
      }

      // Nếu click BÊN NGOÀI → CHẶN event để không đóng menu
      e.stopPropagation()
      e.preventDefault()

      // Force giữ menu mở
      if (!subMenu.classList.contains('show')) {
        subMenu.classList.add('show')
        menuElement.classList.add('hover', 'show')
      }
    }

    // Thêm listener ở capture phase để bắt event sớm
    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      subMenu.classList.remove('show')
      menuElement.classList.remove('hover', 'show')
    }
  }, [isCurrentTourTarget])

  return (
    <div data-tour={dataTour} ref={menuItemRef} className='menu-item menu-lg-down-accordion me-lg-1'>
      <span
        className={clsx('menu-link py-3', {
          active: checkIsActive(pathname, to),
        })}
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

        {/* {hasArrow && <span className='menu-arrow'>&#8594;</span>} */}
        {/* {hasArrow && <i className="fa-regular fa-chevron-down ms-1"></i>} */}
        {hasArrow &&
          <span className='menu-arrow'>
            <i className="fa-regular fa-chevron-down"></i>
          </span>}

      </span>
      <div
        className={clsx(
          'menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown',
          isMega ? 'w-100 w-lg-850px p-5 p-lg-5' : 'menu-rounded py-lg-4 w-lg-225px'
        )}
        data-kt-menu-dismiss={isCurrentTourTarget ? 'false' : 'true'}
      >
        {children}
      </div>
    </div>
  )
}

export { MenuInnerWithSub }
