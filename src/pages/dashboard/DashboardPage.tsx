import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dashboardActions } from '@/redux/actions';
import {
  setDashboardData,
  setLoading,
  setError,
  type DashboardData,
} from '@/redux/slices/dashboardSlice';
import {
  Users,
  Briefcase,
  CalendarDays,
  TrendingUp,
  Activity,
  Clock,
  Video,
  Zap,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

/* ── Animation variants ──────────────────────────────────────── */
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 14 } },
};

/* ── Hires chart color palette ───────────────────────────────── */
const HIRE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#3b82f6', '#60a5fa', '#38bdf8', '#22d3ee', '#10b981'];

/* ── Component ───────────────────────────────────────────────── */
const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch({
      type: dashboardActions.FETCH_DASHBOARD,
      method: 'GET',
      endPoint: '/api/v1/dashboard/',
      auth: true,
      setLoading: (val: boolean) => dispatch(setLoading(val)),
      getResponse: (res: DashboardData) => dispatch(setDashboardData(res)),
      getError: (err: any) => dispatch(setError(err?.message || 'Failed to load dashboard')),
    });
  }, [dispatch]);

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-10 animate-spin" style={{ color: theme.accent }} />
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading your dashboard…</p>
      </div>
    );
  }

  /* ── Derived data ──────────────────────────────────────────── */
  const topStats = data.top_stats || {
    total_candidates: 0,
    active_jobs_by_status: [],
    interviews_upcoming_count: 0,
    active_clients: 0
  };

  const totalActiveJobs = (topStats.active_jobs_by_status || []).reduce((sum, j) => sum + j.count, 0);

  const statCards = [
    { title: 'Total Candidates', value: topStats.total_candidates?.toLocaleString('en-IN') || '0', icon: Users, color: '#3b82f6' },
    { title: 'Active Positions', value: totalActiveJobs.toLocaleString('en-IN'), icon: Briefcase, color: '#8b5cf6' },
    { title: 'Upcoming Interviews', value: topStats.interviews_upcoming_count.toString(), icon: Video, color: '#f59e0b' },
    { title: 'Active Clients', value: topStats.active_clients?.toLocaleString('en-IN') || '0', icon: Building2, color: '#10b981' },
  ];

  const funnelChartData = (data.funnel_trend || []).map((d) => ({
    name: d.month,
    Sourced: d.sourced,
    Interviewed: d.interviewed,
  }));

  const hiresChartData = (data.hires_by_client || [])
    .sort((a, b) => b.hires_count - a.hires_count)
    .slice(0, 10);

  const pipelineData = (data.pipeline_overview || []).map(p => ({
    name: (p.status || 'unknown').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    count: p.count,
  }));
  // Filter out zero-count stages for cleaner chart, or keep all to show funnel width.
  // We'll keep them to show the full pipeline stage, but maybe limit to those with some activity if it's too wide.
  const activePipelineData = pipelineData.filter(p => p.count > 0);

  const topJobs = (data.top_performing_jobs || []);

  const formatTime = (time: string) => {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  /* ── Activity type colors ──────────────────────────────────── */
  const activityColors: Record<string, string> = {
    APPLICATION: '#3b82f6',
    INTERVIEW: '#f59e0b',
    APPROVAL: '#10b981',
    REJECTION: '#ef4444',
    OFFER: '#8b5cf6',
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Dashboard Overview
          </h1>
          <p className="text-base mt-2" style={{ color: theme.textSecondary }}>
            Welcome back! Here's a comprehensive look at your recruitment performance.
          </p>
        </div>
        <div
          className="flex items-center gap-3 text-sm px-5 py-2.5 rounded-xl border shadow-sm backdrop-blur-md"
          style={{ background: theme.surfaceHover, borderColor: theme.border, color: theme.textSecondary }}
        >
          <CalendarDays className="size-5" style={{ color: theme.accent }} />
          <span className="font-medium">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── Row 1: KPI Stat Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border p-7 shadow-sm group hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-default"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            {/* Background Glow */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 opacity-10 blur-3xl pointer-events-none rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-20"
              style={{ background: stat.color }}
            />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div
                className="p-3.5 rounded-2xl shadow-sm"
                style={{ background: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon className="size-6" strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-1.5 relative z-10">
              <h3 className="text-4xl font-black tracking-tight" style={{ color: theme.textPrimary }}>
                {stat.value}
              </h3>
              <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.textMuted }}>
                {stat.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Row 2: Active Jobs Breakdown + Efficiency ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs by Status */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Active Jobs</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Breakdown by status</p>
          </div>
          <div className="space-y-3">
            {(topStats.active_jobs_by_status || []).map((job, idx) => {
              const statusColors: Record<string, string> = {
                OPEN: '#10b981', 'ON-HOLD': '#f59e0b', CLOSED: '#ef4444',
                open: '#10b981', 'on-hold': '#f59e0b', closed: '#ef4444',
              };
              const color = statusColors[job.status] || theme.accent;
              const pct = totalActiveJobs > 0 ? Math.round((job.count / totalActiveJobs) * 100) : 0;
              return (
                <div key={idx} className="rounded-xl p-4 border transition-all hover:shadow-sm" style={{ background: theme.surfaceHover, borderColor: theme.border }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-2.5 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-semibold capitalize" style={{ color: theme.textPrimary }}>{(job.status || 'unknown').toLowerCase().replace('-', ' ')}</span>
                    </div>
                    <span className="text-lg font-black" style={{ color: theme.textPrimary }}>{job.count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: theme.surfaceMuted }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Funnel Trend Chart (Spans 2 columns) */}
        {funnelChartData.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-3xl border shadow-sm p-7 flex flex-col"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Recruitment Funnel Trend</h3>
                <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Candidates sourced vs interviewed</p>
              </div>
            </div>
            <div className="flex-1 min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSourced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInterviewed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.border} opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textMuted, fontSize: 13, fontWeight: 500 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textMuted, fontSize: 13, fontWeight: 500 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: theme.textPrimary, fontWeight: 600 }}
                    labelStyle={{ color: theme.textMuted, marginBottom: '8px', fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="Sourced" stroke={theme.accent} strokeWidth={4} fillOpacity={1} fill="url(#colorSourced)" />
                  <Area type="monotone" dataKey="Interviewed" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorInterviewed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Row 3: Pipeline Overview & Top Jobs ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Overview Chart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Pipeline Overview</h3>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Current candidates by stage</p>
            </div>
          </div>
          {activePipelineData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-3">
              <Users className="size-10" style={{ color: theme.textMuted + '60' }} />
              <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No active candidates in pipeline</p>
            </div>
          ) : (
            <div className="flex-1 min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activePipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={theme.border} opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.textMuted, fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.textMuted, fontSize: 12, fontWeight: 500 }} />
                  <RechartsTooltip
                    cursor={{ fill: theme.surfaceHover }}
                    contentStyle={{ backgroundColor: theme.surface, borderRadius: '12px', border: `1px solid ${theme.border}`, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: theme.textPrimary, fontWeight: 600 }}
                    labelStyle={{ color: theme.textMuted, marginBottom: '8px', fontWeight: 700 }}
                  />
                  <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]} barSize={32}>
                    {activePipelineData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={HIRE_COLORS[index % HIRE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Top Performing Jobs */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Top Performing Jobs</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>By active candidates</p>
          </div>
          {topJobs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Briefcase className="size-10" style={{ color: theme.textMuted + '60' }} />
              <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No active jobs</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 max-h-[300px]">
              {topJobs.slice(0, 5).map((job, idx) => (
                <div key={job.job_id} className="p-4 rounded-xl border flex items-center justify-between group hover:shadow-sm transition-all" style={{ background: theme.surfaceHover, borderColor: theme.border }}>
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-bold truncate" style={{ color: theme.textPrimary }}>{job.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: theme.surfaceMuted }}>
                        <div className="h-full rounded-full" style={{ background: HIRE_COLORS[idx % HIRE_COLORS.length], width: `${Math.min(100, (job.active_candidates / Math.max(1, topJobs[0].active_candidates)) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: theme.textMuted }}>{job.active_candidates} active</span>
                    </div>
                  </div>
                  <div className="size-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: `${HIRE_COLORS[idx % HIRE_COLORS.length]}20`, color: HIRE_COLORS[idx % HIRE_COLORS.length] }}>
                    #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 3: Upcoming Interviews + Hires by Client ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Interviews */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl border shadow-sm p-7"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Upcoming Interviews</h3>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                {(data.upcoming_interviews || []).length} scheduled
              </p>
            </div>
          </div>

          {(data.upcoming_interviews || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Video className="size-10" style={{ color: theme.textMuted + '60' }} />
              <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No upcoming interviews</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b" style={{ borderColor: theme.border }}>
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Candidate</th>
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Position</th>
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Schedule</th>
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Round</th>
                    <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Interviewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: theme.border }}>
                  {(data.upcoming_interviews || []).map((interview, idx) => (
                    <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-8 rounded-full flex items-center justify-center font-bold text-xs"
                            style={{ background: theme.accent + '20', color: theme.accent }}
                          >
                            {interview.candidate_name?.charAt(0) || '?'}
                          </div>
                          <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>
                            {interview.candidate_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm font-medium max-w-[200px] truncate" style={{ color: theme.textSecondary }}>
                        {interview.job_title}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold w-fit"
                            style={{ background: theme.surfaceMuted, color: theme.textPrimary }}
                          >
                            <Clock className="size-3" style={{ color: theme.accent }} />
                            {formatTime(interview.time)}
                          </span>
                          <span className="text-[11px] font-medium" style={{ color: theme.textMuted }}>
                            {formatDate(interview.date)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-md"
                          style={{ background: '#f59e0b18', color: '#d97706' }}
                        >
                          {interview.round}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-sm font-medium" style={{ color: theme.textSecondary }}>
                        {interview.interviewer_name || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Hires by Client */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Hires by Client</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Placement distribution</p>
          </div>
          {hiresChartData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-3">
              <Building2 className="size-10" style={{ color: theme.textMuted + '60' }} />
              <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No hire data yet</p>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hiresChartData} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="client_name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.textPrimary, fontSize: 12, fontWeight: 600 }}
                      width={110}
                    />
                    <RechartsTooltip
                      cursor={{ fill: theme.surfaceHover }}
                      contentStyle={{
                        backgroundColor: theme.surface,
                        borderRadius: '8px',
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                    <Bar dataKey="hires_count" name="Hires" radius={[0, 6, 6, 0]} barSize={18}>
                      {hiresChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={HIRE_COLORS[index % HIRE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${theme.border}` }}>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  Total Hires
                </span>
                <span className="text-lg font-black" style={{ color: theme.textPrimary }}>
                  {hiresChartData.reduce((s, d) => s + d.hires_count, 0)}
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* ── Row 4: Activity Feed + Efficiency ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl border shadow-sm p-7"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: theme.accent + '20' }}>
                <Activity className="size-5" style={{ color: theme.accent }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Recent Activity</h3>
            </div>
          </div>

          {(data.unread_activity || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Activity className="size-10" style={{ color: theme.textMuted + '60' }} />
              <p className="text-sm font-medium" style={{ color: theme.textMuted }}>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-6 pl-2">
              {(data.unread_activity || []).slice(0, 8).map((item, idx, arr) => {
                const dotColor = activityColors[item.type] || theme.accent;
                return (
                  <div key={idx} className="flex gap-5 group">
                    <div className="relative flex flex-col items-center">
                      <div
                        className="size-10 rounded-full flex items-center justify-center font-bold text-xs z-10 shadow-sm border-2"
                        style={{ background: dotColor + '18', color: dotColor, borderColor: dotColor + '40' }}
                      >
                        {item.type?.charAt(0) || 'A'}
                      </div>
                      {idx !== arr.length - 1 && (
                        <div className="absolute top-10 bottom-[-24px] w-[2px]" style={{ background: theme.border }} />
                      )}
                    </div>
                    <div className="pt-1 flex-1 min-w-0">
                      <p className="text-[15px] font-semibold leading-relaxed truncate" style={{ color: theme.textPrimary }}>
                        {item.title}
                      </p>
                      <p className="text-sm mt-0.5 truncate" style={{ color: theme.textSecondary }}>
                        {item.message}
                      </p>
                      <p className="text-xs font-semibold mt-1.5 uppercase tracking-wider" style={{ color: theme.textMuted }}>
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Efficiency + Quick Stats */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Efficiency Metrics</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Key performance indicators</p>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {/* Time to Hire */}
            <div
              className="flex items-center justify-between p-5 rounded-xl border group hover:shadow-sm transition-all"
              style={{ background: theme.surfaceHover, borderColor: theme.border }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg" style={{ background: '#10b98120', color: '#10b981' }}>
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Time to Hire</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Average duration</p>
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: theme.textPrimary }}>
                {data.average_time_to_hire_days} <span className="text-base font-semibold" style={{ color: theme.textMuted }}>days</span>
              </p>
            </div>

            {/* Offer Acceptance */}
            <div
              className="flex items-center justify-between p-5 rounded-xl border group hover:shadow-sm transition-all"
              style={{ background: theme.surfaceHover, borderColor: theme.border }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Offer Acceptance</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Conversion rate</p>
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: theme.textPrimary }}>
                {data.offer_acceptance_rate}%
              </p>
            </div>

            {/* Rejection Rate */}
            <div
              className="flex items-center justify-between p-5 rounded-xl border group hover:shadow-sm transition-all"
              style={{ background: theme.surfaceHover, borderColor: theme.border }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-lg" style={{ background: '#ef444420', color: '#ef4444' }}>
                  <Activity className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Rejection Rate</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>Overall rejections</p>
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: theme.textPrimary }}>
                {data.rejection_rate}%
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;