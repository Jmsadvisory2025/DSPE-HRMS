import { all, fork } from "redux-saga/effects";
import { watchAuthSaga } from "./auth";
import { watchClientsSaga } from "./clients";
import { watchCandidatesSaga } from "./candidates";
import { watchPositionsSaga } from "./positions";
import { watchApprovalsSaga } from "./approvals";
import { watchUsersSaga } from "./users";
import { watchAuditSaga } from "./audit";
import { watchDashboardSaga } from "./dashboard";
import { watchNotificationsSaga } from "./notifications";

function* rootSaga() {
  yield all([
    fork(watchAuthSaga),
    fork(watchClientsSaga),
    fork(watchCandidatesSaga),
    fork(watchPositionsSaga),
    fork(watchApprovalsSaga),
    fork(watchUsersSaga),
    fork(watchAuditSaga),
    fork(watchDashboardSaga),
    fork(watchNotificationsSaga),
  ]);
}

export default rootSaga;
