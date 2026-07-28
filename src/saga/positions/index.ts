import { takeLatest } from "redux-saga/effects";
import { positionActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchPositionsSaga() {
  yield takeLatest(positionActions.FETCH_JOBS, genericSaga);
  yield takeLatest(positionActions.FETCH_JOB_DETAIL, genericSaga);
  yield takeLatest(positionActions.ADD_JOB, genericSaga);
  yield takeLatest(positionActions.UPDATE_JOB, genericSaga);
}
