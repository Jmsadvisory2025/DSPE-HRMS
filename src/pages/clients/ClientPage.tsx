import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clientActions } from '@/redux/actions';
import { setClients, setLoading, setError } from '@/redux/slices/clientSlice';
import type { ClientResponse } from '@/types/client.types';
import ClientHeader from './components/ClientHeader';
import { Loader2, Building2, Calendar } from 'lucide-react';
import { theme } from '@/config/theme';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const ClientPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clients, loading } = useAppSelector((state) => state.clients);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Filter input states (what user types)
  const [searchClient, setSearchClient] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchAddedBy, setSearchAddedBy] = useState('');

  // Applied filter states (sent to API on Enter)
  const [appliedClient, setAppliedClient] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedAddedBy, setAppliedAddedBy] = useState('');

  // Focus tracking
  const activeFieldRef = useRef<string | null>(null);
  const clientRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const addedByRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    client: clientRef,
    location: locationRef,
    addedBy: addedByRef,
  };

  // Restore focus after loading finishes
  useEffect(() => {
    if (!loading && activeFieldRef.current) {
      const ref = fieldRefs[activeFieldRef.current];
      if (ref?.current) {
        ref.current.focus();
      }
    }
  }, [loading]);

  const applySearch = () => {
    setAppliedClient(searchClient);
    setAppliedLocation(searchLocation);
    setAppliedAddedBy(searchAddedBy);
  };

  const handleKeyDown = (field: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      activeFieldRef.current = field;
      applySearch();
    }
  };

  // 5-second debounce fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedClient(searchClient);
      setAppliedLocation(searchLocation);
      setAppliedAddedBy(searchAddedBy);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchClient, searchLocation, searchAddedBy]);

  const fetchClients = () => {
    const params = new URLSearchParams();
    const search = [appliedClient, appliedLocation].filter(Boolean).join(' ');
    
    if (search) {
        params.append('search', search);
    }
    
    if (appliedAddedBy) {
        params.append('created_by_name', appliedAddedBy);
    }

    const queryString = params.toString();
    const endPoint = `/api/v1/clients/${queryString ? `?${queryString}` : ''}`;

    dispatch({
      type: clientActions.FETCH_CLIENTS,
      method: "GET",
      endPoint: endPoint,
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: ClientResponse) => dispatch(setClients(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  };

  useEffect(() => {
    fetchClients();
  }, [dispatch, appliedClient, appliedLocation, appliedAddedBy]);

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedIds(prev => 
      selected ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(clients.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0 || !isAdmin) return;
    dispatch({
      type: clientActions.DELETE_CLIENTS,
      method: 'DELETE',
      endPoint: '/api/v1/clients/bulk-delete/',
      auth: true,
      body: { client_ids: selectedIds },
      setLoading: (val: boolean) => setDeleting(val),
      getResponse: (res: any) => {
        toast.success(res?.message || 'Clients deleted successfully');
        setSelectedIds([]);
        fetchClients();
      },
      getError: () => {}
    });
  };

  return (
    <div className="space-y-6">
      <ClientHeader 
        totalClients={clients.length} 
        selectedCount={isAdmin ? selectedIds.length : 0}
        deleting={deleting}
        onDeleteSelected={isAdmin ? handleDeleteSelected : undefined}
      />
      
      {/* Table replacing ClientGrid */}
      <div
        className="rounded-lg border overflow-x-auto"
        style={{
          borderColor: theme.border,
          background: theme.surface,
          minHeight: '500px',
        }}
      >
        <Table style={{ tableLayout: 'fixed', width: '100%', minWidth: '900px' }}>
          <colgroup>
            {isAdmin && <col style={{ width: '40px' }} />}
            <col style={{ width: '35%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '100px' }} />
          </colgroup>
          <TableHeader>
            <TableRow className="hover:bg-transparent" style={{ borderColor: theme.border }}>
              {isAdmin && (
                <TableHead className="pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={clients.length > 0 && selectedIds.length === clients.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
              )}
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                Client
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                Location
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                Created By
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-center pr-4" style={{ color: theme.textMuted }}>
                Jobs
              </TableHead>
            </TableRow>
            
            {/* Filter Row */}
            <TableRow className="hover:bg-transparent" style={{ borderColor: theme.border }}>
              {isAdmin && <TableHead className="py-1.5 px-1"></TableHead>}
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={clientRef}
                  placeholder="Client Name / ID..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  onKeyDown={handleKeyDown('client')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={locationRef}
                  placeholder="Location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={handleKeyDown('location')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={addedByRef}
                  placeholder="Created by name..."
                  value={searchAddedBy}
                  onChange={(e) => setSearchAddedBy(e.target.value)}
                  onKeyDown={handleKeyDown('addedBy')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center">
                  <Loader2 className="size-8 animate-spin mx-auto" style={{ color: theme.accent }} />
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-32 text-center text-sm" style={{ color: theme.textMuted }}>
                  No clients match your search.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                const locationStr = [client.city, client.state, client.country].filter(Boolean).join(', ');

                return (
                  <TableRow
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="cursor-pointer group hover:bg-muted/50"
                    style={{ borderColor: theme.border }}
                  >
                    {isAdmin && (
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                          checked={selectedIds.includes(client.id)}
                          onChange={(e) => handleSelectChange(client.id, e.target.checked)}
                        />
                      </TableCell>
                    )}
                    
                    {/* Client Name + ID */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: theme.accent + '18' }}
                        >
                          <Building2 className="size-4" style={{ color: theme.accent }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate" style={{ color: theme.textPrimary }}>
                              {client.company_name}
                            </span>
                            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-sm shrink-0" style={{ background: theme.surfaceMuted, color: theme.textMuted }}>
                              {client.client_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
                        {locationStr || "No Location"}
                      </p>
                    </TableCell>

                    {/* Added By */}
                    <TableCell>
                      <div className="font-medium text-[13px] truncate" style={{ color: theme.textPrimary }}>
                        {client.created_by_name || "N/A"}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px]" style={{ color: theme.textMuted }}>
                        <Calendar className="size-3 shrink-0" />
                        <span>{client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </TableCell>

                    {/* Jobs */}
                    <TableCell className="text-center pr-4">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-0.5 shrink-0 font-medium"
                        style={{
                          borderColor: theme.accent + '40',
                          color: theme.accent,
                          background: theme.accent + '15',
                        }}
                      >
                        {client.open_jobs_count || 0} Open
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientPage;