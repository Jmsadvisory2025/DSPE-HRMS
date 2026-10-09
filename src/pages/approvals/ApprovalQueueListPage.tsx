import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Mail, Phone, Briefcase, Building, MapPin, Calendar, IndianRupee, Clock, User, FileText, ExternalLink, GraduationCap, CheckCircle2, Pencil, Save, CalendarClock, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch } from '@/store/hooks';
import { approvalActions } from '@/redux/actions';
import { theme } from '@/config/theme';
import { toast } from 'sonner';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';

const ApprovalQueueListPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || '';
  const stageParam = searchParams.get('stage') || '';

  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Synopsis editing state
  const [editingSynopsisId, setEditingSynopsisId] = useState<string | null>(null);
  const [synopsisValue, setSynopsisValue] = useState('');
  const [synopsisSaving, setSynopsisSaving] = useState(false);

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const stageOptions = [
    { value: '', label: 'All Stages' },
    {value: 'screening' , label: 'Screening'},
    { value: 'sent-to-client', label: 'Sent to Client' },
    { value: 'interview-align', label: 'Interview Align' },
    { value: 'select', label: 'Select' },
    { value: 'offered', label: 'Offered' },
    { value: 'joined', label: 'Joined' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'backout', label: 'Backout' },
    { value: 'duplicate', label: 'Duplicate' },
  ];

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams();
    if (newStatus) params.set('status', newStatus);
    if (stageParam) params.set('stage', stageParam);
    navigate(`/approvals/queue?${params.toString()}`);
  };

  const handleStageChange = (newStage: string) => {
    const params = new URLSearchParams();
    if (statusParam) params.set('status', statusParam);
    if (newStage) params.set('stage', newStage);
    navigate(`/approvals/queue?${params.toString()}`);
  };

  useEffect(() => {
    setPage(1);
  }, [statusParam, stageParam]);

  useEffect(() => {
    const apiParams = new URLSearchParams();
    if (statusParam) apiParams.set('approval_status', statusParam);
    if (stageParam) apiParams.set('stage', stageParam);
    apiParams.set('page', page.toString());

    dispatch({
      type: approvalActions.FETCH_APPROVAL_QUEUE_LIST,
      method: 'GET',
      endPoint: `/api/v1/candidates/applications/approval-queue-list/?${apiParams.toString()}`,
      auth: true,
      setLoading: (val: boolean) => setLoading(val),
      getResponse: (res: any) => {
        if (res?.results && Array.isArray(res.results)) {
          setApps(res.results);
          setTotalCount(res.count || 0);
          // Standard pagination typically uses 10 items per page
          setTotalPages(Math.ceil((res.count || 0) / 10));
        } else if (Array.isArray(res)) {
          setApps(res);
          setTotalCount(res.length);
          setTotalPages(1);
        } else {
          setApps([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      },
      getError: (err: any) => {
        console.error('Error fetching approval queue list:', err);
        toast.error('Failed to load applications.');
      },
    });
  }, [dispatch, statusParam, stageParam, page]);

  // Synopsis edit helpers
  const handleEditSynopsis = (appId: string, currentSynopsis: string) => {
    setEditingSynopsisId(appId);
    setSynopsisValue(currentSynopsis || '');
  };

  const handleSaveSynopsis = (appId: string) => {
    setSynopsisSaving(true);
    dispatch({
      type: approvalActions.UPDATE_APPLICATION,
      method: 'PATCH',
      endPoint: `/api/v1/candidates/applications/${appId}/`,
      auth: true,
      body: { synopsis: synopsisValue },
      setLoading: () => {},
      getResponse: () => {
        setSynopsisSaving(false);
        setEditingSynopsisId(null);
        // Update local state for grouped applications
        setApps((prev) =>
          prev.map((group) => ({
            ...group,
            applications: group.applications.map((a: any) =>
              a.id === appId ? { ...a, synopsis: synopsisValue } : a
            )
          }))
        );
        toast.success('Synopsis updated successfully');
      },
      getError: (err: any) => {
        setSynopsisSaving(false);
        const errorData = (err as any)?.response?.data;
        toast.error(errorData?.message || errorData?.detail || 'Failed to update synopsis');
      },
    });
  };

  const activeLabel = [
    statusParam ? statusOptions.find(o => o.value === statusParam)?.label : '',
    stageParam ? stageOptions.find(o => o.value === stageParam)?.label : '',
  ].filter(Boolean).join(' · ') || 'All';

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ color: theme.textSecondary }}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize" style={{ color: theme.textPrimary }}>
              {activeLabel} Applications
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
              Reviewing all cross-job applications ({totalCount} total)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5 w-44">
            <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>Pipeline Stage</label>
            <SearchableDropdown
              options={stageOptions}
              value={stageParam}
              onChange={handleStageChange}
              placeholder="All Stages"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-44">
            <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>Approval Status</label>
            <SearchableDropdown
              options={statusOptions}
              value={statusParam}
              onChange={handleStatusChange}
              placeholder="All Statuses"
            />
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="size-8 animate-spin mb-4" style={{ color: theme.accent }} />
          <p className="text-sm font-medium" style={{ color: theme.textMuted }}>
            Loading {statusParam} applications...
          </p>
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Briefcase className="size-12 mb-4" style={{ color: theme.textMuted + '60' }} />
          <p className="text-base font-medium" style={{ color: theme.textMuted }}>
            No {statusParam} applications found.
          </p>
        </div>
      ) : (
        <div className="space-y-10 pb-12">
          {apps.map((group: any) => (
            <div key={group.job_id} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Briefcase className="size-5" style={{ color: theme.accent }} /> 
                <h2 
                  className="text-xl font-bold cursor-pointer hover:underline" 
                  style={{ color: theme.textPrimary }}
                  onClick={() => navigate(`/approvals/${group.job_id}`)}
                >
                  {group.job_title}
                </h2>
                <Badge 
                  variant="outline" 
                  className="ml-2 font-medium"
                  style={{ background: theme.surface, color: theme.textSecondary, borderColor: theme.border }}
                >
                  {group.applications.length} {group.applications.length === 1 ? 'Application' : 'Applications'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-6 pl-2">
                {group.applications.map((app: any) => (
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
                                    app.manager_review_status === 'pending'
                                      ? theme.warning
                                      : app.manager_review_status === 'accepted' || app.manager_review_status === 'approved'
                                        ? theme.success
                                        : theme.destructive,
                                  background:
                                    app.manager_review_status === 'pending'
                                      ? theme.warningSoft
                                      : app.manager_review_status === 'accepted' || app.manager_review_status === 'approved'
                                        ? theme.successSoft
                                        : theme.destructiveSoft,
                                  border: 0,
                                }}
                              >
                                {app.manager_review_status}
                              </Badge>
                            </div>

                            <div
                              className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm mt-1"
                              style={{ color: theme.textSecondary }}
                            >
                              <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {app.candidate_email}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {app.candidate_contact || 'Not specified'}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-2" style={{ color: theme.textMuted }}>
                              <div className="flex items-center gap-1.5">
                                <Briefcase className="size-3.5" />
                                <span>{app.candidate_experience || 'Not specified'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Building className="size-3.5" />
                                <span className="truncate max-w-[150px]" title={app.candidate_current_company || ''}>{app.candidate_current_company || 'Not specified'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="size-3.5" />
                                <span>{app.candidate_current_location || 'Not specified'}</span>
                              </div>
                            </div>

                            <div
                              className="flex items-center gap-2 text-sm mt-2 pt-2 border-t"
                              style={{ color: theme.textMuted }}
                            >
                              <User className="size-3.5" />
                              <span>
                                Submitted by: {app.submitted_by?.name || 'Unknown'}
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
                          onClick={() => window.open(app.candidate_cv, '_blank')}
                          disabled={!app.candidate_cv}
                        >
                          <FileText className="size-3.5" />
                          View Resume
                          <ExternalLink className="size-3" />
                        </Button>
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
                        {app.share_date || 'N/A'}
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
                        {app.current_ctc && app.current_ctc !== '0.00'
                          ? app.current_ctc
                          : 'N/A'}
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
                        {app.expected_ctc && app.expected_ctc !== '0.00'
                          ? app.expected_ctc
                          : 'N/A'}
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
                        {app.notice_period || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div className="mt-4 space-y-4">
                    <div className="p-3 rounded-md bg-muted/40 text-sm border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-muted-foreground mr-2">Synopsis:</span>
                        {editingSynopsisId !== app.id && (
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => handleEditSynopsis(app.id, app.synopsis)}>
                            <Pencil className="size-3 mr-1" /> Edit
                          </Button>
                        )}
                      </div>
                      {editingSynopsisId === app.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            className="w-full min-h-[80px] p-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                            value={synopsisValue}
                            onChange={(e) => setSynopsisValue(e.target.value)}
                            placeholder="Enter synopsis..."
                          />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingSynopsisId(null)} disabled={synopsisSaving}>Cancel</Button>
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveSynopsis(app.id)} disabled={synopsisSaving} style={{ background: theme.accent }}>
                              {synopsisSaving ? <Loader2 className="size-3 animate-spin mr-1" /> : <Save className="size-3 mr-1" />} Save
                            </Button>
                          </div>
                        </div>
                      ) : app.synopsis ? (
                        <div className="whitespace-pre-wrap mt-1">{app.synopsis}</div>
                      ) : (
                        <div className="text-muted-foreground italic mt-1">Not specified</div>
                      )}
                    </div>

                    {/* Skills & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border bg-muted/10">
                      {app.candidate_skills && app.candidate_skills.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <CheckCircle2 className="size-3.5" /> Skills
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {app.candidate_skills.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="font-normal text-xs bg-background shadow-sm border">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <CheckCircle2 className="size-3.5" /> Skills
                          </div>
                          <p className="text-sm text-muted-foreground">No skills specified</p>
                        </div>
                      )}

                      {app.candidate_education && app.candidate_education.length > 0 ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <GraduationCap className="size-3.5" /> Education
                          </div>
                          <div className="text-sm space-y-2">
                            {app.candidate_education.map((edu: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="mt-1.5 size-1.5 rounded-full bg-muted-foreground/50 shrink-0"></span>
                                <span className="text-muted-foreground leading-snug">{edu}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            <GraduationCap className="size-3.5" /> Education
                          </div>
                          <p className="text-sm text-muted-foreground">No education details specified</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interview Schedule */}
                  {app.interview_schedule && (
                    <div className="mt-4 p-4 rounded-xl border bg-primary/5 border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarClock className="size-4 text-primary" />
                        <span className="text-sm font-bold text-primary">Interview Scheduled</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Date</div>
                          <div className="text-sm font-medium">{new Date(app.interview_schedule.date).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Time</div>
                          <div className="text-sm font-medium">{app.interview_schedule.time}</div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Mode</div>
                          <div className="text-sm font-medium capitalize flex items-center gap-1.5">
                            {app.interview_schedule.mode === 'online' ? <Video className="size-3.5" /> : <Building className="size-3.5" />}
                            {app.interview_schedule.mode}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1">Interviewer</div>
                          <div className="text-sm font-medium truncate max-w-[120px]" title={app.interview_schedule.interviewer_name || 'TBD'}>
                            {app.interview_schedule.interviewer_name || 'TBD'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: theme.border }}>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Showing page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ color: theme.textSecondary, borderColor: theme.border }}
                >
                  <ChevronLeft className="size-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ color: theme.textSecondary, borderColor: theme.border }}
                >
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueueListPage;
