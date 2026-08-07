import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { theme } from '@/config/theme';
import {
  ArrowLeft, Briefcase, MapPin, IndianRupee, Users,
  GraduationCap, Loader2, Building2, User, ChevronDown, ChevronUp, ArrowRight, MoreHorizontal
} from 'lucide-react';
import { positionActions } from '@/redux/actions';
import { toast } from 'sonner';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

/* ── Types ──────────────────────────────────────────────────── */
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
const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'screening': { label: 'Screening', color: theme.info, bg: theme.infoSoft },
  'interview-scheduled': { label: 'Interview Scheduled', color: theme.chart2, bg: theme.chart2 + '15' },
  'interview-align': { label: 'Interview Align', color: theme.chart2, bg: theme.chart2 + '15' },
  'sent-to-client': { label: 'Sent to Client', color: theme.accent, bg: theme.accentSoft },
  'select': { label: 'Selected', color: theme.chart3, bg: theme.chart3 + '15' },
  'offered': { label: 'Offered', color: theme.warning, bg: theme.warningSoft },
  'hired': { label: 'Hired', color: theme.success, bg: theme.successSoft },
  'joined': { label: 'Joined', color: theme.success, bg: theme.successSoft },
  'rejected': { label: 'Rejected', color: theme.destructive, bg: theme.destructiveSoft },
  'on-hold': { label: 'On Hold', color: theme.warning, bg: theme.warningSoft },
  'backout': { label: 'Backout', color: theme.destructive, bg: theme.destructiveSoft },
};

