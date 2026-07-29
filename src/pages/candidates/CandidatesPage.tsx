import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { candidateActions } from '@/redux/actions';
import { setCandidates, setLoading, setError } from '@/redux/slices/candidateSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Upload,
  Download,
  Plus,
  TriangleAlert,
  Filter,
} from 'lucide-react';
import { theme } from '@/config/theme';
import { SubmitCandidateModal } from './components/SubmitCandidateModal';
import { MoreHorizontal } from 'lucide-react';

const ActionMenu = ({ onOpenSubmit }: { onOpenSubmit: () => void }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative inline-block" onClick={(e) => { e.stopPropagation(); }}>
       <button onClick={() => setOpen(!open)} className="p-1 rounded-md hover:bg-black/10 transition-colors">
          <MoreHorizontal className="size-4 text-muted-foreground" />
       </button>
       {open && (
         <>
           <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
           <div className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-popover shadow-md z-50 py-1" style={{ borderColor: theme.border, background: theme.surface }}>
             <button 
               className="w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground" 
               style={{ color: theme.textPrimary }}
               onClick={() => { setOpen(false); onOpenSubmit(); }}
             >
               Submit Candidate
             </button>
           </div>
         </>
       )}
    </div>
  );
};

const CandidatesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { candidates, loading } = useAppSelector((state) => state.candidates);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [experienceMin, setExperienceMin] = useState('');
  const [experienceMax, setExperienceMax] = useState('');

  // Submit Candidate Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [targetCandidateId, setTargetCandidateId] = useState<string | null>(null);

  const fetchCandidates = (overrideClear = false) => {
    const params = new URLSearchParams();
    if (!overrideClear) {
      if (searchQuery) params.append('search', searchQuery);
      if (experienceMin) params.append('experience_min', experienceMin);
      if (experienceMax) params.append('experience_max', experienceMax);
      if (duplicatesOnly) params.append('is_duplicate', 'true');
    }

    const queryString = params.toString();
    const endPoint = `/api/v1/candidates/${queryString ? `?${queryString}` : ''}`;

    dispatch({
      type: candidateActions.FETCH_CANDIDATES,
      method: "GET",
      endPoint,
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (data: any) => dispatch(setCandidates(data.results || [])),
      getError: (err: any) => dispatch(setError(err.message)),
    });
  };

  useEffect(() => {
    fetchCandidates();
  }, [dispatch]);

  const handleClear = () => {
    setSearchQuery('');
    setExperienceMin('');
    setExperienceMax('');
    setDuplicatesOnly(false);
    fetchCandidates(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Candidates
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {candidates.length} candidates found
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="size-3.5" />
            <span>Bulk Upload</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/candidates/new')}>
            <Plus className="size-3.5" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      {/* ── Search & Filters ────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-[360px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4"
            style={{ color: theme.textMuted }}
          />
          <Input
            placeholder="Search by name, email, phone, location, company, role, skills..."
            className="pl-9 text-sm"
            style={{
              background: theme.surface,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Input 
            placeholder="Min Exp"
            type="number"
            className="w-[85px] text-sm h-9"
            style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
            value={experienceMin}
            onChange={(e) => setExperienceMin(e.target.value)}
          />
          <span className="text-sm font-medium" style={{ color: theme.textMuted }}>-</span>
          <Input 
            placeholder="Max Exp"
            type="number"
            className="w-[85px] text-sm h-9"
            style={{ background: theme.surface, borderColor: theme.border, color: theme.textPrimary }}
            value={experienceMax}
            onChange={(e) => setExperienceMax(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Duplicates toggle */}
          <button
            onClick={() => setDuplicatesOnly(!duplicatesOnly)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: duplicatesOnly ? theme.warningSoft : 'transparent',
              color: duplicatesOnly ? theme.warning : theme.textMuted,
              border: `1px solid ${duplicatesOnly ? theme.warning + '40' : theme.border}`,
            }}
          >
            <TriangleAlert className="size-3.5" />
            <span>Duplicates</span>
          </button>
          
          <Button variant="outline" size="sm" onClick={handleClear} className="h-8 text-xs">
            Clear
          </Button>
          <Button size="sm" onClick={() => fetchCandidates()} className="h-8 text-xs px-4" style={{ background: theme.accent, color: theme.accentForeground }}>
            Apply
          </Button>
        </div>

        {/* Result count */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
          <Filter className="size-3.5" />
          <span>{candidates.length} results</span>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          borderColor: theme.border,
          background: theme.surface,
        }}
      >
        <Table>
          <TableHeader>
            <TableRow
              className="hover:bg-transparent"
              style={{ borderColor: theme.border }}
            >
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[220px]"
                style={{ color: theme.textMuted }}
              >
                Candidate
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[180px]"
                style={{ color: theme.textMuted }}
              >
                Contact
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[150px]"
                style={{ color: theme.textMuted }}
              >
                Current Company
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[100px]"
                style={{ color: theme.textMuted }}
              >
                Experience
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[150px]"
                style={{ color: theme.textMuted }}
              >
                Location
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[120px]"
                style={{ color: theme.textMuted }}
              >
                Uploaded By
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[100px]"
                style={{ color: theme.textMuted }}
              >
                Created At
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider w-[80px] text-right pr-4"
                style={{ color: theme.textMuted }}
              >
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell
                   colSpan={8}
                   className="h-32 text-center text-sm"
                   style={{ color: theme.textMuted }}
                 >
                   Loading candidates...
                 </TableCell>
               </TableRow>
            ) : candidates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-32 text-center text-sm"
                  style={{ color: theme.textMuted }}
                >
                  No candidates found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  onClick={() => navigate('/candidates/' + candidate.id)}
                  className="cursor-pointer group"
                  style={{ borderColor: theme.border }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = theme.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  {/* Candidate Name + Role */}
                  <TableCell className="py-3 max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-semibold leading-tight truncate"
                          style={{ color: theme.accent }}
                        >
                          {candidate.candidate_name || "N/A"}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: theme.textMuted }}
                        >
                          {candidate.current_profile || "N/A"}
                        </p>
                      </div>
                      {candidate.is_duplicate && (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 px-1.5 py-0 h-5 shrink-0"
                          style={{
                            borderColor: theme.warning + '60',
                            color: theme.warning,
                            background: theme.warningSoft,
                          }}
                        >
                          <TriangleAlert className="size-2.5" />
                          Duplicate
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell className="max-w-[180px]">
                     <div className="min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ color: theme.textSecondary }}
                        >
                          {candidate.email || "N/A"}
                        </p>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{ color: theme.textMuted }}
                        >
                          {candidate.contact || "N/A"}
                        </p>
                      </div>
                  </TableCell>

                  {/* Company */}
                  <TableCell
                    className="text-sm max-w-[150px] truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.current_company || "Not provided"}
                  </TableCell>

                  {/* Experience */}
                  <TableCell
                    className="text-sm max-w-[100px] truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.experience || "N/A"}
                  </TableCell>

                  {/* Location */}
                  <TableCell
                    className="text-sm font-medium max-w-[150px] truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.current_location || "N/A"}
                  </TableCell>

                  {/* Uploaded By */}
                  <TableCell
                    className="text-sm max-w-[120px] truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.uploaded_by_name || "N/A"}
                  </TableCell>
                  
                  {/* Created At */}
                  <TableCell
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4">
                     <ActionMenu 
                        onOpenSubmit={() => {
                           setTargetCandidateId(candidate.id);
                           setSubmitModalOpen(true);
                        }} 
                     />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <SubmitCandidateModal 
         isOpen={submitModalOpen} 
         onClose={() => {
           setSubmitModalOpen(false);
           setTargetCandidateId(null);
         }} 
         candidateId={targetCandidateId} 
      />
    </div>
  );
};

export default CandidatesPage;