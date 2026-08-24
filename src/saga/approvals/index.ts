import { takeLatest } from "redux-saga/effects";
import { approvalActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchApprovalsSaga() {
  yield takeLatest(approvalActions.FETCH_APPLICATIONS, genericSaga);
  yield takeLatest(approvalActions.FETCH_APPLICATION_DETAIL, genericSaga);
  yield takeLatest(approvalActions.FETCH_GROUPED_APPROVALS, genericSaga);
  yield takeLatest(approvalActions.PREVIEW_TRACKER, genericSaga);
  yield takeLatest(approvalActions.UPDATE_TRACKER_PREVIEW, genericSaga);
  yield takeLatest(approvalActions.REVIEW_APPLICATION, genericSaga);
  yield takeLatest(approvalActions.UPDATE_APPLICATION, genericSaga);
  yield takeLatest(approvalActions.SEND_TO_CLIENT, genericSaga);
  yield takeLatest(approvalActions.CLIENT_REMINDER, genericSaga);
}
