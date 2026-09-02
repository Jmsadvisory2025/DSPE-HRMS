import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { theme } from '@/config/theme';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClientHeaderProps {
  totalClients: number;
  selectedCount?: number;
  deleting?: boolean;
  onDeleteSelected?: () => void;
}

const ClientHeader = ({ totalClients, selectedCount = 0, deleting = false, onDeleteSelected }: ClientHeaderProps) => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    if (onDeleteSelected) onDeleteSelected();
  };

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
        {selectedCount > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 animate-in fade-in"
              style={{ color: theme.destructive, borderColor: theme.destructive + '50', background: theme.destructive + '10' }}
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              <span>Delete Selected ({selectedCount})</span>
            </Button>
            
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {selectedCount} selected {selectedCount === 1 ? 'client' : 'clients'}? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleConfirmDelete}
                    style={{ background: theme.destructive, color: '#fff' }}
                  >
                    Confirm Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
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
