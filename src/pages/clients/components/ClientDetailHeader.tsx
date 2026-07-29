import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Plus, Users } from 'lucide-react';
import { theme } from '@/config/theme';
import type { ClientDetail } from '@/types/client.types';
import TeamMembersModal from './TeamMembersModal';

interface ClientDetailHeaderProps {
  client: ClientDetail;
}

const ClientDetailHeader = ({ client }: ClientDetailHeaderProps) => {
  const navigate = useNavigate();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Back link */}
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: theme.textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
        onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
      >
        <ArrowLeft className="size-3.5" />
        All clients
      </button>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            {client.company_name}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: theme.textMuted }}>
            {client.industry} · {[client.city, client.state, client.country].filter(Boolean).join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className="text-xs px-2.5 py-1 font-medium"
            style={{
              borderColor:
                client.status === 'active'
                  ? theme.success + '50'
                  : theme.textMuted + '50',
              color:
                client.status === 'active' ? theme.success : theme.textMuted,
              background:
                client.status === 'active'
                  ? theme.successSoft
                  : theme.surfaceMuted,
            }}
          >
            {client.status}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate(`/clients/${client.id}/edit`)}
          >
            <Pencil className="size-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsTeamModalOpen(true)}
          >
            <Users className="size-3" />
            Team Members
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => navigate('/positions/new')}
          >
            <Plus className="size-3.5" />
            New Position
          </Button>
        </div>
      </div>

      <TeamMembersModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        clientId={client.id}
        initialTeamMembers={client.team_members || []}
        onSuccess={() => {
          // If you need to refetch client details, trigger it here.
          // Since the Redux store typically updates itself or you can force a refresh.
        }}
      />
    </div>
  );
};

export default ClientDetailHeader;
