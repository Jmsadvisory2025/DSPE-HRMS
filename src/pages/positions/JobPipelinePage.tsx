import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { theme } from "@/config/theme";
import { getJobStatusStyle } from "@/lib/statusUtils";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  IndianRupee,
  Users,
  GraduationCap,
  Loader2,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Clock,
  Video,
  MapPinned,
  CheckCircle2,
  XCircle,
  Send,
  ClipboardCheck,
  RefreshCw,
  UserCheck,
  Phone,
  Square,
  CheckSquare2,
  Download,
} from "lucide-react";
import { positionActions, candidateActions } from "@/redux/actions";
import { toast } from "sonner";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

/* ── Types ──────────────────────────────────────────────────── */
interface InterviewSchedule {
  id: string;
  date: string;
  time: string;
  mode: "online" | "in-person" | "telephonic";
  interviewer_name: string;
  notes: string;
  manager_approval_status: "pending" | "approved" | "rejected";
  attendance_status:
    | "pending"
    | "attended"
    | "no-show"
    | "reschedule-requested";
  created_at: string;
}

interface PipelineCandidate {
  application_id: string;
  candidate_id: string;
  candidate_name: string;
  current_company: string;
  experience: string;
  current_ctc: string;
  expected_ctc: string;
  notice_period: string;
  notes: string;
  status: string;
  interview_schedule?: InterviewSchedule | null;
}

interface PipelineData {
  job: {
    id: string;
    code: string;
    title: string;
    description: string;
    description_file: string | null;
    skills: string[];
    education: string;
    min_experience: number;
    max_experience: number;
    location: string;
    budget: string;
    hiring_for: string;
    client: {
      id: string;
      name: string;
      team_member: {
        id: string;
        name: string;
        email: string;
      };
    } | null;
    status: string;
    assigned_recruiters: {
      id: string;
      name: string;
      email: string;
      phone: string;
      avatar: string | null;
      role: string;
      organization: {
        id: string;
        name: string;
        created_at: string;
      };
    }[];
    created_by: {
      id: string;
      name: string;
      email: string;
      phone: string;
      avatar: string | null;
      role: string;
      organization: {
        id: string;
        name: string;
        created_at: string;
      };
    } | null;
    hiring_manager: string | null;
    stages: any[];
    candidate_count: number;
    created_at: string;
    updated_at: string;
    organization: string;
    is_deleted: boolean;
    deleted_at: string | null;
  };
  pipeline: Record<string, PipelineCandidate[]>;
}

/* ── Stage display config ───────────────────────────────────── */
const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  "sent-to-client": {
    label: "Sent to Client",
    color: theme.accent,
    bg: theme.accentSoft,
  },
  "interview-align": {
    label: "Interview Align",
    color: theme.chart2,
    bg: theme.chart2 + "15",
  },
  select: { label: "Select", color: theme.chart3, bg: theme.chart3 + "15" },
  offered: { label: "Offered", color: theme.warning, bg: theme.warningSoft },
  joined: { label: "Joined", color: theme.success, bg: theme.successSoft },
  "on-hold": { label: "On Hold", color: theme.warning, bg: theme.warningSoft },
  rejected: {
    label: "Rejected",
    color: theme.destructive,
    bg: theme.destructiveSoft,
  },
  backout: {
    label: "Backout",
    color: theme.destructive,
    bg: theme.destructiveSoft,
  },
};

const getStageConfig = (stage: string) => {
  return (
    STAGE_CONFIG[stage] || {
      label: stage.replace(/-/g, " "),
      color: theme.textMuted,
      bg: theme.surfaceMuted,
    }
  );
};

