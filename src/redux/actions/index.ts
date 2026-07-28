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
} as const;

/* ── Candidates ───────────────────────────────────────────────── */
export const candidateActions = {} as const;

/* ── Positions ────────────────────────────────────────────────── */
export const positionActions = {
  FETCH_JOBS: "FETCH_JOBS",
  FETCH_JOB_DETAIL: "FETCH_JOB_DETAIL",
  ADD_JOB: "ADD_JOB",
  UPDATE_JOB: "UPDATE_JOB",
} as const;

/* ── Approvals ────────────────────────────────────────────────── */
export const approvalActions = {} as const;

/* ── Users ─────────────────────────────────────────────────────── */
export const userActions = {
  FETCH_USERS: "FETCH_USERS",
  ADD_USER: "ADD_USER",
  UPDATE_USER: "UPDATE_USER",
} as const;

/* ── Audit Logs ───────────────────────────────────────────────── */
export const auditActions = {} as const;

/* ── Dashboard ────────────────────────────────────────────────── */
export const dashboardActions = {} as const;
