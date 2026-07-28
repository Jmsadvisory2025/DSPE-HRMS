import { takeLatest } from "redux-saga/effects";
import { userActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchUsersSaga() {
  yield takeLatest(userActions.FETCH_USERS, genericSaga);
  yield takeLatest(userActions.ADD_USER, genericSaga);
  yield takeLatest(userActions.UPDATE_USER, genericSaga);
}
