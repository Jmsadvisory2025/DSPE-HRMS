import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar } from 'lucide-react';
import { theme } from '@/config/theme';
import type { JobPosition } from '../types';

interface JobCardProps {
  job: JobPosition;
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  // Status Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return { color: theme.info, bg: theme.infoSoft, border: theme.info + '50' };
      case 'On Hold': return { color: theme.warning, bg: theme.warningSoft, border: theme.warning + '50' };
      case 'Filled': return { color: theme.success, bg: theme.successSoft, border: theme.success + '50' };
      case 'Closed': return { color: theme.textMuted, bg: theme.surfaceMuted, border: theme.borderStrong };
      default: return { color: theme.textPrimary, bg: theme.surfaceMuted, border: theme.border };
    }
  };

  // Priority Colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return { color: theme.destructive, bg: theme.destructive + '15' };
      case 'Medium': return { color: theme.warning, bg: theme.warningSoft };
      case 'Low': return { color: theme.success, bg: theme.successSoft };
      default: return { color: theme.textPrimary, bg: theme.surfaceMuted };
    }
  };

  const statusColors = getStatusColor(job.status);
  const priorityColors = getPriorityColor(job.priority);

  // Take up to 3 skills, count the rest
  const visibleSkills = job.skills.slice(0, 3);
  const hiddenSkillsCount = job.skills.length - 3;

  return (
    <div
      onClick={() => navigate(`/positions/${job.id}`)}
      className="rounded-xl p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.borderStrong;
        e.currentTarget.style.background = theme.surfaceHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.background = theme.surface;
      }}
    >
      {/* Top Row: Job Code, Priority, Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
            {job.jobCode}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-0 font-medium"
            style={{
              color: priorityColors.color,
              background: priorityColors.bg,
            }}
          >
            {job.priority}
          </Badge>
        </div>
        <Badge
          variant="outline"
          className="text-xs px-2.5 py-0.5 font-medium"
          style={{
            borderColor: statusColors.border,
            color: statusColors.color,
            background: statusColors.bg,
          }}
        >
          {job.status}
        </Badge>
      </div>

      {/* Title & Client */}
      <div>
        <h3 className="text-base font-bold" style={{ color: theme.textPrimary }}>
          {job.designation}
        </h3>
        <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>
          {job.client}
        </p>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-1">
        {/* Row 1 */}
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
          <span className="text-sm" style={{ color: theme.textSecondary }}>{job.location}</span>
        </div>
        <div className="text-right">
          <span className="text-sm" style={{ color: theme.textSecondary }}>
            {job.mode} - {job.type}
          </span>
        </div>

        {/* Row 2 */}
        <div>
          <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            {job.minExperience}-{job.maxExperience} yrs
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
            ₹{job.minBudget}-{job.maxBudget} LPA
          </span>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {visibleSkills.map((skill) => (
          <Badge
            key={skill}
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-0 font-medium"
            style={{ color: theme.chart2, background: theme.chart2 + '15' }}
          >
            {skill}
          </Badge>
        ))}
        {hiddenSkillsCount > 0 && (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-0 font-medium"
            style={{ color: theme.chart2, background: theme.chart2 + '15' }}
          >
            +{hiddenSkillsCount}
          </Badge>
        )}
      </div>

      {/* Recruiters & Date */}
      <div className="flex items-center justify-between mt-2 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-4">
          <User className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
          <span className="text-xs truncate" style={{ color: theme.textSecondary }}>
            {job.recruiters.map(r => r.name.split(' ')[0]).join(', ')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
          <span className="text-xs" style={{ color: theme.textSecondary }}>
            {job.targetDate}
          </span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="text-xs" style={{ color: theme.textMuted }}>
        {job.openings} opening{job.openings > 1 ? 's' : ''} · Skills match ≥ {job.skillsMatch}%
      </div>
    </div>
  );
};

export default JobCard;
