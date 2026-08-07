import { useNavigate } from 'react-router-dom';
import { theme } from '@/config/theme';
import RecruitOSLogo from '@/assets/RecruitOSLogo.png';
import { ArrowLeft, Mail, Globe, ShieldCheck } from 'lucide-react';

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ── Policy sections ──────────────────────────────────────────── */
const SECTIONS = [
  {
    title: 'Information We Collect',
    content: `We may collect the following information:`,
    bullets: [
      'Name',
      'Email address',
      'Organization or company name',
      'User account information',
      'Recruitment-related information such as job postings, candidate details, interview records, and hiring status',
      'Device information, browser type, IP address, and usage logs',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: 'We use the information we collect to:',
    bullets: [
      'Provide and maintain the RECRUIT-OS platform',
      'Authenticate users using Google Sign-In',
      'Manage recruitment processes',
      'Improve our services and user experience',
      'Communicate important service updates',
      'Protect the security of our platform',
      'Comply with legal obligations',
    ],
  },
  {
    title: 'Google Sign-In',
    content: `RECRUIT-OS allows users to sign in using their Google account. When you sign in with Google, we may receive basic profile information such as:`,
    bullets: [
      'Name',
      'Email address',
      'Profile picture (if available)',
    ],
    after: 'We only request the information necessary for user authentication. We do not access your Gmail, Google Drive, Google Calendar, or any other Google services unless you explicitly authorize additional permissions.',
  },
  {
    title: 'Data Sharing',
    content: 'We do not sell or rent your personal information. We may share information only:',
    bullets: [
      'With your organization or authorized administrators',
      'With trusted service providers that help us operate the platform',
      'When required by law or legal process',
      'To protect the security, rights, and integrity of RECRUIT-OS',
    ],
  },
  {
    title: 'Data Security',
    content: 'We use appropriate technical and organizational measures to protect your information, including secure connections, access controls, and industry-standard security practices.\n\nAlthough we take reasonable steps to protect your data, no method of electronic storage or transmission is completely secure.',
  },
  {
    title: 'Data Retention',
    content: 'We retain your information only for as long as necessary to provide our services, meet legal obligations, resolve disputes, and enforce our agreements.',
  },
  {
    title: 'Cookies',
    content: 'RECRUIT-OS may use cookies and similar technologies to:',
    bullets: [
      'Maintain secure user sessions',
      'Remember user preferences',
      'Improve website performance',
      'Analyze platform usage',
    ],
    after: 'You can manage or disable cookies through your browser settings.',
  },
  {
    title: 'Third-Party Services',
    content: 'Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third-party websites.',
  },
  {
    title: "Children's Privacy",
    content: 'RECRUIT-OS is intended for business and professional use and is not designed for children under the age of 13. We do not knowingly collect personal information from children.',
  },
  {
    title: 'Changes to This Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date.',
  },
];

/* ── Component ────────────────────────────────────────────────── */
const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: theme.background, color: theme.textPrimary }}
    >
      {/* Dot-grid ambient background */}
      <div
        className="fixed inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          backgroundColor: hexToRgba(theme.surface, 0.85),
          borderBottom: `1px solid ${hexToRgba(theme.border, 0.6)}`,
        }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
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

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80 cursor-pointer"
            style={{ color: theme.textSecondary }}
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </button>
        </div>
      </nav>

      {/* ── Content ───────────────────────────────────────────── */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              backgroundColor: theme.accentSoft,
              color: theme.accent,
              border: `1px solid ${hexToRgba(theme.accent, 0.2)}`,
            }}
          >
            <ShieldCheck className="size-3.5" />
            Your Privacy Matters
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style={{ color: theme.textPrimary }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            Effective Date: 07 August 2026
          </p>
        </div>

        {/* Policy card */}
        <div
          className="rounded-2xl p-8 sm:p-10 space-y-8"
          style={{
            backgroundColor: hexToRgba(theme.surface, 0.9),
            border: `1px solid ${hexToRgba(theme.border, 0.5)}`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 20px 50px ${hexToRgba(theme.textPrimary, 0.06)}`,
          }}
        >
          {/* Introduction */}
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: theme.textPrimary }}>
              Introduction
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
              RECRUIT-OS ("we," "our," or "us") is a recruitment management platform developed by JMS Tech.
              This Privacy Policy explains how we collect, use, store, and protect your information when you
              use our website and services.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: theme.textSecondary }}>
              By using RECRUIT-OS, you agree to the terms of this Privacy Policy.
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map(({ title, content, bullets, after }, index) => (
            <div key={index}>
              <h2 className="text-xl font-bold mb-3" style={{ color: theme.textPrimary }}>
                {title}
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: theme.textSecondary }}>
                {content}
              </p>
              {bullets && (
                <ul className="mt-3 space-y-1.5">
                  {bullets.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      <span
                        className="mt-1.5 size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.accent }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {after && (
                <p className="text-sm leading-relaxed mt-3" style={{ color: theme.textSecondary }}>
                  {after}
                </p>
              )}
            </div>
          ))}

          {/* Contact */}
          <div
            className="rounded-xl p-6"
            style={{
              backgroundColor: theme.surfaceMuted,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h2 className="text-xl font-bold mb-3" style={{ color: theme.textPrimary }}>
              Contact Us
            </h2>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              If you have any questions regarding this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2.5">
              <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                JMS Tech
              </p>
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                <Mail className="size-4" style={{ color: theme.textMuted }} />
                <a href="mailto:recruitosjmstech@gmail.com" className="hover:underline" style={{ color: theme.accent }}>
                  recruitosjmstech@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: theme.textSecondary }}>
                <Globe className="size-4" style={{ color: theme.textMuted }} />
                <a href="https://recruitos.jmstech.co" className="hover:underline" style={{ color: theme.accent }}>
                  recruitos.jmstech.co
                </a>
              </div>
            </div>
          </div>

          {/* Closing */}
          <p className="text-sm leading-relaxed pt-4" style={{ color: theme.textMuted, borderTop: `1px solid ${theme.border}` }}>
            By using RECRUIT-OS, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
          </p>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="relative z-10 py-8 px-6"
        style={{ borderTop: `1px solid ${theme.border}` }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: theme.textMuted }}>
            © {new Date().getFullYear()} JMS Tech. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs hover:underline" style={{ color: theme.textMuted }}>
              Home
            </a>
            <a href="/login" className="text-xs hover:underline" style={{ color: theme.textMuted }}>
              Sign In
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