const getStageConfig = (stage: string) => {
  return STAGE_CONFIG[stage] || { label: stage.replace(/-/g, ' '), color: theme.textMuted, bg: theme.surfaceMuted };
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
  const [localPipeline, setLocalPipeline] = useState<Record<string, PipelineCandidate[]>>({});

  // Scroll container ref for auto-scroll during drag
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Stage change confirmation modal state
  const [stageChangeModal, setStageChangeModal] = useState<{
    open: boolean;
    candidate: PipelineCandidate | null;
    fromStage: string;
    toStage: string;
    destIndex: number;
  }>({ open: false, candidate: null, fromStage: '', toStage: '', destIndex: 0 });
  const [stageChangeNote, setStageChangeNote] = useState('');
  const [stageChangeSaving, setStageChangeSaving] = useState(false);

  useEffect(() => {
    if (jobId) {
      dispatch({
        type: positionActions.FETCH_JOB_PIPELINE,
        method: 'GET',
        endPoint: `/api/v1/jobs/${jobId}/pipeline/`,
        auth: true,
        setLoading: (val: boolean) => setLoading(val),
        getResponse: (res: PipelineData) => {
          setData(res);
          setLocalPipeline(res.pipeline);
        },
        getError: (err: any) => console.error('Pipeline fetch failed:', err),
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
    window.addEventListener('mousemove', handleMouseMoveDuringDrag);
    startAutoScroll();
  }, [handleMouseMoveDuringDrag, startAutoScroll]);

  const handleDragEndCleanup = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMoveDuringDrag);
    stopAutoScroll();
  }, [handleMouseMoveDuringDrag, stopAutoScroll]);

  /* ── Drag & Drop Handler ──────────────────────────────────── */
  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside any droppable, or in the same spot
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    // Same column reorder — just move locally
    if (sourceStage === destStage) {
      const items = [...(localPipeline[sourceStage] || [])];
      const [moved] = items.splice(source.index, 1);
      if (!moved) return;
      items.splice(destination.index, 0, moved);
      setLocalPipeline(prev => ({ ...prev, [sourceStage]: items }));
      return;
    }

    // Cross-column move → open confirmation modal
    const sourceItems = localPipeline[sourceStage] || [];
    const candidate = sourceItems[source.index];
    if (!candidate) return;

    setStageChangeNote(candidate.notes || '');
    setStageChangeModal({
      open: true,
      candidate,
      fromStage: sourceStage,
      toStage: destStage,
      destIndex: destination.index,
    });
  }, [localPipeline]);

  const handleMenuMoveClick = useCallback((candidate: PipelineCandidate, fromStage: string, toStage: string) => {
    setStageChangeNote(candidate.notes || '');
    setStageChangeModal({
      open: true,
      candidate,
      fromStage,
      toStage,
      destIndex: (localPipeline[toStage] || []).length, // Add to bottom of target column
    });
  }, [localPipeline]);

  /* ── Confirm Stage Change ────────────────────────────────── */
  const handleConfirmStageChange = useCallback(() => {
    const { candidate, fromStage, toStage, destIndex } = stageChangeModal;
    if (!candidate || !stageChangeNote.trim()) return;

    // Optimistic move
    const prevPipeline = { ...localPipeline };
    const sourceItems = [...(prevPipeline[fromStage] || [])];
    const destItems = [...(prevPipeline[toStage] || [])];
    const srcIdx = sourceItems.findIndex(c => c.application_id === candidate.application_id);
    if (srcIdx === -1) return;

    sourceItems.splice(srcIdx, 1);
    const updatedItem = { ...candidate, status: toStage, notes: stageChangeNote.trim() };
    destItems.splice(destIndex, 0, updatedItem);

    const newPipeline = { ...prevPipeline, [fromStage]: sourceItems, [toStage]: destItems };
    setLocalPipeline(newPipeline);

    // Close modal & set loading
    setStageChangeModal({ open: false, candidate: null, fromStage: '', toStage: '', destIndex: 0 });
    setMovingAppId(candidate.application_id);
    setStageChangeSaving(true);

    dispatch({
      type: positionActions.UPDATE_APPLICATION_STATUS,
      method: 'PATCH',
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
        setStageChangeNote('');
        const stageLabel = getStageConfig(toStage).label;
        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{candidate.candidate_name}</span>
            <span className="text-sm opacity-80">
              {res?.message || `Moved to ${stageLabel}`}
            </span>
          </div>
        );
      },
      getError: (err: any) => {
        setMovingAppId(null);
        setStageChangeSaving(false);
        setStageChangeNote('');
        // Revert optimistic update
        setLocalPipeline(prevPipeline);

        const errorData = err?.response?.data;
        if (errorData?.status && Array.isArray(errorData.status)) {
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Failed to move {candidate.candidate_name}</span>
              <ul className="list-disc pl-4 text-sm opacity-90">
                {errorData.status.map((errMsg: string, i: number) => (
                  <li key={i}>{errMsg}</li>
                ))}
              </ul>
            </div>,
            { duration: 5000 }
          );
        } else {
          toast.error(
            `Failed to move ${candidate.candidate_name}: ${errorData?.message || errorData?.detail || 'Unknown error'}`
          );
        }
      },
    });
  }, [stageChangeModal, stageChangeNote, localPipeline, dispatch]);

  const handleCancelStageChange = useCallback(() => {
    setStageChangeModal({ open: false, candidate: null, fromStage: '', toStage: '', destIndex: 0 });
    setStageChangeNote('');
  }, []);

  /* ── Render — Loading / Error ─────────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin mb-3" style={{ color: theme.accent }} />
        <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading pipeline...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="text-sm font-medium" style={{ color: theme.textMuted }}>Failed to load pipeline data.</span>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const { job } = data;

  // Count total candidates across all stages
  const totalCandidates = Object.values(localPipeline).reduce((sum, arr) => sum + arr.length, 0);

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
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
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
                  <h1 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                    {job.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className="capitalize text-xs border-0 font-medium"
                    style={{
                      color: job.status === 'open' ? theme.success : theme.textMuted,
                      background: job.status === 'open' ? theme.successSoft : theme.surfaceMuted,
                    }}
                  >
                    {job.status}
                  </Badge>
                </div>
                <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                  {job.code} {job.client ? `· ${job.client.name}` : ''} {job.client?.team_member ? `· POC: ${job.client.team_member.name}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setJobDetailsExpanded(prev => !prev)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  color: theme.accent,
                  background: theme.accentSoft,
                }}
              >
                {jobDetailsExpanded ? 'Less Details' : 'More Details'}
                {jobDetailsExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
              <MapPin className="size-3.5" style={{ color: theme.textMuted }} />
              <span className="capitalize">{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
              <Briefcase className="size-3.5" style={{ color: theme.textMuted }} />
              <span>{job.min_experience}–{job.max_experience} yrs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
              <IndianRupee className="size-3.5" style={{ color: theme.textMuted }} />
              <span>{job.budget ? (parseFloat(job.budget) / 100000).toFixed(1) + ' LPA' : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
              <GraduationCap className="size-3.5" style={{ color: theme.textMuted }} />
              <span>{job.education || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
              <Users className="size-3.5" style={{ color: theme.textMuted }} />
              <span>{totalCandidates} candidate{totalCandidates !== 1 ? 's' : ''}</span>
            </div>
            {job.hiring_for && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
                <Building2 className="size-3.5" style={{ color: theme.textMuted }} />
                <span className="capitalize">Hiring for: {job.hiring_for}</span>
              </div>
            )}
            {job.hiring_manager && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textSecondary }}>
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
                <h4 className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
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
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 border-t mt-4" style={{ borderColor: theme.border }}>
              {job.skills && job.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill, i) => (
                      <Badge
                        key={`${skill}-${i}`}
                        variant="outline"
                        className="text-xs px-2 py-0.5 border-0 font-medium"
                        style={{ color: theme.chart2, background: theme.chart2 + '15' }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {job.description_file && (
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: theme.textMuted }}>
                    Attachments
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-xs font-medium"
                    style={{ borderColor: theme.accent + '50', color: theme.accent, background: theme.accentSoft }}
                    onClick={() => window.open(job.description_file as string, '_blank')}
                  >
                    <Briefcase className="size-3.5" />
                    View Job Description
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t" style={{ borderColor: theme.border }}>
              {/* Assigned Recruiters */}
              {job.assigned_recruiters && job.assigned_recruiters.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: theme.textMuted }}>
                    Assigned Recruiters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.assigned_recruiters.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                        style={{ background: theme.surfaceMuted, border: `1px solid ${theme.border}` }}
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
                            style={{ background: theme.accentSoft, color: theme.accent }}
                          >
                            {rec.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold" style={{ color: theme.textPrimary }}>{rec.name}</p>
                          <p style={{ color: theme.textSecondary }}>{rec.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created By & Meta */}
              {job.created_by && (
                <div>
                  <h4 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: theme.textMuted }}>
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
                          style={{ background: theme.chart2 + '20', color: theme.chart2 }}
                        >
                          {job.created_by.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Created By</p>
                        <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{job.created_by.name}</p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>{job.created_by.role}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider block mb-0.5" style={{ color: theme.textMuted }}>Created At</span>
                        <span style={{ color: theme.textSecondary }}>
                          {new Date(job.created_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider block mb-0.5" style={{ color: theme.textMuted }}>Last Updated</span>
                        <span style={{ color: theme.textSecondary }}>
                          {new Date(job.updated_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
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
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: theme.accent, background: theme.accentSoft }}>
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
        <div ref={scrollContainerRef} className="overflow-x-auto pb-2" style={{ scrollBehavior: 'auto' }}>
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {allStages.map((stageName) => {
              const candidates = localPipeline[stageName];
              const config = getStageConfig(stageName);

              return (
                <Droppable droppableId={stageName} key={stageName}>
                  {(provided, snapshot) => (
                    <div
                      className="flex flex-col rounded-xl overflow-hidden shrink-0 transition-all duration-200"
                      style={{
                        width: '280px',
                        background: snapshot.isDraggingOver
                          ? config.color + '08'
                          : theme.surface,
                        border: snapshot.isDraggingOver
                          ? `2px solid ${config.color}`
                          : `1px solid ${theme.border}`,
                        minHeight: '200px',
                        boxShadow: snapshot.isDraggingOver
                          ? `0 0 20px ${config.color}30, 0 4px 15px ${config.color}15`
                          : 'none',
                        transform: snapshot.isDraggingOver ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Stage Header */}
                      <div
                        className="px-4 py-3 flex items-center justify-between transition-colors duration-200"
                        style={{
                          borderBottom: `2px solid ${config.color}`,
                          background: snapshot.isDraggingOver
                            ? config.color + '25'
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
                          style={{ background: config.color, color: '#fff' }}
                        >
                          {candidates.length}
                        </span>
                      </div>

                      {/* Droppable Cards Area */}
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 p-2.5 space-y-2 overflow-hidden transition-colors duration-200"
                        style={{
                          maxHeight: '500px',
                          minHeight: '120px',
                        }}
                      >
                        {candidates.length === 0 && !snapshot.isDraggingOver ? (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                              No candidates
                            </p>
                          </div>
                        ) : candidates.length === 0 && snapshot.isDraggingOver ? (
                          <div className="flex items-center justify-center h-full min-h-[120px]">
                            <p className="text-xs text-center font-medium" style={{ color: config.color }}>
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
                                const isMoving = movingAppId === candidate.application_id;

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
                                        : 'none',
                                      opacity: isMoving ? 0.6 : 1,
                                      cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                    }}
                                  >
                                    {/* Name */}
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ background: config.bg, color: config.color }}
                                      >
                                        {candidate.candidate_name?.charAt(0)?.toUpperCase()}
                                      </div>
                                      <p className="text-sm font-semibold truncate flex-1" style={{ color: theme.textPrimary }}>
                                        {candidate.candidate_name}
                                      </p>
                                      
                                      <div className="flex items-center shrink-0">
                                        {isMoving && (
                                          <Loader2 className="size-3.5 animate-spin mr-2" style={{ color: config.color }} />
                                        )}
                                        {!snapshot.isDragging && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-6 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: theme.textMuted }}
                                              >
                                                <MoreHorizontal className="size-3.5" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                              <DropdownMenuGroup>
                                                <DropdownMenuLabel className="text-xs font-semibold" style={{ color: theme.textMuted }}>Move to stage</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {allStages.filter(s => s !== stageName).map(targetStage => (
                                                  <DropdownMenuItem
                                                    key={targetStage}
                                                    className="text-xs cursor-pointer"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleMenuMoveClick(candidate, stageName, targetStage);
                                                    }}
                                                  >
                                                    <div
                                                      className="size-2 rounded-full mr-2"
                                                      style={{ background: getStageConfig(targetStage).color }}
                                                    />
                                                    {getStageConfig(targetStage).label}
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                      {candidate.current_company && candidate.current_company !== 'Not specified' && (
                                        <div className="col-span-2">
                                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Company</p>
                                          <p className="text-xs font-medium truncate" style={{ color: theme.textSecondary }}>{candidate.current_company}</p>
                                        </div>
                                      )}
                                      {candidate.experience && candidate.experience !== 'Not specified' && (
                                        <div>
                                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Exp</p>
                                          <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>{candidate.experience} yrs</p>
                                        </div>
                                      )}
                                      {candidate.notice_period && (
                                        <div>
                                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Notice</p>
                                          <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>{candidate.notice_period} days</p>
                                        </div>
                                      )}
                                      {candidate.current_ctc && (
                                        <div>
                                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>C. CTC</p>
                                          <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>₹{candidate.current_ctc}</p>
                                        </div>
                                      )}
                                      {candidate.expected_ctc && (
                                        <div>
                                          <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>E. CTC</p>
                                          <p className="text-xs font-medium" style={{ color: theme.textSecondary }}>₹{candidate.expected_ctc}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Notes */}
                                    {candidate.notes && (
                                      <p
                                        className="text-[11px] italic line-clamp-2 pt-1"
                                        style={{ color: theme.textMuted, borderTop: `1px solid ${theme.border}` }}
                                      >
                                        "{candidate.notes}"
                                      </p>
                                    )}
                                  </div>
                                );

                                return snapshot.isDragging
                                  ? ReactDOM.createPortal(cardContent, document.body)
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

      {/* ── Stage Change Confirmation Modal ────────────────────── */}
      <Dialog
        open={stageChangeModal.open}
        onOpenChange={(open) => {
          if (!open && !stageChangeSaving) handleCancelStageChange();
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle style={{ color: theme.textPrimary }}>Confirm Stage Change</DialogTitle>
            <DialogDescription className="text-sm pt-1" style={{ color: theme.textMuted }}>
              Review the details below and add a note before moving this candidate.
            </DialogDescription>
          </DialogHeader>

          {stageChangeModal.candidate && (
            <div className="space-y-4 py-2">
              {/* Candidate Details Card */}
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ background: theme.surfaceMuted, border: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: theme.accentSoft, color: theme.accent }}
                  >
                    {stageChangeModal.candidate.candidate_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                      {stageChangeModal.candidate.candidate_name}
                    </p>
                    {stageChangeModal.candidate.current_company && stageChangeModal.candidate.current_company !== 'Not specified' && (
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        {stageChangeModal.candidate.current_company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stageChangeModal.candidate.experience && stageChangeModal.candidate.experience !== 'Not specified' && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Experience</p>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{stageChangeModal.candidate.experience} yrs</p>
                    </div>
                  )}
                  {stageChangeModal.candidate.current_ctc && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Current CTC</p>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>₹{stageChangeModal.candidate.current_ctc}</p>
                    </div>
                  )}
                  {stageChangeModal.candidate.expected_ctc && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Expected CTC</p>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>₹{stageChangeModal.candidate.expected_ctc}</p>
                    </div>
                  )}
                  {stageChangeModal.candidate.notice_period && (
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.textMuted }}>Notice Period</p>
                      <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{stageChangeModal.candidate.notice_period} days</p>
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
                    style={{ background: getStageConfig(stageChangeModal.fromStage).color }}
                  />
                  <span className="text-xs font-bold" style={{ color: getStageConfig(stageChangeModal.fromStage).color }}>
                    {getStageConfig(stageChangeModal.fromStage).label}
                  </span>
                </div>

                <ArrowRight className="size-5 shrink-0" style={{ color: theme.textMuted }} />

                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    background: getStageConfig(stageChangeModal.toStage).bg,
                    border: `1px solid ${getStageConfig(stageChangeModal.toStage).color}30`,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: getStageConfig(stageChangeModal.toStage).color }}
                  />
                  <span className="text-xs font-bold" style={{ color: getStageConfig(stageChangeModal.toStage).color }}>
                    {getStageConfig(stageChangeModal.toStage).label}
                  </span>
                </div>
              </div>

              {/* Notes — Required */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                  Note <span style={{ color: theme.destructive }}>*</span>
                </label>
                <Textarea
                  value={stageChangeNote}
                  onChange={(e) => setStageChangeNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (stageChangeNote.trim() && !stageChangeSaving) {
                        handleConfirmStageChange();
                      }
                    }
                  }}
                  placeholder="Add a note for this stage change..."
                  rows={3}
                  className="resize-none text-sm"
                  style={{ background: theme.background, borderColor: theme.border, color: theme.textPrimary }}
                  disabled={stageChangeSaving}
                />
                {!stageChangeNote.trim() && (
                  <p className="text-xs" style={{ color: theme.destructive }}>Note is required to change stage.</p>
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
              style={{ background: theme.accent, color: theme.accentForeground }}
            >
              {stageChangeSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Moving...
                </>
              ) : (
                'Confirm & Move'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPipelinePage;
