import { motion } from 'framer-motion';
import { theme } from '@/config/theme';
import { 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  CalendarDays,
  ArrowUpRight,
  Activity,
  Video,
  Target,
  Award,
  Zap,
  Info
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
  PieChart,
  Pie
} from 'recharts';

// --- DUMMY DATA (Indian Context) ---
const statCards = [
  { title: 'Total Candidates', value: '14,250', trend: '+12.5%', trendUp: true, icon: Users, color: '#3b82f6' },
  { title: 'Active Positions', value: '184', trend: '+8.2%', trendUp: true, icon: Briefcase, color: '#8b5cf6' },
  { title: 'Interviews Today', value: '32', trend: '+15.4%', trendUp: true, icon: Video, color: '#f59e0b' },
  { title: 'Placements (YTD)', value: '412', trend: '+28.1%', trendUp: true, icon: CheckCircle2, color: '#10b981' },
];

const pipelineData = [
  { name: 'Jan', Sourced: 1200, Screened: 840, Interviewed: 450, Hired: 120 },
  { name: 'Feb', Sourced: 1400, Screened: 939, Interviewed: 580, Hired: 150 },
  { name: 'Mar', Sourced: 1100, Screened: 780, Interviewed: 400, Hired: 90 },
  { name: 'Apr', Sourced: 1578, Screened: 1190, Interviewed: 700, Hired: 210 },
  { name: 'May', Sourced: 1889, Screened: 1480, Interviewed: 918, Hired: 280 },
  { name: 'Jun', Sourced: 1639, Screened: 1280, Interviewed: 850, Hired: 240 },
  { name: 'Jul', Sourced: 2149, Screened: 1630, Interviewed: 1110, Hired: 310 },
];

const sourceData = [
  { name: 'Naukri.com', value: 850, color: '#0a66c2' },
  { name: 'LinkedIn', value: 720, color: '#8b5cf6' },
  { name: 'Employee Referrals', value: 430, color: '#10b981' },
  { name: 'Instahyre', value: 290, color: '#f43f5e' },
  { name: 'Campus Drives', value: 180, color: '#f59e0b' },
];

const departmentData = [
  { name: 'Engineering', value: 45 },
  { name: 'Sales', value: 25 },
  { name: 'Marketing', value: 15 },
  { name: 'HR & Admin', value: 10 },
  { name: 'Finance', value: 5 },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];

const recentActivity = [
  { user: 'Rahul Sharma', action: 'scheduled an interview for', candidate: 'Priya Patel', role: 'Senior React Developer', time: '10 mins ago', avatar: 'RS' },
  { user: 'Neha Gupta', action: 'approved a new requisition:', candidate: 'Product Manager (B2B)', role: 'Product Team', time: '1 hour ago', avatar: 'NG' },
  { user: 'System', action: 'received', candidate: '42 new applications', role: 'Data Analyst Role', time: '3 hours ago', avatar: 'S' },
  { user: 'Amit Kumar', action: 'extended an offer to', candidate: 'Rohan Desai', role: 'DevOps Lead', time: '5 hours ago', avatar: 'AK' },
  { user: 'Sneha Reddy', action: 'rejected', candidate: 'Vikram Singh', role: 'Backend Engineer', time: 'Yesterday', avatar: 'SR' },
];

const upcomingInterviews = [
  { candidate: 'Anjali Verma', role: 'UI/UX Designer', time: '10:30 AM', interviewer: 'Karthik N.', type: 'Technical Round' },
  { candidate: 'Siddharth Rao', role: 'Full Stack Engineer', time: '11:45 AM', interviewer: 'Rahul S.', type: 'System Design' },
  { candidate: 'Meera Iyer', role: 'Marketing Head', time: '02:00 PM', interviewer: 'Neha G.', type: 'Culture Fit' },
  { candidate: 'Arjun Nair', role: 'Cloud Architect', time: '04:15 PM', interviewer: 'Amit K.', type: 'Final Round' },
];

const keyMetrics = [
  { label: 'Time to Hire', value: '18 Days', target: '< 21 Days', status: 'good', icon: Zap },
  { label: 'Offer Acceptance', value: '82%', target: '> 80%', status: 'good', icon: Award },
  { label: 'Cost per Hire', value: '₹24,500', target: '< ₹30,000', status: 'good', icon: Target },
  { label: 'Diversity Ratio', value: '34%', target: '> 40%', status: 'warning', icon: Users },
];

const DashboardPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.08 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div 
      className="space-y-8  "
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b" style={{ borderColor: theme.border }}>
        <div>
          <div
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 text-xs font-medium"
  style={{
    background: "#f59e0b20",
    color: "#b45309",
    border: "1px solid #f59e0b40",
  }}
>
  <Info className="size-3.5" />
  We're improving the dashboard. Until maintenance is complete, you'll see demo data instead of live information.
