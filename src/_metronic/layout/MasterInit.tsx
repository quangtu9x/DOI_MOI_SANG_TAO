import { useEffect, useState } from 'react'
import { Tab } from 'bootstrap'
import {
  MenuComponent,
  DrawerComponent,
  ScrollComponent,
  ScrollTopComponent,
  StickyComponent,
  ToggleComponent,
  SwapperComponent,
} from '../assets/ts/components'
import { ThemeModeComponent } from '../assets/ts/layout'

import { useLayout } from './core'
import { preloadEssentialConfigs } from '@/hooks'
import { registerLicense } from '@syncfusion/ej2-base';
// Tối ưu first-load: registerAllModules() của handsontable đã chuyển vào
// @/app/components/tdhottable — chỉ tải khi trang thực sự dùng bảng tính.

registerLicense('Ngo9BigBOggjHTQxAR8/V1NMaF1cW2hIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEBjW35WcHdWQ2BaVkV1Xw==');

export function MasterInit() {
  const { config } = useLayout()
  const [initialized, setInitialized] = useState(false)
  const pluginsInitialization = () => {
    ThemeModeComponent.init()
    setTimeout(() => {
      ToggleComponent.bootstrap()
      ScrollTopComponent.bootstrap()
      DrawerComponent.bootstrap()
      StickyComponent.bootstrap()
      MenuComponent.bootstrap()
      ScrollComponent.bootstrap()
      SwapperComponent.bootstrap()
      document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
        Tab.getOrCreateInstance(tab)
      })
    }, 500)
  }

  useEffect(() => {
    if (!initialized) {
      setInitialized(true)
      pluginsInitialization()
      preloadEssentialConfigs()
    }
  }, [config, initialized])

  return <></>
}