/* ── Component ──────────────────────────────────────────────── */
const JobPipelinePage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobDetailsExpanded, setJobDetailsExpanded] = useState(false);
  const [movingAppId, setMovingAppId] = useState<string | null>(null);

  // Local pipeline state for optimistic drag-and-drop
  const [localPipeline, setLocalPipeline] = useState<
    Record<string, PipelineCandidate[]>
  >({});

  // Scroll container ref for auto-scroll during drag
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Stage change confirmation modal state
  const [stageChangeModal, setStageChangeModal] = useState<{
    open: boolean;
    candidate: PipelineCandidate | null;
    fromStage: string;
    toStage: string;
    destIndex: number;
  }>({
    open: false,
    candidate: null,
    fromStage: "",
    toStage: "",
    destIndex: 0,
  });
  const [stageChangeNote, setStageChangeNote] = useState("");
  const [stageChangeSaving, setStageChangeSaving] = useState(false);

  // ── Interview Scheduling Modal States ──────────────────────
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    candidate: PipelineCandidate | null;
  }>({ open: false, candidate: null });
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    mode: "online" as "online" | "in-person" | "telephonic",
    interviewer_name: "",
    notes: "",
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const [approvalModal, setApprovalModal] = useState<{
    open: boolean;
    candidate: PipelineCandidate | null;
  }>({ open: false, candidate: null });
  const [approvalSaving, setApprovalSaving] = useState(false);

  const [attendanceModal, setAttendanceModal] = useState<{
    open: boolean;
    candidate: PipelineCandidate | null;
  }>({ open: false, candidate: null });
  const [selectedAttendance, setSelectedAttendance] = useState<string>("");
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  const [sendToClientLoading, setSendToClientLoading] = useState<string | null>(
    null,
  );

  // Bulk send-to-client selection state
  const [selectedForSend, setSelectedForSend] = useState<Set<string>>(new Set());
  const [bulkSendLoading, setBulkSendLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (jobId) {
      dispatch({
        type: positionActions.FETCH_JOB_PIPELINE,
        method: "GET",
        endPoint: `/api/v1/jobs/${jobId}/pipeline/`,
        auth: true,
        setLoading: (val: boolean) => setLoading(val),
        getResponse: (res: PipelineData) => {
          setData(res);
          setLocalPipeline(res.pipeline);
        },
        getError: (err: any) => console.error("Pipeline fetch failed:", err),
      });
    }
  }, [dispatch, jobId]);

  /* ── Auto-scroll during drag ────────────────────────────────── */
  const handleDragUpdate = useCallback(() => {
    // We use a mouse listener approach: on each animation frame while
    // the mouse is near the edge of the scroll container, scroll it.
  }, []);

  // Persistent refs for auto-scroll animation loop
  const scrollAnimRef = React.useRef<number | null>(null);
  const scrollSpeedRef = React.useRef(0);

  const startAutoScroll = useCallback(() => {
    const tick = () => {
      if (scrollSpeedRef.current !== 0 && scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft += scrollSpeedRef.current;
      }
      scrollAnimRef.current = requestAnimationFrame(tick);
    };
    scrollAnimRef.current = requestAnimationFrame(tick);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
    scrollSpeedRef.current = 0;
  }, []);

  const handleMouseMoveDuringDrag = useCallback((e: MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX;
    const edgeThreshold = 120;

    if (mouseX < rect.left + edgeThreshold) {
      const proximity = (rect.left + edgeThreshold - mouseX) / edgeThreshold;
      scrollSpeedRef.current = -(proximity * 18);
    } else if (mouseX > rect.right - edgeThreshold) {
      const proximity = (mouseX - (rect.right - edgeThreshold)) / edgeThreshold;
      scrollSpeedRef.current = proximity * 18;
    } else {
      scrollSpeedRef.current = 0;
    }
  }, []);

  const handleDragStart = useCallback(() => {
    window.addEventListener("mousemove", handleMouseMoveDuringDrag);
    startAutoScroll();
  }, [handleMouseMoveDuringDrag, startAutoScroll]);

  const handleDragEndCleanup = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMoveDuringDrag);
    stopAutoScroll();
  }, [handleMouseMoveDuringDrag, stopAutoScroll]);

  /* ── Drag & Drop Handler ──────────────────────────────────── */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      // Dropped outside any droppable, or in the same spot
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const sourceStage = source.droppableId;
      let destStage = destination.droppableId;

      if (destStage === "hired") destStage = "joined";

      // Same column reorder — just move locally
      if (sourceStage === destStage) {
        const items = [...(localPipeline[sourceStage] || [])];
        const [moved] = items.splice(source.index, 1);
        if (!moved) return;
        items.splice(destination.index, 0, moved);
        setLocalPipeline((prev) => ({ ...prev, [sourceStage]: items }));
        return;
      }

      // Cross-column move → open confirmation modal
      const sourceItems = localPipeline[sourceStage] || [];
      const candidate = sourceItems[source.index];
      if (!candidate) return;

      setStageChangeNote(candidate.notes || "");
      setStageChangeModal({
        open: true,
        candidate,
        fromStage: sourceStage,
        toStage: destStage,
        destIndex: destination.index,
      });
    },
    [localPipeline],
  );

  const handleMenuMoveClick = useCallback(
    (candidate: PipelineCandidate, fromStage: string, toStage: string) => {
      setStageChangeNote(candidate.notes || "");
      setStageChangeModal({
        open: true,
        candidate,
        fromStage,
        toStage,
        destIndex: (localPipeline[toStage] || []).length, // Add to bottom of target column
      });
    },
    [localPipeline],
  );

  /* ── Confirm Stage Change ────────────────────────────────── */
  const handleConfirmStageChange = useCallback(() => {
    const { candidate, fromStage, toStage, destIndex } = stageChangeModal;
    if (!candidate || !stageChangeNote.trim()) return;

    // Optimistic move
    const prevPipeline = { ...localPipeline };
    const sourceItems = [...(prevPipeline[fromStage] || [])];
    const destItems = [...(prevPipeline[toStage] || [])];
    const srcIdx = sourceItems.findIndex(
      (c) => c.application_id === candidate.application_id,
    );
    if (srcIdx === -1) return;

    sourceItems.splice(srcIdx, 1);
    const updatedItem = {
      ...candidate,
      status: toStage,
      notes: stageChangeNote.trim(),
    };
    destItems.splice(destIndex, 0, updatedItem);

    const newPipeline = {
      ...prevPipeline,
      [fromStage]: sourceItems,
      [toStage]: destItems,
    };
    setLocalPipeline(newPipeline);

    // Close modal & set loading
    setStageChangeModal({
      open: false,
      candidate: null,
      fromStage: "",
      toStage: "",
      destIndex: 0,
    });
    setMovingAppId(candidate.application_id);
    setStageChangeSaving(true);

    dispatch({
      type: positionActions.UPDATE_APPLICATION_STATUS,
      method: "PATCH",
      endPoint: `/api/v1/candidates/applications/${candidate.application_id}/`,
      auth: true,
      body: {
        status: toStage,
        notes: stageChangeNote.trim(),
      },
      setLoading: () => {},
      getResponse: (res: any) => {
        setMovingAppId(null);
        setStageChangeSaving(false);
        setStageChangeNote("");
        const stageLabel = getStageConfig(toStage).label;
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{candidate.candidate_name}</span>
            <span className="text-sm opacity-80">
              {res?.message || `Moved to ${stageLabel}`}
            </span>
          </div>,
        );
      },
      getError: (err: any) => {
        setMovingAppId(null);
        setStageChangeSaving(false);
        setStageChangeNote("");
        // Revert optimistic update
        setLocalPipeline(prevPipeline);

        const errorData = err?.response?.data;
        if (errorData?.status && Array.isArray(errorData.status)) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                Failed to move {candidate.candidate_name}
              </span>
              <ul className="list-disc pl-4 text-sm opacity-90">
                {errorData.status.map((errMsg: string, i: number) => (
                  <li key={i}>{errMsg}</li>
                ))}
              </ul>
            </div>,
            { duration: 5000 },
          );
        } else {
          toast.error(
            `Failed to move ${candidate.candidate_name}: ${errorData?.message || errorData?.detail || "Unknown error"}`,
          );
        }
      },
    });
  }, [stageChangeModal, stageChangeNote, localPipeline, dispatch]);

  const handleCancelStageChange = useCallback(() => {
    setStageChangeModal({
      open: false,
      candidate: null,
      fromStage: "",
      toStage: "",
      destIndex: 0,
    });
    setStageChangeNote("");
  }, []);

  /* ── Interview Workflow Helpers ──────────────────────────────── */
  const isInterviewStage = (stage: string) => stage === "interview-align";

  const updateCandidateInterviewSchedule = useCallback(
    (applicationId: string, schedule: InterviewSchedule) => {
      setLocalPipeline((prev) => {
        const updated = { ...prev };
        let foundCandidate: PipelineCandidate | null = null;
        let currentStage = "";

        // Find the candidate
        for (const stage of Object.keys(updated)) {
          const idx = updated[stage].findIndex(
            (c) => c.application_id === applicationId,
          );
          if (idx !== -1) {
            foundCandidate = {
              ...updated[stage][idx],
              interview_schedule: schedule,
            };
            currentStage = stage;
            break;
          }
        }

        // Automatically map to interview-align if not already there
        if (foundCandidate && currentStage) {
          if (currentStage !== "interview-align") {
            updated[currentStage] = updated[currentStage].filter(
              (c) => c.application_id !== applicationId,
            );
            foundCandidate.status = "interview-align";
            if (!updated["interview-align"]) updated["interview-align"] = [];
            updated["interview-align"] = [
              foundCandidate,
              ...updated["interview-align"],
            ];
          } else {
            updated[currentStage] = updated[currentStage].map((c) =>
              c.application_id === applicationId ? foundCandidate! : c,
            );
          }
        }
        return updated;
      });
    },
    [],
  );

  /* ── Schedule Interview (Step 2 / Step 4 Resubmit) ─────────── */
  const handleOpenScheduleModal = useCallback(
    (candidate: PipelineCandidate) => {
      const existing = candidate.interview_schedule;
      setScheduleForm({
        date: existing?.date || "",
        time: existing?.time || "",
        mode: existing?.mode || "online",
        interviewer_name: existing?.interviewer_name || "",
        notes: existing?.notes || "",
      });
      setScheduleModal({ open: true, candidate });
    },
    [],
  );

  const handleScheduleInterview = useCallback(() => {
    const { candidate } = scheduleModal;
    if (!candidate || !scheduleForm.date || !scheduleForm.time) return;

    setScheduleSaving(true);

    dispatch({
      type: positionActions.SCHEDULE_INTERVIEW,
      method: "POST",
      endPoint: `/api/v1/candidates/applications/${candidate.application_id}/schedule-interview/`,
      auth: true,
      body: {
        date: scheduleForm.date,
        time: scheduleForm.time,
        mode: scheduleForm.mode,
        interviewer_name: scheduleForm.interviewer_name,
        notes: scheduleForm.notes,
      },
      setLoading: () => {},
      getResponse: (res: any) => {
        setScheduleSaving(false);
        setScheduleModal({ open: false, candidate: null });
        setScheduleForm({
          date: "",
          time: "",
          mode: "online" as "online" | "in-person" | "telephonic",
          interviewer_name: "",
          notes: "",
        });

        // Handle new API response format which returns the pipeline column
        let returnedSchedule = res;
        if (
          res &&
          res["interview-align"] &&
          Array.isArray(res["interview-align"])
        ) {
          const updatedCandidate = res["interview-align"].find(
            (c: any) => c.application_id === candidate?.application_id,
          );
          if (updatedCandidate?.interview_schedule) {
            returnedSchedule = updatedCandidate.interview_schedule;
          }
        }

        if (returnedSchedule && candidate) {
          updateCandidateInterviewSchedule(
            candidate.application_id,
            returnedSchedule,
          );
        }
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{candidate.candidate_name}</span>
            <span className="text-sm opacity-80">
              Interview scheduled successfully
            </span>
          </div>,
        );
      },
      getError: (err: any) => {
        setScheduleSaving(false);
        const errorData = (err as any)?.response?.data;
        toast.error(
          `Failed to schedule interview: ${errorData?.message || errorData?.detail || "Unknown error"}`,
        );
      },
    });
  }, [scheduleModal, scheduleForm, dispatch, updateCandidateInterviewSchedule]);

  /* ── Approve / Reject Interview Schedule (Step 3) ───────────── */
  const handleApproveInterview = useCallback(
    (status: "approved" | "rejected") => {
      const { candidate } = approvalModal;
      if (!candidate) return;

      setApprovalSaving(true);

      dispatch({
        type: positionActions.APPROVE_INTERVIEW_SCHEDULE,
        method: "POST",
        endPoint: `/api/v1/candidates/applications/${candidate.application_id}/approve-interview-schedule/`,
        auth: true,
        body: { status },
        setLoading: () => {},
        getResponse: () => {
          setApprovalSaving(false);
          setApprovalModal({ open: false, candidate: null });
          // Update local schedule status
          if (candidate.interview_schedule) {
            updateCandidateInterviewSchedule(candidate.application_id, {
              ...candidate.interview_schedule,
              manager_approval_status: status,
            });
          }
          toast.success(
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">{candidate.candidate_name}</span>
              <span className="text-sm opacity-80">
                Interview schedule{" "}
                {status === "approved" ? "approved ✅" : "rejected ❌"}
              </span>
            </div>,
          );
        },
        getError: (err: any) => {
          setApprovalSaving(false);
          const errorData = (err as any)?.response?.data;
          toast.error(
            `Failed to ${status} schedule: ${errorData?.message || errorData?.detail || "Unknown error"}`,
          );
        },
      });
    },
    [approvalModal, dispatch, updateCandidateInterviewSchedule],
  );

  /* ── Send Interview to Client (Bulk) ────────────────────────── */
  // Get sendable candidates (interview approved + has client)
  const sendableCandidates = useMemo(() => {
    const result: PipelineCandidate[] = [];
    Object.values(localPipeline).forEach((candidates) => {
      candidates.forEach((c) => {
        if (
          c.interview_schedule &&
          c.interview_schedule.manager_approval_status === "approved"
        ) {
          result.push(c);
        }
      });
    });
    return result;
  }, [localPipeline]);

  const toggleSendSelection = useCallback((applicationId: string) => {
    setSelectedForSend((prev) => {
      const next = new Set(prev);
      if (next.has(applicationId)) {
        next.delete(applicationId);
      } else {
        next.add(applicationId);
      }
      return next;
    });
  }, []);

  const toggleSelectAllSendable = useCallback(() => {
    setSelectedForSend((prev) => {
      if (prev.size === sendableCandidates.length && sendableCandidates.length > 0) {
        return new Set();
      }
      return new Set(sendableCandidates.map((c) => c.application_id));
    });
  }, [sendableCandidates]);

  const handleBulkSendToClient = useCallback(() => {
    if (selectedForSend.size === 0) return;

    setBulkSendLoading(true);

    dispatch({
      type: positionActions.SEND_INTERVIEW_TO_CLIENT,
      method: "POST",
      endPoint: `/api/v1/candidates/applications/send-interview-to-client/`,
      auth: true,
      body: { application_ids: Array.from(selectedForSend) },
      setLoading: () => {},
      getResponse: (res: any) => {
        setBulkSendLoading(false);
        setSelectedForSend(new Set());
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">Sent to Client</span>
            <span className="text-sm opacity-80">
              {res?.message || `Successfully sent ${selectedForSend.size} interview schedule(s) to client.`}
            </span>
          </div>,
        );
        if (res?.errors && res.errors.length > 0) {
          res.errors.forEach((e: string) => toast.error(e));
        }
      },
      getError: (err: any) => {
        setBulkSendLoading(false);
        const errorData = (err as any)?.response?.data;
        toast.error(
          `Failed to send to client: ${errorData?.message || errorData?.detail || "Unknown error"}`,
        );
      },
    });
  }, [dispatch, selectedForSend]);

  const handleExportSelected = () => {
    if (selectedForSend.size === 0) return;
    dispatch({
      type: candidateActions.EXPORT_CANDIDATES,
      method: "GET",
      endPoint: `/api/v1/candidates/export/?application_ids=${Array.from(selectedForSend).join(",")}&job_id=${jobId}`,
      auth: true,
      responseType: "blob",
      setLoading: (val: boolean) => setExportLoading(val),
      getResponse: (res: any) => {
        const blob = new Blob([res], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `candidates_export_${new Date().getTime()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Successfully exported candidates!");
        setSelectedForSend(new Set());
      },
      getError: (err: any) => {
        console.error("Failed to export candidates:", err);
        toast.error("Failed to export candidates. Please try again.");
      },
    });
  };

  /* ── Update Interview Attendance (Step 6) ───────────────────── */
  const handleUpdateAttendance = useCallback(() => {
    const { candidate } = attendanceModal;
    if (!candidate || !selectedAttendance) return;

    setAttendanceSaving(true);

    dispatch({
      type: positionActions.UPDATE_INTERVIEW_ATTENDANCE,
      method: "POST",
      endPoint: `/api/v1/candidates/applications/${candidate.application_id}/update-interview-attendance/`,
      auth: true,
      body: { status: selectedAttendance },
      setLoading: () => {},
      getResponse: () => {
        setAttendanceSaving(false);
        setAttendanceModal({ open: false, candidate: null });
        setSelectedAttendance("");
        // Update local attendance status
        if (candidate.interview_schedule) {
          updateCandidateInterviewSchedule(candidate.application_id, {
            ...candidate.interview_schedule,
            attendance_status:
              selectedAttendance as InterviewSchedule["attendance_status"],
          });
        }
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{candidate.candidate_name}</span>
            <span className="text-sm opacity-80">
              Attendance updated to {selectedAttendance.replace("-", " ")}
            </span>
          </div>,
        );
      },
      getError: (err: any) => {
        setAttendanceSaving(false);
        const errorData = (err as any)?.response?.data;
        toast.error(
          `Failed to update attendance: ${errorData?.message || errorData?.detail || "Unknown error"}`,
        );
      },
    });
  }, [
    attendanceModal,
    selectedAttendance,
    dispatch,
    updateCandidateInterviewSchedule,
  ]);

  /* ── Render — Loading / Error ─────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2
          className="size-8 animate-spin mb-3"
          style={{ color: theme.accent }}
        />
        <span
          className="text-sm font-medium"
          style={{ color: theme.textMuted }}
        >
          Loading pipeline...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span
          className="text-sm font-medium"
          style={{ color: theme.textMuted }}
        >
          Failed to load pipeline data.
        </span>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const { job } = data;

  // Count total candidates across all stages
  const totalCandidates = Object.values(localPipeline).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  // Get stages
  const allStages = Object.keys(localPipeline);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back Button ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>

      {/* ── Compact Job Details Header ──────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Top Row — always visible */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center size-10 rounded-lg shrink-0"
                style={{ background: theme.accentSoft }}
              >
                <Briefcase className="size-5" style={{ color: theme.accent }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold"
                    style={{ color: theme.textPrimary }}
                  >
                    {job.title}
                  </h1>
                  {(() => {
                    const statusStyle = getJobStatusStyle(job.status);
                    return (
                      <Badge
                        variant="outline"
                        className="capitalize text-xs border-0 font-medium"
                        style={{
                          color: statusStyle.color,
                          background: statusStyle.background,
                        }}
                      >
                        {statusStyle.label}
                      </Badge>
                    );
                  })()}
                </div>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: theme.textMuted }}
                >
                  {job.code} {job.client ? `· ${job.client.name}` : ""}{" "}
                  {job.client?.team_member
                    ? `· POC: ${job.client.team_member.name}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setJobDetailsExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: theme.accent,
                  background: theme.accentSoft,
                }}
              >
                {jobDetailsExpanded ? "Less Details" : "More Details"}
                {jobDetailsExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <MapPin className="size-3.5" style={{ color: theme.textMuted }} />
              <span className="capitalize">{job.location}</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <Briefcase
                className="size-3.5"
                style={{ color: theme.textMuted }}
              />
              <span>
                {job.min_experience}–{job.max_experience} yrs
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <IndianRupee
                className="size-3.5"
                style={{ color: theme.textMuted }}
              />
              <span>
                {job.budget
                  ? (parseFloat(job.budget) / 100000).toFixed(1) + " LPA"
                  : "N/A"}
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <GraduationCap
                className="size-3.5"
                style={{ color: theme.textMuted }}
              />
              <span>{job.education || "N/A"}</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: theme.textSecondary }}
            >
              <Users className="size-3.5" style={{ color: theme.textMuted }} />
              <span>
                {totalCandidates} candidate{totalCandidates !== 1 ? "s" : ""}
              </span>
            </div>
            {job.hiring_for && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: theme.textSecondary }}
              >
                <Building2
                  className="size-3.5"
                  style={{ color: theme.textMuted }}
                />
                <span className="capitalize">Hiring for: {job.hiring_for}</span>
              </div>
            )}
            {job.hiring_manager && (
              <div
                className="flex items-center gap-1.5 text-xs"
                style={{ color: theme.textSecondary }}
              >
                <User className="size-3.5" style={{ color: theme.textMuted }} />
                <span className="capitalize">HM: {job.hiring_manager}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {jobDetailsExpanded && (
          <div
            className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ borderTop: `1px solid ${theme.border}` }}
          >
            {/* Job Description */}
            {job.description && (
              <div className="pt-4">
                <h4
                  className="text-xs font-bold tracking-wider uppercase mb-2"
                  style={{ color: theme.textMuted }}
                >
                  Job Description
                </h4>
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: theme.textSecondary }}
                >
                  {job.description}
                </div>
              </div>
            )}

            {/* Skills & Attachments */}
            <div
              className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t mt-4"
              style={{ borderColor: theme.border }}
            >
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h4
                    className="text-xs font-bold tracking-wider uppercase mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill, i) => (
                      <Badge
                        key={`${skill}-${i}`}
                        variant="outline"
                        className="text-xs px-2 py-0.5 border-0 font-medium"
                        style={{
                          color: theme.chart2,
                          background: theme.chart2 + "15",
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.description_file && (
                <div>
                  <h4
                    className="text-xs font-bold tracking-wider uppercase mb-2"
                    style={{ color: theme.textMuted }}
                  >
                    Attachments
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-xs font-medium"
                    style={{
                      borderColor: theme.accent + "50",
                      color: theme.accent,
                      background: theme.accentSoft,
                    }}
                    onClick={() =>
                      window.open(job.description_file as string, "_blank")
                    }
                  >
                    <Briefcase className="size-3.5" />
                    View Job Description
                  </Button>
                </div>
              )}
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t"
              style={{ borderColor: theme.border }}
            >
              {/* Assigned Recruiters */}
              {job.assigned_recruiters &&
                job.assigned_recruiters.length > 0 && (
                  <div>
                    <h4
                      className="text-xs font-bold tracking-wider uppercase mb-3"
                      style={{ color: theme.textMuted }}
                    >
                      Assigned Recruiters
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.assigned_recruiters.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                          style={{
                            background: theme.surfaceMuted,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {rec.avatar ? (
                            <img
                              src={rec.avatar}
                              alt={rec.name}
                              className="size-7 rounded-full object-cover shadow-sm"
                            />
                          ) : (
                            <div
                              className="size-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                              style={{
                                background: theme.accentSoft,
                                color: theme.accent,
                              }}
                            >
                              {rec.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: theme.textPrimary }}
                            >
                              {rec.name}
                            </p>
                            <p style={{ color: theme.textSecondary }}>
                              {rec.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Created By & Meta */}
              {job.created_by && (
                <div>
                  <h4
                    className="text-xs font-bold tracking-wider uppercase mb-3"
                    style={{ color: theme.textMuted }}
                  >
                    Meta Information
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {job.created_by.avatar ? (
                        <img
                          src={job.created_by.avatar}
                          alt={job.created_by.name}
                          className="size-9 rounded-full object-cover shadow-sm ring-2 ring-white"
                          style={{ boxShadow: `0 0 0 1px ${theme.border}` }}
                        />
                      ) : (
                        <div
                          className="size-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
                          style={{
                            background: theme.chart2 + "20",
                            color: theme.chart2,
                          }}
                        >
                          {job.created_by.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p
                          className="text-xs font-medium uppercase tracking-wider mb-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          Created By
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: theme.textPrimary }}
                        >
                          {job.created_by.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          {job.created_by.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span
                          className="text-xs font-medium uppercase tracking-wider block mb-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          Created At
                        </span>
                        <span style={{ color: theme.textSecondary }}>
                          {new Date(job.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div>
                        <span
                          className="text-xs font-medium uppercase tracking-wider block mb-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          Last Updated
                        </span>
                        <span style={{ color: theme.textSecondary }}>
                          {new Date(job.updated_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Pipeline Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Pipeline Overview
        </h2>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ color: theme.accent, background: theme.accentSoft }}
        >
          {totalCandidates} Total
        </span>
      </div>

      {/* ── Pipeline Stage Columns — Drag & Drop ──────────────── */}
      <DragDropContext
        onDragStart={handleDragStart}
        onDragEnd={(res) => {
          handleDragEndCleanup();
          handleDragEnd(res);
        }}
      >
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2"
          style={{ scrollBehavior: "auto" }}
        >
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {allStages.map((stageName) => {
              const candidates = localPipeline[stageName];
              const config = getStageConfig(stageName);

              return (
                <Droppable droppableId={stageName} key={stageName}>
                  {(provided, snapshot) => (
                    <div
                      className="flex flex-col rounded-xl overflow-hidden shrink-0 transition-all duration-200"
                      style={{
                        width: "280px",
                        background: snapshot.isDraggingOver
                          ? config.color + "08"
                          : theme.surface,
                        border: snapshot.isDraggingOver
                          ? `2px solid ${config.color}`
                          : `1px solid ${theme.border}`,
                        minHeight: "200px",
                        boxShadow: snapshot.isDraggingOver
                          ? `0 0 20px ${config.color}30, 0 4px 15px ${config.color}15`
                          : "none",
                        transform: snapshot.isDraggingOver
                          ? "scale(1.02)"
                          : "scale(1)",
                      }}
                    >
                      {/* Stage Header */}
                      <div
                        className="px-4 py-3 flex items-center justify-between transition-colors duration-200"
                        style={{
                          borderBottom: `2px solid ${config.color}`,
                          background: snapshot.isDraggingOver
                            ? config.color + "25"
                            : config.bg,
                        }}
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-wider capitalize"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                        <span
                          className="flex items-center justify-center size-5 rounded-full text-[10px] font-bold"
                          style={{ background: config.color, color: "#fff" }}
                        >
                          {candidates.length}
                        </span>
                      </div>

                      {/* Droppable Cards Area */}
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 p-2.5 space-y-2 transition-colors duration-200"
                        style={{
                          minHeight: "120px",
                        }}
                      >
                        {candidates.length === 0 && !snapshot.isDraggingOver ? (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p
                              className="text-xs text-center"
                              style={{ color: theme.textMuted }}
                            >
                              No candidates
                            </p>
                          </div>
                        ) : candidates.length === 0 &&
                          snapshot.isDraggingOver ? (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p
                              className="text-xs text-center font-medium"
                              style={{ color: config.color }}
                            >
                              Drop here
                            </p>
                          </div>
                        ) : (
                          candidates.map((candidate, index) => (
                            <Draggable
                              key={candidate.application_id}
                              draggableId={candidate.application_id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                const isMoving =
                                  movingAppId === candidate.application_id;

                                const cardContent = (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="rounded-lg p-3 space-y-2 transition-shadow duration-150 select-none group"
                                    style={{
                                      ...provided.draggableProps.style,
                                      background: snapshot.isDragging
                                        ? theme.surface
                                        : theme.background,
                                      border: `1px solid ${snapshot.isDragging ? config.color : theme.border}`,
                                      boxShadow: snapshot.isDragging
                                        ? `0 8px 25px ${config.color}25, 0 4px 10px rgba(0,0,0,0.15)`
                                        : "none",
                                      opacity: isMoving ? 0.6 : 1,
                                      cursor: snapshot.isDragging
                                        ? "grabbing"
                                        : "grab",
                                    }}
                                  >
                                    {/* Name + Checkbox */}
                                    <div className="flex items-center gap-2">
                                      {/* Send-to-client checkbox */}
                                      {data?.job.client &&
                                        candidate.interview_schedule &&
                                        candidate.interview_schedule
                                          .manager_approval_status ===
                                          "approved" && (
                                        <button
                                          className="shrink-0 cursor-pointer transition-transform hover:scale-110"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            toggleSendSelection(
                                              candidate.application_id,
                                            );
                                          }}
                                          onMouseDown={(e) =>
                                            e.stopPropagation()
                                          }
                                          title="Select to send interview to client"
                                        >
                                          {selectedForSend.has(
                                            candidate.application_id,
                                          ) ? (
                                            <CheckSquare2
                                              className="size-4"
                                              style={{
                                                color: theme.accent,
                                              }}
                                            />
                                          ) : (
                                            <Square
                                              className="size-4"
                                              style={{
                                                color: theme.textMuted,
                                              }}
                                            />
                                          )}
                                        </button>
                                      )}
                                      <div
                                        className="size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{
                                          background: config.bg,
                                          color: config.color,
                                        }}
                                      >
                                        {candidate.candidate_name
                                          ?.charAt(0)
                                          ?.toUpperCase()}
                                      </div>
                                      <p
                                        className="text-sm font-semibold truncate flex-1"
                                        style={{ color: theme.textPrimary }}
                                      >
                                        {candidate.candidate_name}
                                      </p>

                                      <div className="flex items-center shrink-0">
                                        {isMoving && (
                                          <Loader2
                                            className="size-3.5 animate-spin mr-2"
                                            style={{ color: config.color }}
                                          />
                                        )}
                                        {!snapshot.isDragging && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger
                                              className="size-6 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center rounded-md cursor-pointer"
                                              style={{ color: theme.textMuted }}
                                            >
                                              <MoreHorizontal className="size-3.5" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                              align="end"
                                              className="w-52 text-xs"
                                            >
                                              <DropdownMenuGroup>
                                                <DropdownMenuLabel
                                                  className="text-xs font-semibold"
                                                  style={{
                                                    color: theme.textMuted,
                                                  }}
                                                >
                                                  Move to stage
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {allStages
                                                  .filter(
                                                    (s) => s !== stageName,
                                                  )
                                                  .map((targetStage) => (
                                                    <DropdownMenuItem
                                                      key={targetStage}
                                                      className="text-xs cursor-pointer"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMenuMoveClick(
                                                          candidate,
                                                          stageName,
                                                          targetStage,
                                                        );
                                                      }}
                                                    >
                                                      <div
                                                        className="size-2 rounded-full mr-2"
                                                        style={{
                                                          background:
                                                            getStageConfig(
                                                              targetStage,
                                                            ).color,
                                                        }}
                                                      />
                                                      {
                                                        getStageConfig(
                                                          targetStage,
                                                        ).label
                                                      }
                                                    </DropdownMenuItem>
                                                  ))}
                                              </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                    </div>

                                    {/* ── Interview Details & Quick Actions ── */}
                                    {isInterviewStage(stageName) && (
                                      <div
                                        className="pt-2 mt-2 space-y-2 border-t"
                                        style={{ borderColor: theme.border }}
                                      >
                                        {candidate.interview_schedule ? (
                                          <>
                                            {/* Beautiful Details Box */}
                                            <div
                                              className="rounded-md p-2 space-y-2 text-xs shadow-sm"
                                              style={{
                                                background: theme.surfaceMuted,
                                                border: `1px solid ${theme.border}`,
                                              }}
                                            >
                                              <div className="flex items-center justify-between">
                                                <div
                                                  className="flex items-center gap-1.5 font-semibold"
                                                  style={{
                                                    color: theme.textPrimary,
                                                  }}
                                                >
                                                  <Calendar
                                                    className="size-3.5"
                                                    style={{
                                                      color: theme.chart2,
                                                    }}
                                                  />
                                                  {new Date(
                                                    candidate.interview_schedule
                                                      .date,
                                                  ).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                    },
                                                  )}
                                                </div>
                                                <Badge
                                                  variant="outline"
                                                  className="text-[9px] uppercase px-1.5 py-0 h-4 border-none font-bold tracking-wider"
                                                  style={{
                                                    background:
                                                      candidate
                                                        .interview_schedule
                                                        .manager_approval_status ===
                                                      "approved"
                                                        ? theme.successSoft
                                                        : candidate
                                                              .interview_schedule
                                                              .manager_approval_status ===
                                                            "rejected"
                                                          ? theme.destructiveSoft
                                                          : theme.warningSoft,
                                                    color:
                                                      candidate
                                                        .interview_schedule
                                                        .manager_approval_status ===
                                                      "approved"
                                                        ? theme.success
                                                        : candidate
                                                              .interview_schedule
                                                              .manager_approval_status ===
                                                            "rejected"
                                                          ? theme.destructive
                                                          : theme.warning,
                                                  }}
                                                >
                                                  {
                                                    candidate.interview_schedule
                                                      .manager_approval_status
                                                  }
                                                </Badge>
                                              </div>

                                              <div
                                                className="grid grid-cols-2 gap-2 text-[11px]"
                                                style={{
                                                  color: theme.textSecondary,
                                                }}
                                              >
                                                <div className="flex items-center gap-1.5">
                                                  <Clock className="size-3 shrink-0" />
                                                  <span className="truncate">
                                                    {candidate.interview_schedule.time?.slice(
                                                      0,
                                                      5,
                                                    )}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                  {candidate.interview_schedule
                                                    .mode === "online" ? (
                                                    <Video
                                                      className="size-3 shrink-0"
                                                      style={{
                                                        color: theme.accent,
                                                      }}
                                                    />
                                                  ) : candidate
                                                      .interview_schedule
                                                      .mode === "telephonic" ? (
                                                    <Phone
                                                      className="size-3 shrink-0"
                                                      style={{
                                                        color: theme.chart3,
                                                      }}
                                                    />
                                                  ) : (
                                                    <MapPinned
                                                      className="size-3 shrink-0"
                                                      style={{
                                                        color: theme.chart4,
                                                      }}
                                                    />
                                                  )}
                                                  <span className="truncate capitalize">
                                                    {candidate
                                                      .interview_schedule
                                                      .mode === "in-person"
                                                      ? "In-Person"
                                                      : candidate
                                                          .interview_schedule
                                                          .mode}
                                                  </span>
                                                </div>
                                                {candidate.interview_schedule
                                                  .interviewer_name && (
                                                  <div className="col-span-2 flex items-center gap-1.5">
                                                    <UserCheck className="size-3 shrink-0" />
                                                    <span className="truncate">
                                                      {
                                                        candidate
                                                          .interview_schedule
                                                          .interviewer_name
                                                      }
                                                    </span>
                                                  </div>
                                                )}
                                              </div>

                                              {candidate.interview_schedule
                                                .attendance_status !==
                                                "pending" && (
                                                <div
                                                  className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t"
                                                  style={{
                                                    borderColor: theme.border,
                                                  }}
                                                >
                                                  <ClipboardCheck
                                                    className="size-3 shrink-0"
                                                    style={{
                                                      color:
                                                        candidate
                                                          .interview_schedule
                                                          .attendance_status ===
                                                        "attended"
                                                          ? theme.success
                                                          : candidate
                                                                .interview_schedule
                                                                .attendance_status ===
                                                              "no-show"
                                                            ? theme.destructive
                                                            : theme.warning,
                                                    }}
                                                  />
                                                  <span
                                                    className="font-semibold uppercase text-[9px] tracking-wider"
                                                    style={{
                                                      color:
                                                        candidate
                                                          .interview_schedule
                                                          .attendance_status ===
                                                        "attended"
                                                          ? theme.success
                                                          : candidate
                                                                .interview_schedule
                                                                .attendance_status ===
                                                              "no-show"
                                                            ? theme.destructive
                                                            : theme.warning,
                                                    }}
                                                  >
                                                    {candidate.interview_schedule.attendance_status.replace(
                                                      "-",
                                                      " ",
                                                    )}
                                                  </span>
                                                </div>
                                              )}
                                            </div>

                                            {/* Action Buttons */}
                                            {candidate.interview_schedule
                                              .manager_approval_status ===
                                              "pending" && (
                                              <Button
                                                size="sm"
                                                className="w-full text-xs h-7"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setApprovalModal({
                                                    open: true,
                                                    candidate,
                                                  });
                                                }}
                                              >
                                                <CheckCircle2
                                                  className="size-3.5 mr-1.5"
                                                  style={{
                                                    color: theme.success,
                                                  }}
                                                />
                                                Review Schedule
                                              </Button>
                                            )}

                                            {candidate.interview_schedule
                                              .manager_approval_status ===
                                              "approved" && (
                                              <div className="flex gap-1.5">
                                                <Button
                                                  size="sm"
                                                  className="flex-1 text-[11px] h-7 px-0"
                                                  variant="outline"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAttendance(
                                                      candidate
                                                        .interview_schedule
                                                        ?.attendance_status ||
                                                        "",
                                                    );
                                                    setAttendanceModal({
                                                      open: true,
                                                      candidate,
                                                    });
                                                  }}
                                                >
                                                  <ClipboardCheck
                                                    className="size-3 mr-1"
                                                    style={{
                                                      color: theme.chart4,
                                                    }}
                                                  />
                                                  Attendance
                                                </Button>
                                              </div>
                                            )}

                                            {(candidate.interview_schedule
                                              .manager_approval_status ===
                                              "rejected" ||
                                              candidate.interview_schedule
                                                .attendance_status ===
                                                "reschedule-requested") && (
                                              <Button
                                                size="sm"
                                                className="w-full text-xs h-7 border-0 font-medium"
                                                style={{
                                                  background: theme.chart2,
                                                  color: "#fff",
                                                }}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenScheduleModal(
                                                    candidate,
                                                  );
                                                }}
                                              >
                                                <Calendar className="size-3.5 mr-1.5" />
                                                Reschedule
                                              </Button>
                                            )}
                                          </>
                                        ) : (
                                          <Button
                                            size="sm"
                                            className="w-full text-xs h-7 border-0 font-medium hover:opacity-90"
                                            style={{
                                              background: theme.chart2,
                                              color: "#fff",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenScheduleModal(
                                                candidate,
                                              );
                                            }}
                                          >
                                            <Calendar className="size-3.5 mr-1.5" />
                                            Schedule Interview
                                          </Button>
                                        )}
                                      </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                      {candidate.current_company &&
                                        candidate.current_company !==
                                          "Not specified" && (
                                          <div className="col-span-2">
                                            <p
                                              className="text-[10px] uppercase font-bold tracking-wider"
                                              style={{ color: theme.textMuted }}
                                            >
                                              Company
                                            </p>
                                            <p
                                              className="text-xs font-medium truncate"
                                              style={{
                                                color: theme.textSecondary,
                                              }}
                                            >
                                              {candidate.current_company}
                                            </p>
                                          </div>
                                        )}
                                      {candidate.experience &&
                                        candidate.experience !==
                                          "Not specified" && (
                                          <div>
                                            <p
                                              className="text-[10px] uppercase font-bold tracking-wider"
                                              style={{ color: theme.textMuted }}
                                            >
                                              Exp
                                            </p>
                                            <p
                                              className="text-xs font-medium"
                                              style={{
                                                color: theme.textSecondary,
                                              }}
                                            >
                                              {candidate.experience} yrs
                                            </p>
                                          </div>
                                        )}
                                      {candidate.notice_period && (
                                        <div>
                                          <p
                                            className="text-[10px] uppercase font-bold tracking-wider"
                                            style={{ color: theme.textMuted }}
                                          >
                                            Notice
                                          </p>
                                          <p
                                            className="text-xs font-medium"
                                            style={{
                                              color: theme.textSecondary,
                                            }}
                                          >
                                            {candidate.notice_period} days
                                          </p>
                                        </div>
                                      )}
                                      {candidate.current_ctc && (
                                        <div>
                                          <p
                                            className="text-[10px] uppercase font-bold tracking-wider"
                                            style={{ color: theme.textMuted }}
                                          >
                                            C. CTC
                                          </p>
                                          <p
                                            className="text-xs font-medium"
                                            style={{
                                              color: theme.textSecondary,
                                            }}
                                          >
                                            ₹{candidate.current_ctc}
                                          </p>
                                        </div>
                                      )}
                                      {candidate.expected_ctc && (
                                        <div>
                                          <p
                                            className="text-[10px] uppercase font-bold tracking-wider"
                                            style={{ color: theme.textMuted }}
                                          >
                                            E. CTC
                                          </p>
                                          <p
                                            className="text-xs font-medium"
                                            style={{
                                              color: theme.textSecondary,
                                            }}
                                          >
                                            ₹{candidate.expected_ctc}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Notes */}
                                    {candidate.notes && (
                                      <p
                                        className="text-[11px] italic line-clamp-2 pt-1"
                                        style={{
                                          color: theme.textMuted,
                                          borderTop: `1px solid ${theme.border}`,
                                        }}
                                      >
                                        "{candidate.notes}"
                                      </p>
                                    )}
                                  </div>
                                );

                                return snapshot.isDragging
                                  ? ReactDOM.createPortal(
                                      cardContent,
                                      document.body,
                                    )
                                  : cardContent;
                              }}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* ── Bulk Send Action Bar ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedForSend.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border"
            style={{ 
              background: theme.surface + 'E6',
              borderColor: theme.border,
              boxShadow: `0 20px 40px -10px ${theme.accent}40, 0 0 20px ${theme.accent}20` 
            }}
          >
            <div className="flex flex-col">
              <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                {selectedForSend.size} Candidate{selectedForSend.size > 1 ? 's' : ''} Selected
              </span>
              {/* <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
                Ready to send interview details to client
              </span> */}
            </div>
            
            <div className="h-8 w-px mx-2" style={{ background: theme.border }}></div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-medium hover:bg-transparent hover:opacity-80"
              style={{ color: theme.textMuted }}
              onClick={() => setSelectedForSend(new Set())}
            >
              Clear
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold gap-2 px-4 h-9 rounded-full transition-transform hover:scale-105"
              onClick={handleExportSelected}
              disabled={exportLoading || bulkSendLoading}
            >
              {exportLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Export CSV
            </Button>

            <Button
              size="sm"
              className="text-xs font-bold gap-2 px-6 h-9 rounded-full transition-transform hover:scale-105"
              style={{ background: theme.accent, color: '#fff' }}
              onClick={handleBulkSendToClient}
              disabled={bulkSendLoading}
            >
              {bulkSendLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send Interview Details to Client
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stage Change Confirmation Modal ────────────────────── */}
      <Dialog
        open={stageChangeModal.open}
        onOpenChange={(open) => {
          if (!open && !stageChangeSaving) handleCancelStageChange();
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle style={{ color: theme.textPrimary }}>
              Confirm Stage Change
            </DialogTitle>
            <DialogDescription
              className="text-sm pt-1"
              style={{ color: theme.textMuted }}
            >
              Review the details below and add a note before moving this
              candidate.
            </DialogDescription>
          </DialogHeader>

          {stageChangeModal.candidate && (
            <div className="space-y-4 py-2">
              {/* Candidate Details Card */}
              <div
                className="rounded-lg p-4 space-y-3"
                style={{
                  background: theme.surfaceMuted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: theme.accentSoft,
                      color: theme.accent,
                    }}
                  >
                    {stageChangeModal.candidate.candidate_name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: theme.textPrimary }}
                    >
                      {stageChangeModal.candidate.candidate_name}
                    </p>
                    {stageChangeModal.candidate.current_company &&
                      stageChangeModal.candidate.current_company !==
                        "Not specified" && (
                        <p
                          className="text-xs"
                          style={{ color: theme.textSecondary }}
                        >
                          {stageChangeModal.candidate.current_company}
                        </p>
                      )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stageChangeModal.candidate.experience &&
                    stageChangeModal.candidate.experience !==
                      "Not specified" && (
                      <div>
                        <p
                          className="text-[10px] uppercase font-bold tracking-wider"
                          style={{ color: theme.textMuted }}
                        >
                          Experience
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: theme.textPrimary }}
                        >
                          {stageChangeModal.candidate.experience} yrs
                        </p>
                      </div>
                    )}
                  {stageChangeModal.candidate.current_ctc && (
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Current CTC
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        ₹{stageChangeModal.candidate.current_ctc}
                      </p>
                    </div>
                  )}
                  {stageChangeModal.candidate.expected_ctc && (
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Expected CTC
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        ₹{stageChangeModal.candidate.expected_ctc}
                      </p>
                    </div>
                  )}
                  {stageChangeModal.candidate.notice_period && (
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Notice Period
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        {stageChangeModal.candidate.notice_period} days
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* From → To Stage Visual */}
              <div className="flex items-center justify-center gap-3 py-2">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: getStageConfig(stageChangeModal.fromStage).bg,
                    border: `1px solid ${getStageConfig(stageChangeModal.fromStage).color}30`,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      background: getStageConfig(stageChangeModal.fromStage)
                        .color,
                    }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: getStageConfig(stageChangeModal.fromStage).color,
                    }}
                  >
                    {getStageConfig(stageChangeModal.fromStage).label}
                  </span>
                </div>

                <ArrowRight
                  className="size-5 shrink-0"
                  style={{ color: theme.textMuted }}
                />

                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: getStageConfig(stageChangeModal.toStage).bg,
                    border: `1px solid ${getStageConfig(stageChangeModal.toStage).color}30`,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      background: getStageConfig(stageChangeModal.toStage)
                        .color,
                    }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: getStageConfig(stageChangeModal.toStage).color,
                    }}
                  >
                    {getStageConfig(stageChangeModal.toStage).label}
                  </span>
                </div>
              </div>

              {/* Notes — Required */}
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  Note <span style={{ color: theme.destructive }}>*</span>
                </label>
                <Textarea
                  value={stageChangeNote}
                  onChange={(e) => setStageChangeNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (stageChangeNote.trim() && !stageChangeSaving) {
                        handleConfirmStageChange();
                      }
                    }
                  }}
                  placeholder="Add a note for this stage change..."
                  rows={3}
                  className="resize-none text-sm"
                  style={{
                    background: theme.background,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                  disabled={stageChangeSaving}
                />
                {!stageChangeNote.trim() && (
                  <p className="text-xs" style={{ color: theme.destructive }}>
                    Note is required to change stage.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelStageChange}
              disabled={stageChangeSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStageChange}
              disabled={stageChangeSaving || !stageChangeNote.trim()}
              style={{
                background: theme.accent,
                color: theme.accentForeground,
              }}
            >
              {stageChangeSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Moving...
                </>
              ) : (
                "Confirm & Move"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Schedule Interview Modal ────────────────────────────── */}
      <Dialog
        open={scheduleModal.open}
        onOpenChange={(open) => {
          if (!open && !scheduleSaving) {
            setScheduleModal({ open: false, candidate: null });
            setScheduleForm({
              date: "",
              time: "",
              mode: "online" as "online" | "in-person" | "telephonic",
              interviewer_name: "",
              notes: "",
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle style={{ color: theme.textPrimary }}>
              <div className="flex items-center gap-2">
                <Calendar className="size-5" style={{ color: theme.chart2 }} />
                {scheduleModal.candidate?.interview_schedule
                  ? "Reschedule Interview"
                  : "Schedule Interview"}
              </div>
            </DialogTitle>
            <DialogDescription
              className="text-sm pt-1"
              style={{ color: theme.textMuted }}
            >
              {scheduleModal.candidate?.candidate_name && (
                <>
                  Set up an interview for{" "}
                  <strong style={{ color: theme.textPrimary }}>
                    {scheduleModal.candidate.candidate_name}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  Date <span style={{ color: theme.destructive }}>*</span>
                </label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    background: theme.background,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                  disabled={scheduleSaving}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className="text-xs font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  Time <span style={{ color: theme.destructive }}>*</span>
                </label>
                <input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="h-9 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    background: theme.background,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                  disabled={scheduleSaving}
                />
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: theme.textPrimary }}
              >
                Mode
              </label>
              <div className="flex gap-2">
                {[
                  {
                    value: "online" as const,
                    label: "Online",
                    icon: Video,
                    color: theme.accent,
                    bg: theme.accentSoft,
                  },
                  {
                    value: "in-person" as const,
                    label: "In-Person",
                    icon: MapPinned,
                    color: theme.chart4,
                    bg: theme.chart4 + "15",
                  },
                  {
                    value: "telephonic" as const,
                    label: "Telephonic",
                    icon: Phone,
                    color: theme.chart3,
                    bg: theme.chart3 + "15",
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isActive = scheduleForm.mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          mode: opt.value,
                        }))
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                      style={{
                        background: isActive ? opt.bg : theme.surfaceMuted,
                        border: `1.5px solid ${isActive ? opt.color : theme.border}`,
                        color: isActive ? opt.color : theme.textMuted,
                      }}
                      disabled={scheduleSaving}
                    >
                      <Icon className="size-3.5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interviewer Name */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: theme.textPrimary }}
              >
                Interviewer Name
              </label>
              <input
                type="text"
                value={scheduleForm.interviewer_name}
                onChange={(e) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    interviewer_name: e.target.value,
                  }))
                }
                placeholder="e.g. Jane Doe"
                className="h-9 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus:ring-2"
                style={{
                  background: theme.background,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
                disabled={scheduleSaving}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold"
                style={{ color: theme.textPrimary }}
              >
                Notes
              </label>
              <Textarea
                value={scheduleForm.notes}
                onChange={(e) =>
                  setScheduleForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="e.g. First technical round"
                rows={2}
                className="resize-none text-sm"
                style={{
                  background: theme.background,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
                disabled={scheduleSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setScheduleModal({ open: false, candidate: null });
                setScheduleForm({
                  date: "",
                  time: "",
                  mode: "online" as "online" | "in-person" | "telephonic",
                  interviewer_name: "",
                  notes: "",
                });
              }}
              disabled={scheduleSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleInterview}
              disabled={
                scheduleSaving || !scheduleForm.date || !scheduleForm.time
              }
              style={{ background: theme.chart2, color: "#fff" }}
            >
              {scheduleSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 size-4" />
                  {scheduleModal.candidate?.interview_schedule
                    ? "Reschedule"
                    : "Schedule Interview"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Approve / Reject Interview Schedule Modal ───────────── */}
      <Dialog
        open={approvalModal.open}
        onOpenChange={(open) => {
          if (!open && !approvalSaving)
            setApprovalModal({ open: false, candidate: null });
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle style={{ color: theme.textPrimary }}>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className="size-5"
                  style={{ color: theme.success }}
                />
                Review Interview Schedule
              </div>
            </DialogTitle>
            <DialogDescription
              className="text-sm pt-1"
              style={{ color: theme.textMuted }}
            >
              {approvalModal.candidate?.candidate_name && (
                <>
                  Review the proposed interview schedule for{" "}
                  <strong style={{ color: theme.textPrimary }}>
                    {approvalModal.candidate.candidate_name}
                  </strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {approvalModal.candidate?.interview_schedule && (
            <div className="space-y-4 py-2">
              {/* Schedule Details Card */}
              <div
                className="rounded-lg p-4 space-y-3"
                style={{
                  background: theme.surfaceMuted,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className="size-4"
                      style={{ color: theme.chart2 }}
                    />
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Date
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        {new Date(
                          approvalModal.candidate.interview_schedule.date,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" style={{ color: theme.chart2 }} />
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Time
                      </p>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: theme.textPrimary }}
                      >
                        {approvalModal.candidate.interview_schedule.time?.slice(
                          0,
                          5,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {approvalModal.candidate.interview_schedule.mode ===
                    "online" ? (
                      <Video
                        className="size-4"
                        style={{ color: theme.accent }}
                      />
                    ) : approvalModal.candidate.interview_schedule.mode ===
                      "telephonic" ? (
                      <Phone
                        className="size-4"
                        style={{ color: theme.chart3 }}
                      />
                    ) : (
                      <MapPinned
                        className="size-4"
                        style={{ color: theme.chart4 }}
                      />
                    )}
                    <div>
                      <p
                        className="text-[10px] uppercase font-bold tracking-wider"
                        style={{ color: theme.textMuted }}
                      >
                        Mode
                      </p>
                      <p
                        className="text-sm font-semibold capitalize"
                        style={{ color: theme.textPrimary }}
                      >
                        {approvalModal.candidate.interview_schedule.mode ===
                        "in-person"
                          ? "In-Person"
                          : approvalModal.candidate.interview_schedule.mode}
                      </p>
                    </div>
                  </div>
                  {approvalModal.candidate.interview_schedule
                    .interviewer_name && (
                    <div className="flex items-center gap-2">
                      <UserCheck
                        className="size-4"
                        style={{ color: theme.chart3 }}
                      />
                      <div>
                        <p
                          className="text-[10px] uppercase font-bold tracking-wider"
                          style={{ color: theme.textMuted }}
                        >
                          Interviewer
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: theme.textPrimary }}
                        >
                          {
                            approvalModal.candidate.interview_schedule
                              .interviewer_name
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {approvalModal.candidate.interview_schedule.notes && (
                  <div
                    className="pt-2"
                    style={{ borderTop: `1px solid ${theme.border}` }}
                  >
                    <p
                      className="text-[10px] uppercase font-bold tracking-wider mb-1"
                      style={{ color: theme.textMuted }}
                    >
                      Notes
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme.textSecondary }}
                    >
                      {approvalModal.candidate.interview_schedule.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setApprovalModal({ open: false, candidate: null })}
              disabled={approvalSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleApproveInterview("rejected")}
              disabled={approvalSaving}
              style={{ background: theme.destructive, color: "#fff" }}
            >
              {approvalSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="mr-1.5 size-4" />
                  Reject
                </>
              )}
            </Button>
            <Button
              onClick={() => handleApproveInterview("approved")}
              disabled={approvalSaving}
              style={{ background: theme.success, color: "#fff" }}
            >
              {approvalSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Update Attendance Modal ─────────────────────────────── */}
      <Dialog
        open={attendanceModal.open}
        onOpenChange={(open) => {
          if (!open && !attendanceSaving) {
            setAttendanceModal({ open: false, candidate: null });
            setSelectedAttendance("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle style={{ color: theme.textPrimary }}>
              <div className="flex items-center gap-2">
                <ClipboardCheck
                  className="size-5"
                  style={{ color: theme.chart4 }}
                />
                Update Interview Attendance
              </div>
            </DialogTitle>
            <DialogDescription
              className="text-sm pt-1"
              style={{ color: theme.textMuted }}
            >
              {attendanceModal.candidate?.candidate_name && (
                <>
                  Record attendance for{" "}
                  <strong style={{ color: theme.textPrimary }}>
                    {attendanceModal.candidate.candidate_name}
                  </strong>
                  's interview
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Interview Info Summary */}
          {attendanceModal.candidate?.interview_schedule && (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs"
              style={{
                background: theme.surfaceMuted,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Calendar
                className="size-3.5 shrink-0"
                style={{ color: theme.chart2 }}
              />
              <span style={{ color: theme.textSecondary }}>
                {new Date(
                  attendanceModal.candidate.interview_schedule.date,
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {" · "}
                {attendanceModal.candidate.interview_schedule.time?.slice(0, 5)}
                {" · "}
                <span className="capitalize">
                  {attendanceModal.candidate.interview_schedule.mode}
                </span>
              </span>
            </div>
          )}

          {/* Attendance Status Cards */}
          <div className="grid grid-cols-2 gap-2.5 py-2">
            {(
              [
                {
                  value: "attended",
                  label: "Attended",
                  icon: CheckCircle2,
                  color: theme.success,
                  bg: theme.successSoft,
                },
                {
                  value: "no-show",
                  label: "No Show",
                  icon: XCircle,
                  color: theme.destructive,
                  bg: theme.destructiveSoft,
                },
                {
                  value: "reschedule-requested",
                  label: "Reschedule",
                  icon: RefreshCw,
                  color: theme.warning,
                  bg: theme.warningSoft,
                },
                {
                  value: "pending",
                  label: "Pending",
                  icon: Clock,
                  color: theme.textMuted,
                  bg: theme.surfaceMuted,
                },
              ] as const
            ).map((option) => {
              const Icon = option.icon;
              const isSelected = selectedAttendance === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedAttendance(option.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-150 cursor-pointer"
                  style={{
                    background: isSelected ? option.bg : theme.background,
                    border: `2px solid ${isSelected ? option.color : theme.border}`,
                    boxShadow: isSelected
                      ? `0 0 12px ${option.color}20`
                      : "none",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                  }}
                  disabled={attendanceSaving}
                >
                  <Icon
                    className="size-6"
                    style={{
                      color: isSelected ? option.color : theme.textMuted,
                    }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isSelected ? option.color : theme.textMuted,
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAttendanceModal({ open: false, candidate: null });
                setSelectedAttendance("");
              }}
              disabled={attendanceSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAttendance}
              disabled={attendanceSaving || !selectedAttendance}
              style={{ background: theme.chart4, color: "#fff" }}
            >
              {attendanceSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ClipboardCheck className="mr-2 size-4" />
                  Confirm Attendance
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPipelinePage;
