import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
} from 'lucide-react';
import { theme } from '@/config/theme';
import { SubmitCandidateModal } from './components/SubmitCandidateModal';
import { MultiSubmitCandidateModal } from './components/MultiSubmitCandidateModal';
import { MoreHorizontal, Edit, Send } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ActionMenu = ({ onOpenSubmit, onEdit }: { onOpenSubmit: () => void, onEdit: () => void }) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-muted/50 data-[state=open]:bg-muted flex items-center justify-center rounded-md transition-colors bg-transparent border-0 cursor-pointer">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" style={{ color: theme.textSecondary }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px] p-1" style={{ borderColor: theme.border, background: theme.surface }}>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }} onSelect={(e) => { e.stopPropagation(); onEdit(); }} className="cursor-pointer gap-2 py-2">
            <Edit className="size-4" />
            <span className="font-medium">Edit Candidate</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenSubmit(); }} onSelect={(e) => { e.stopPropagation(); onOpenSubmit(); }} className="cursor-pointer gap-2 py-2">
            <Send className="size-4" />
            <span className="font-medium">Submit Candidate</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const CandidatesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { candidates, loading } = useAppSelector((state) => state.candidates);
  
  // Filter input states (what user types)
  const [searchName, setSearchName] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [experienceMin, setExperienceMin] = useState('');
  const [experienceMax, setExperienceMax] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);

  // Applied filter states (sent to API on Enter)
  const [appliedName, setAppliedName] = useState('');
  const [appliedContact, setAppliedContact] = useState('');
  const [appliedCompany, setAppliedCompany] = useState('');
  const [appliedExpMin, setAppliedExpMin] = useState('');
  const [appliedExpMax, setAppliedExpMax] = useState('');
  const [appliedLocation, setAppliedLocation] = useState('');
  const [appliedUploadedBy, setAppliedUploadedBy] = useState('');

  // Submit Candidate Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [targetCandidateId, setTargetCandidateId] = useState<string | null>(null);

  // Multi Submit State
  const [multiSubmitModalOpen, setMultiSubmitModalOpen] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Focus tracking
  const activeFieldRef = useRef<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const expMinRef = useRef<HTMLInputElement>(null);
  const expMaxRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const uploadedByRef = useRef<HTMLInputElement>(null);

  const fieldRefs: Record<string, React.RefObject<HTMLInputElement | null>> = {
    name: nameRef,
    contact: contactRef,
    company: companyRef,
    expMin: expMinRef,
    expMax: expMaxRef,
    location: locationRef,
    uploadedBy: uploadedByRef,
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
    setAppliedName(searchName);
    setAppliedContact(searchContact);
    setAppliedCompany(searchCompany);
    setAppliedExpMin(experienceMin);
    setAppliedExpMax(experienceMax);
    setAppliedLocation(searchLocation);
    setAppliedUploadedBy(uploadedBy);
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
      setAppliedName(searchName);
      setAppliedContact(searchContact);
      setAppliedCompany(searchCompany);
      setAppliedExpMin(experienceMin);
      setAppliedExpMax(experienceMax);
      setAppliedLocation(searchLocation);
      setAppliedUploadedBy(uploadedBy);
    }, 5000);
    return () => clearTimeout(timer);
  }, [searchName, searchContact, searchCompany, experienceMin, experienceMax, searchLocation, uploadedBy]);

  // Fetch candidates with applied filters
  useEffect(() => {
    const params = new URLSearchParams();
    const search = [appliedName, appliedContact, appliedCompany, appliedLocation].filter(Boolean).join(' ');
    if (search) params.append('search', search);
    if (appliedExpMin) params.append('experience_min', appliedExpMin);
    if (appliedExpMax) params.append('experience_max', appliedExpMax);
    if (duplicatesOnly) params.append('is_duplicate', 'true');
    if (appliedUploadedBy) params.append('uploaded_by', appliedUploadedBy);

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
  }, [dispatch, appliedName, appliedContact, appliedCompany, appliedExpMin, appliedExpMax, appliedLocation, appliedUploadedBy, duplicatesOnly]);

  const handleClear = () => {
    setSearchName('');
    setSearchContact('');
    setSearchCompany('');
    setExperienceMin('');
    setExperienceMax('');
    setSearchLocation('');
    setUploadedBy('');
    setDuplicatesOnly(false);
    setSelectedCandidateIds([]);
    setAppliedName('');
    setAppliedContact('');
    setAppliedCompany('');
    setAppliedExpMin('');
    setAppliedExpMax('');
    setAppliedLocation('');
    setAppliedUploadedBy('');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(candidates.map((c: any) => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidateIds(prev => [...prev, id]);
    } else {
      setSelectedCandidateIds(prev => prev.filter(cId => cId !== id));
    }
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
          {selectedCandidateIds.length > 0 && (
            <Button
              size="sm"
              className="gap-1.5 animate-in fade-in"
              style={{ background: theme.accent, color: theme.accentForeground }}
              onClick={() => setMultiSubmitModalOpen(true)}
            >
              <Send className="size-3.5" />
              <span>Submit Selected ({selectedCandidateIds.length})</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
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
              Clear Filters
            </Button>
          </div>

          <Button size="sm" className="gap-1.5" onClick={() => navigate('/candidates/new')}>
            <Plus className="size-3.5" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div
        className="rounded-lg border overflow-x-auto"
        style={{
          borderColor: theme.border,
          background: theme.surface,
          minHeight: '500px',
        }}
      >
        <Table style={{ tableLayout: 'fixed', width: '100%', minWidth: '1100px' }}>
          <colgroup>
            <col style={{ width: '40px' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <TableHeader>
            <TableRow
              className="hover:bg-transparent"
              style={{ borderColor: theme.border }}
            >
              <TableHead className="pl-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  checked={candidates.length > 0 && selectedCandidateIds.length === candidates.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Candidate
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Contact
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Current Company
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Experience
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Location
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Uploaded By
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider text-right pr-4"
                style={{ color: theme.textMuted }}
              >
                Actions
              </TableHead>
            </TableRow>
            {/* Filter Row */}
            <TableRow className="hover:bg-transparent" style={{ borderColor: theme.border }}>
              <TableHead className="py-1.5 px-1">
                {/* No filter for checkbox */}
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={nameRef}
                  placeholder="Name / Role..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={handleKeyDown('name')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={contactRef}
                  placeholder="Email / Phone..."
                  value={searchContact}
                  onChange={(e) => setSearchContact(e.target.value)}
                  onKeyDown={handleKeyDown('contact')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                <Input
                  ref={companyRef}
                  placeholder="Company..."
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  onKeyDown={handleKeyDown('company')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-1">
                <div className="flex items-center gap-1">
                  <Input
                    ref={expMinRef}
                    placeholder="Min"
                    type="number"
                    value={experienceMin}
                    onChange={(e) => setExperienceMin(e.target.value)}
                    onKeyDown={handleKeyDown('expMin')}
                    className="h-7 text-xs font-normal w-1/2"
                  />
                  <Input
                    ref={expMaxRef}
                    placeholder="Max"
                    type="number"
                    value={experienceMax}
                    onChange={(e) => setExperienceMax(e.target.value)}
                    onKeyDown={handleKeyDown('expMax')}
                    className="h-7 text-xs font-normal w-1/2"
                  />
                </div>
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
                  ref={uploadedByRef}
                  placeholder="Uploaded By..."
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  onKeyDown={handleKeyDown('uploadedBy')}
                  className="h-7 text-xs font-normal"
                />
              </TableHead>
              <TableHead className="py-1.5 px-2">
                {/* No filter for Actions */}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell
                   colSpan={8}
                   className="h-32 text-center"
                 >
                   <Loader2 className="size-8 animate-spin mx-auto" style={{ color: theme.accent }} />
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
                  <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                      checked={selectedCandidateIds.includes(candidate.id)}
                      onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                    />
                  </TableCell>
                  {/* Candidate Name + Role */}
                  <TableCell className="py-3">
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
                  <TableCell>
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
                    className="text-sm truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.current_company || "Not provided"}
                  </TableCell>

                  {/* Experience */}
                  <TableCell
                    className="text-sm truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.experience || "N/A"}
                  </TableCell>

                  {/* Location */}
                  <TableCell
                    className="text-sm font-medium truncate"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.current_location || "N/A"}
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    <div className="font-medium text-[13px] truncate" style={{ color: theme.textPrimary }}>
                      {candidate.uploaded_by_name || "N/A"}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>
                      {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right pr-4">
                     <ActionMenu 
                        onOpenSubmit={() => {
                           setTargetCandidateId(candidate.id);
                           setSubmitModalOpen(true);
                        }} 
                        onEdit={() => navigate(`/candidates/${candidate.id}/edit`)}
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

      <MultiSubmitCandidateModal
        isOpen={multiSubmitModalOpen}
        onClose={() => setMultiSubmitModalOpen(false)}
        candidateIds={selectedCandidateIds}
        onSuccess={() => {
           setSelectedCandidateIds([]);
        }}
      />
    </div>
  );
};

export default CandidatesPage;