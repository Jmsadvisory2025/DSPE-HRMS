import { takeLatest } from "redux-saga/effects";
import { emailLogActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchEmailLogsSaga() {
  yield takeLatest(emailLogActions.FETCH_EMAIL_LOGS, genericSaga);
}
