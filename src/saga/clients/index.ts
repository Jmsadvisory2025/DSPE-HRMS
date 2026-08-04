import { takeLatest } from "redux-saga/effects";
import { clientActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchClientsSaga() {
  yield takeLatest(clientActions.FETCH_CLIENTS, genericSaga);
  yield takeLatest(clientActions.FETCH_CLIENT_DETAIL, genericSaga);
  yield takeLatest(clientActions.ADD_CLIENT, genericSaga);
  yield takeLatest(clientActions.UPDATE_CLIENT, genericSaga);
  yield takeLatest(clientActions.FETCH_TRACKER_FORMATS, genericSaga);
  yield takeLatest(clientActions.UPDATE_TRACKER_FORMAT, genericSaga);
  yield takeLatest(clientActions.CREATE_TRACKER_FORMAT, genericSaga);
}
