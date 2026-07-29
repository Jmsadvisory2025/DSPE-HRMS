import { takeLatest } from "redux-saga/effects";
import { approvalActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchApprovalsSaga() {
  yield takeLatest(approvalActions.FETCH_APPLICATIONS, genericSaga);
  yield takeLatest(approvalActions.FETCH_APPLICATION_DETAIL, genericSaga);
  yield takeLatest(approvalActions.REVIEW_APPLICATION, genericSaga);
}
