import { takeLatest } from "redux-saga/effects";
import { auditActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchAuditSaga() {
  yield takeLatest(auditActions.FETCH_AUDIT_LOGS, genericSaga);
  yield takeLatest(auditActions.FETCH_AUDIT_LOG_DETAIL, genericSaga);
}
