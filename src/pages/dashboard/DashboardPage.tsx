import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/config/theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dashboardActions, userActions } from '@/redux/actions';
import { useAuth } from '@/context/AuthContext';
import { setUsers } from '@/redux/slices/userSlice';
import {
  setDashboardData,
  setLoading,
  setError,
  type DashboardData,
} from '@/redux/slices/dashboardSlice';
import {
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  Clock,
  Video,
  Building2,
  Loader2,
  ChevronRight,
  MapPin,
  ArrowUpRight,
  Target,
  Timer,
  CheckCircle2,
  XCircle,
  UserCheck,
  CalendarClock,
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Search,
  ChevronDown,
  X,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useNavigate } from 'react-router-dom';

/* ── Animation ───────────────────────────────────────────────── */
const container: any = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item: any = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 18 } },
};

/* ── Palette (muted, professional) ───────────────────────────── */
const ACCENT = '#3B82C4';       // theme accent
const CHART_A = '#3B82C4';      // blue
const CHART_B = '#6AADEB';      // light blue
const PIE_COLORS = ['#3B82C4', '#6AADEB', '#4A9FD9', '#93C5FD', '#BFC6D2', '#D8DDE6', '#7C8497', '#A0AEC0'];

/* ── Component ───────────────────────────────────────────────── */
const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.dashboard);
  const { users } = useAppSelector((s) => s.users);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN' || user?.role?.toUpperCase() === 'ADMIN';

  const [filters, setFilters] = useState({
    user_id: '',
    from_date: '',
    to_date: '',
  });
  
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    dispatch({
      type: dashboardActions.FETCH_DASHBOARD,
      method: 'GET',
      endPoint: `/api/v1/dashboard/?${params.toString()}`,
      auth: true,
      setLoading: (v: boolean) => dispatch(setLoading(v)),
      getResponse: (r: DashboardData) => dispatch(setDashboardData(r)),
      getError: (e: any) => dispatch(setError(e?.message || 'Failed to load dashboard')),
    });
  }, [dispatch, filters]);

  useEffect(() => {
    if (isAdmin && users.length === 0) {
      dispatch({
        type: userActions.FETCH_USERS,
        method: 'GET',
        endPoint: '/api/v1/users/',
        auth: true,
        getResponse: (data: any) => dispatch(setUsers(data.results || [])),
      });
    }
  }, [dispatch, isAdmin, users.length]);

  const handleExport = () => {
    const params = new URLSearchParams();
    params.append('export', 'true');
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    
    let token = '';
    const loginDataRaw = localStorage.getItem('RecruitOS_Login_Data');
    if (loginDataRaw) {
      try {
        token = JSON.parse(loginDataRaw)?.accessToken || '';
      } catch (e) {
        console.error('Failed to parse login data', e);
      }
    }
    
    fetch(`${baseUrl}/api/v1/dashboard/?${params.toString()}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Export failed with status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dashboard_export.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Export failed:', err);
        alert('Failed to export. Check console for details.');
      });
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="size-8 animate-spin" style={{ color: ACCENT }} />
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>Loading dashboard…</p>
      </div>
    );
  }

  /* ── Derived ───────────────────────────────────────────────── */
  const ts = data.top_stats || { total_candidates: 0, active_jobs_by_status: [], interviews_upcoming_count: 0, active_clients: 0 };
  const totalJobs = (ts.active_jobs_by_status || []).reduce((s, j) => s + j.count, 0);

  const stats = [
    { label: 'Total Candidates', value: ts.total_candidates?.toLocaleString('en-IN') || '0', icon: Users, path: '/candidates' },
    { label: 'Active Positions', value: totalJobs.toLocaleString('en-IN'), icon: Briefcase, path: '/positions' },
    { label: 'Upcoming Interviews', value: ts.interviews_upcoming_count.toString(), icon: CalendarClock, path: '#upcoming-interviews' },
    { label: 'Active Clients', value: ts.active_clients?.toLocaleString('en-IN') || '0', icon: Building2, path: '/clients' },
  ];

  const funnelData = (data.funnel_trend || []).map((d) => ({ name: d.month, Sourced: d.sourced, Interviewed: d.interviewed }));
  const hiresData = (data.hires_by_client || []).sort((a, b) => b.hires_count - a.hires_count).slice(0, 8);
  const getStageName = (s: string) => {
    const m: Record<string, string> = { 'hr-round': 'HR Round', 'client-round': 'Client Round', 'screening': 'Screening', 'technical': 'Technical', 'offer': 'Offer', 'hired': 'Hired', 'duplicate': 'Duplicate' };
    return m[s?.toLowerCase()] || (s || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };
  const pipeData = (data.pipeline_overview || []).filter((p) => p.count > 0).map((p) => ({
    name: getStageName(p.status),
    key: p.status || '',
    value: p.count,
  }));
  const pipeTotal = pipeData.reduce((s, d) => s + d.value, 0);
  const topJobs = data.top_performing_jobs || [];

  /* ── Helpers ───────────────────────────────────────────────── */
  const fmtTime = (t: string) => {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };
  const fmtDate = (d: string) => {
    if (!d) return '';
    const dt = new Date(d), now = new Date();
    if (dt.toDateString() === now.toDateString()) return 'Today';
    const tmr = new Date(now); tmr.setDate(now.getDate() + 1);
    if (dt.toDateString() === tmr.toDateString()) return 'Tomorrow';
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };
  const ago = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statusColor: Record<string, string> = {
    open: '#3AAF76', ongoing: '#3B82C4', hold: '#E0963A', 'on-hold': '#E0963A', close: '#D9534F', closed: '#D9534F',
  };

  const actColor: Record<string, string> = {
    APPLICATION: ACCENT, INTERVIEW: '#E0963A', APPROVAL: '#3AAF76', REJECTION: '#D9534F', OFFER: '#7367D6', info: '#4A9FD9', INFO: '#4A9FD9',
  };

  /* ── card wrapper style ─────────────────────────────────────── */
  const card = { background: theme.surface, borderColor: theme.border };

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible" variants={container}>

      {/* ── Header ──────────────────────────────────────────── */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4 border-b" style={{ borderColor: theme.border }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.textMuted }}>Overview of your recruitment pipeline</p>
        </div>
        
        {/* <div className="flex flex-wrap items-center gap-3">
          
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-lg border bg-slate-50/50" style={{ borderColor: theme.border }}>
              <div className="flex items-center pl-2 pr-1">
                <Filter className="size-3.5 text-slate-400" />
              </div>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-[160px] h-7 text-xs bg-white border border-slate-200 rounded-md px-2 outline-none focus:ring-1 focus:ring-slate-300"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <span className="truncate pr-2">
                    {filters.user_id 
                      ? users.find((u: any) => u.id === filters.user_id)?.name || 'All Members'
                      : 'All Members'}
                  </span>
                  <ChevronDown className="size-3 text-slate-400 shrink-0" />
                </button>
                
                {userDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserDropdownOpen(false)} 
                    />
                    <div className="absolute top-full right-0 lg:left-0 mt-1 w-[260px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="flex items-center px-2 border-b border-slate-100 bg-slate-50/50">
                        <Search className="size-3 text-slate-400 mr-2 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search members..." 
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full text-[11px] font-medium py-2 outline-none bg-transparent"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                        <div 
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors ${!filters.user_id ? 'bg-slate-50' : ''}`}
                          onClick={() => { setFilters(f => ({ ...f, user_id: '' })); setUserDropdownOpen(false); setUserSearch(''); }}
                        >
                          <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            <Users className="size-3.5 text-slate-400" />
                          </div>
                          <span className={`text-[11px] ${!filters.user_id ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>All Members</span>
                        </div>
                        {users.filter((u: any) => (u.name || '').toLowerCase().includes(userSearch.toLowerCase())).map((u: any) => (
                          <div 
                            key={u.id}
                            className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-t border-slate-50 hover:bg-slate-50 transition-colors ${filters.user_id === u.id ? 'bg-slate-50' : ''}`}
                            onClick={() => { setFilters(f => ({ ...f, user_id: u.id })); setUserDropdownOpen(false); setUserSearch(''); }}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="size-7 rounded-full object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="size-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 border border-slate-200">
                                {(u.name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[11px] truncate ${filters.user_id === u.id ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{u.name}</span>
                                <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 shrink-0">{u.role}</span>
                              </div>
                              <p className="text-[9px] text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                        ))}
                        {users.filter((u: any) => (u.name || '').toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                          <div className="px-3 py-4 text-xs text-center text-slate-400">
                            No members found
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <input
                type="date"
                className="text-xs font-medium bg-white border-slate-200 rounded-md py-1 px-2 outline-none cursor-pointer"
                value={filters.from_date}
                onChange={(e) => setFilters(f => ({ ...f, from_date: e.target.value }))}
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                className="text-xs font-medium bg-white border-slate-200 rounded-md py-1 px-2 outline-none cursor-pointer"
                value={filters.to_date}
                onChange={(e) => setFilters(f => ({ ...f, to_date: e.target.value }))}
              />
              
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-md py-1 px-3 text-xs font-semibold transition-colors"
                style={{ color: ACCENT }}
              >
                <Download className="size-3.5" />
                Export
              </button>
              
              {(filters.user_id || filters.from_date || filters.to_date) && (
                <button
                  onClick={() => setFilters({ user_id: '', from_date: '', to_date: '' })}
                  className="flex items-center justify-center p-1 px-2 ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Clear filters"
                >
                  <X className="size-3.5" />
                  <span className="text-[10px] font-semibold ml-1">Clear</span>
                </button>
              )}
            </div>
          
          

          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border h-[32px]" style={{ background: theme.surfaceMuted, borderColor: theme.border, color: theme.textSecondary }}>
            <CalendarDays className="size-3.5" style={{ color: ACCENT }} />
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div> */}
      </motion.div>

      {/* ── KPI Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="rounded-xl border p-5 cursor-pointer group"
            style={card}
            onClick={() => {
              if (s.path.startsWith('#')) document.getElementById(s.path.substring(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              else navigate(s.path);
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: theme.surfaceMuted }}>
                <s.icon className="size-4" style={{ color: ACCENT }} />
              </div>
              <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: theme.textMuted }} />
            </div>
            <p className="text-2xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>{s.value}</p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: theme.textMuted }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Row 2: Jobs + Pipeline + Metrics ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Jobs by Status */}
        <motion.div variants={item} className="rounded-xl border p-5 cursor-pointer" style={card} onClick={() => navigate('/positions')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Jobs by Status</h3>
            <ChevronRight className="size-3.5" style={{ color: theme.textMuted }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(ts.active_jobs_by_status || []).map((j, idx) => {
              const clr = statusColor[j.status?.toLowerCase()] || ACCENT;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl p-3.5 flex flex-col justify-between hover:brightness-95 transition-all" 
                  style={{ background: theme.surfaceMuted }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/positions?status=${j.status?.toLowerCase()}`);
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 rounded-full" style={{ background: clr }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>{j.status}</span>
                  </div>
                  <span className="text-xl font-extrabold leading-none" style={{ color: theme.textPrimary }}>{j.count}</span>
                </div>
              );
            })}
            {(ts.active_jobs_by_status || []).length === 0 && (
              <div className="col-span-2 text-center py-6">
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>No active jobs</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pipeline Overview */}
        <motion.div variants={item} className="rounded-xl border p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Pipeline Overview</h3>
            {pipeTotal > 0 && (
              <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>{pipeTotal} <span className="font-medium" style={{ color: theme.textMuted }}>total</span></span>
            )}
          </div>
          {pipeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Target className="size-7" style={{ color: theme.textMuted + '50' }} />
              <p className="text-xs" style={{ color: theme.textMuted }}>No pipeline data</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
              {pipeData.map((d, i) => {
                const pct = pipeTotal > 0 ? (d.value / pipeTotal) * 100 : 0;
                const clr = PIE_COLORS[i % PIE_COLORS.length];
                return (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2.5 rounded-lg border hover:shadow-sm hover:brightness-95 transition-all group cursor-pointer bg-white" 
                    style={{ borderColor: theme.border }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/approvals/queue?stage=${encodeURIComponent(d.key)}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-7 rounded border font-bold text-[10px]" style={{ color: clr, borderColor: clr + '40', background: clr + '08' }}>
                        {Math.round(pct)}%
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: theme.textSecondary }}>{d.name}</span>
                    </div>
                    <span className="text-xs font-extrabold px-1" style={{ color: theme.textPrimary }}>{d.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={item} className="rounded-xl border p-5" style={card}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: theme.textPrimary }}>Key Metrics</h3>
          <div className="space-y-2.5">
            {[
              { icon: Timer, label: 'Avg. Time to Hire', value: `${data.average_time_to_hire_days} days`, color: ACCENT },
              { icon: CheckCircle2, label: 'Offer Acceptance', value: `${data.offer_acceptance_rate}%`, color: '#3AAF76' },
              { icon: XCircle, label: 'Rejection Rate', value: `${data.rejection_rate}%`, color: '#D9534F' },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: theme.surfaceMuted }}>
                <m.icon className="size-4 flex-shrink-0" style={{ color: m.color }} />
                <div className="flex-1">
                  <p className="text-[10px] font-medium" style={{ color: theme.textMuted }}>{m.label}</p>
                  <p className="text-base font-extrabold leading-tight" style={{ color: theme.textPrimary }}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Row 3: Funnel Chart + Hires ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div variants={item} className="lg:col-span-3 rounded-xl border p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Recruitment Funnel</h3>
              <p className="text-[11px] mt-0.5" style={{ color: theme.textMuted }}>Sourced vs Interviewed</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: theme.textMuted }}>
                <span className="size-2 rounded-full" style={{ background: CHART_A }} /> Sourced
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: theme.textMuted }}>
                <span className="size-2 rounded-full" style={{ background: '#3AAF76' }} /> Interviewed
              </span>
            </div>
          </div>
          {funnelData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <BarChart3 className="size-7" style={{ color: theme.textMuted + '50' }} />
              <p className="text-xs" style={{ color: theme.textMuted }}>No trend data</p>
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSourced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_A} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={CHART_A} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gInterviewed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3AAF76" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3AAF76" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: theme.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Sourced" stroke={CHART_A} strokeWidth={2} fillOpacity={1} fill="url(#gSourced)" />
                  <Area type="monotone" dataKey="Interviewed" stroke="#3AAF76" strokeWidth={2} fillOpacity={1} fill="url(#gInterviewed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2 rounded-xl border p-5 cursor-pointer" style={card} onClick={() => navigate('/clients')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Hires by Client</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: theme.surfaceMuted, color: theme.textSecondary }}>
              {hiresData.reduce((s, d) => s + d.hires_count, 0)} total
            </span>
          </div>
          {hiresData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <UserCheck className="size-7" style={{ color: theme.textMuted + '50' }} />
              <p className="text-xs" style={{ color: theme.textMuted }}>No hire data</p>
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiresData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="client_name" type="category" axisLine={false} tickLine={false} tick={{ fill: theme.textPrimary, fontSize: 11, fontWeight: 600 }} width={100} />
                  <RechartsTooltip cursor={{ fill: theme.surfaceHover }} contentStyle={{ backgroundColor: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '12px' }} />
                  <Bar dataKey="hires_count" name="Hires" radius={[0, 4, 4, 0]} barSize={14}>
                    {hiresData.map((_, i) => <Cell key={i} fill={i === 0 ? ACCENT : CHART_B} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Row 4: Upcoming Interviews ──────────────────────── */}
      <motion.div id="upcoming-interviews" variants={item} className="rounded-xl border p-5" style={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Upcoming Interviews</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: theme.surfaceMuted, color: theme.textMuted }}>
            {(data.upcoming_interviews || []).length} scheduled
          </span>
        </div>

        {(data.upcoming_interviews || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Video className="size-7" style={{ color: theme.textMuted + '50' }} />
            <p className="text-xs" style={{ color: theme.textMuted }}>No upcoming interviews</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left" style={{ minWidth: '820px' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  {['Candidate', 'Position', 'Client', 'Schedule', 'Round', 'Interviewer', 'Recruiter'].map((h) => (
                    <th key={h} className="pb-2.5 pr-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.upcoming_interviews || []).map((iv, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-black/[0.015] transition-colors cursor-pointer"
                    style={{ borderBottom: idx < (data.upcoming_interviews || []).length - 1 ? `1px solid ${theme.surfaceMuted}` : 'none' }}
                    onClick={() => navigate(`/positions/${iv.job_id}/pipeline`)}
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: theme.accentSoft, color: ACCENT }}>
                          {iv.candidate_name?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>{iv.candidate_name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-xs max-w-[150px] truncate" style={{ color: theme.textSecondary }}>{iv.job_title}</td>
                    <td className="py-3 pr-3 text-xs max-w-[120px] truncate" style={{ color: theme.textSecondary }}>{iv.client_name || iv.client?.name || '—'}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>{fmtTime(iv.time)}</span>
                        <span className="text-[10px]" style={{ color: theme.textMuted }}>· {fmtDate(iv.date)}</span>
                        {iv.mode && (
                          iv.mode === 'online' || iv.mode === 'video'
                            ? <Video className="size-3 ml-1" style={{ color: theme.info }} />
                            : <MapPin className="size-3 ml-1" style={{ color: theme.textMuted }} />
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: theme.warningSoft, color: theme.warning }}>{iv.round}</span>
                    </td>
                    <td className="py-3 pr-3 text-xs" style={{ color: theme.textSecondary }}>{iv.interviewer_name || '—'}</td>
                    <td className="py-3 pr-3">
                      {iv.worked_by ? (
                        <div>
                          <p className="text-[11px] font-semibold" style={{ color: theme.textPrimary }}>{iv.worked_by.name}</p>
                          <p className="text-[9px] capitalize" style={{ color: theme.textMuted }}>{iv.worked_by.role?.replace(/_/g, ' ')}</p>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: theme.textMuted }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Row 5: Activity + Top Jobs ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity */}
        <motion.div variants={item} className="lg:col-span-3 rounded-xl border p-5 cursor-pointer" style={card} onClick={() => navigate('/notifications')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Recent Activity</h3>
            {(data.unread_activity || []).length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: theme.destructiveSoft, color: theme.destructive }}>
                {(data.unread_activity || []).length} unread
              </span>
            )}
          </div>
          {(data.unread_activity || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Activity className="size-7" style={{ color: theme.textMuted + '50' }} />
              <p className="text-xs" style={{ color: theme.textMuted }}>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {(data.unread_activity || []).slice(0, 6).map((a, i) => {
                const clr = actColor[a.type] || ACCENT;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-black/[0.015] transition-colors"
                    onClick={(e) => { if (a.link) { e.stopPropagation(); navigate(a.link); } }}
                  >
                    <div className="size-7 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5" style={{ background: clr + '12', color: clr }}>
                      {a.type?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: theme.textPrimary }}>{a.title}</p>
                      <p className="text-[11px] line-clamp-1" style={{ color: theme.textSecondary }}>{a.message}</p>
                    </div>
                    <span className="text-[10px] font-medium flex-shrink-0 pt-0.5" style={{ color: theme.textMuted }}>{ago(a.created_at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Top Jobs */}
        <motion.div variants={item} className="lg:col-span-2 rounded-xl border p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Top Performing Jobs</h3>
            <span className="text-[10px] font-medium" style={{ color: theme.textMuted }}>By active candidates</span>
          </div>
          {topJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Briefcase className="size-7" style={{ color: theme.textMuted + '50' }} />
              <p className="text-xs" style={{ color: theme.textMuted }}>No job data</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {topJobs.slice(0, 6).map((j, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-black/[0.015] transition-colors group"
                  onClick={() => navigate(`/positions/${j.job_id}`)}
                >
                  <span className="text-[11px] font-bold w-5 text-center" style={{ color: theme.textMuted }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: theme.textPrimary }}>{j.title}</p>
                    <p className="text-[10px]" style={{ color: theme.textMuted }}>{j.active_candidates} candidates</p>
                  </div>
                  <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: theme.textMuted }} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;