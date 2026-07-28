import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
} from 'lucide-react';
import { theme } from '@/config/theme';

import { CANDIDATES, type Segment } from './data';

const SEGMENT_STYLES: Record<Segment, { bg: string; text: string }> = {
  'Wealth Management': { bg: '#1a2e1a', text: '#6ee7b7' },
  'AMC':               { bg: '#1a2a3d', text: '#38bdf8' },
  'NBFC':              { bg: '#2a1a3d', text: '#a78bfa' },
  'Banking':           { bg: '#2a2a1a', text: '#fbbf24' },
  'Insurance':         { bg: '#1a2a2a', text: '#67e8f9' },
  'Broking':           { bg: '#2a1a2a', text: '#f0abfc' },
  'Investment Banking': { bg: '#1a1a2a', text: '#818cf8' },
};

const FILTER_OPTIONS = ['All', 'Broking', 'Wealth Management', 'AMC', 'NBFC', 'Banking', 'Insurance'] as const;

/* ── Component ────────────────────────────────────────────────── */
const CandidatesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);

  // Filter logic
  const filtered = CANDIDATES.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSegment =
      activeFilter === 'All' || c.segment === activeFilter;

    const matchesDuplicate = !duplicatesOnly || c.isDuplicate;

    return matchesSearch && matchesSegment && matchesDuplicate;
  });

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
            {filtered.length} candidates in the BFSI repository
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
          <Button size="sm" className="gap-1.5">
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
            placeholder="Search by name, email, company, skill..."
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

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              style={{
                background:
                  activeFilter === filter ? theme.accent : theme.surfaceMuted,
                color:
                  activeFilter === filter
                    ? theme.accentForeground
                    : theme.textSecondary,
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Duplicates toggle */}
        <button
          onClick={() => setDuplicatesOnly(!duplicatesOnly)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ml-auto"
          style={{
            background: duplicatesOnly ? theme.warningSoft : 'transparent',
            color: duplicatesOnly ? theme.warning : theme.textMuted,
            border: `1px solid ${duplicatesOnly ? theme.warning + '40' : theme.border}`,
          }}
        >
          <TriangleAlert className="size-3.5" />
          <span>Duplicates only</span>
        </button>

        {/* Result count */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: theme.textMuted }}>
          <Filter className="size-3.5" />
          <span>{filtered.length} results</span>
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
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Candidate
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
                Segment
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
                CTC (Cur/Exp)
              </TableHead>
              <TableHead
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: theme.textMuted }}
              >
                Uploaded By
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((candidate) => {
              const segStyle = SEGMENT_STYLES[candidate.segment];

              return (
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
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{ color: theme.accent }}
                        >
                          {candidate.name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: theme.textMuted }}
                        >
                          {candidate.role}
                        </p>
                      </div>
                      {candidate.isDuplicate && (
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 px-1.5 py-0 h-5"
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

                  {/* Company */}
                  <TableCell
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.company}
                  </TableCell>

                  {/* Segment Badge */}
                  <TableCell>
                    <span
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: segStyle.bg,
                        color: segStyle.text,
                      }}
                    >
                      {candidate.segment}
                    </span>
                  </TableCell>

                  {/* Experience */}
                  <TableCell
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.experience}
                  </TableCell>

                  {/* Location */}
                  <TableCell
                    className="text-sm font-medium"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.location}
                  </TableCell>

                  {/* CTC */}
                  <TableCell className="text-sm">
                    <span style={{ color: theme.textSecondary }}>
                      {candidate.ctcCurrent}
                    </span>
                    <ArrowRight
                      className="inline size-3 mx-1.5"
                      style={{ color: theme.textMuted }}
                    />
                    <span style={{ color: theme.textPrimary }}>
                      {candidate.ctcExpected}
                    </span>
                  </TableCell>

                  {/* Uploaded By */}
                  <TableCell
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {candidate.uploadedBy}
                  </TableCell>
                </TableRow>
              );
            })}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-sm"
                  style={{ color: theme.textMuted }}
                >
                  No candidates found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CandidatesPage;