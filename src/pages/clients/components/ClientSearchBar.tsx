import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { theme } from '@/config/theme';

interface ClientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const ClientSearchBar = ({ value, onChange }: ClientSearchBarProps) => {
  return (
    <div className="relative max-w-[360px]">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
        style={{ color: theme.textMuted }}
      />
      <Input
        placeholder="Search clients by name or industry..."
        className="pl-9 text-sm"
        style={{
          background: theme.surface,
          borderColor: theme.border,
          color: theme.textPrimary,
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default ClientSearchBar;
