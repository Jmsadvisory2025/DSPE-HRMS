import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import type { WebStorage } from "redux-persist/lib/types";
import createSagaMiddleware from "redux-saga";

/* ── Custom storage engine (fixes Vite ESM compat issue) ────── */
const storage: WebStorage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};
import rootSaga from "@/saga";

/* ── Slice Reducers ───────────────────────────────────────────── */
import authReducer from "@/redux/slices/authSlice";
import clientReducer from "@/redux/slices/clientSlice";
import candidateReducer from "@/redux/slices/candidateSlice";
import positionReducer from "@/redux/slices/positionSlice";
import approvalReducer from "@/redux/slices/approvalSlice";
import userReducer from "@/redux/slices/userSlice";
import auditReducer from "@/redux/slices/auditSlice";
import dashboardReducer from "@/redux/slices/dashboardSlice";

/* ── Saga Middleware ──────────────────────────────────────────── */
const sagaMiddleware = createSagaMiddleware();

/* ── Persist Config ───────────────────────────────────────────── */
const persistConfig = {
  key: "recruit-os-root",
  storage,
  whitelist: ["auth"],
};

/* ── Root Reducer ─────────────────────────────────────────────── */
const rootReducer = combineReducers({
  auth: authReducer,
  clients: clientReducer,
  candidates: candidateReducer,
  positions: positionReducer,
  approvals: approvalReducer,
  users: userReducer,
  audit: auditReducer,
  dashboard: dashboardReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ── Store ─────────────────────────────────────────────────────── */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

/* ── Type Exports ─────────────────────────────────────────────── */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
