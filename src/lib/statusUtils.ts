import { theme } from '@/config/theme';

type JobStatus = 'open' | 'ongoing' | 'close' | 'hold';

interface StatusStyle {
  label: string;
  color: string;
  background: string;
  borderColor: string;
}

export const getJobStatusStyle = (statusStr: string | undefined | null): StatusStyle => {
  const status = (statusStr?.toLowerCase() || 'open') as JobStatus;
  
  switch (status) {
    case 'open':
      return {
        label: 'Open',
        color: theme.success,
        background: theme.success + '15',
        borderColor: theme.success + '50'
      };
    case 'ongoing':
      return {
        label: 'Ongoing',
        color: theme.info,
        background: theme.infoSoft,
        borderColor: theme.info + '50'
      };
    case 'close':
      return {
        label: 'Closed',
        color: theme.textMuted,
        background: theme.surfaceMuted,
        borderColor: theme.border
      };
    case 'hold':
      return {
        label: 'On Hold',
        color: theme.warning,
        background: theme.warning + '15',
        borderColor: theme.warning + '50'
      };
    default:
      return {
        label: statusStr || 'Open',
        color: theme.textPrimary,
        background: theme.surfaceMuted,
        borderColor: theme.border
      };
  }
};
