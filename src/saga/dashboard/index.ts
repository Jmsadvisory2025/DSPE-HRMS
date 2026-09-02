import { takeLatest } from "redux-saga/effects";
import { dashboardActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchDashboardSaga() {
  yield takeLatest(dashboardActions.FETCH_DASHBOARD, genericSaga);
}
