import { takeLatest } from "redux-saga/effects";
import { positionActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchPositionsSaga() {
  yield takeLatest(positionActions.FETCH_JOBS, genericSaga);
  yield takeLatest(positionActions.FETCH_JOB_DETAIL, genericSaga);
  yield takeLatest(positionActions.FETCH_JOB_PIPELINE, genericSaga);
  yield takeLatest(positionActions.UPDATE_APPLICATION_STATUS, genericSaga);
  yield takeLatest(positionActions.ADD_JOB, genericSaga);
  yield takeLatest(positionActions.UPDATE_JOB, genericSaga);
  yield takeLatest(positionActions.MOVE_APPLICATION_STAGE, genericSaga);
  yield takeLatest(positionActions.SCHEDULE_INTERVIEW, genericSaga);
  yield takeLatest(positionActions.APPROVE_INTERVIEW_SCHEDULE, genericSaga);
  yield takeLatest(positionActions.SEND_INTERVIEW_TO_CLIENT, genericSaga);
  yield takeLatest(positionActions.UPDATE_INTERVIEW_ATTENDANCE, genericSaga);
  yield takeLatest(positionActions.CHANGE_JOB_STATUS, genericSaga);
}
