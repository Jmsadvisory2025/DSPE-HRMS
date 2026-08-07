import { useNavigate } from 'react-router-dom';
import { theme } from '@/config/theme';
import RecruitOSLogo from '@/assets/RecruitOSLogo.png';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  FileSearch,
  CalendarCheck,
  BarChart3,
  BriefcaseBusiness,
  ArrowRight,
  Mail,
  Globe,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────── */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ── Feature data ─────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: 'Candidate Management',
    description: 'Organize and track candidates throughout the entire hiring pipeline with a centralized database.',
  },
  {
    icon: FileSearch,
    title: 'Resume Parsing',
    description: 'Automatically extract and structure candidate information from resumes with AI-powered parsing.',
  },
  {
    icon: Sparkles,
    title: 'AI Candidate Matching',
    description: 'Leverage intelligent algorithms to match the right candidates to the right positions in seconds.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Job Posting',
    description: 'Create, manage, and distribute job postings across your organization with streamlined workflows.',
  },
  {
    icon: CalendarCheck,
    title: 'Interview Scheduling',
    description: 'Coordinate interviews effortlessly with integrated calendar management and automated reminders.',
  },
  {
    icon: BarChart3,
    title: 'Recruitment Analytics',
    description: 'Gain actionable insights with real-time dashboards, hiring metrics, and performance reports.',
  },
];

const TRUST_BADGES = [
  { icon: Sparkles, label: 'AI-Powered' },
  { icon: ShieldCheck, label: 'Enterprise Security' },
  { icon: Zap, label: 'Lightning Fast' },
];

