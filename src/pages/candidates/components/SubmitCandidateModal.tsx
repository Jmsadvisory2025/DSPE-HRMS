import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Briefcase, MapPin, IndianRupee, Clock, Building2, GraduationCap, Download, Users, FileText, AlertCircle, FileSignature, CalendarDays, User, MessageSquare, Video, CheckCircle2, XCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions, candidateActions } from '@/redux/actions';
import { setJobs, setLoading as setJobsLoading } from '@/redux/slices/positionSlice';
import { setCandidateDetail, setCandidateDetailLoading } from '@/redux/slices/candidateSlice';
import { theme } from '@/config/theme';
import { getJobStatusStyle } from '@/lib/statusUtils';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | null;
}

export const SubmitCandidateModal = ({ isOpen, onClose, candidateId }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.positions);
  const { candidateDetail, candidateDetailLoading } = useAppSelector((state) => state.candidates);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalCandidateLoading, setModalCandidateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<Record<string, string[]> | null>(null);
  const errorBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (errorBoxRef.current && !errorBoxRef.current.contains(event.target as Node)) {
        setSubmissionErrors(null);
      }
    }
    
    if (submissionErrors) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [submissionErrors]);

  useEffect(() => {
    if (isOpen) {
      setSelectedJobId('');
      setSynopsis('');
      setSubmissionErrors(null);
      // Fetch all jobs for dropdown
      dispatch({
        type: positionActions.FETCH_JOBS,
        method: 'GET',
        endPoint: '/api/v1/jobs/',
        auth: true,
        setLoading: (val: boolean) => dispatch(setJobsLoading(val)),
        getResponse: (data: any) => dispatch(setJobs(data.results || [])),
        getError: (err: any) => console.error("Failed to fetch jobs", err),
      });

      // Fetch candidate details
      if (candidateId) {
        dispatch({
          type: candidateActions.FETCH_CANDIDATE_DETAIL,
          method: 'GET',
          endPoint: `/api/v1/candidates/${candidateId}/`,
          auth: true,
          setLoading: setModalCandidateLoading,
          getResponse: (data: any) => dispatch(setCandidateDetail(data)),
          getError: (err: any) => console.error("Failed to fetch candidate details", err),
        });
      }
    } else {
      setSelectedJobDetail(null);
      setSubmissionErrors(null);
      setSynopsis('');
    }
  }, [isOpen, dispatch, candidateId]);

  useEffect(() => {
    if (selectedJobId) {
      dispatch({
        type: positionActions.FETCH_JOB_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/jobs/${selectedJobId}/`,
        auth: true,
        setLoading: setDetailLoading,
        getResponse: (data: any) => setSelectedJobDetail(data),
        getError: (err: any) => console.error("Failed to fetch job detail", err),
      });
    } else {
      setSelectedJobDetail(null);
    }
  }, [selectedJobId, dispatch]);

  const handleSubmit = () => {
    if (!candidateId || !selectedJobId || !synopsis.trim()) {
      if (!synopsis.trim() && selectedJobId) {
        toast.error("Please provide a synopsis");
      }
      return;
    }
    
    setSubmitting(true);
    setSubmissionErrors(null);

    dispatch({
      type: candidateActions.SUBMIT_CANDIDATE,
      method: 'POST',
      endPoint: '/api/v1/candidates/applications/',
      auth: true,
      body: {
        candidate_id: candidateId,
        job_id: selectedJobId,
        synopsis: synopsis.trim() || undefined
      },
      showSuccessMessage: true,
      setLoading: (val: boolean) => {
         if (!val) setSubmitting(false);
      },
      getResponse: () => {
         onClose();
         navigate(`/approvals/${selectedJobId}`);
      },
      getError: (err: any) => {
         const data = err?.response?.data;
         if (data?.field_errors) {
           setSubmissionErrors(data.field_errors);
           // Show toast for each error so user can easily understand
           const fieldErrors = data.field_errors as Record<string, string[]>;
           Object.entries(fieldErrors).forEach(([field, messages]) => {
             if (field === 'non_field_errors') {
               messages.forEach((msg: string) => toast.error(msg));
             } else {
               const label = field.replace(/_/g, ' ');
               messages.forEach((msg: string) => toast.error(`${label}: ${msg}`));
             }
           });
         } else {
           const errorMsg = data?.detail || data?.error || err?.message || 'Failed to submit candidate.';
           toast.error(errorMsg);
         }
      }
    });
  };

  const jobOptions = jobs.map((job: any) => ({
    value: job.id,
    label: `${job.title} ${job.client?.name ? `(${job.client.name})` : ''}`
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-[1000px] w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
        <div className="p-6 pb-4 border-b border-border/40 bg-muted/20 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileSignature className="size-5" style={{ color: theme.accent }} />
              Submit Candidate
            </DialogTitle>
            <DialogDescription>
               Select a job position and provide a synopsis to submit this candidate.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* LEFT COLUMN: Form */}
          <div className="w-full md:w-[45%] flex flex-col border-r border-border/40 overflow-y-auto bg-background">
            <div className="p-6 space-y-6 flex-1">
              <div className="space-y-2">
                 <label className="text-sm font-semibold flex items-center justify-between" style={{ color: theme.textSecondary }}>
                   Job Position
                   {!selectedJobId && <span className="text-xs text-destructive font-medium">Required</span>}
                 </label>
                 <SearchableDropdown
                   options={jobOptions}
                   value={selectedJobId}
                   onChange={(val) => {
                     setSelectedJobId(val);
                     setSubmissionErrors(null);
                   }}
                   placeholder={jobsLoading ? "Loading jobs..." : "Select a job..."}
                   disabled={submitting || jobsLoading}
                   loading={jobsLoading}
                 />
              </div>

              {/* Synopsis Field */}
              <div className="space-y-2 animate-in fade-in fill-mode-both">
                 <label className="text-sm font-semibold flex items-center justify-between" style={{ color: theme.textSecondary }}>
                   <span>Synopsis <span className="text-destructive">*</span></span>
                   {(!synopsis.trim() && selectedJobId) && <span className="text-xs text-destructive font-medium">Required</span>}
                 </label>
                 <Textarea 
                   placeholder="e.g. This candidate brings 8 years of Python experience, highly recommended for backend leadership roles." 
                   value={synopsis}
                   onChange={(e) => setSynopsis(e.target.value)}
                   disabled={submitting}
                   className="min-h-[160px] resize-y bg-background focus:bg-background transition-colors"
                 />
                 <p className="text-xs text-muted-foreground leading-relaxed">Add any key highlights, relevant experience, or a brief summary for the client or hiring manager.</p>
              </div>

              {/* Validation Errors Box */}
              {submissionErrors && (
                <div ref={errorBoxRef} className="rounded-lg p-4 border shadow-sm animate-in fade-in zoom-in-95" style={{ background: theme.destructiveSoft, borderColor: theme.destructive + '40' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded-full shrink-0" style={{ background: theme.destructive, color: '#fff' }}>
                      {submissionErrors.non_field_errors ? (
                        <AlertCircle className="size-3" />
                      ) : (
                        <FileText className="size-3" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold" style={{ color: theme.destructive }}>
                      {submissionErrors.non_field_errors ? 'Submission Error' : 'Missing Details'}
                    </h4>
                  </div>
                  {!submissionErrors.non_field_errors && (
                    <p className="text-xs mb-3 font-medium opacity-90" style={{ color: theme.destructive }}>
                      Please update the candidate profile before submitting:
                    </p>
                  )}
                  <ul className="space-y-1.5">
                    {Object.entries(submissionErrors).map(([field, errors]) => (
                      <li key={field} className="text-xs flex items-start gap-1.5" style={{ color: theme.destructive }}>
                        <span className="mt-1 size-1 rounded-full shrink-0" style={{ background: theme.destructive }} />
                        <span>
                          {field === 'non_field_errors' ? (
                            <>{errors.join(' ')}</>
                          ) : (
                            <><span className="font-bold capitalize">{field.replace(/_/g, ' ')}:</span> {errors.join(' ')}</>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Past Applications */}
              {candidateId && (
                <div className="space-y-4 pt-6 mt-6 border-t border-border/40 animate-in fade-in zoom-in-95">
                  <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.textSecondary }}>
                    <Briefcase className="size-4" />
                    Application History
                    {candidateDetail?.applications && candidateDetail.applications.length > 0 && !modalCandidateLoading && (
                      <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: theme.accent + '15', color: theme.accent }}>
                        {candidateDetail.applications.length} records
                      </span>
                    )}
                  </h4>
                  
                  {modalCandidateLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                      <Loader2 className="size-6 animate-spin" style={{ color: theme.accent }} />
                      <p className="text-xs" style={{ color: theme.textMuted }}>Loading past applications...</p>
                    </div>
                  ) : candidateDetail?.applications && candidateDetail.applications.length > 0 ? (
                    <div className="space-y-3">
                      {candidateDetail.applications.map((app: any) => {
                      const statusColor = app.status === 'offered' || app.status === 'hired' ? theme.success 
                        : app.status === 'rejected' ? theme.destructive 
                        : app.status === 'screening' ? '#f59e0b'
                        : theme.textSecondary;
                      const reviewColor = app.manager_review_status === 'accepted' ? theme.success 
                        : app.manager_review_status === 'rejected' ? theme.destructive 
                        : theme.textMuted;
                      
                      return (
                        <div key={app.id} className="rounded-xl border text-sm shadow-sm transition-all hover:shadow-md overflow-hidden" style={{ background: theme.surface, borderColor: theme.border }}>
                          {/* Header */}
                          <div className="flex justify-between items-center gap-3 px-4 py-2.5" style={{ background: theme.surfaceMuted, borderBottom: `1px solid ${theme.border}` }}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="size-2 rounded-full shrink-0" style={{ background: statusColor }} />
                              <span className="font-semibold truncate" style={{ color: theme.textPrimary }}>{app.job_title}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider shrink-0 px-2 py-0.5" style={{ color: statusColor, borderColor: statusColor + '50', background: statusColor + '10' }}>
                              {app.status}
                            </Badge>
                          </div>

                          <div className="px-4 py-3 space-y-3">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                                <div className="size-6 rounded-md flex items-center justify-center shrink-0" style={{ background: theme.surfaceMuted }}>
                                  <CalendarDays className="size-3" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider font-medium leading-none mb-0.5">Shared</p>
                                  <p className="font-medium" style={{ color: theme.textSecondary }}>{app.share_date ? new Date(app.share_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                                <div className="size-6 rounded-md flex items-center justify-center shrink-0" style={{ background: theme.surfaceMuted }}>
                                  <User className="size-3" />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider font-medium leading-none mb-0.5">Submitted By</p>
                                  <p className="font-medium" style={{ color: theme.textSecondary }}>{app.submitted_by?.name || 'N/A'}</p>
                                </div>
                              </div>
                              {app.stage_name && (
                                <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                                  <div className="size-6 rounded-md flex items-center justify-center shrink-0" style={{ background: theme.surfaceMuted }}>
                                    <Briefcase className="size-3" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-medium leading-none mb-0.5">Stage</p>
                                    <p className="font-medium" style={{ color: theme.textSecondary }}>{app.stage_name}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Synopsis */}
                            {app.synopsis && (
                              <div className="text-xs rounded-lg p-3 border" style={{ background: theme.surfaceMuted, borderColor: theme.border }}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <FileText className="size-3" style={{ color: theme.textMuted }} />
                                  <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: theme.textMuted }}>Synopsis</span>
                                </div>
                                <p className="leading-relaxed" style={{ color: theme.textSecondary }}>{app.synopsis}</p>
                              </div>
                            )}

                            {/* Interview Schedule */}
                            {app.interview_schedule && (
                              <div className="text-xs rounded-lg p-3 border" style={{ background: theme.accent + '06', borderColor: theme.accent + '25' }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Video className="size-3" style={{ color: theme.accent }} />
                                  <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: theme.accent }}>Interview Schedule</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                  <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                                    <CalendarDays className="size-3 shrink-0" style={{ color: theme.textMuted }} />
                                    <span>{new Date(app.interview_schedule.date).toLocaleDateString()} at {app.interview_schedule.time?.slice(0, 5)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                                    <MapPin className="size-3 shrink-0" style={{ color: theme.textMuted }} />
                                    <span className="capitalize">{app.interview_schedule.mode}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                                    <User className="size-3 shrink-0" style={{ color: theme.textMuted }} />
                                    <span>{app.interview_schedule.interviewer_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
                                    <CheckCircle2 className="size-3 shrink-0" style={{ color: app.interview_schedule.attendance_status === 'attended' ? theme.success : theme.textMuted }} />
                                    <span className="capitalize">{app.interview_schedule.attendance_status || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Manager Review Footer */}
                            <div className="flex items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: theme.border + '50' }}>
                              <div className="flex items-center gap-1.5 text-xs">
                                {app.manager_review_status === 'accepted' ? (
                                  <CheckCircle2 className="size-3.5" style={{ color: theme.success }} />
                                ) : app.manager_review_status === 'rejected' ? (
                                  <XCircle className="size-3.5" style={{ color: theme.destructive }} />
                                ) : (
                                  <Clock className="size-3.5" style={{ color: theme.textMuted }} />
                                )}
                                <span className="font-medium" style={{ color: theme.textMuted }}>Manager Review:</span>
                                <span className="font-semibold capitalize px-1.5 py-0.5 rounded text-[10px]" style={{ 
                                  color: reviewColor, 
                                  background: reviewColor + '12'
                                }}>
                                  {app.manager_review_status}
                                </span>
                              </div>
                            </div>

                            {/* Manager Notes */}
                            {app.manager_review_notes && (
                              <div className="text-xs rounded-lg p-3 border-l-2" style={{ background: theme.surfaceMuted, borderColor: reviewColor }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <MessageSquare className="size-3" style={{ color: theme.textMuted }} />
                                  <span className="font-semibold uppercase tracking-wider text-[10px]" style={{ color: theme.textMuted }}>Manager Notes</span>
                                </div>
                                <p className="leading-relaxed italic" style={{ color: theme.textSecondary }}>"{app.manager_review_notes}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-lg border border-dashed" style={{ borderColor: theme.border, background: theme.surfaceMuted }}>
                      <p className="text-sm" style={{ color: theme.textMuted }}>No past candidate application data found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Job Details */}
          <div className="w-full md:w-[55%] bg-muted/10 overflow-y-auto relative p-6">
            {!selectedJobId && !detailLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-muted-foreground animate-in fade-in">
                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Briefcase className="size-8 opacity-50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No Job Selected</h3>
                <p className="text-sm max-w-[250px]">Select a job position from the left to view its details here.</p>
              </div>
            )}

            {detailLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
              </div>
            )}

            {!detailLoading && selectedJobDetail && (
              <div className="rounded-xl p-6 space-y-6 shadow-sm bg-background border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2" style={{ borderColor: theme.border }}>
                {/* Header / Title */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-semibold text-lg leading-tight tracking-tight" style={{ color: theme.textPrimary }}>{selectedJobDetail.title}</h4>
                    <div className="flex items-center flex-wrap gap-2 mt-2 text-sm" style={{ color: theme.textSecondary }}>
                      <Building2 className="size-4" />
                      <span className="font-medium">{selectedJobDetail.client?.name || 'Internal'}</span>
                      <span style={{ color: theme.textMuted }}>•</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: theme.surfaceMuted }}>{selectedJobDetail.code}</span>
                      {(() => {
                        const sStyle = getJobStatusStyle(selectedJobDetail.status);
                        return (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-2 font-semibold" style={{ borderColor: sStyle.borderColor, color: sStyle.color }}>
                            {sStyle.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* Core Details Grid */}
                <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm py-5" style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}><Briefcase className="size-3.5" /> Experience</div>
                    <p className="font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.min_experience} - {selectedJobDetail.max_experience} Yrs</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}><MapPin className="size-3.5" /> Location</div>
                    <p className="font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.location}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}><IndianRupee className="size-3.5" /> Budget</div>
                    <p className="font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.budget}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}><Clock className="size-3.5" /> Openings</div>
                    <p className="font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.openings}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Additional Info Row */}
                  <div className="flex flex-col gap-3">
                     {selectedJobDetail.education && (
                       <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                         <div className="p-2 rounded-md bg-background shadow-sm border border-border/50">
                           <GraduationCap className="size-4 shrink-0" style={{ color: theme.textSecondary }} />
                         </div>
                         <div>
                           <p className="text-[11px] font-medium uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Education</p>
                           <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.education}</p>
                         </div>
                       </div>
                     )}
                     {selectedJobDetail.client?.team_member && (
                       <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                         <div className="p-2 rounded-md bg-background shadow-sm border border-border/50">
                           <Users className="size-4 shrink-0" style={{ color: theme.textSecondary }} />
                         </div>
                         <div>
                           <p className="text-[11px] font-medium uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Client POC (HR)</p>
                           <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{selectedJobDetail.client.team_member.name}</p>
                         </div>
                       </div>
                     )}
                  </div>

                  {/* Skills */}
                  {selectedJobDetail.skills && selectedJobDetail.skills.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: theme.textMuted }}>Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedJobDetail.skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs font-medium px-2.5 py-1" style={{ background: theme.surface, color: theme.textPrimary, border: `1px solid ${theme.border}` }}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    {/* Team Members assigned */}
                    {selectedJobDetail.assigned_recruiters && selectedJobDetail.assigned_recruiters.length > 0 && (
                      <div>
                         <p className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: theme.textMuted }}>Recruiters</p>
                         <div className="flex flex-wrap gap-2">
                            {selectedJobDetail.assigned_recruiters.map((recruiter: any, i: number) => (
                               <div key={i} className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-full" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                                  {recruiter.avatar ? (
                                     <img src={recruiter.avatar} alt="avatar" className="size-5 rounded-full object-cover ring-1 ring-border" />
                                  ) : (
                                     <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold uppercase ring-1 ring-border/50" style={{ color: theme.accent }}>{recruiter.name.substring(0, 2)}</div>
                                  )}
                                  <span className="font-medium pr-1" style={{ color: theme.textSecondary }}>{recruiter.name}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}

                    {/* Description File */}
                    {selectedJobDetail.description_file && (
                      <a 
                        href={selectedJobDetail.description_file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-90 px-4 py-2 rounded-lg transition-all shadow-sm border border-accent/20 hover:shadow-md"
                        style={{ color: theme.accent, background: theme.accent + '10' }}
                      >
                        <FileText className="size-4" />
                        View JD
                        <Download className="size-3.5 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/20 border-t border-border/40 mt-auto">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button 
             style={{ background: theme.accent, color: theme.accentForeground }} 
             onClick={handleSubmit}
             disabled={submitting || !selectedJobId || !synopsis.trim()}
          >
             {submitting ? (
               <>
                 <Loader2 className="mr-2 size-4 animate-spin" />
                 Submitting...
               </>
             ) : 'Submit Candidate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};