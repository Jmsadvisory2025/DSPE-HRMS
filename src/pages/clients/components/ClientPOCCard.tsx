import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { theme } from '@/config/theme';
import type { POC } from '@/types/client.types';

interface ClientPOCCardProps {
  title: string;
  poc: POC;
  accentColor?: string;
}

const ClientPOCCard = ({ title, poc, accentColor = theme.accent }: ClientPOCCardProps) => {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: theme.textPrimary }}
      >
        {title}
      </h3>

      <div className="mb-3">
        <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {poc.name}
        </p>
        {poc.designation && (
          <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
            {poc.designation}
          </p>
        )}
      </div>

      <div className="mt-2 space-y-1.5">
        {poc.email && (
          <a
            href={`mailto:${poc.email}`}
            className="flex items-center gap-2 text-xs hover:underline"
            style={{ color: theme.accent }}
          >
            <Mail className="size-3" />
            {poc.email}
          </a>
        )}
        {poc.contact && (
          <a
            href={`tel:${poc.contact}`}
            className="flex items-center gap-2 text-xs hover:underline"
            style={{ color: theme.accent }}
          >
            <Phone className="size-3" />
            {poc.contact}
          </a>
        )}
      </div>
    </div>
  );
};

export default ClientPOCCard;
