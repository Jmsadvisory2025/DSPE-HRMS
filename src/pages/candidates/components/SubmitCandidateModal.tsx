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
    }
  }, [isOpen, dispatch]);

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
      <DialogContent showCloseButton={!submitting}>
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
                <SelectValue placeholder={jobsLoading ? "Loading jobs..." : "Select a job..."} />
             </SelectTrigger>
             <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                     {job.title} {job.client_name ? `(${job.client_name})` : ''}
                  </SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        <DialogFooter>
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
