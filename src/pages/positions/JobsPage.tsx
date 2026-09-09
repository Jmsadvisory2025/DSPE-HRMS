import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  high:   { color: '#ef4444', bg: '#ef444418' },
  medium: { color: '#f59e0b', bg: '#f59e0b18' },
  low:    { color: '#22c55e', bg: '#22c55e18' },
};

/* ── Hover Card for Assigned Recruiters (Portal-based) ──────── */
const AssignedRecruitersCell = ({ recruiters }: { recruiters: any[] }) => {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (triggerRef.current && recruiters.length > 1) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position below the trigger, but flip up if too close to the bottom
      const spaceBelow = window.innerHeight - rect.bottom;
      const cardHeight = recruiters.length * 52 + 60; // estimate
      const top = spaceBelow < cardHeight ? rect.top - cardHeight : rect.bottom + 4;
      setPos({ top, left: rect.left });
      setHovered(true);
    }
  }, [recruiters.length]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col gap-0.5 cursor-default">
        <span className="text-[13px] font-medium truncate" style={{ color: theme.textPrimary }}>
          {recruiters[0].name}
        </span>
        {recruiters.length > 1 && (
          <span className="text-[11px] underline decoration-dotted underline-offset-2" style={{ color: theme.accent }}>
            +{recruiters.length - 1} more
          </span>
        )}
      </div>

      {hovered && recruiters.length > 1 && createPortal(
        <div
          className="animate-in fade-in-0 zoom-in-95 duration-150"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className="rounded-xl p-3 shadow-xl min-w-[280px] max-w-[340px]"
            style={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              pointerEvents: 'auto',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: theme.textMuted }}>
              Assigned Recruiters ({recruiters.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {recruiters.map((rec: any) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
                  style={{ background: theme.surfaceMuted }}
                >
                  {rec.avatar ? (
                    <img
                      src={rec.avatar}
                      alt={rec.name}
                      className="size-8 rounded-full object-cover shrink-0"
                      style={{ border: `2px solid ${theme.accent}30` }}
                    />
                  ) : (
                    <div
                      className="size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: theme.accent + '20', color: theme.accent }}
                    >
                      {rec.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate" style={{ color: theme.textPrimary }}>
                      {rec.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] capitalize px-1.5 py-0.5 rounded-sm" style={{ background: theme.accent + '15', color: theme.accent }}>
                        {rec.role}
                      </span>
                      {rec.email && (
                        <span className="text-[10px] truncate" style={{ color: theme.textMuted }}>
                          {rec.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const JobsPage = () => {
  const navigate = useNavigate();
  const { isRecruiter, isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.positions);

  // Filter input states (what user types)
  const [searchCode, setSearchCode] = useState('');
  const [searchDesignation, setSearchDesignation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCreatedBy, setSearchCreatedBy] = useState('');
  const [searchAssignedTo, setSearchAssignedTo] = useState('');

  // Applied filter states (sent to API on Enter)
  const [appliedCode, setAppliedCode] = useState('');
  const [appliedDesignation, setAppliedDesignation] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedCreatedBy, setAppliedCreatedBy] = useState('');
  const [appliedAssignedTo, setAppliedAssignedTo] = useState('');

  // Dropdown states (apply immediately)
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('open'); // default is open
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [clientsData, setClientsData] = useState<{client: {client_id: string, name: string}}[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Focus tracking
  const activeFieldRef = useRef<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const designationRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const createdByRef = useRef<HTMLInputElement>(null);
  const assignedToRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    code: codeRef,
    designation: designationRef,
    location: locationRef,
    createdBy: createdByRef,
    assignedTo: assignedToRef,
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
    setAppliedCode(searchCode);
    setAppliedDesignation(searchDesignation);
    setAppliedLocation(searchLocation);
    setAppliedCreatedBy(searchCreatedBy);
    setAppliedAssignedTo(searchAssignedTo);
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
      setAppliedCode(searchCode);
      setAppliedDesignation(searchDesignation);
      setAppliedLocation(searchLocation);
      setAppliedCreatedBy(searchCreatedBy);
      setAppliedAssignedTo(searchAssignedTo);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchCode, searchDesignation, searchLocation, searchCreatedBy, searchAssignedTo]);

  const buildEndpoint = () => {
    const params = new URLSearchParams();
    if (appliedCode) params.append('code', appliedCode);
    if (appliedDesignation) params.append('title', appliedDesignation);
    if (selectedClient) params.append('client_name', selectedClient);
    if (appliedLocation) params.append('location', appliedLocation);
    if (appliedCreatedBy) params.append('created_by_name', appliedCreatedBy);
    if (appliedAssignedTo) params.append('assigned_to_name', appliedAssignedTo);
    if (selectedStatus) params.append('status', selectedStatus);
    if (selectedPriority) params.append('priority', selectedPriority);
    const qs = params.toString();
    return `/api/v1/jobs/${qs ? `?${qs}` : ''}`;
  };

  const handleStatusChange = (jobId: string, jobTitle: string, newStatus: string) => {
    dispatch({
      type: positionActions.CHANGE_JOB_STATUS,
      method: 'PATCH',
      endPoint: `/api/v1/jobs/${jobId}/status/`,
      auth: true,
      body: { status: newStatus },
      getResponse: () => {
        toast.success(`${jobTitle} status updated to ${newStatus}`);
        
        dispatch({
          type: positionActions.FETCH_JOBS,
          method: 'GET',
          endPoint: buildEndpoint(),
          auth: true,
          getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
          getError: (err: any) => console.error(err),
        });
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedJobIds(checked ? jobs.map((job) => job.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedJobIds((current) => checked ? [...current, id] : current.filter((jobId) => jobId !== id));
  };

  const handleDeleteSelected = () => {
    if (!isAdmin || selectedJobIds.length === 0) return;

    dispatch({
      type: positionActions.DELETE_JOBS,
      method: 'DELETE',
      endPoint: '/api/v1/jobs/bulk-delete/',
      auth: true,
      body: { job_ids: selectedJobIds },
      setLoading: (val: boolean) => setDeleting(val),
      getResponse: (response: any) => {
        toast.success(response?.message || 'Jobs deleted successfully');
        setSelectedJobIds([]);
        setDeleteConfirmOpen(false);
        dispatch({
          type: positionActions.FETCH_JOBS,
          method: 'GET',
          endPoint: buildEndpoint(),
          auth: true,
          getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
          getError: (err: any) => dispatch(setError(err.message)),
        });
      },
      getError: (error: any) => {
        toast.error(error?.response?.data?.error || 'Failed to delete jobs');
      },
    });
  };

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
    dispatch({
      type: positionActions.FETCH_JOBS,
      method: 'GET',
      endPoint: buildEndpoint(),
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch, appliedCode, appliedDesignation, appliedLocation, appliedCreatedBy, appliedAssignedTo, selectedClient, selectedStatus, selectedPriority]);

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clientsData.map(c => ({
      value: c.client.name,
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

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

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

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && selectedJobIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 animate-in fade-in"
              style={{ color: theme.destructive, borderColor: theme.destructive + '50', background: theme.destructive + '10' }}
              disabled={deleting}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              <span>Delete Selected ({selectedJobIds.length})</span>
            </Button>
          )}
          {!isRecruiter && (
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/positions/new')}>
              <Plus className="size-3.5" />
              <span>New Job</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto" style={{ background: theme.surface, border: `1px solid ${theme.border}`, minHeight: '500px' }}>
        <Table style={{ tableLayout: 'fixed', width: '100%', minWidth: '1600px' }}>
          <colgroup>
            {isAdmin && <col style={{ width: '40px' }} />}
            <col style={{ width: '110px' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <TableHeader style={{ background: theme.surfaceMuted }}>
            <TableRow>
              {isAdmin && (
                <TableHead className="pl-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 shadow-sm cursor-pointer"
                    checked={jobs.length > 0 && selectedJobIds.length === jobs.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
              )}
              <TableHead>Code</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-center">Priority</TableHead>
              <TableHead className="text-center">Approvals</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center pr-4">Actions</TableHead>
            </TableRow>
            
            {/* Filter Row */}
            <TableRow className="hover:bg-transparent" style={{ borderColor: theme.border }}>
              {isAdmin && <TableHead className="py-1.5 px-1" />}
              <TableHead className="py-1.5 px-2">
                <Input 
                  ref={codeRef}
                  placeholder="Code..." 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={handleKeyDown('code')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input 
                  ref={designationRef}
                  placeholder="Designation..." 
                  value={searchDesignation}
                  onChange={(e) => setSearchDesignation(e.target.value)}
                  onKeyDown={handleKeyDown('designation')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <SearchableDropdown
                  options={clientOptions}
                  value={selectedClient}
                  onChange={setSelectedClient}
                  placeholder="All Clients"
                  loading={clientsLoading}
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
                  ref={createdByRef}
                  placeholder="Name..." 
                  value={searchCreatedBy}
                  onChange={(e) => setSearchCreatedBy(e.target.value)}
                  onKeyDown={handleKeyDown('createdBy')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input 
                  ref={assignedToRef}
                  placeholder="Name..." 
                  value={searchAssignedTo}
                  onChange={(e) => setSearchAssignedTo(e.target.value)}
                  onKeyDown={handleKeyDown('assignedTo')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <SearchableDropdown
                  options={priorityOptions}
                  value={selectedPriority}
                  onChange={setSelectedPriority}
                  placeholder="All"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                {/* Approvals (No Filter) */}
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <SearchableDropdown
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  placeholder="Status"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                {/* Actions (No Filter) */}
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 11 : 10} className="h-32 text-center">
                  <Loader2 className="size-8 animate-spin mx-auto" style={{ color: theme.accent }} />
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 11 : 10} className="text-center py-8" style={{ color: theme.textMuted }}>
                  No jobs found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => {
                const priority = job.priority?.toLowerCase() || 'medium';
                const priorityStyle = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
                return (
                <TableRow
                  key={job.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/positions/${job.id}`)}
                >
                  {isAdmin && (
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 shadow-sm cursor-pointer"
                        checked={selectedJobIds.includes(job.id)}
                        onChange={(e) => handleSelectOne(job.id, e.target.checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium" style={{ color: theme.accent }}>
                    {job.code}
                  </TableCell>
                  <TableCell style={{ color: theme.textPrimary }}>
                    <div className="font-semibold truncate">{job.title}</div>
                    <div className="text-xs" style={{ color: theme.textMuted }}>
                      Exp: {job.min_experience}-{job.max_experience} yrs
                    </div>
                  </TableCell>
                  <TableCell style={{ color: theme.textSecondary }} className="truncate">
                    {job.client?.name || 'Self'}
                  </TableCell>
                  <TableCell style={{ color: theme.textSecondary }} className="capitalize truncate">
                    {job.location}
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium text-[13px] truncate" style={{ color: theme.textPrimary }}>
                      {job.created_by_name || 'Unknown'}
                    </div>
                    <div className="text-[11px] mt-0.5 truncate" style={{ color: theme.textMuted }}>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </TableCell>

                  {/* Assigned Recruiters */}
                  <TableCell>
                    {job.assigned_recruiters && job.assigned_recruiters.length > 0 ? (
                      <AssignedRecruitersCell recruiters={job.assigned_recruiters} />
                    ) : (
                      <span className="text-xs" style={{ color: theme.textMuted }}>Unassigned</span>
                    )}
                  </TableCell>

                  {/* Priority */}  
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="capitalize text-[10px] px-2 py-0.5"
                      style={{
                        color: priorityStyle.color,
                        background: priorityStyle.bg,
                        borderColor: priorityStyle.color + '40',
                      }}
                    >
                      {job.priority || 'N/A'}
                    </Badge>
                  </TableCell>
                 
                  <TableCell onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/approvals/${job.id}`);
                  }} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex justify-center gap-1">
                      {job.approval_stats?.map((stat) => {
                        let color: string = theme.textMuted;
                        let bgClass = "bg-muted/50";
                        let isPendingAction = false;
                        
                        if (stat.status === 'pending') {
                          color = theme.warning;
                          if (stat.count > 0) {
                            isPendingAction = true;
                            bgClass = "bg-orange-500/10 border border-orange-500/30 animate-pulse shadow-sm"; 
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
                            className={`flex flex-col items-center justify-center rounded-md px-1.5 py-0.5 min-w-[36px] cursor-pointer hover:opacity-80 transition-opacity ${bgClass}`}
                            title={`View ${stat.status} applications`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const tabStatus = stat.status === 'approved' ? 'accepted' : stat.status;
                              navigate(`/approvals/${job.id}?tab=${tabStatus}`);
                            }}
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

                  <TableCell className="text-center">
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
                  
                  <TableCell onClick={(e) => e.stopPropagation()} className="text-center pr-4">
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedJobIds.length} selected {selectedJobIds.length === 1 ? 'job' : 'jobs'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDeleteSelected} style={{ background: theme.destructive, color: '#fff' }}>
              {deleting ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsPage;