/* ── Auth ─────────────────────────────────────────────────────── */
export const authActions = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  SET_PIN: "SET_PIN",
} as const;

/* ── Clients ──────────────────────────────────────────────────── */
export const clientActions = {
  FETCH_CLIENTS: "FETCH_CLIENTS",
  FETCH_CLIENT_DETAIL: "FETCH_CLIENT_DETAIL",
  ADD_CLIENT: "ADD_CLIENT",
  UPDATE_CLIENT: "UPDATE_CLIENT",
  FETCH_TRACKER_FORMATS: "FETCH_TRACKER_FORMATS",
  UPDATE_TRACKER_FORMAT: "UPDATE_TRACKER_FORMAT",
  CREATE_TRACKER_FORMAT: "CREATE_TRACKER_FORMAT",
} as const;

/* ── Candidates ───────────────────────────────────────────────── */
export const candidateActions = {
  FETCH_CANDIDATES: "FETCH_CANDIDATES",
  UPLOAD_RESUMES: "UPLOAD_RESUMES",
  FETCH_CANDIDATE_DETAIL: "FETCH_CANDIDATE_DETAIL",
  UPDATE_CANDIDATE: "UPDATE_CANDIDATE",
  SUBMIT_CANDIDATE: "SUBMIT_CANDIDATE",
} as const;

/* ── Positions ────────────────────────────────────────────────── */
export const positionActions = {
  FETCH_JOBS: "FETCH_JOBS",
  FETCH_JOB_DETAIL: "FETCH_JOB_DETAIL",
  FETCH_JOB_PIPELINE: "FETCH_JOB_PIPELINE",
  UPDATE_APPLICATION_STATUS: "UPDATE_APPLICATION_STATUS",
  ADD_JOB: "ADD_JOB",
  UPDATE_JOB: "UPDATE_JOB",
  MOVE_APPLICATION_STAGE: "MOVE_APPLICATION_STAGE",
  SCHEDULE_INTERVIEW: "SCHEDULE_INTERVIEW",
  APPROVE_INTERVIEW_SCHEDULE: "APPROVE_INTERVIEW_SCHEDULE",
  SEND_INTERVIEW_TO_CLIENT: "SEND_INTERVIEW_TO_CLIENT",
  UPDATE_INTERVIEW_ATTENDANCE: "UPDATE_INTERVIEW_ATTENDANCE",
} as const;

export const approvalActions = {
  FETCH_APPLICATIONS: "FETCH_APPLICATIONS",
  FETCH_APPLICATION_DETAIL: "FETCH_APPLICATION_DETAIL",
  FETCH_GROUPED_APPROVALS: "FETCH_GROUPED_APPROVALS",
  PREVIEW_TRACKER: "PREVIEW_TRACKER",
  UPDATE_TRACKER_PREVIEW: "UPDATE_TRACKER_PREVIEW",
  REVIEW_APPLICATION: "REVIEW_APPLICATION",
  UPDATE_APPLICATION: "UPDATE_APPLICATION",
  SEND_TO_CLIENT: "SEND_TO_CLIENT",
} as const;

/* ── Users ─────────────────────────────────────────────────────── */
export const userActions = {
  FETCH_USERS: "FETCH_USERS",
  ADD_USER: "ADD_USER",
  UPDATE_USER: "UPDATE_USER",
} as const;

/* ── Audit Logs ───────────────────────────────────────────────── */
export const auditActions = {
  FETCH_AUDIT_LOGS: "FETCH_AUDIT_LOGS",
  FETCH_AUDIT_LOG_DETAIL: "FETCH_AUDIT_LOG_DETAIL",
} as const;

/* ── Notifications ────────────────────────────────────────────── */
export const notificationActions = {
  FETCH_NOTIFICATIONS: "FETCH_NOTIFICATIONS",
  MARK_NOTIFICATIONS_READ: "MARK_NOTIFICATIONS_READ",
  MARK_ALL_NOTIFICATIONS_READ: "MARK_ALL_NOTIFICATIONS_READ",
} as const;

/* ── Dashboard ────────────────────────────────────────────────── */
export const dashboardActions = {} as const;
