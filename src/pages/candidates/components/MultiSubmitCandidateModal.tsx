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
import { Loader2, Briefcase, MapPin, IndianRupee, Clock, Building2, GraduationCap, Download, Users, FileText, AlertCircle, FileSignature, CalendarDays, User, Video, CheckCircle2, XCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions, candidateActions } from '@/redux/actions';
import { setJobs, setLoading as setJobsLoading } from '@/redux/slices/positionSlice';
import { setCandidateDetail } from '@/redux/slices/candidateSlice';
import { theme } from '@/config/theme';
import { getJobStatusStyle } from '@/lib/statusUtils';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidateIds: string[];
  onSuccess?: () => void;
}

export const MultiSubmitCandidateModal = ({ isOpen, onClose, candidateIds, onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.positions);
  const { candidates, candidateDetail } = useAppSelector((state) => state.candidates);
  const selectedCandidates = candidates.filter((c: any) => candidateIds.includes(c.id));
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<Record<string, string[]> | null>(null);
  const [rightTab, setRightTab] = useState<'job' | 'candidates'>('candidates');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
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
      dispatch({
        type: positionActions.FETCH_JOBS,
        method: 'GET',
        endPoint: '/api/v1/jobs/',
        auth: true,
        setLoading: (val: boolean) => dispatch(setJobsLoading(val)),
        getResponse: (data: any) => dispatch(setJobs(data.results || [])),
        getError: (err: any) => console.error("Failed to fetch jobs", err),
      });
    } else {
      setSelectedJobDetail(null);
      setSubmissionErrors(null);
      setSynopsis('');
    }
  }, [isOpen, dispatch]);

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
    if (candidateIds.length === 0 || !selectedJobId) {
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
        candidate_ids: candidateIds,
        job_id: selectedJobId,
        synopsis: synopsis.trim() || undefined
      },
      showSuccessMessage: true,
      setLoading: (val: boolean) => {
         if (!val) setSubmitting(false);
      },
      getResponse: (res: any) => {
         if (res && res.message) {
           toast.success(res.message);
         }
         onClose();
         if (onSuccess) onSuccess();
         navigate(`/approvals/${selectedJobId}`);
      },
      getError: (err: any) => {
         const data = err?.response?.data;
         if (data?.field_errors) {
           setSubmissionErrors(data.field_errors);
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
           const errorMsg = data?.detail || data?.error || err?.message || 'Failed to submit candidates.';
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
      <DialogContent showCloseButton={!submitting} className="sm:max-w-[1200px] w-full h-[85vh] max-h-[95vh] flex flex-col p-0 overflow-hidden bg-background shadow-2xl rounded-2xl">
        <div className="px-8 py-6 border-b border-border/40 shrink-0" style={{ background: `linear-gradient(to right, ${theme.surfaceMuted}, ${theme.surface})` }}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl shadow-sm border bg-background" style={{ borderColor: theme.border }}>
                <FileSignature className="size-6" style={{ color: theme.accent }} />
              </div>
              <span className="font-bold tracking-tight">Submit {candidateIds.length} Candidate{candidateIds.length !== 1 ? 's' : ''}</span>
            </DialogTitle>
            <DialogDescription className="text-sm font-medium mt-1.5 opacity-80">
               Select a job position and provide a synopsis to submit these candidates in bulk.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-[40%] flex flex-col border-r border-border/40 overflow-y-auto bg-background">
            <div className="p-8 space-y-8 flex-1">
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

              <div className="space-y-2 animate-in fade-in fill-mode-both">
                 <label className="text-sm font-semibold flex items-center justify-between" style={{ color: theme.textSecondary }}>
                   <span>Synopsis (Optional)</span>
                 </label>
                 <Textarea 
                   placeholder="e.g. These candidates have excellent skills in Django and React..." 
                   value={synopsis}
                   onChange={(e) => setSynopsis(e.target.value)}
                   disabled={submitting}
                   className="min-h-[160px] resize-y bg-background focus:bg-background transition-colors"
                 />
                 <p className="text-xs text-muted-foreground leading-relaxed">Add any key highlights or a brief summary for the client or hiring manager. This synopsis will apply to all selected candidates.</p>
              </div>

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
                  <ul className="space-y-1.5 mt-3">
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
            </div>
          </div>

          <div className="w-full md:w-[60%] bg-muted/10 overflow-y-auto relative p-8 flex flex-col">
            <div className="flex items-center bg-muted/30 p-1 rounded-xl mb-6 w-full sm:w-fit border shadow-sm shrink-0">
               <button 
                 className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all ${rightTab === 'job' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setRightTab('job')}
               >
                 Job Details
               </button>
               <button 
                 className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${rightTab === 'candidates' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                 onClick={() => setRightTab('candidates')}
               >
                 Selected Candidates
                 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: theme.accent + '20', color: theme.accent }}>
                   {candidateIds.length}
                 </span>
               </button>
            </div>

            {rightTab === 'candidates' && (
              <div className="animate-in fade-in zoom-in-95 fill-mode-both flex flex-col gap-4">
                 {selectedCandidates.map((c: any) => {
                   const isExpanded = expandedCandidateId === c.id;
                   return (
                   <div key={c.id} className="rounded-xl border bg-background shadow-sm transition-all overflow-hidden" style={{ borderColor: theme.border }}>
                     <div 
                       className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                       onClick={() => {
                         if (isExpanded) {
                           setExpandedCandidateId(null);
                         } else {
                           setExpandedCandidateId(c.id);
                           if (candidateDetail?.id !== c.id) {
                             dispatch({
                               type: candidateActions.FETCH_CANDIDATE_DETAIL,
                               method: 'GET',
                               endPoint: `/api/v1/candidates/${c.id}/`,
                               auth: true,
                               setLoading: setHistoryLoading,
                               getResponse: (data: any) => dispatch(setCandidateDetail(data)),
                               getError: (err: any) => console.error(err),
                             });
                           }
                         }
                       }}
                     >
                       <div className="flex items-center gap-4 min-w-0">
                         <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 shrink-0" style={{ color: theme.accent }}>
                           {c.candidate_name?.substring(0, 2).toUpperCase() || 'C'}
                         </div>
                         <div className="min-w-0">
                           <p className="font-semibold text-sm truncate" style={{ color: theme.textPrimary }}>{c.candidate_name}</p>
                           <p className="text-xs truncate mt-0.5" style={{ color: theme.textMuted }}>{c.current_profile || 'No profile specified'}</p>
                           <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md" style={{ background: theme.surfaceMuted, color: theme.textSecondary }}>{c.experience || '0'} Yrs Exp</span>
                             <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1"><MapPin className="size-3" /> {c.current_location?.split(',')[0] || 'N/A'}</span>
                           </div>
                         </div>
                       </div>
                       <div className="shrink-0 p-2 text-muted-foreground">
                         {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                       </div>
                     </div>

                     {isExpanded && (
                       <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                         <div className="p-4 rounded-lg bg-muted/20 border" style={{ borderColor: theme.border + '50' }}>
                           <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: theme.textSecondary }}>
                             <Briefcase className="size-3.5" />
                             Application History
                             {candidateDetail?.id === c.id && candidateDetail?.applications?.length > 0 && (
                               <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: theme.accent + '15', color: theme.accent }}>
                                 {candidateDetail.applications.length} records
                               </span>
                             )}
                           </h4>

                           {historyLoading || candidateDetail?.id !== c.id ? (
                              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                                <Loader2 className="size-5 animate-spin" style={{ color: theme.accent }} />
                                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Loading history...</p>
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
                                    <div key={app.id} className="rounded-lg border text-sm shadow-sm bg-background" style={{ borderColor: theme.border }}>
                                      <div className="flex justify-between items-center gap-3 px-3 py-2" style={{ background: theme.surfaceMuted, borderBottom: `1px solid ${theme.border}` }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="size-1.5 rounded-full shrink-0" style={{ background: statusColor }} />
                                          <span className="font-semibold text-xs truncate" style={{ color: theme.textPrimary }}>{app.job_title}</span>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider shrink-0 px-1.5 py-0" style={{ color: statusColor, borderColor: statusColor + '50', background: statusColor + '10' }}>
                                          {app.status}
                                        </Badge>
                                      </div>

                                      <div className="p-3 space-y-3.5">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="flex items-start gap-2 text-xs" style={{ color: theme.textMuted }}>
                                            <CalendarDays className="size-3.5 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Shared</p>
                                              <p className="font-medium truncate" style={{ color: theme.textSecondary }}>{app.share_date ? new Date(app.share_date).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2 text-xs" style={{ color: theme.textMuted }}>
                                            <User className="size-3.5 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                              <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.textMuted }}>Submitted By</p>
                                              <p className="font-medium truncate" style={{ color: theme.textSecondary }} title={app.submitted_by?.name}>{app.submitted_by?.name || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {app.synopsis && (
                                          <div className="text-xs">
                                            <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5" style={{ color: theme.textMuted }}><MessageSquare className="size-3" /> Synopsis</p>
                                            <p className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>{app.synopsis}</p>
                                          </div>
                                        )}

                                        {app.interview_schedule && (
                                          <div className="text-xs rounded p-2.5 border space-y-1.5" style={{ background: theme.accent + '06', borderColor: theme.accent + '25' }}>
                                            <div className="flex items-center gap-1.5 mb-2">
                                              <Video className="size-3" style={{ color: theme.accent }} />
                                              <span className="font-bold uppercase tracking-wider text-[9px]" style={{ color: theme.accent }}>Interview Schedule</span>
                                            </div>
                                            <p className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                                              {new Date(app.interview_schedule.date).toLocaleDateString()} at {app.interview_schedule.time?.slice(0, 5)}
                                            </p>
                                            <div className="flex flex-col gap-0.5 text-xs">
                                              {app.interview_schedule.mode && (
                                                <p className="capitalize text-muted-foreground">{app.interview_schedule.mode}</p>
                                              )}
                                              {app.interview_schedule.interviewer_name && (
                                                <p className="text-muted-foreground">{app.interview_schedule.interviewer_name}</p>
                                              )}
                                              {app.interview_schedule.status && (
                                                <p className="font-medium capitalize mt-0.5" style={{ color: theme.accent }}>{app.interview_schedule.status}</p>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs pt-2.5 border-t" style={{ borderColor: theme.border + '50' }}>
                                          <span className="font-medium" style={{ color: theme.textMuted }}>Manager Review:</span>
                                          <span className="font-bold capitalize px-1.5 py-0.5 rounded text-[10px]" style={{ 
                                            color: reviewColor, 
                                            background: reviewColor + '12'
                                          }}>
                                            {app.manager_review_status || 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                           ) : (
                              <div className="py-4 text-center">
                                <p className="text-xs" style={{ color: theme.textMuted }}>No past candidate application data found.</p>
                              </div>
                           )}
                         </div>
                       </div>
                     )}
                   </div>
                 )})}
              </div>
            )}

            {rightTab === 'job' && !selectedJobId && !detailLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground animate-in fade-in">
                <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 border border-border/50">
                  <Briefcase className="size-8 opacity-50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">No Job Selected</h3>
                <p className="text-sm max-w-[280px]">Select a job position from the left to view its detailed requirements here.</p>
              </div>
            )}

            {rightTab === 'job' && detailLoading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
              </div>
            )}

            {rightTab === 'job' && !detailLoading && selectedJobDetail && (
              <div className="rounded-xl p-6 space-y-6 shadow-sm bg-background border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2" style={{ borderColor: theme.border }}>
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
             disabled={submitting || !selectedJobId || candidateIds.length === 0}
          >
             {submitting ? (
               <>
                 <Loader2 className="mr-2 size-4 animate-spin" />
                 Submitting...
               </>
             ) : `Submit ${candidateIds.length} Candidate${candidateIds.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
