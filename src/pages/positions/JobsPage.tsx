import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { positionActions } from '@/redux/actions';
import { setJobs, setLoading, setError } from '@/redux/slices/positionSlice';
import type { JobResponse } from '@/types/position.types';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/config/theme';

const JobsPage = () => {
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();
  const dispatch = useAppDispatch();
  const { jobs, loading } = useAppSelector((state) => state.positions);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch({
      type: positionActions.FETCH_JOBS,
      method: 'GET',
      endPoint: '/api/v1/jobs/',
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: JobResponse) => dispatch(setJobs(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  }, [dispatch]);

  // Counts based on live API data
  const counts = {
    All: jobs.length,
    Open: jobs.filter((p) => p.status.toLowerCase() === 'open').length,
    'On Hold': jobs.filter((p) => p.status.toLowerCase() === 'on hold' || p.status.toLowerCase() === 'on_hold').length,
    Filled: jobs.filter((p) => p.status.toLowerCase() === 'filled').length,
    Closed: jobs.filter((p) => p.status.toLowerCase() === 'closed').length,
  };

  const filteredPositions = jobs.filter((job) => {
    // Basic Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!job.title.toLowerCase().includes(q) && !job.code.toLowerCase().includes(q)) {
        return false;
      }
    }

    // Status filtering
    if (activeFilter === 'All') return true;
    if (activeFilter === 'On Hold' && (job.status.toLowerCase() === 'on hold' || job.status.toLowerCase() === 'on_hold')) return true;
    return job.status.toLowerCase() === activeFilter.toLowerCase();
  });

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
          {Object.entries(counts).map(([status, count]) => {
            const isActive = activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0"
                style={{
                  background: isActive ? theme.accentSoft : 'transparent',
                  color: isActive ? theme.accent : theme.textMuted,
                  border: `1px solid ${isActive ? theme.accent : 'transparent'}`,
                }}
              >
                {status} - {count}
              </button>
            );
          })}
        </div>

        {/* Search & Type Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative shrink-0">
            <select
              className="appearance-none bg-transparent text-sm pl-3 pr-8 py-2 outline-none cursor-pointer"
              style={{ color: theme.textPrimary }}
            >
              <option>All hiring types</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 pointer-events-none" style={{ color: theme.textMuted }} />
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
              style={{ color: theme.textMuted }}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designation, code..."
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
                <TableHead>Openings</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPositions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8" style={{ color: theme.textMuted }}>
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
                    <TableCell style={{ color: theme.textSecondary }}>
                      {job.openings}
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

export default JobsPage;