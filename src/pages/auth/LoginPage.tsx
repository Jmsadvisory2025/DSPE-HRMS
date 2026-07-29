import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextFlippingBoard } from '@/components/ui/text-flipping-board';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ShieldCheck, Zap, Lock, Mail, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAppDispatch } from '@/store/hooks';
import { authActions } from '@/redux/actions';
import { setCredentials } from '@/redux/slices/authSlice';
import type { LoginResponse, LoginErrorResponse } from '@/types/auth.types';
import { toast } from 'sonner';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@base-ui/react';

// Longer, benefit-led copy — the board is 22 cols x 6 rows, so these wrap
// automatically across 2-3 lines instead of sitting as one short line.
const FEATURE_TEXTS = [
  "CONNECTING EXCEPTIONAL TALENT WITH VISIONARY TEAMS",
  "AI POWERED CANDIDATE MATCHING IN SECONDS NOT WEEKS",
  "STREAMLINED HIRING FROM FIRST SOURCE TO SIGNED OFFER",
  "BANK GRADE SECURITY BUILT FOR ENTERPRISE RECRUITING",
  "TRUSTED BY LEADING TEAMS HIRING WORLDWIDE",
];

// Flip animation takes 2s, then holds for 3s before the next flip begins.
const FLIP_DURATION_S = 2.0;
const HOLD_DURATION_S = 1.0;
const CYCLE_MS = (FLIP_DURATION_S + HOLD_DURATION_S) * 1000; // 5000ms