</div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Dashboard Overview
          </h1>
          <p className="text-base mt-2" style={{ color: theme.textSecondary }}>
            Welcome back! Here's a comprehensive look at your recruitment performance.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm px-5 py-2.5 rounded-xl border shadow-sm backdrop-blur-md" 
             style={{ background: theme.surfaceHover, borderColor: theme.border, color: theme.textSecondary }}>
          <CalendarDays className="size-5" style={{ color: theme.accent }} />
          <span className="font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border p-7 shadow-sm group hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 opacity-10 blur-3xl pointer-events-none rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-20" 
                 style={{ background: stat.color }} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="p-3.5 rounded-2xl shadow-sm" style={{ background: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}30` }}>
                <stat.icon className="size-6" strokeWidth={2.5} />
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm" 
                    style={{ 
                      background: stat.trendUp ? '#10b98115' : '#ef444415', 
                      color: stat.trendUp ? '#10b981' : '#ef4444',
                      border: `1px solid ${stat.trendUp ? '#10b98130' : '#ef444430'}`
                    }}>
                {stat.trendUp ? <TrendingUp className="size-3.5" /> : <TrendingUp className="size-3.5 rotate-180" />}
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1.5 relative z-10">
              <h3 className="text-4xl font-black tracking-tight" style={{ color: theme.textPrimary }}>{stat.value}</h3>
              <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: theme.textMuted }}>{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Charts and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Pipeline Chart (Spans 2 columns) */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Recruitment Funnel Trend</h3>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Volume of candidates sourced vs interviewed</p>
            </div>
            <select className="px-3 py-1.5 text-sm rounded-lg border outline-none font-medium" 
                    style={{ background: theme.surfaceHover, borderColor: theme.border, color: theme.textPrimary }}>
              <option>Last 7 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 min-h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSourced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterviewed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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

        {/* Key Metrics Panel */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Efficiency Metrics</h3>
            <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Current vs Target KPIs</p>
          </div>
          <div className="flex-1 flex flex-col justify-between gap-4">
            {keyMetrics.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border group hover:border-transparent transition-all"
                   style={{ background: theme.surfaceHover, borderColor: theme.border }}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg" style={{ background: metric.status === 'good' ? '#10b98120' : '#f59e0b20', color: metric.status === 'good' ? '#10b981' : '#f59e0b' }}>
                    <metric.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{metric.label}</p>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Target: {metric.target}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black" style={{ color: theme.textPrimary }}>{metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3: Upcoming Interviews & Sourcing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Interviews List */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 rounded-3xl border shadow-sm p-7"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Upcoming Interviews</h3>
              <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Scheduled for today</p>
            </div>
            <button className="text-sm font-bold hover:underline" style={{ color: theme.accent }}>View Calendar</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b" style={{ borderColor: theme.border }}>
                  <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Candidate</th>
                  <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Role</th>
                  <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Time</th>
                  <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Round</th>
                  <th className="py-3 px-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: theme.border }}>
                {upcomingInterviews.map((interview, idx) => (
                  <tr key={idx} className="hover:bg-black/5 transition-colors group">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full flex items-center justify-center font-bold text-xs" 
                             style={{ background: theme.accent + '20', color: theme.accent }}>
                          {interview.candidate.charAt(0)}
                        </div>
                        <span className="font-bold text-sm" style={{ color: theme.textPrimary }}>{interview.candidate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm font-medium" style={{ color: theme.textSecondary }}>{interview.role}</td>
                    <td className="py-4 px-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                            style={{ background: theme.surfaceMuted, color: theme.textPrimary }}>
                        <Clock className="size-3" style={{ color: theme.accent }} />
                        {interview.time}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm" style={{ color: theme.textMuted }}>{interview.type}</td>
                    <td className="py-4 px-2">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-white font-medium text-xs px-3"
                              style={{ background: theme.accent }}>
                        Join Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Source Distribution */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-3xl border shadow-sm p-7 flex flex-col"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="mb-2">
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Top Sourcing Channels</h3>
          </div>
          <div className="flex-1 min-h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: theme.textPrimary, fontSize: 13, fontWeight: 600 }} width={120} />
                <RechartsTooltip 
                  cursor={{ fill: theme.surfaceHover }}
                  contentStyle={{ backgroundColor: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}` }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Recent Activity & Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: theme.accent + '20' }}>
                <Activity className="size-5" style={{ color: theme.accent }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Team Activity Log</h3>
            </div>
            <button className="text-sm font-bold hover:underline" style={{ color: theme.textMuted }}>View All</button>
          </div>
          
          <div className="space-y-7 pl-2">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex gap-5 group">
                <div className="relative flex flex-col items-center">
                  <div className="size-11 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-sm border-2"
                       style={{ background: theme.surface, color: theme.textPrimary, borderColor: theme.border }}>
                    {activity.avatar}
                  </div>
                  {idx !== recentActivity.length - 1 && (
                    <div className="absolute top-11 bottom-[-28px] w-[2px]" style={{ background: theme.border }} />
                  )}
                </div>
                <div className="pt-1.5 flex-1">
                  <p className="text-[15px] leading-relaxed" style={{ color: theme.textPrimary }}>
                    <span className="font-bold">{activity.user}</span>{' '}
                    <span style={{ color: theme.textSecondary }}>{activity.action}</span>{' '}
                    <span className="font-bold" style={{ color: theme.accent }}>{activity.candidate}</span>{' '}
                    <span style={{ color: theme.textSecondary }}>for</span>{' '}
                    <span className="font-bold">{activity.role}</span>
                  </p>
                  <p className="text-xs font-semibold mt-1.5 uppercase tracking-wider" style={{ color: theme.textMuted }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Department Breakdown */}
        <motion.div 
          variants={itemVariants}
          className="rounded-3xl border shadow-sm p-7 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="absolute top-7 left-7">
             <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>Hires by Department</h3>
             <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Distribution across teams</p>
          </div>
          
          <div className="w-full h-[350px] mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: theme.surface, borderRadius: '8px', border: `1px solid ${theme.border}` }}
                  itemStyle={{ color: theme.textPrimary, fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {departmentData.map((dept, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                <span className="text-sm font-medium" style={{ color: theme.textSecondary }}>{dept.name} ({dept.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

export default DashboardPage;