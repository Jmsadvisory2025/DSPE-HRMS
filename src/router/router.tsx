import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import DashboardLayout from "../components/layout/DashboardLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CandidatesPage from "@/pages/candidates/CandidatesPage";
import ClientPage from "@/pages/clients/ClientPage";
import ClientDetailPage from "@/pages/clients/ClientDetailPage";
import ClientEditPage from "@/pages/clients/ClientEditPage";
import NewClientPage from "@/pages/clients/NewClientPage";
import NewPositionPage from "@/pages/positions/NewPositionPage";
import JobsPage from "@/pages/positions/JobsPage";
import JobDetailPage from "@/pages/positions/JobDetailPage";
import EditPositionPage from "@/pages/positions/EditPositionPage";
import ApprovalsPage from "@/pages/approvals/ApprovalsPage";
import ApprovalDetailPage from "@/pages/approvals/ApprovalDetailPage";
import UsersPage from "@/pages/users/UsersPage";
import AuditLogsPage from "@/pages/audit/AuditLogsPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import AddCandidatePage from "@/pages/candidates/AddCandidatePage";
import CandidateDetailPage from "@/pages/candidates/CandidateDetailPage";
import EditCandidatePage from "@/pages/candidates/EditCandidatePage";
import SetPinPage from "@/pages/auth/SetPinPage";

const RootRedirect = () => {
  return <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  /* ── Public routes ─────────────────────────────────────────── */
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path:"/set-pin",
    element: <SetPinPage />
  },
  /* ── Authenticated routes (with sidebar) ───────────────────── */
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/candidates",
        element: <CandidatesPage />,
      },
      {
        path: "/candidates/new",
        element: <AddCandidatePage />,
      },
      {
        path: "/candidates/:candidateId",
        element: <CandidateDetailPage />,
      },
      {
        path: "/candidates/:candidateId/edit",
        element: <EditCandidatePage />,
      },
      {
        path: "/clients",
        element: <ClientPage />,
      },
      {
        path: "/clients/new",
        element: <NewClientPage />,
      },
      {
        path: "/clients/:clientId",
        element: <ClientDetailPage />,
      },
      {
        path: "/clients/:clientId/edit",
        element: <ClientEditPage />,
      },
      {
        path: "/positions",
        element: <JobsPage />,
      },
      {
        path: "/positions/new",
        element: <NewPositionPage />,
      },
      {
        path: "/positions/:jobId",
        element: <JobDetailPage />,
      },
      {
        path: "/positions/:jobId/edit",
        element: <EditPositionPage />,
      },
      {
        path: "/approvals",
        element: <ApprovalsPage />,
      },
      {
        path: "/approvals/:applicationId",
        element: <ApprovalDetailPage />,
      },
      {
        path: "/interviews",
        element: <DashboardPage />,
      },
      {
        path: "/users",
        element: <UsersPage />,
      },
      {
        path: "/audit-logs",
        element: <AuditLogsPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/messages",
        element: <DashboardPage />,
      },
      {
        path: "/reports",
        element: <DashboardPage />,
      },
      {
        path: "/documents",
        element: <DashboardPage />,
      },
      {
        path: "/settings",
        element: <DashboardPage />,
      },
    ],
  },
]);