// theme.ts stores solid hex values, so glows/soft washes need an alpha
// version of the same color rather than a separate token.
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const LoginPage = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('11111111');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % FEATURE_TEXTS.length);
    }, CYCLE_MS);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch Google Client ID from backend
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google-config/`)
      .then(res => res.json())
      .then(data => {
        if (data.client_id) {
          setGoogleClientId(data.client_id);
        }
      })
      .catch(err => console.error("Failed to fetch Google config", err));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch({
      type: authActions.LOGIN,
      method: "POST" as const,
      endPoint: "/api/v1/auth/login/",
      body: { email, password },
      auth: false,
      setLoading,
      showSuccessMessage: true,
      getResponse: (data: unknown) => {
        const res = data as LoginResponse;
        dispatch(
          setCredentials({
            user: res.user,
            accessToken: res.access,
            refreshToken: res.refresh,
          })
        );
        navigate('/dashboard');
        toast.success("Login successful");
      },
      getError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: LoginErrorResponse } };
        const msg =
          axiosErr?.response?.data?.detail ||
          axiosErr?.response?.data?.error ||
          'Something went wrong. Please try again.';
        toast.error(msg);
      },
    });
  };

  const handleGoogleLogin = (credential: string | undefined) => {
    if (!credential) {
      toast.error("Google Login failed: No credential received.");
      return;
    }

    dispatch({
      type: authActions.LOGIN,
      method: "POST" as const,
      endPoint: "/api/v1/auth/google/",
      body: { id_token: credential },
      auth: false,
      setLoading,
      showSuccessMessage: true,
      getResponse: (data: unknown) => {
        const res = data as LoginResponse;
        dispatch(
          setCredentials({
            user: res.user,
            accessToken: res.access,
            refreshToken: res.refresh,
          })
        );
        navigate('/dashboard');
        toast.success("Google Login successful");
      },
      getError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: LoginErrorResponse } };
        const msg =
          axiosErr?.response?.data?.detail ||
          axiosErr?.response?.data?.error ||
          'Something went wrong during Google Login.';
        toast.error(msg);
      },
    });
  };

  return (
    <div
      className="h-screen w-full relative overflow-hidden flex flex-col"
      style={{ backgroundColor: theme.background, color: theme.textPrimary }}
    >
      {/* ── Shared ambient canvas — spans the FULL page, no hard split ───────────── */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${theme.border} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
    

      <div className="relative z-10 h-full w-full flex items-center justify-center px-6 py-4 lg:px-12">
        <div className="w-full max-w-5xl flex items-center gap-10 lg:gap-16 xl:gap-20">
          {/* ── Left: Flipping Board Showcase ─────────────────────────────────────── */}
          <div className="hidden lg:flex flex-1 flex-col justify-center gap-10">
            {/* Brand Header */}
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: theme.accent,
                  color: theme.accentForeground,
                  boxShadow: `0 10px 25px -5px ${hexToRgba(theme.accent, 0.35)}`,
                }}
              >
                <Zap className="size-5" />
              </div>
              <div className=''>
                <h1 className="font-bold text-lg tracking-wider" style={{ color: theme.textPrimary }}>
                  RECRUIT-OS
                </h1>
                <p className="text-xs" style={{ color: theme.textMuted }}>
                  Next-Gen Recruitment Platform
                </p>
              </div>
            </div>

            {/* Flipping Board Display */}
            <div className="space-y-7">
             

              <div className="w-full transform scale-95 hover:scale-100 transition-transform duration-500 ease-out">
                <TextFlippingBoard
                  text={FEATURE_TEXTS[textIndex]}
                  duration={FLIP_DURATION_S}
                />
              </div>

              <div className="space-y-3 max-w-md pl-1">
                <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textSecondary }}>
                  Transforming how teams source, screen, and hire top talent.
                </p>
                <div className="flex items-center gap-2">
                  {FEATURE_TEXTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTextIndex(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === textIndex ? '24px' : '6px',
                        backgroundColor: i === textIndex ? theme.accent : theme.textMuted,
                        opacity: i === textIndex ? 1 : 0.4,
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Badges Footer */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                <div
                  className="size-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <Sparkles className="size-3.5" style={{ color: theme.accent }} />
                </div>
                <span>AI Automated Matching</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                <div
                  className="size-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <ShieldCheck className="size-3.5" style={{ color: theme.accent }} />
                </div>
                <span>Enterprise Grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: theme.textMuted }}>
                <div
                  className="size-7 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.accentSoft }}
                >
                  <Zap className="size-3.5" style={{ color: theme.accent }} />
                </div>
                <span>Instant Sync & Analytics</span>
              </div>
            </div>
          </div>

          {/* ── Right: Login Card, floating on the same canvas ────────────────────── */}
          <div className="w-full lg:w-auto lg:flex-1 flex items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              {/* Mobile Logo Header */}
              <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
                <div
                  className="size-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.accent, color: theme.accentForeground }}
                >
                  <Zap className="size-5" />
                </div>
                <span className="font-bold text-xl tracking-wider" style={{ color: theme.textPrimary }}>
                  RECRUIT-OS
                </span>
              </div>

              <Card
                className="backdrop-blur-xl shadow-2xl"
                style={{
                  backgroundColor: hexToRgba(theme.surface, 0.75),
                  borderColor: theme.border,
                  boxShadow: `0 25px 50px -12px ${hexToRgba('#000000', 0.4)}`,
                }}
              >
                <CardHeader className="space-y-3 text-center pb-6 pt-4">
                  <div className="flex justify-center mb-2">
                    <div
                      className="size-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: theme.surfaceMuted, color: theme.accent, border: `1px solid ${theme.border}` }}
                    >
                      <Zap className="size-6" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-sm px-4" style={{ color: theme.textMuted }}>
                    Sign in with your Google Workspace account to access RecruitOS.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pb-10">
                  {googleClientId ? (
                    <div className="flex flex-col items-center justify-center gap-4">
                      <GoogleOAuthProvider clientId={googleClientId}>
                        <div className="hover:scale-105 transition-transform duration-300">
                          <GoogleLogin
                            onSuccess={(credentialResponse) => {
                              handleGoogleLogin(credentialResponse.credential);
                            }}
                            onError={() => {
                              toast.error("Google Login failed. Please try again.");
                            }}
                            useOneTap
                            theme="filled_black"
                            size="large"
                            text="continue_with"
                            shape="pill"
                            width="300"
                          />
                        </div>
                      </GoogleOAuthProvider>
                      <div className="flex items-center gap-1.5 mt-4 text-xs" style={{ color: theme.textMuted }}>
                        <ShieldCheck className="size-3.5" />
                        <span>Secure, single sign-on access</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Loader2 className="size-6 animate-spin mb-2" style={{ color: theme.accent }} />
                      <span className="text-xs" style={{ color: theme.textMuted }}>Initializing secure connection...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;