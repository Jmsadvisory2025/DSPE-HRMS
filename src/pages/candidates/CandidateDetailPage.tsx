import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Briefcase, MapPin, Building2, User, FileText, CheckCircle2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { CANDIDATES } from './data';
import { useAuth } from '@/context/AuthContext';

const CandidateDetailPage = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();

  const candidate = CANDIDATES.find((c) => c.id === Number(candidateId));

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>Candidate Not Found</h2>
        <Button onClick={() => navigate('/candidates')}>Back to Candidates</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto">
      {/* Header / Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 h-9 w-9">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
              {candidate.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium" style={{ color: theme.accent }}>{candidate.role}</span>
              <span className="text-xs" style={{ color: theme.textMuted }}>•</span>
              <span className="text-sm" style={{ color: theme.textSecondary }}>{candidate.company}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isRecruiter && (
            <Button variant="outline" size="sm" className="h-9">
              Edit Candidate
            </Button>
          )}
          <Button size="sm" className="h-9 gap-1.5" style={{ background: theme.accent, color: theme.accentForeground }}>
            <FileText className="size-4" />
            View Resume
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div
            className="rounded-xl p-6"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>Candidate Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs" style={{ color: theme.textMuted }}>Experience</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.experience}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: theme.textMuted }}>Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4" style={{ color: theme.textSecondary }} />
                  <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.location}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: theme.textMuted }}>Current CTC</p>
                <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.ctcCurrent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: theme.textMuted }}>Expected CTC</p>
                <p className="text-sm font-medium" style={{ color: theme.success }}>{candidate.ctcExpected}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t space-y-4" style={{ borderColor: theme.border }}>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Segment / Industry</p>
                <Badge variant="outline" style={{ color: theme.info, borderColor: theme.info + '50', background: theme.info + '10' }}>
                  {candidate.segment}
                </Badge>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Uploaded By</p>
                <div className="flex items-center gap-2">
                  <User className="size-4" style={{ color: theme.textSecondary }} />
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>{candidate.uploadedBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Pipeline */}
        <div className="space-y-6">
          <div
            className="rounded-xl p-6"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: theme.textPrimary }}>Status</h3>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="size-5" style={{ color: theme.success }} />
              <div>
                <p className="text-sm font-medium" style={{ color: theme.success }}>Active Candidate</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>Ready for submission</p>
              </div>
            </div>

            <h3 className="text-sm font-bold mb-3" style={{ color: theme.textPrimary }}>Active Applications</h3>
            {/* Mock pipeline application */}
            <div className="p-3 rounded-lg border flex flex-col gap-2" style={{ borderColor: theme.border, background: theme.surfaceMuted }}>
              <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>Senior Wealth Manager</p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>HDFC Securities</p>
              <Badge variant="outline" className="w-fit text-[10px]" style={{ color: theme.warning, borderColor: theme.warning, background: theme.warning + '10' }}>
                Pending Approval
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
