import { useEffect } from 'react';
import { ILayout, useLayout } from '../../core';

const Footer = () => {
  const { config } = useLayout();
  useEffect(() => {
    updateDOM(config);
  }, [config]);
  return (
    <>
      {/* <div className="text-gray-900 order-2 order-md-1">
        <span className="text-muted fw-semibold me-1">{new Date().getFullYear().toString()}&copy;</span>
        <a href="https://tandan.com.vn/" target="_blank" className="text-gray-800 text-hover-primary">
          Tan Dan JSC
        </a>
        <span className="text-muted fw-bold me-2">{` | API: ${import.meta.env.VITE_APP_API_VERSION} | Client: ${
          import.meta.env.VITE_APP_CLIENT_VERSION
        }`}</span>
      </div>

      <ul className="menu menu-gray-600 menu-hover-primary fw-semibold order-1">
        <li className="menu-item">
          <a href="https://tandan.com.vn/" target="_blank" className="menu-link px-2">
            About
          </a>
        </li>

        <li className="menu-item">
          <a href="https://tandan.com.vn/" target="_blank" className="menu-link px-2">
            Support
          </a>
        </li>
      </ul> */}
    </>
  );
};

const updateDOM = (config: ILayout) => {
  if (config.app?.footer?.fixed?.desktop) {
    document.body.classList.add('data-kt-app-footer-fixed', 'true');
  }

  if (config.app?.footer?.fixed?.mobile) {
    document.body.classList.add('data-kt-app-footer-fixed-mobile', 'true');
  }
};

export { Footer };
