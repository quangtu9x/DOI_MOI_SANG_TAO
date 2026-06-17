import { all } from 'redux-saga/effects';
import { combineReducers } from 'redux';

import { globalSlice } from './global/Slice';
import { modalSlice } from './modal/Slice';
import { organizationUnitSlice } from './organization-unit/Slice';
import { dashboardSlice } from './dashboard/Slice';
import notificationReducer from './notification/Slice';
import businessReducer from './business-filter/Slice';

export const rootReducer = combineReducers({
  global: globalSlice.reducer,
  modal: modalSlice.reducer,
  organizationUnit: organizationUnitSlice.reducer,
  dashboard: dashboardSlice.reducer,
  notification: notificationReducer,
  business: businessReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export function* rootSaga() {
  yield all([]);
}
