import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Phone, Mail, Calendar, Percent, Clock, RefreshCw, Award,
  Link as LinkIcon, MapPin, Briefcase, File, UserCheck, Users
} from 'lucide-react';
import { theme } from '@/config/theme';
import type { ClientDetail } from '@/types/client.types';
import ClientPOCCard from './ClientPOCCard';

interface ClientOverviewProps {
  client: ClientDetail;
}

/* ── Detail row helper ────────────────────────────────────────── */
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="size-4 mt-0.5 shrink-0" style={{ color: theme.textMuted }} />
    <div className="min-w-0">
      <p className="text-xs" style={{ color: theme.textMuted }}>
        {label}
      </p>
      <div className="text-sm font-medium" style={{ color: theme.textSecondary }}>
        {value}
      </div>
    </div>
  </div>
);

const ClientOverview = ({ client }: ClientOverviewProps) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="p-3 rounded-lg" style={{ background: theme.accentSoft, color: theme.accent }}>
            <Briefcase className="size-5" />
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Open Jobs</p>
            <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{client.stats?.open_jobs || 0}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="p-3 rounded-lg" style={{ background: theme.chart2 + '20', color: theme.chart2 }}>
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Candidates Submitted</p>
            <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{client.stats?.candidates_submitted || 0}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <div className="p-3 rounded-lg" style={{ background: theme.successSoft, color: theme.success }}>
            <UserCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>Hired</p>
            <p className="text-xl font-bold" style={{ color: theme.textPrimary }}>{client.stats?.hired_count || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Details Panel ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className="rounded-xl p-6"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Contact & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <DetailRow icon={Mail} label="Email" value={client.email || '—'} />
              <DetailRow icon={Phone} label="Phone" value={client.contact || '—'} />
              <DetailRow icon={MapPin} label="Address" value={[client.street, client.city, client.state, client.postal_code, client.country].filter(Boolean).join(', ') || '—'} />
            </div>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>
              Commercials & Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <DetailRow icon={Building2} label="Industry" value={client.industry || '—'} />
              <DetailRow icon={Building2} label="GST" value={client.gst_number || '—'} />
              <DetailRow icon={Calendar} label="Agreement Date" value={client.agreement_date ? new Date(client.agreement_date).toLocaleDateString() : '—'} />
              <DetailRow icon={File} label="Document" value={
                client.agreement_document ? (
                  <a href={client.agreement_document} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline transition-opacity hover:opacity-80" style={{ color: theme.accent }}>
                    <LinkIcon className="size-3 shrink-0" />
                    <span className="truncate max-w-[150px] font-medium" title={client.agreement_document_name}>{client.agreement_document_name || 'Download Agreement'}</span>
                  </a>
                ) : '—'
              } />
              <DetailRow icon={Percent} label="Commercials" value={client.commercial_decided || 'N/A'} />
              <DetailRow icon={Clock} label="Payment period" value={client.payment_period_days ? `${client.payment_period_days} days` : '—'} />
              <DetailRow icon={RefreshCw} label="Replacement" value={client.replacement_period_days ? `${client.replacement_period_days} days` : '—'} />
              <DetailRow icon={Award} label="Status" value={<span className="capitalize">{client.status || '—'}</span>} />
            </div>
            
            {client.notes && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
                <p className="text-xs mb-1" style={{ color: theme.textMuted }}>Notes</p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>{client.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── POC Cards ─────────────────────────────────────────── */}
        <div className="space-y-4">
          {client.pocs?.hiring && client.pocs.hiring.map((poc, idx) => (
            <ClientPOCCard
              key={poc.id || `hiring-${idx}`}
              title="Hiring POC"
              poc={poc}
              accentColor={theme.success}
            />
          ))}
          {client.pocs?.payment && client.pocs.payment.map((poc, idx) => (
            <ClientPOCCard
              key={poc.id || `payment-${idx}`}
              title="Payment POC"
              poc={poc}
              accentColor={theme.chart2}
            />
          ))}
          
          {/* Team Members List (Overview) */}
          {client.team_members && client.team_members.length > 0 && (
             <div className="rounded-xl p-5" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: theme.textPrimary }}>
                   <Users className="size-4" style={{ color: theme.accent }} />
                   Internal Team Members
                 </h3>
                 <button
                   onClick={() => navigate(`/clients/${client.id}/edit`)}
                   className="text-xs font-medium hover:underline"
                   style={{ color: theme.accent }}
                 >
                   Update
                 </button>
               </div>
               <div className="space-y-2">
                 {client.team_members.map((member, idx) => (
                   <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5">
                     <div className="min-w-0 flex-1 pr-3">
                       <p className="font-medium truncate" style={{ color: theme.textSecondary }}>{member.name}</p>
                       <p className="text-xs truncate mt-0.5" style={{ color: theme.textMuted }}>{member.email}</p>
                     </div>
                     <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accent}30` }}>
                       {member.role || 'Member'}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientOverview;
