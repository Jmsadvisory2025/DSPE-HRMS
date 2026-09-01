import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Mail, Phone, Calendar } from 'lucide-react';
import { theme } from '@/config/theme';
import type { Client } from '@/types/client.types';

/* ── Industry icon color mapping ──────────────────────────────── */
const INDUSTRY_COLORS: Record<string, string> = {
  'Broking':              '#a78bfa',
  'Wealth Management':    '#6ee7b7',
  'AMC':                  '#38bdf8',
  'NBFC':                 '#818cf8',
  'Banking':              '#fbbf24',
  'Insurance':            '#67e8f9',
  'Investment Banking':   '#f0abfc',
};

interface ClientCardProps {
  client: Client;
}

const ClientCard = ({ client }: ClientCardProps) => {
  const navigate = useNavigate();
  const iconColor = INDUSTRY_COLORS[client.industry] || theme.accent;

  const locationStr = [client.city, client.state, client.country].filter(Boolean).join(', ');

  return (
    <div
      onClick={() => navigate(`/clients/${client.id}`)}
      className="rounded-xl p-5 cursor-pointer flex flex-col justify-between gap-4 transition-all duration-200"
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
      {/* Top row — Name + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconColor + '18' }}
          >
            <Building2 className="size-4" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="flex items-center gap-2"
              style={{ color: theme.textPrimary }}
            >
              <span className="text-sm font-semibold truncate">
                {client.company_name}
              </span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-sm shrink-0" style={{ background: theme.surfaceMuted, color: theme.textMuted }}>
                {client.client_id}
              </span>
            </div>
            <p className="text-xs truncate mt-0.5" style={{ color: theme.textMuted }}>
              {client.industry || locationStr || "No Industry"}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 shrink-0 font-medium"
          style={{
            borderColor: theme.accent + '40',
            color: theme.accent,
            background: theme.accent + '15',
          }}
        >
          {client.open_jobs_count || 0} Open Jobs
        </Badge>
      </div>

      {/* Middle — Contact & Location */}
      <div className="flex flex-col gap-2 pt-2">
        {client.email && (
          <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
            <Mail className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.contact && (
          <div className="flex items-center gap-2 text-xs" style={{ color: theme.textSecondary }}>
            <Phone className="size-3.5 shrink-0" style={{ color: theme.textMuted }} />
            <span>{client.contact}</span>
          </div>
        )}
      
      </div>

      {/* Bottom — POC and Date */}
      <div
        className="pt-3 mt-1 flex items-center justify-between"
        style={{ borderTop: `1px solid ${theme.border}` }}
      >
        <p className="text-xs" style={{ color: theme.textMuted }}>
          Created By:{' '}
          <span style={{ color: theme.textSecondary }}>{client.created_by_name}</span>
        </p>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
          <Calendar className="size-3 shrink-0" />
          <span>{new Date(client.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;
