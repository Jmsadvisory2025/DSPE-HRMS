import { takeLatest } from "redux-saga/effects";
import { notificationActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchNotificationsSaga() {
  yield takeLatest(notificationActions.FETCH_NOTIFICATIONS, genericSaga);
  yield takeLatest(notificationActions.MARK_NOTIFICATIONS_READ, genericSaga);
  yield takeLatest(notificationActions.MARK_ALL_NOTIFICATIONS_READ, genericSaga);
}
