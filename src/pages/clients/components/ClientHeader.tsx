import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/config/theme';
import axios from 'axios';

interface ClientHeaderProps {
  totalClients: number;
}

const ClientHeader = ({ totalClients }: ClientHeaderProps) => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const loginDataRaw = localStorage.getItem('RecruitOS_Login_Data');
      const token = loginDataRaw ? JSON.parse(loginDataRaw)?.accessToken : null;

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/clients/export/`,
        {
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'clients_export.xlsx';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      // Trigger file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Clients exported successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export clients');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: theme.textPrimary }}
        >
          Clients
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
          {totalClients} clients on the roster
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={exporting}
          onClick={handleExport}
        >
          {exporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span>Export</span>
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/clients/new')}>
          <Plus className="size-3.5" />
          <span>Add Client</span>
        </Button>
      </div>
    </div>
  );
};

export default ClientHeader;
