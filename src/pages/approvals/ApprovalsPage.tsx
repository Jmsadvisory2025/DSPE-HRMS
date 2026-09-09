import React, { useEffect, useState, useRef } from 'react';
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
import { getJobStatusStyle } from '@/lib/statusUtils';
import { SearchableDropdown } from '@/components/ui/searchable-dropdown';

const ApprovalsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.positions);
  
  // Filter input states (what user types)
  const [searchCode, setSearchCode] = useState('');
  const [searchDesignation, setSearchDesignation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

  // Applied filter states (sent to API on Enter)
  const [appliedCode, setAppliedCode] = useState('');
  const [appliedDesignation, setAppliedDesignation] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');

  const [clientsData, setClientsData] = useState<{client: {client_id: string, name: string}}[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [approvalStats, setApprovalStats] = useState<{ status: string; count: number }[]>([]);

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'ongoing', label: 'On Going' },
    { value: 'close', label: 'Closed' },
    { value: 'hold', label: 'Hold' },
  ];

  // Track which filter was last used by name
  const activeFieldRef = useRef<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const designationRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    code: codeRef,
    designation: designationRef,
    location: locationRef,
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

  // Apply search on Enter key
  const applySearch = () => {
    setAppliedCode(searchCode);
    setAppliedDesignation(searchDesignation);
    setAppliedLocation(searchLocation);
  };

  const handleKeyDown = (field: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      activeFieldRef.current = field;
      applySearch();
    }
  };

  // 5-second debounce fallback if user forgets to press Enter
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedCode(searchCode);
      setAppliedDesignation(searchDesignation);
      setAppliedLocation(searchLocation);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchCode, searchDesignation, searchLocation]);

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

  // Fetch jobs with all filters via API (triggered on Enter or client change)
  useEffect(() => {
    let endpoint = '/api/v1/jobs/?';
    const search = [appliedCode, appliedDesignation, appliedLocation].filter(Boolean).join(' ');
    if (search) endpoint += `search=${encodeURIComponent(search)}&`;
    if (selectedClient) endpoint += `client=${encodeURIComponent(selectedClient)}&`;
    if (appliedStatus) endpoint += `status=${encodeURIComponent(appliedStatus)}&`;

    dispatch({
      type: positionActions.FETCH_JOBS,
      method: 'GET',
      endPoint: endpoint,
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: JobResponse) => {
        dispatch(setJobs(data.results || []));
        if (data.approval_stats) {
          setApprovalStats(data.approval_stats);
        } else {
          setApprovalStats([]);
        }
      },
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch, appliedCode, appliedDesignation, appliedLocation, appliedStatus, selectedClient]);

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clientsData.map(c => ({
      value: c.client.client_id,
      label: c.client.name,
    }))
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
            Approvals
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            Select a job to review pending applications.
          </p>
        </div>
      </div>

      {/* Approval Stats Summary */}
      {approvalStats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {approvalStats.map((stat, i) => (
            <div 
              key={i} 
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
            >
              <div>
                <p className="text-sm font-medium capitalize" style={{ color: theme.textSecondary }}>{stat.status} Applications</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: theme.textPrimary }}>{stat.count}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table - always mounted so filter inputs don't lose focus */}
        <div className="rounded-xl overflow-x-auto" style={{ background: theme.surface, border: `1px solid ${theme.border}`, minHeight: '500px' }}>
          <Table style={{ tableLayout: 'fixed', width: '100%', minWidth: '950px' }}>
            <colgroup>
              <col style={{ width: '120px' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <TableHeader style={{ background: theme.surfaceMuted }}>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead >Designation</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className='text-center'>Approvals</TableHead>
                <TableHead className='text-center'>Status</TableHead>
              </TableRow>
              <TableRow>
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
                  {/* No filter for Approvals */}
                </TableHead>
                <TableHead className="py-1.5 px-2">
                  <SearchableDropdown
                    options={statusOptions}
                    value={appliedStatus}
                    onChange={(val) => setAppliedStatus(val)}
                    placeholder="All"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="size-8 animate-spin mx-auto" style={{ color: theme.accent }} />
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8" style={{ color: theme.textMuted }}>
                    No jobs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/approvals/${job.id}`)}
                  >
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
                      <div className="flex justify-center  gap-1">
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
};

export default ApprovalsPage;