import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { theme } from "@/config/theme";
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Mail,
  FileText,
  IndianRupee,
  Clock,
  User,
  Eye,
  Pencil,
  Save,
  X,
  Loader2,
  Send,
  BarChart3,
  FileClock,
  Building,
  CheckCircle2,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ReviewActionModal } from "./components/ReviewActionModal";
import { approvalActions } from "@/redux/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  stage_name: string | null;
  share_date: string;
  created_at: string;
  current_ctc: string;
  expected_ctc: string;
  notice_period: string;
  submitted_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  candidate_cv: string;
  manager_review_status: string;
  manager_review_notes: string;
}

interface GroupedResponse {
  job_id: string;
  job_title: string;
  applications: Application[];
}

interface TrackerPreviewData {
  tracker_preview: Record<string, any>[];
  columns: string[];
}

const ApprovalDetailPage = () => {
  const { applicationId: jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isRecruiter } = useAuth();

  const [data, setData] = useState<GroupedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "accepted" | "rejected" | "resubmit" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  // Tracker preview state
  const [trackerData, setTrackerData] = useState<
    Record<string, TrackerPreviewData>
  >({});
  const [trackerLoading, setTrackerLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [trackerOpen, setTrackerOpen] = useState<Record<string, boolean>>({});
  const [trackerEditing, setTrackerEditing] = useState<Record<string, boolean>>(
    {},
  );
  const [trackerEditData, setTrackerEditData] = useState<
    Record<string, Record<string, any>>
  >({});
  const [trackerSaving, setTrackerSaving] = useState<Record<string, boolean>>(
    {},
  );
  const [trackerExtraCols, setTrackerExtraCols] = useState<
    Record<string, { key: string; value: string }[]>
  >({});

  // Tracker Confirm Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [appIdToConfirm, setAppIdToConfirm] = useState<string | null>(null);

  // Send to Client State
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [sendingToClient, setSendingToClient] = useState(false);
  const [sendClientModalOpen, setSendClientModalOpen] = useState(false);

  // Past Jobs State
  const [pastJobsModalOpen, setPastJobsModalOpen] = useState(false);
  const [pastJobsLoading, setPastJobsLoading] = useState(false);
  const [pastJobsData, setPastJobsData] = useState<any[]>([]);
  const [pastJobsCandidateName, setPastJobsCandidateName] = useState<string>("");

  const handleFetchPastJobs = (appId: string, candidateName: string) => {
    setPastJobsModalOpen(true);
    setPastJobsLoading(true);
    setPastJobsData([]);
    setPastJobsCandidateName(candidateName);

    dispatch({
      type: approvalActions.FETCH_APPLICATION_DETAIL,
      method: "GET",
      endPoint: `/api/v1/candidates/applications/${appId}/`,
      auth: true,
      setLoading: (val: boolean) => setPastJobsLoading(val),
      getResponse: (res: any) => {
        if (res && res.past_jobs) {
          setPastJobsData(res.past_jobs);
        }
      },
      getError: (err: any) => {
        console.error("Failed to fetch past jobs", err);
        toast.error("Failed to fetch past jobs for this candidate.");
      },
    });
  };

  const fetchDetail = () => {
    if (jobId) {
      dispatch({
        type: approvalActions.FETCH_GROUPED_APPROVALS,
        method: "GET",
        endPoint: `/api/v1/candidates/applications/grouped-approval-queue/?job=${jobId}`,
        auth: true,
        setLoading: (val: boolean) => setLoading(val),
        getResponse: (res: GroupedResponse[]) => {
          if (res && res.length > 0) {
            setData(res[0]);
          } else {
            setData(null);
          }
        },
        getError: (err: any) => console.error("Error fetching approvals:", err),
      });
    }
  };

  const handleToggleSelect = (appId: string) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const handleSendToClient = () => {
    if (selectedApps.size === 0) return;
    dispatch({
      type: approvalActions.SEND_TO_CLIENT,
      method: "POST",
      endPoint: "/api/v1/candidates/applications/send-to-client/",
      auth: true,
      body: { application_ids: Array.from(selectedApps) },
      setLoading: (val: boolean) => setSendingToClient(val),
      getResponse: (res: any) => {
        if (res?.errors && res.errors.length > 0) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {res.message || "Partial Success"}
              </span>
              <ul className="list-disc pl-4 text-sm opacity-90">
                {res.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>,
            { duration: 6000 },
          );
        } else {
          toast.success(
            res?.message || "Trackers successfully sent to the client!",
          );
        }
        setSelectedApps(new Set());
        setSendClientModalOpen(false);
      },
      getError: (err: any) => {
        console.error("Failed to send trackers:", err);
        const errorData = err?.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                {errorData.message || "Failed to send"}
              </span>
              <ul className="list-disc pl-4 text-sm opacity-90">
                {errorData.errors.map((errMsg: string, i: number) => (
                  <li key={i}>{errMsg}</li>
                ))}
              </ul>
            </div>,
            { duration: 6000 },
          );
        } else {
          toast.error(
            errorData?.message ||
              errorData?.detail ||
              errorData?.error ||
              "Failed to send trackers to the client",
          );
        }
      },
    });
  };

  useEffect(() => {
    fetchDetail();
  }, [dispatch, jobId]);

  const handleActionClick = (
    appId: string,
    type: "accepted" | "rejected" | "resubmit",
  ) => {
    setTargetAppId(appId);
    setActionType(type);
    setModalOpen(true);
  };

  const submitAction = (notes: string) => {
    if (!targetAppId || !actionType) return;
    setSubmitting(true);

    dispatch({
      type: approvalActions.REVIEW_APPLICATION,
      method: "POST",
      endPoint: `/api/v1/candidates/applications/${targetAppId}/review/`,
      auth: true,
      body: { status: actionType, notes },
      setLoading: (val: boolean) => {
        if (!val) setSubmitting(false);
      },
      getResponse: () => {
        setModalOpen(false);
        fetchDetail();
      },
      getError: (err: any) => console.error("Action failed:", err),
    });
  };

  // ── Tracker Preview ──────────────────────────────────────────
  const handlePreviewTracker = (appId: string) => {
    // Toggle open/close
    if (trackerOpen[appId]) {
      setTrackerOpen((prev) => ({ ...prev, [appId]: false }));
      setTrackerEditing((prev) => ({ ...prev, [appId]: false }));
      return;
    }

    setTrackerLoading((prev) => ({ ...prev, [appId]: true }));
    setTrackerOpen((prev) => ({ ...prev, [appId]: true }));

    dispatch({
      type: approvalActions.PREVIEW_TRACKER,
      method: "POST",
      endPoint: "/api/v1/clients/tracker-formats/preview/",
      auth: true,
      body: { application_ids: [appId] },
      setLoading: (val: boolean) =>
        setTrackerLoading((prev) => ({ ...prev, [appId]: val })),
      getResponse: (res: TrackerPreviewData) => {
        setTrackerData((prev) => ({ ...prev, [appId]: res }));
      },
      getError: (err: any) => {
        console.error("Tracker preview failed:", err);
        setTrackerOpen((prev) => ({ ...prev, [appId]: false }));

        const status = err?.response?.status;
        const errMsg =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load tracker preview";

        if (status === 404 || errMsg.toLowerCase().includes("not found")) {
          toast.warning(errMsg);
        } else {
          toast.error(errMsg);
        }
      },
    });
  };

  const handleStartEdit = (appId: string) => {
    const preview = trackerData[appId];
    if (!preview || !preview.tracker_preview[0]) return;

    // Clone the preview row into editable state
    const row = { ...preview.tracker_preview[0] };
    setTrackerEditData((prev) => ({ ...prev, [appId]: row }));
    setTrackerExtraCols((prev) => ({ ...prev, [appId]: [] }));
    setTrackerEditing((prev) => ({ ...prev, [appId]: true }));
  };

  const handleCancelEdit = (appId: string) => {
    setTrackerEditing((prev) => ({ ...prev, [appId]: false }));
    setTrackerExtraCols((prev) => ({ ...prev, [appId]: [] }));
  };

  const handleAddExtraCol = (appId: string) => {
    setTrackerExtraCols((prev) => ({
      ...prev,
      [appId]: [...(prev[appId] || []), { key: "", value: "" }],
    }));
  };

  const handleRemoveExtraCol = (appId: string, index: number) => {
    setTrackerExtraCols((prev) => ({
      ...prev,
      [appId]: (prev[appId] || []).filter((_, i) => i !== index),
    }));
  };

  const handleExtraColChange = (
    appId: string,
    index: number,
    field: "key" | "value",
    val: string,
  ) => {
    setTrackerExtraCols((prev) => {
      const cols = [...(prev[appId] || [])];
      cols[index] = { ...cols[index], [field]: val };
      return { ...prev, [appId]: cols };
    });
  };

  const handleRemoveExistingCol = (appId: string, col: string) => {
    setTrackerEditData((prev) => {
      const data = { ...prev[appId] };
      delete data[col];
      return { ...prev, [appId]: data };
    });
  };

  const handleEditChange = (appId: string, column: string, value: string) => {
    setTrackerEditData((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], [column]: value },
    }));
  };

  const initiateSaveTracker = (appId: string) => {
    setAppIdToConfirm(appId);
    setConfirmModalOpen(true);
  };

  const handleSaveTracker = () => {
    if (!appIdToConfirm) return;
    const appId = appIdToConfirm;

    const editRow = { ...trackerEditData[appId] };
    if (!editRow) {
      setConfirmModalOpen(false);
      return;
    }

    // Merge extra columns into the row
    const extras = trackerExtraCols[appId] || [];
    extras.forEach((ec) => {
      if (ec.key.trim()) {
        editRow[ec.key.trim()] = ec.value;
      }
    });

    setTrackerSaving((prev) => ({ ...prev, [appId]: true }));

    dispatch({
      type: approvalActions.UPDATE_TRACKER_PREVIEW,
      method: "PATCH",
      endPoint: "/api/v1/clients/tracker-formats/preview-update/",
      auth: true,
      body: {
        tracker_update: [editRow],
      },
      setLoading: (val: boolean) =>
        setTrackerSaving((prev) => ({ ...prev, [appId]: val })),
      getResponse: () => {
        toast.success("Tracker details updated successfully");
        setTrackerEditing((prev) => ({ ...prev, [appId]: false }));
        setConfirmModalOpen(false);
        setAppIdToConfirm(null);
        // Re-fetch the preview to show updated data
        dispatch({
          type: approvalActions.PREVIEW_TRACKER,
          method: "POST",
          endPoint: "/api/v1/clients/tracker-formats/preview/",
          auth: true,
          body: { application_ids: [appId] },
          setLoading: () => {},
          getResponse: (res: TrackerPreviewData) => {
            setTrackerData((prev) => ({ ...prev, [appId]: res }));
          },
          getError: () => {},
        });
      },
      getError: (err: any) => {
        console.error("Tracker update failed:", err);
        toast.error("Failed to update tracker details");
      },
    });
  };

  // ── Render ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="size-8 border-2 border-t-transparent rounded-full animate-spin mb-4"
          style={{
            borderColor: `${theme.border} transparent ${theme.border} ${theme.border}`,
            borderTopColor: theme.accent,
          }}
        ></div>
        <div className="text-sm font-medium" style={{ color: theme.textMuted }}>
          Loading approvals...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-sm font-medium" style={{ color: theme.textMuted }}>
          No pending approvals found for this job.
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/approvals")}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/approvals")}
            style={{ borderColor: theme.border, color: theme.textSecondary }}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: theme.textPrimary }}
            >
              Pending Approvals
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              {data.job_title} • {data.applications.length} application
              {data.applications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            // variant="outline"
            className="gap-2"
            onClick={() => navigate(`/positions/${jobId}/pipeline`)}
            // style={{ borderColor: theme.accent + '50', color: theme.accent }}
          >
            <BarChart3 className="size-4" />
            Check Status
          </Button>

          {selectedApps.size > 0 && (
            <Button
              onClick={() => setSendClientModalOpen(true)}
              disabled={sendingToClient}
              className="gap-2"
              style={{ background: theme.accent }}
            >
              {sendingToClient ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send {selectedApps.size} to Client
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.applications.map((app) => (
          <Card
            key={app.id}
            style={{ background: theme.surface, borderColor: theme.border }}
            className="overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-gray-300 cursor-pointer shrink-0"
                        checked={selectedApps.has(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                        style={{ accentColor: theme.accent }}
                      />
                      <h3
                        className="text-lg font-bold"
                        style={{ color: theme.textPrimary }}
                      >
                        {app.candidate_name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="capitalize"
                        style={{
                          color:
                            app.manager_review_status === "pending"
                              ? theme.warning
                              : app.manager_review_status === "accepted"
                                ? theme.success
                                : app.manager_review_status === "resubmit"
                                  ? theme.info
                                  : theme.destructive,
                          background:
                            app.manager_review_status === "pending"
                              ? theme.warningSoft
                              : app.manager_review_status === "accepted"
                                ? theme.successSoft
                                : app.manager_review_status === "resubmit"
                                  ? theme.infoSoft
                                  : theme.destructiveSoft,
                          border: 0,
                        }}
                      >
                        {app.manager_review_status}
                      </Badge>
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      <Mail className="size-3.5" />
                      <span>{app.candidate_email}</span>
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm mt-2"
                      style={{ color: theme.textMuted }}
                    >
                      <User className="size-3.5" />
                      <span>
                        Submitted by: {app.submitted_by?.name || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(app.candidate_cv, "_blank")}
                        disabled={!app.candidate_cv}
                      >
                        <FileText className="size-3.5" />
                        View Resume
                        <ExternalLink className="size-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePreviewTracker(app.id)}
                        style={
                          trackerOpen[app.id]
                            ? {
                                background: theme.accentSoft,
                                borderColor: theme.accent,
                                color: theme.accent,
                              }
                            : {}
                        }
                      >
                        <Eye className="size-3.5" />
                        {trackerOpen[app.id]
                          ? "Hide Tracker"
                          : "Preview Tracker"}
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFetchPastJobs(app.id, app.candidate_name)}
                            >
                              <FileClock className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Check this candidate's past applications</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-lg bg-black/5 dark:bg-white/5">
                  <div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      <Calendar className="size-3.5" /> Share Date
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      {app.share_date || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      <IndianRupee className="size-3.5" /> Current CTC
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      {app.current_ctc && app.current_ctc !== "0.00"
                        ? app.current_ctc
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      <IndianRupee className="size-3.5" /> Expected CTC
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      {app.expected_ctc && app.expected_ctc !== "0.00"
                        ? app.expected_ctc
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      <Clock className="size-3.5" /> Notice Period
                    </div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme.textPrimary }}
                    >
                      {app.notice_period || "N/A"}
                    </div>
                  </div>
                </div>

                {/* ── Tracker Preview Panel ──────────────────────────────── */}
                {trackerOpen[app.id] && (
                  <div
                    className="mt-4 rounded-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ border: `1px solid ${theme.border}` }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ background: theme.surfaceMuted }}
                    >
                      <h4
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: theme.textPrimary }}
                      >
                        <Eye
                          className="size-4"
                          style={{ color: theme.accent }}
                        />
                        Tracker Details
                      </h4>
                      <div className="flex items-center gap-2">
                        {!trackerEditing[app.id] ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-7 text-xs"
                            onClick={() => handleStartEdit(app.id)}
                            disabled={
                              trackerLoading[app.id] || !trackerData[app.id]
                            }
                          >
                            <Pencil className="size-3" /> Edit
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-7 text-xs"
                              onClick={() => handleCancelEdit(app.id)}
                              disabled={trackerSaving[app.id]}
                            >
                              <X className="size-3" /> Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1.5 h-7 text-xs"
                              onClick={() => initiateSaveTracker(app.id)}
                              disabled={trackerSaving[app.id]}
                              style={{ background: theme.accent }}
                            >
                              {trackerSaving[app.id] ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Save className="size-3" />
                              )}
                              {trackerSaving[app.id] ? "Saving..." : "Save"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {trackerLoading[app.id] ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2
                          className="size-5 animate-spin"
                          style={{ color: theme.accent }}
                        />
                        <span
                          className="ml-2 text-sm"
                          style={{ color: theme.textMuted }}
                        >
                          Loading tracker...
                        </span>
                      </div>
                    ) : trackerData[app.id] &&
                      trackerData[app.id].columns.length > 0 ? (
                      <div className="p-4 space-y-4">
                        {/* Tracker Receiver Info */}
                        {(trackerData[app.id] as any).tracker_receiver && (
                          <div
                            className="flex items-center gap-3 px-3 py-2 rounded-lg"
                            style={{ background: theme.accentSoft }}
                          >
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: theme.accent,
                                color: theme.accentForeground,
                              }}
                            >
                              {(
                                trackerData[app.id] as any
                              ).tracker_receiver.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>
                            <div>
                              <div
                                className="text-sm font-semibold"
                                style={{ color: theme.textPrimary }}
                              >
                                {
                                  (trackerData[app.id] as any).tracker_receiver
                                    .name
                                }
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: theme.textMuted }}
                              >
                                {
                                  (trackerData[app.id] as any).tracker_receiver
                                    .email
                                }{" "}
                                • Tracker Receiver
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Preview Table */}
                        {!trackerEditing[app.id] ? (
                          <div
                            className="rounded-lg overflow-hidden"
                            style={{ border: `1px solid ${theme.border}` }}
                          >
                            <table className="w-full">
                              <tbody>
                                {trackerData[app.id].columns.map((col, idx) => {
                                  const value =
                                    trackerData[app.id].tracker_preview[0]?.[
                                      col
                                    ] || "";
                                  return (
                                    <tr
                                      key={col}
                                      style={{
                                        background:
                                          idx % 2 === 0
                                            ? theme.background
                                            : theme.surfaceMuted,
                                      }}
                                    >
                                      <td
                                        className="px-4 py-2.5 text-xs font-semibold capitalize align-top whitespace-nowrap"
                                        style={{
                                          color: theme.textMuted,
                                          width: "160px",
                                          borderRight: `1px solid ${theme.border}`,
                                        }}
                                      >
                                        {col.replace(/_/g, " ")}
                                      </td>
                                      <td
                                        className="px-4 py-2.5 text-sm font-medium align-top"
                                        style={{
                                          color: value
                                            ? theme.textPrimary
                                            : theme.textMuted,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {value || "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <>
                            {/* Edit Mode — grid layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {Object.keys(trackerEditData[app.id] || {})
                                .filter((k) => k !== "application_id")
                                .map((col) => {
                                  const value =
                                    trackerEditData[app.id]?.[col] || "";
                                  return (
                                    <div key={col} className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <label
                                          className="text-xs font-semibold capitalize"
                                          style={{ color: theme.textMuted }}
                                        >
                                          {col.replace(/_/g, " ")}
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleRemoveExistingCol(app.id, col)
                                          }
                                          className="text-xs px-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                          style={{ color: theme.destructive }}
                                          title="Remove column"
                                          disabled={trackerSaving[app.id]}
                                        >
                                          <X className="size-3" />
                                        </button>
                                      </div>
                                      <Input
                                        value={value}
                                        onChange={(e) =>
                                          handleEditChange(
                                            app.id,
                                            col,
                                            e.target.value,
                                          )
                                        }
                                        className="h-9 text-sm"
                                        style={{
                                          background: theme.background,
                                          borderColor: theme.border,
                                          color: theme.textPrimary,
                                        }}
                                        disabled={trackerSaving[app.id]}
                                      />
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Extra columns */}
                            {(trackerExtraCols[app.id] || []).length > 0 && (
                              <div
                                className="pt-3 mt-3 space-y-3"
                                style={{
                                  borderTop: `1px dashed ${theme.border}`,
                                }}
                              >
                                <p
                                  className="text-xs font-semibold"
                                  style={{ color: theme.accent }}
                                >
                                  New Columns
                                </p>
                                {(trackerExtraCols[app.id] || []).map(
                                  (ec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-end gap-3"
                                    >
                                      <div className="flex-1 space-y-1">
                                        <label
                                          className="text-xs font-medium"
                                          style={{ color: theme.textMuted }}
                                        >
                                          Column Name
                                        </label>
                                        <Input
                                          value={ec.key}
                                          onChange={(e) =>
                                            handleExtraColChange(
                                              app.id,
                                              idx,
                                              "key",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="e.g. city, age, gender..."
                                          className="h-9 text-sm"
                                          style={{
                                            background: theme.background,
                                            borderColor: theme.border,
                                            color: theme.textPrimary,
                                          }}
                                          disabled={trackerSaving[app.id]}
                                        />
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <label
                                          className="text-xs font-medium"
                                          style={{ color: theme.textMuted }}
                                        >
                                          Value
                                        </label>
                                        <Input
                                          value={ec.value}
                                          onChange={(e) =>
                                            handleExtraColChange(
                                              app.id,
                                              idx,
                                              "value",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Enter value..."
                                          className="h-9 text-sm"
                                          style={{
                                            background: theme.background,
                                            borderColor: theme.border,
                                            color: theme.textPrimary,
                                          }}
                                          disabled={trackerSaving[app.id]}
                                        />
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-2 shrink-0"
                                        onClick={() =>
                                          handleRemoveExtraCol(app.id, idx)
                                        }
                                        disabled={trackerSaving[app.id]}
                                        style={{
                                          borderColor: theme.destructive + "50",
                                          color: theme.destructive,
                                        }}
                                      >
                                        <X className="size-3.5" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 h-8 text-xs"
                              onClick={() => handleAddExtraCol(app.id)}
                              disabled={trackerSaving[app.id]}
                              style={{
                                borderColor: theme.accent + "50",
                                color: theme.accent,
                              }}
                            >
                              + Add Column
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        className="text-center py-8 text-sm"
                        style={{ color: theme.textMuted }}
                      >
                        No tracker format configured for this client.
                      </div>
                    )}
                  </div>
                )}

                {/* Review Notes */}
                {app.manager_review_notes && (
                  <div
                    className="mt-4 p-3 rounded text-sm border-l-2"
                    style={{
                      background: theme.surfaceMuted,
                      borderColor: theme.accent,
                      color: theme.textSecondary,
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{ color: theme.textPrimary }}
                    >
                      Review Notes:
                    </span>{" "}
                    {app.manager_review_notes}
                  </div>
                )}
              </div>

              {/* Action Bar (Manager Only) */}
              {!isRecruiter &&
                app.manager_review_status?.toLowerCase() === "pending" && (
                  <div
                    className="flex items-center justify-end gap-3 p-4 border-t"
                    style={{
                      borderColor: theme.border,
                      background: theme.surfaceMuted,
                    }}
                  >
                    Profile :-
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(app.id, "rejected")}
                      style={{
                        borderColor: theme.destructive + "50",
                        color: theme.destructive,
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActionClick(app.id, "resubmit")}
                      style={{
                        borderColor: theme.warning + "50",
                        color: theme.warning,
                      }}
                    >
                      Re-Submission
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleActionClick(app.id, "accepted")}
                      style={{
                        background: theme.success,
                        color: theme.textInverse,
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ReviewActionModal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        onConfirm={submitAction}
        actionType={actionType}
        loading={submitting}
      />

      <Dialog
        open={confirmModalOpen}
        onOpenChange={(open) =>
          !trackerSaving[appIdToConfirm || ""] && setConfirmModalOpen(open)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Tracker Update</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Please note: When you add or remove any fields in this tracker, it
              will update the tracker format globally for this client's team
              member.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={appIdToConfirm ? trackerSaving[appIdToConfirm] : false}
            >
              Cancel
            </Button>
            <Button
              style={{
                background: theme.accent,
                color: theme.accentForeground,
              }}
              onClick={handleSaveTracker}
              disabled={appIdToConfirm ? trackerSaving[appIdToConfirm] : false}
            >
              {appIdToConfirm && trackerSaving[appIdToConfirm] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sendClientModalOpen}
        onOpenChange={(open) =>
          !sendingToClient && setSendClientModalOpen(open)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to Client</DialogTitle>
            <DialogDescription className="text-base pt-2">
              <span
                className="font-semibold block mb-2"
                style={{ color: theme.textPrimary }}
              >
                Selected Candidates:
              </span>
              <ul
                className="list-disc pl-5 mb-4 max-h-40 overflow-y-auto space-y-1 text-sm"
                style={{ color: theme.textSecondary }}
              >
                {data?.applications
                  .filter((app) => selectedApps.has(app.id))
                  .map((app) => (
                    <li key={app.id}>{app.candidate_name}</li>
                  ))}
              </ul>
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: theme.warningSoft,
                  border: `1px solid ${theme.warning}50`,
                  color: theme.textPrimary,
                }}
              >
                <strong style={{ color: theme.warning }}>Please Note:</strong>{" "}
                Before sending, verify all details and the tracker manually for
                each candidate to ensure accuracy.
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setSendClientModalOpen(false)}
              disabled={sendingToClient}
            >
              Cancel
            </Button>
            <Button
              style={{
                background: theme.accent,
                color: theme.accentForeground,
              }}
              onClick={handleSendToClient}
              disabled={sendingToClient}
            >
              {sendingToClient ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Confirm & Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pastJobsModalOpen} onOpenChange={setPastJobsModalOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[950px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b" style={{ borderColor: theme.border }}>
            <DialogTitle className="text-xl font-bold" style={{ color: theme.textPrimary }}>
              Past Applications
              {pastJobsCandidateName && <span style={{ color: theme.accent }}> • {pastJobsCandidateName}</span>}
            </DialogTitle>
            <DialogDescription className="text-sm" style={{ color: theme.textMuted }}>
              History of previous applications and their statuses for this candidate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {pastJobsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.accent }} />
                <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Fetching past records...</span>
              </div>
            ) : pastJobsData.length > 0 ? (
              <div className="flex flex-col gap-5">
                {pastJobsData.map((job, idx) => (
                  <Card key={idx} style={{ background: theme.surface, borderColor: theme.border }} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b" style={{ borderColor: theme.border, background: theme.surfaceMuted }}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-bold text-lg tracking-tight" style={{ color: theme.textPrimary }}>{job.job_title}</h4>
                          {job.status && (
                            <Badge className="capitalize text-[11px] px-2.5 py-0.5 font-bold" style={{ background: theme.accentSoft, color: theme.accent, border: 0 }}>
                              {job.status}
                            </Badge>
                          )}
                          {job.stage && (
                            <Badge variant="outline" className="capitalize text-[11px] px-2.5 py-0.5 font-bold shadow-sm">
                              {job.stage}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                          <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                            <Building className="size-3.5" /> {job.company_name}
                          </span>
                          <span className="text-muted-foreground hidden sm:inline opacity-50">•</span>
                          <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <Calendar className="size-3.5" /> Applied: {new Date(job.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <User className="size-3" /> Recruiter
                          </span>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>{job.recruiter_name || "N/A"}</div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <User className="size-3" /> Manager
                          </span>
                          <div className="font-medium text-sm" style={{ color: theme.textPrimary }}>{job.manager_name || "N/A"}</div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <Briefcase className="size-3" /> Email
                          </span>
                          <div className="font-medium text-sm truncate" style={{ color: theme.textPrimary }}>
                            {job.email || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <CheckCircle2 className="size-3" /> Manager Review
                          </span>
                          <div>
                            <Badge 
                              className="capitalize text-[11px] font-bold px-2.5 py-0.5 shadow-sm"
                              style={{
                                color: job.manager_review_status === 'pending' ? theme.warning : 
                                       job.manager_review_status === 'accepted' ? theme.success : 
                                       job.manager_review_status === 'resubmit' ? theme.info : theme.destructive,
                                background: job.manager_review_status === 'pending' ? theme.warningSoft : 
                                            job.manager_review_status === 'accepted' ? theme.successSoft : 
                                            job.manager_review_status === 'resubmit' ? theme.infoSoft : theme.destructiveSoft,
                                border: 0,
                              }}
                            >
                              {job.manager_review_status || "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {job.manager_review_notes && (
                        <div className="mt-6 p-4 rounded-xl shadow-sm" style={{ background: theme.background, border: `1px solid ${theme.border}`, borderLeft: `4px solid ${theme.accent}` }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                            <MessageSquare className="size-3" /> Review Notes
                          </span>
                          <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textSecondary }}>"{job.manager_review_notes}"</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="size-12 rounded-full mb-4 flex items-center justify-center" style={{ background: theme.surfaceMuted }}>
                  <FileText className="size-6" style={{ color: theme.textMuted }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>No Past Applications</h3>
                <p className="text-sm mt-1 max-w-sm" style={{ color: theme.textMuted }}>
                  This candidate has not applied to any other positions within the system.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4 pt-4 border-t" style={{ borderColor: theme.border }}>
            <Button variant="outline" className="w-full sm:w-auto font-semibold" onClick={() => setPastJobsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalDetailPage;
