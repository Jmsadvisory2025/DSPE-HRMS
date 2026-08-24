import { takeLatest } from "redux-saga/effects";
import { candidateActions } from "@/redux/actions";
import { genericSaga } from "@/saga/genericSaga/genericSaga";

export function* watchCandidatesSaga() {
  yield takeLatest(candidateActions.FETCH_CANDIDATES as any, genericSaga);
  yield takeLatest(candidateActions.UPLOAD_RESUMES as any, genericSaga);
  yield takeLatest(candidateActions.FETCH_CANDIDATE_DETAIL as any, genericSaga);
  yield takeLatest(candidateActions.UPDATE_CANDIDATE as any, genericSaga);
  yield takeLatest(candidateActions.SUBMIT_CANDIDATE as any, genericSaga);
  yield takeLatest(candidateActions.EXPORT_CANDIDATES as any, genericSaga);
}
