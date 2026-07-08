import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { HotTable, HotTableProps } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';

import clsx from 'clsx';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

// Đăng ký module handsontable tại đây (thay vì MasterInit) để chỉ tải khi
// trang có bảng tính — mọi HotTable trong app đều render qua TDHotTable.
registerAllModules();

export interface TDHotTableProps extends HotTableProps {
  wrapperStyle?: React.CSSProperties;
}

const TDHotTable = forwardRef<any, TDHotTableProps>((props, ref) => {
  const { wrapperStyle, className, ...hotProps } = props;
  const internalRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    get hotInstance() {
      return internalRef.current?.hotInstance;
    },
    render: () => {
      if (internalRef.current?.hotInstance) {
        internalRef.current.hotInstance.render();
      }
    },
    refresh: () => {
      if (internalRef.current?.hotInstance) {
        internalRef.current.hotInstance.refreshDimensions();
        internalRef.current.hotInstance.render();
      }
    }
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalRef.current?.hotInstance) {
        internalRef.current.hotInstance.refreshDimensions();
        internalRef.current.hotInstance.render();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [props.nestedHeaders, props.columns, props.data]);

  return (
    <div
      className={clsx('td-hot-table-wrapper ht-theme-main', className)}
      style={{ width: '100%', height: '100%', ...wrapperStyle }}
    >
      <HotTable
        ref={internalRef}
        licenseKey="non-commercial-and-evaluation"
        autoRowSize={true}
        autoColumnSize={true}
        manualColumnResize={true}
        manualRowResize={true}
        outsideClickDeselects={false}
        height="auto"
        width="100%"
        {...hotProps}
      />
    </div>
  );
});

TDHotTable.displayName = 'TDHotTable';

export default TDHotTable;
