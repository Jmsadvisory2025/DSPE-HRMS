import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronDown, Loader2, MoreHorizontal, Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions, clientActions } from '@/redux/actions';
import { setJobs, setLoading, setError } from '@/redux/slices/positionSlice';
import type { JobResponse } from '@/types/position.types';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/config/theme';
import { getJobStatusStyle } from '@/lib/statusUtils';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';
import { toast } from 'sonner';

const JobsPage = () => {
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.positions);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [clientsData, setClientsData] = useState<{client: {client_id: string, name: string}}[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const handleStatusChange = (jobId: string, jobTitle: string, newStatus: string) => {
    dispatch({
      type: positionActions.CHANGE_JOB_STATUS,
      method: 'PATCH',
      endPoint: `/api/v1/jobs/${jobId}/status/`,
      auth: true,
      body: { status: newStatus },
      getResponse: () => {
        toast.success(`${jobTitle} status updated to ${newStatus}`);
        
        // Refresh the jobs list
        let endpoint = '/api/v1/jobs/?';
        if (debouncedSearch) endpoint += `search=${encodeURIComponent(debouncedSearch)}&`;
        if (selectedClient) endpoint += `client=${encodeURIComponent(selectedClient)}&`;
        if (selectedStatus) endpoint += `status=${encodeURIComponent(selectedStatus)}&`;
        
        dispatch({
          type: positionActions.FETCH_JOBS,
          method: 'GET',
          endPoint: endpoint,
          auth: true,
          getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
          getError: (err: any) => console.error(err),
        });
      }
    });
  };

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
    if (selectedStatus) endpoint += `status=${encodeURIComponent(selectedStatus)}&`;

    dispatch({
      type: positionActions.FETCH_JOBS,
      method: 'GET',
      endPoint: endpoint,
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch, debouncedSearch, selectedClient, selectedStatus]);

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clientsData.map(c => ({
      value: c.client.client_id,
      label: c.client.name,
    }))
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'close', label: 'Closed' },
    { value: 'hold', label: 'On Hold' },
  ];

  const filteredPositions = jobs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Jobs
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Open mandates, assignments, and hiring priorities across clients.
          </p>
        </div>

        {!isRecruiter && (
          <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/positions/new')}>
            <Plus className="size-3.5" />
            <span>New Job</span>
          </Button>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
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
          <div className="w-full sm:w-40 shrink-0">
            <SearchableDropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Status"
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
                <TableHead>Created By</TableHead>
                <TableHead>Approvals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8" style={{ color: theme.textMuted }}>
                    No jobs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPositions.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/positions/${job.id}`)}
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
                      <div className="font-medium text-[13px]" style={{ color: theme.textPrimary }}>
                        {job.created_by_name || 'Unknown'}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                        {job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </TableCell>
                   
                    <TableCell onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/approvals/${job.id}`);
                    }} className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2">
                        {job.approval_stats?.map((stat) => {
                          let color: string = theme.textMuted;
                          let bgClass = "bg-muted/50";
                          let isPendingAction = false;
                          
                          if (stat.status === 'pending') {
                            color = theme.warning;
                            if (stat.count > 0) {
                              isPendingAction = true;
                              bgClass = "bg-orange-500/10 border border-orange-500/30 animate-pulse shadow-sm"; // Using ring for highlight instead of pulse to be less intrusive on jobs page, or pulse as user wants
                              color = "#f97316"; 
                            }
                          } else if (stat.status === 'approved' || stat.status === 'accepted') {
                            color = theme.success;
                          } else if (stat.status === 'rejected') {
                            color = theme.destructive;
                          }
                          
                          return (
                            <div 
                              key={stat.status}
                              className={`flex flex-col items-center justify-center rounded-md px-2 py-1 min-w-[40px] ${bgClass}`}
                              title={`${stat.count} ${stat.status}`}
                            >
                              <span className={`text-xs ${isPendingAction ? 'font-extrabold' : 'font-bold'}`} style={{ color }}>{stat.count}</span>
                              <span className="text-[9px] uppercase tracking-wider" style={{ color: isPendingAction ? color : theme.textMuted }}>
                                {stat.status.slice(0, 3)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>

                    <TableCell>
                      {(() => {
                        const statusStyle = getJobStatusStyle(job.status);
                        return (
                          <Badge
                            variant="outline"
                            className="capitalize"
                            style={{
                              color: statusStyle.color,
                              background: statusStyle.background,
                              border: 0,
                            }}
                          >
                            {statusStyle.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" style={{ color: theme.textSecondary }} />}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, job.title, 'open')}>
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, job.title, 'ongoing')}>
                              Ongoing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, job.title, 'close')}>
                              Closed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, job.title, 'hold')}>
                              On Hold
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default JobsPage;