/* ── Component ────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: theme.background, color: theme.textPrimary }}
    >
      {/* ── Dot-grid ambient background ───────────────────────── */}
      <div
        className="fixed inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ════════════════════════════════════════════════════════
          NAVBAR
         ════════════════════════════════════════════════════════ */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: hexToRgba(theme.surface, 0.85),
          borderBottom: `1px solid ${hexToRgba(theme.border, 0.6)}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={RecruitOSLogo} alt="RecruitOS" className="size-9 object-contain" />
            <div>
              <span className="font-bold text-base tracking-wider" style={{ color: theme.textPrimary }}>
                RECRUIT-OS
              </span>
              <p className="text-[10px] -mt-0.5" style={{ color: theme.textMuted }}>
                by JMS Tech
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: theme.textSecondary }}>
              Features
            </a>
            <a href="#who" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: theme.textSecondary }}>
              Who It's For
            </a>
            <a href="#company" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: theme.textSecondary }}>
              Company
            </a>
            <a href="/privacy-policy" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: theme.textSecondary }}>
              Privacy Policy
            </a>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-lg cursor-pointer"
            style={{
              backgroundColor: theme.accent,
              color: theme.accentForeground,
              boxShadow: `0 4px 14px ${hexToRgba(theme.accent, 0.3)}`,
            }}
          >
            Sign In
            <ArrowRight className="size-4" />
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              backgroundColor: theme.accentSoft,
              color: theme.accent,
              border: `1px solid ${hexToRgba(theme.accent, 0.2)}`,
            }}
          >
            <Sparkles className="size-3.5" />
            AI-Powered Recruitment Platform
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
            style={{ color: theme.textPrimary }}
          >
            The Recruitment Platform
            <br />
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, ${theme.accent}, ${theme.chart2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Built for Modern Hiring
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: theme.textSecondary }}
          >
            RecruitOS helps organizations manage the complete recruitment lifecycle — from sourcing
            and screening to interviews and signed offers — all in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: theme.accentForeground,
                boxShadow: `0 8px 25px ${hexToRgba(theme.accent, 0.35)}`,
              }}
            >
              Get Started
              <ArrowRight className="size-5" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-medium transition-all duration-200 hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: theme.surface,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
            >
              Explore Features
              <ChevronRight className="size-4" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-medium" style={{ color: theme.textMuted }}>
                <div
                  className="size-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <Icon className="size-3.5" style={{ color: theme.accent }} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES SECTION
         ════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
            >
              <Zap className="size-3" />
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: theme.textPrimary }}>
              Everything You Need to Hire Smarter
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: theme.textSecondary }}>
              A comprehensive suite of tools designed to streamline every step of your recruitment process.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  backgroundColor: hexToRgba(theme.surface, 0.8),
                  border: `1px solid ${hexToRgba(theme.border, 0.6)}`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Hover gradient glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${hexToRgba(theme.accent, 0.05)}, transparent)`,
                  }}
                />
                <div
                  className="size-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <Icon className="size-6" style={{ color: theme.accent }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme.textPrimary }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHO IT'S FOR SECTION
         ════════════════════════════════════════════════════════ */}
      <section id="who" className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{
              backgroundColor: hexToRgba(theme.surface, 0.9),
              border: `1px solid ${hexToRgba(theme.border, 0.5)}`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 20px 50px ${hexToRgba(theme.textPrimary, 0.06)}`,
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
            >
              <Users className="size-3" />
              Who It's For
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6" style={{ color: theme.textPrimary }}>
              Built for Recruitment Teams
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: theme.textSecondary }}>
              RecruitOS is designed for HR teams, recruiters, hiring managers, and organizations of all sizes
              who want to streamline their hiring process and make smarter, data-driven recruitment decisions.
            </p>

            {/* Use-case bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
              {[
                'HR Departments',
                'Recruitment Agencies',
                'Hiring Managers',
                'Talent Acquisition Teams',
                'Staffing Firms',
                'Enterprise Organizations',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0" style={{ color: theme.success }} />
                  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CTA BANNER
         ════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="rounded-3xl py-16 px-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.chart2})`,
            }}
          >
            {/* Decorative dots overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
                Ready to Transform Your Hiring?
              </h2>
              <p className="text-base sm:text-lg max-w-xl mx-auto mb-8 text-white/80">
                Join teams that have streamlined their recruitment process with RecruitOS.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: theme.accent,
                }}
              >
                Sign In with Google Workspace
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOOTER
         ════════════════════════════════════════════════════════ */}
      <footer
        id="company"
        className="relative z-10 py-16 px-6"
        style={{
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: hexToRgba(theme.surface, 0.5),
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Company info */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={RecruitOSLogo} alt="RecruitOS" className="size-8 object-contain" />
                <span className="font-bold text-base tracking-wider" style={{ color: theme.textPrimary }}>
                  RECRUIT-OS
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: theme.textSecondary }}>
                AI-powered recruitment management platform developed by JMS Tech.
                Streamlining how organizations source, screen, and hire top talent.
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                © {new Date().getFullYear()} JMS Tech. All rights reserved.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-sm font-bold mb-4" style={{ color: theme.textPrimary }}>
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#features" className="text-sm transition-colors hover:underline" style={{ color: theme.textSecondary }}>
                    Features
                  </a>
                </li>
                <li>
                  <a href="#who" className="text-sm transition-colors hover:underline" style={{ color: theme.textSecondary }}>
                    Who It's For
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-sm transition-colors hover:underline" style={{ color: theme.textSecondary }}>
                    Sign In
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Contact */}
            <div>
              <h4 className="text-sm font-bold mb-4" style={{ color: theme.textPrimary }}>
                Legal & Contact
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="/privacy-policy" className="text-sm transition-colors hover:underline" style={{ color: theme.textSecondary }}>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                    <Mail className="size-3.5" style={{ color: theme.textMuted }} />
                    <a href="mailto:recruitosjmstech@gmail.com" className="hover:underline">
                      recruitosjmstech@gmail.com
                    </a>
                  </div>
                </li>
                <li>
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                    <Globe className="size-3.5" style={{ color: theme.textMuted }} />
                    <a href="https://recruitos.jmstech.co" className="hover:underline">
                      recruitos.jmstech.co
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
