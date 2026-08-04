import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions, clientActions } from '@/redux/actions';
import { setJobs, setLoading, setError } from '@/redux/slices/positionSlice';
import type { JobResponse } from '@/types/position.types';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/config/theme';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';

const ApprovalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.positions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [clientsData, setClientsData] = useState<{client: {client_id: string, name: string}}[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    dispatch({
      type: clientActions.FETCH_CLIENTS,
      method: "GET",
      endPoint: "/api/v1/clients/general-dropdown/",
      auth: true,
      setLoading: (val: boolean) => setClientsLoading(val),
      getResponse: (data: any) => {
        if (data && data.clients_details) {
          setClientsData(data.clients_details);
        }
      },
      getError: (err: any) => console.error('Error fetching clients dropdown:', err),
    });
  }, [dispatch]);

  useEffect(() => {
    let endpoint = '/api/v1/jobs/?';
    if (debouncedSearch) endpoint += `search=${encodeURIComponent(debouncedSearch)}&`;
    if (selectedClient) endpoint += `client=${encodeURIComponent(selectedClient)}&`;

    dispatch({
      type: positionActions.FETCH_JOBS,
      method: 'GET',
      endPoint: endpoint,
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch, debouncedSearch, selectedClient]);

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clientsData.map(c => ({
      value: c.client.client_id,
      label: c.client.name,
    }))
  ];

  const filteredPositions = jobs; // Filter handled by backend now

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Approvals
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Select a job to review pending applications.
          </p>
        </div>
      </div>

      {/* Search & Client Filter */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-full sm:w-48 shrink-0">
          <SearchableDropdown
            options={clientOptions}
            value={selectedClient}
            onChange={setSelectedClient}
            placeholder="All Clients"
            loading={clientsLoading}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: theme.textMuted }}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, location, or status..."
            className="pl-9 text-sm"
            style={{
              background: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="size-8 animate-spin" style={{ color: theme.accent }} />
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
          <Table>
            <TableHeader style={{ background: theme.surfaceMuted }}>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8" style={{ color: theme.textMuted }}>
                    No jobs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPositions.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/approvals/${job.id}`)}
                  >
                    <TableCell className="font-medium" style={{ color: theme.accent }}>
                      {job.code}
                    </TableCell>
                    <TableCell style={{ color: theme.textPrimary }}>
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>
                        Exp: {job.min_experience}-{job.max_experience} yrs
                      </div>
                    </TableCell>
                    <TableCell style={{ color: theme.textSecondary }}>
                      {job.client?.name || 'Self'}
                    </TableCell>
                    <TableCell style={{ color: theme.textSecondary }} className="capitalize">
                      {job.location}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize"
                        style={{
                          color: job.status.toLowerCase() === 'open' ? theme.info : theme.textMuted,
                          background: job.status.toLowerCase() === 'open' ? theme.infoSoft : theme.surfaceMuted,
                          border: 0,
                        }}
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;