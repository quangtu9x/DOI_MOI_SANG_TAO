import { createRoot } from 'react-dom/client';

import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/Store';

// Axios
import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';
// Apps
import { MetronicI18nProvider } from './_metronic/i18n/Metronici18n';
import 'react-toastify/dist/ReactToastify.css';
import './_metronic/assets/sass/style.react.scss';
import './_metronic/assets/fonticon/fonticon.css';
import './_metronic/assets/keenicons/duotone/style.css';
import './_metronic/assets/keenicons/outline/style.css';
import './_metronic/assets/keenicons/solid/style.css';
import './_metronic/assets/sass/style.scss';

import { AppRoutes } from './app/routing/AppRoutes';
import { AuthProvider, setupAxios } from './app/modules/auth';

import { ConfigProvider } from 'antd';
import locale from 'antd/locale/vi_VN';

setupAxios(axios);

const queryClient = new QueryClient();
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <MetronicI18nProvider>
        <ConfigProvider locale={locale}
        >
          <Provider store={store}>
            {/* Asynchronously persist redux stores and show `SplashScreen` while it's loading. */}
            <PersistGate persistor={persistor} loading={<div>Loading...</div>}>
              <AuthProvider>
                <AppRoutes />
              </AuthProvider>
            </PersistGate>
          </Provider>
        </ConfigProvider>
      </MetronicI18nProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
