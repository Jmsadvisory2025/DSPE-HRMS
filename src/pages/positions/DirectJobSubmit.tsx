import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UploadCloud, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions } from '@/redux/actions';
import { setDetailLoading, setSelectedJob, setError } from '@/redux/slices/positionSlice';
import type { JobDetail } from '@/types/position.types';
import { toast } from 'sonner';

const DirectJobSubmit = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { selectedJob: job, detailLoading } = useAppSelector((state) => state.positions);

  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [synopsis, setSynopsis] = useState('');
  const [currentCtc, setCurrentCtc] = useState('');
  const [expectedCtc, setExpectedCtc] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');

  // Fetch job details to display the job title
  useEffect(() => {
    if (jobId) {
      dispatch({
        type: positionActions.FETCH_JOB_DETAIL,
        method: 'GET',
        endPoint: `/api/v1/jobs/${jobId}/`,
        auth: true,
        setLoading: (val: boolean) => dispatch(setDetailLoading(val)),
        getResponse: (data: JobDetail) => dispatch(setSelectedJob(data)),
        getError: (err: any) => dispatch(setError(err.message)),
      });
    }
  }, [dispatch, jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Limit to 1 file
      setResume(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId) {
      toast.error('Job ID is missing.');
      return;
    }
    if (!resume) {
      toast.error('Please upload a resume.');
      return;
    }
    if (!currentCtc.trim()) {
      toast.error('Current CTC is required.');
      return;
    }
    if (!expectedCtc.trim()) {
      toast.error('Expected CTC is required.');
      return;
    }
    if (!noticePeriod.trim()) {
      toast.error('Notice Period is required.');
      return;
    }

    const formData = new FormData();
    formData.append('job_id', jobId);
    formData.append('resume', resume);
    if (synopsis.trim()) formData.append('synopsis', synopsis.trim());
    formData.append('current_ctc', currentCtc.trim());
    formData.append('expected_ctc', expectedCtc.trim());
    formData.append('notice_period', noticePeriod.trim());

    setLoading(true);

    dispatch({
      type: 'SUBMIT_CANDIDATE', // Generic action type
      method: 'POST',
      endPoint: '/api/v1/candidates/add-and-apply/',
      auth: true,
      body: formData,
      setLoading: (val: boolean) => {
        if (!val) setLoading(false);
      },
      getResponse: (res: any) => {
        let msg = 'Candidate submitted successfully!';
        if (res?.past_jobs && res.past_jobs.length > 0) {
          const candidateName = res.past_jobs[0].candidate_name;
          const jobTitle = job?.title || res.past_jobs[0].job_title;
          msg = `${candidateName} successfully uploaded to ${jobTitle}`;
        } else if (res?.message) {
          msg = res.message;
        }
        
        toast.success(msg);
        navigate(`/approvals/${jobId}`);
      },
      getError: (err: any) => {
        console.error('Failed to submit candidate:', err);
        const errData = err?.response?.data;
        if (errData?.errors && Array.isArray(errData.errors)) {
           toast.error(
             <div className="flex flex-col gap-1">
               <span className="font-semibold">{errData.message || "Validation Error"}</span>
               <ul className="list-disc pl-4 text-sm opacity-90">
                 {errData.errors.map((msg: string, i: number) => <li key={i}>{msg}</li>)}
               </ul>
             </div>,
             { duration: 6000 }
           );
        } else {
           toast.error(errData?.message || errData?.detail || errData?.error || 'Failed to submit candidate.');
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`/positions/${jobId}`)}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors mb-2"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
      >
        <ArrowLeft className="size-3.5" />
        Back to Job
      </button>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
          Submit Candidate
        </h1>
        {detailLoading ? (
          <div className="h-5 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: theme.textMuted }} />
            <span className="text-sm" style={{ color: theme.textMuted }}>Loading position details...</span>
          </div>
        ) : job ? (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            You're submitting a candidate for the <strong style={{ color: theme.textPrimary }}>{job.title}</strong> position.
          </p>
        ) : (
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Job not found.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 rounded-xl shadow-sm border" style={{ borderColor: theme.border, background: theme.surface }}>
        
        {/* Resume Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Candidate Resume <span className="text-red-500">*</span>
          </label>
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${isDragging ? 'bg-accent/10 border-accent' : resume ? 'bg-accent/5 border-accent' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            style={{ borderColor: (isDragging || resume) ? theme.accent : theme.border }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {resume ? (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: theme.accentSoft, color: theme.accent }}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{resume.name}</p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Click to change file</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: theme.surfaceMuted, color: theme.textSecondary }}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  {isDragging ? 'Drop resume here' : 'Click or drag and drop to upload resume'}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Supports PDF, DOC, DOCX</p>
              </>
            )}
          </div>
        </div>

        {/* Synopsis */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Synopsis <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Textarea 
            placeholder="Recruiter's summary or synopsis of the candidate..."
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            className="min-h-[100px] resize-y text-sm"
          />
        </div>

        {/* Grid Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              Current CTC <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="e.g. 12 LPA"
              value={currentCtc}
              onChange={(e) => setCurrentCtc(e.target.value)}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              Expected CTC <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="e.g. 15 LPA"
              value={expectedCtc}
              onChange={(e) => setExpectedCtc(e.target.value)}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              Notice Period <span className="text-red-500">*</span>
            </label>
            <Input 
              placeholder="e.g. 30 Days"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value)}
              className="text-sm"
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t flex items-center justify-end gap-3" style={{ borderColor: theme.border }}>
          <Button 
            type="button"
            variant="outline"
            onClick={() => navigate(`/positions/${jobId}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || !resume || !job}
            style={{ background: theme.accent, color: theme.accentForeground }}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Candidate'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DirectJobSubmit;
