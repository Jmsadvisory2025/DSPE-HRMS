import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Briefcase, MapPin, Calendar, FileText, Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions } from '@/redux/actions';
import { setDetailLoading, setSelectedJob, setError } from '@/redux/slices/positionSlice';
import type { JobDetail } from '@/types/position.types';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();
  const dispatch = useAppDispatch();

  const { selectedJob: job, detailLoading } = useAppSelector((state) => state.positions);

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
    return () => {
      dispatch(setSelectedJob(null));
    };
  }, [dispatch, jobId]);

  if (detailLoading || !job) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/positions')}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors mb-2"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
      >
        <ArrowLeft className="size-3.5" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
            {job.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {job.code} · {job.client_name || 'Self'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 font-medium capitalize"
            style={{
              color: job.status.toLowerCase() === 'open' ? theme.info : theme.textPrimary,
              background: job.status.toLowerCase() === 'open' ? theme.infoSoft : theme.surfaceMuted,
              borderColor: job.status.toLowerCase() === 'open' ? theme.info + '50' : theme.border,
            }}
          >
            {job.status.replace('_', ' ')}
          </Badge>
          {!isRecruiter && (
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate(`/positions/${job.id}/edit`)}
            >
              Edit
            </Button>
          )}
          <Button size="sm">
            Submit Candidate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider" style={{ color: theme.textMuted }}>OPENINGS</span>
            <Users className="size-4" style={{ color: theme.textMuted }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{job.openings}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider" style={{ color: theme.textMuted }}>EXPERIENCE</span>
            <Briefcase className="size-4" style={{ color: theme.textMuted }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{job.min_experience}-{job.max_experience} yrs</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider" style={{ color: theme.textMuted }}>BUDGET</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: theme.accent }}>
            {job.budget ? (parseFloat(job.budget) / 100000).toFixed(1) + ' LPA' : 'N/A'}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-wider" style={{ color: theme.textMuted }}>PRIORITY</span>
          </div>
          <div className="text-2xl font-bold uppercase" style={{ color: job.priority.toLowerCase() === 'high' ? theme.destructive : (job.priority.toLowerCase() === 'medium' ? theme.warning : theme.success) }}>
            {job.priority}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Details Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>Job details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                <span className="text-sm" style={{ color: theme.textSecondary }}>{job.location} · {job.job_mode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                <span className="text-sm capitalize" style={{ color: theme.textSecondary }}>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 shrink-0" style={{ color: theme.textMuted }} />
                <span className="text-sm" style={{ color: theme.textSecondary }}>Target: {job.target_closing_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: theme.textSecondary }}>Notice: <strong style={{ color: theme.textPrimary }}>{job.notice_period_preference}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: theme.textSecondary }}>Skills match ≥ {job.skill_criteria}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: theme.textSecondary }}>Education: <strong style={{ color: theme.textPrimary }}>{job.education}</strong></span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold tracking-wider mb-2 uppercase" style={{ color: theme.textMuted }}>Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills && job.skills.length > 0 ? job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="text-xs px-2.5 py-1 border-0 font-medium"
                    style={{ color: theme.chart2, background: theme.chart2 + '15' }}
                  >
                    {skill}
                  </Badge>
                )) : <span className="text-sm" style={{ color: theme.textMuted }}>No skills specified</span>}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-wider mb-2 uppercase" style={{ color: theme.textMuted }}>Job Description</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: theme.textSecondary }}>
                {job.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Recruiters & Meta */}
        <div className="space-y-4">
          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>Assigned recruiters</h3>
            <div className="space-y-3">
              {job.assigned_recruiters && job.assigned_recruiters.length > 0 ? (
                job.assigned_recruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className="rounded-lg p-3"
                    style={{ border: `1px solid ${theme.border}` }}
                  >
                    <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{recruiter.name}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>{recruiter.email}</p>
                    <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: theme.textMuted }}>{recruiter.role}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center py-4" style={{ color: theme.textMuted }}>No recruiters assigned yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl p-6" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
            <h3 className="font-semibold mb-4" style={{ color: theme.textPrimary }}>Meta Information</h3>
            <div className="space-y-4 text-sm" style={{ color: theme.textSecondary }}>
              {job.created_by && (
                <div>
                  <p className="text-xs font-bold tracking-wider mb-1 uppercase" style={{ color: theme.textMuted }}>Created By</p>
                  <p className="font-medium" style={{ color: theme.textPrimary }}>{job.created_by.name}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{job.created_by.email}</p>
                </div>
              )}
              {job.created_at && (
                <div>
                  <p className="text-xs font-bold tracking-wider mb-1 uppercase" style={{ color: theme.textMuted }}>Created At</p>
                  <p>{new Date(job.created_at).toLocaleString()}</p>
                </div>
              )}
              {job.updated_at && (
                <div>
                  <p className="text-xs font-bold tracking-wider mb-1 uppercase" style={{ color: theme.textMuted }}>Last Updated</p>
                  <p>{new Date(job.updated_at).toLocaleString()}</p>
                </div>
              )}
              {job.organization && (
                <div>
                  <p className="text-xs font-bold tracking-wider mb-1 uppercase" style={{ color: theme.textMuted }}>Organization ID</p>
                  <p className="text-xs font-mono break-all">{job.organization}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold tracking-wider mb-1 uppercase" style={{ color: theme.textMuted }}>Job ID</p>
                <p className="text-xs font-mono break-all">{job.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
        <div className="p-5 border-b" style={{ borderColor: theme.border }}>
          <h3 className="font-semibold" style={{ color: theme.textPrimary }}>Pipeline ({job.candidate_count})</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase" style={{ background: theme.surfaceMuted, color: theme.textMuted }}>
              <tr>
                <th className="px-5 py-3 font-semibold">Candidate</th>
                <th className="px-5 py-3 font-semibold">Stage</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(!job.stages || job.stages.length === 0) ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center" style={{ color: theme.textMuted }}>
                    No candidates submitted yet.
                  </td>
                </tr>
              ) : (
                job.stages.map((candidate: any, index: number) => {
                  return (
                    <tr
                      key={index}
                      style={{
                        borderTop: index !== 0 ? `1px solid ${theme.border}` : 'none',
                      }}
                    >
                      <td className="px-5 py-4 font-medium" style={{ color: theme.textPrimary }}>
                        —
                      </td>
                      <td className="px-5 py-4" style={{ color: theme.textSecondary }}>
                        —
                      </td>
                      <td className="px-5 py-4">
                        —
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
