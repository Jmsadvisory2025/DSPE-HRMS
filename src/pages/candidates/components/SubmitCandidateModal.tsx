import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Briefcase, MapPin, IndianRupee, Clock, Building2, GraduationCap, Download, Users, FileText } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions, candidateActions } from '@/redux/actions';
import { setJobs, setLoading as setJobsLoading } from '@/redux/slices/positionSlice';
import { theme } from '@/config/theme';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | null;
}

export const SubmitCandidateModal = ({ isOpen, onClose, candidateId }: Props) => {
  const dispatch = useAppDispatch();
  const { jobs, loading: jobsLoading } = useAppSelector((state) => state.positions);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedJobId('');
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
    } else {
      setSelectedJobDetail(null);
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
    if (!candidateId || !selectedJobId) return;
    
    setSubmitting(true);
    dispatch({
      type: candidateActions.SUBMIT_CANDIDATE,
      method: 'POST',
      endPoint: '/api/v1/candidates/applications/',
      auth: true,
      body: {
        candidate_id: candidateId,
        job_id: selectedJobId
      },
      showSuccessMessage: true,
      setLoading: (val: boolean) => {
         if (!val) setSubmitting(false);
      },
      getResponse: () => {
         onClose();
      },
      getError: (err: any) => {
         console.error("Failed to submit candidate", err);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-[600px] w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Submit Candidate</DialogTitle>
          <DialogDescription>
             Select a job position to submit this candidate to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
           <label className="text-sm font-medium" style={{ color: theme.textSecondary }}>Job Position</label>
           <Select value={selectedJobId} onValueChange={setSelectedJobId} disabled={submitting || jobsLoading}>
             <SelectTrigger className="w-full">
                <SelectValue placeholder={jobsLoading ? "Loading jobs..." : "Select a job..."}>
                  {selectedJobDetail 
                    ? `${selectedJobDetail.title} ${selectedJobDetail.client?.name ? `(${selectedJobDetail.client.name})` : ''}` 
                    : undefined}
                </SelectValue>
             </SelectTrigger>
             <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                     {job.title} {job.client?.name ? `(${job.client.name})` : ''}
                  </SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        {/* Job Details Section */}
        {detailLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin" style={{ color: theme.accent }} />
          </div>
        )}

        {!detailLoading && selectedJobDetail && (
          <div className="rounded-lg p-5 space-y-4 mt-4 overflow-y-auto shadow-sm" style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}` }}>
            {/* Header / Title */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-semibold text-lg leading-tight" style={{ color: theme.textPrimary }}>{selectedJobDetail.title}</h4>
                <div className="flex items-center gap-2 mt-1.5 text-sm" style={{ color: theme.textSecondary }}>
                  <Building2 className="size-3.5" />
                  <span>{selectedJobDetail.client?.name || 'Internal'}</span>
                  <span style={{ color: theme.textMuted }}>•</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: theme.surfaceMuted }}>{selectedJobDetail.code}</span>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 ml-1" style={{ borderColor: selectedJobDetail.status === 'open' ? theme.success : theme.border, color: selectedJobDetail.status === 'open' ? theme.success : theme.textSecondary }}>
                    {selectedJobDetail.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Core Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-4 pb-2" style={{ borderTop: `1px solid ${theme.border}` }}>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.textMuted }}><Briefcase className="size-3.5" /> Experience</div>
                <p style={{ color: theme.textPrimary }}>{selectedJobDetail.min_experience} - {selectedJobDetail.max_experience} Yrs</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.textMuted }}><MapPin className="size-3.5" /> Location</div>
                <p style={{ color: theme.textPrimary }}>{selectedJobDetail.location}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.textMuted }}><IndianRupee className="size-3.5" /> Budget</div>
                <p style={{ color: theme.textPrimary }}>{selectedJobDetail.budget}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: theme.textMuted }}><Clock className="size-3.5" /> Openings</div>
                <p style={{ color: theme.textPrimary }}>{selectedJobDetail.openings}</p>
              </div>
            </div>

            {/* Additional Info Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
               {selectedJobDetail.education && (
                 <div className="flex items-start gap-2 p-2.5 rounded-md" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                   <GraduationCap className="size-4 shrink-0 mt-0.5" style={{ color: theme.textSecondary }} />
                   <div>
                     <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Education</p>
                     <p className="text-xs mt-0.5 line-clamp-2" style={{ color: theme.textPrimary }}>{selectedJobDetail.education}</p>
                   </div>
                 </div>
               )}
               {selectedJobDetail.client?.team_member && (
                 <div className="flex items-start gap-2 p-2.5 rounded-md" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                   <Users className="size-4 shrink-0 mt-0.5" style={{ color: theme.textSecondary }} />
                   <div>
                     <p className="text-xs font-medium" style={{ color: theme.textMuted }}>Client POC (HR)</p>
                     <p className="text-xs mt-0.5" style={{ color: theme.textPrimary }}>{selectedJobDetail.client.team_member.name}</p>
                   </div>
                 </div>
               )}
            </div>

            {/* Description File */}
            {selectedJobDetail.description_file && (
              <div className="pt-2">
                <a 
                  href={selectedJobDetail.description_file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline p-2 rounded-md transition-colors"
                  style={{ color: theme.accent, background: theme.accent + '15' }}
                >
                  <FileText className="size-3.5" />
                  View Job Description File
                  <Download className="size-3 ml-1" />
                </a>
              </div>
            )}

            {/* Skills */}
            {selectedJobDetail.skills && selectedJobDetail.skills.length > 0 && (
              <div className="pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobDetail.skills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs font-medium px-2 py-0.5" style={{ background: theme.surface, color: theme.textPrimary, border: `1px solid ${theme.border}` }}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Team Members assigned */}
            {selectedJobDetail.assigned_recruiters && selectedJobDetail.assigned_recruiters.length > 0 && (
              <div className="pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                 <p className="text-xs font-medium mb-2" style={{ color: theme.textMuted }}>Assigned Recruiters</p>
                 <div className="flex flex-wrap gap-2">
                    {selectedJobDetail.assigned_recruiters.map((recruiter: any, i: number) => (
                       <div key={i} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
                          {recruiter.avatar ? (
                             <img src={recruiter.avatar} alt="avatar" className="size-4 rounded-full object-cover" />
                          ) : (
                             <div className="size-4 rounded-full bg-black/10 flex items-center justify-center text-[8px] font-bold uppercase">{recruiter.name.substring(0, 2)}</div>
                          )}
                          <span style={{ color: theme.textSecondary }}>{recruiter.name}</span>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button 
             style={{ background: theme.accent, color: theme.accentForeground }} 
             onClick={handleSubmit}
             disabled={submitting || !selectedJobId}
          >
             {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
