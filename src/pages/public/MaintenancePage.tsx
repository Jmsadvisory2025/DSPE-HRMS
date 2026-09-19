import { theme } from '@/config/theme';
import { Construction, Sparkles, Clock, ArrowRight } from 'lucide-react';

const MaintenancePage = () => {
  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: theme.background }}
    >
      {/* Decorative floating shapes */}
      <div 
        className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${theme.accentSoft}, transparent 70%)` }}
      />
      <div 
        className="absolute bottom-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${theme.infoSoft}, transparent 70%)` }}
      />
      <div 
        className="absolute top-[40%] left-[10%] w-[200px] h-[200px] rounded-full opacity-30"
        style={{ background: `radial-gradient(circle, ${theme.successSoft}, transparent 70%)` }}
      />
      <div 
        className="absolute top-[20%] right-[15%] w-[180px] h-[180px] rounded-full opacity-25"
        style={{ background: `radial-gradient(circle, ${theme.warningSoft}, transparent 70%)` }}
      />

      {/* Main card */}
      <div 
        className="relative z-10 max-w-lg w-full mx-6 rounded-3xl shadow-xl overflow-hidden"
        style={{ 
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          boxShadow: `0 20px 60px -15px ${theme.accent}20, 0 4px 25px -5px rgba(0,0,0,0.08)`
        }}
      >
        {/* Top accent strip */}
        <div 
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.chart2}, ${theme.chart3})` }}
        />

        <div className="px-8 pt-10 pb-10 sm:px-12 text-center">

          {/* Animated icon cluster */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Background circle glow */}
            <div 
              className="absolute w-32 h-32 rounded-full animate-pulse opacity-60"
              style={{ background: theme.accentSoft }}
            />

            {/* Main icon circle */}
            <div 
              className="relative w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                boxShadow: `0 8px 32px ${theme.accent}40`
              }}
            >
              <Construction className="w-11 h-11 text-white animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            {/* Decorative sparkle badges */}
            <div 
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center animate-pulse shadow-md"
              style={{ background: theme.warning, animationDelay: '0.5s' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div 
              className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center animate-pulse shadow-md"
              style={{ background: theme.success, animationDelay: '1s' }}
            >
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3"
            style={{ color: theme.textPrimary }}
          >
            We're Upgrading!
          </h1>

          <p 
            className="text-base leading-relaxed mb-8 max-w-sm mx-auto"
            style={{ color: theme.textSecondary }}
          >
            Our platform is currently undergoing scheduled maintenance to bring you exciting new features and improvements. We'll be back shortly!
          </p>

          {/* Animated progress indicator */}
          <div className="mb-8">
            <div 
              className="w-full max-w-[280px] mx-auto h-2 rounded-full overflow-hidden relative"
              style={{ background: theme.surfaceMuted }}
            >
              <div 
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.chart2}, ${theme.chart3}, ${theme.accent})`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s ease-in-out infinite'
                }}
              />
            </div>
            <p 
              className="text-xs font-semibold uppercase tracking-widest mt-3 flex items-center justify-center gap-1.5"
              style={{ color: theme.accent }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: theme.success }} />
              Systems updating...
            </p>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div 
              className="p-4 rounded-xl text-left"
              style={{ background: theme.accentSoft, border: `1px solid ${theme.accent}20` }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.accent }}>
                What's happening?
              </div>
              <div className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                Platform upgrades & performance optimization
              </div>
            </div>
            <div 
              className="p-4 rounded-xl text-left"
              style={{ background: theme.successSoft, border: `1px solid ${theme.success}20` }}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: theme.success }}>
                Expected Downtime
              </div>
              <div className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                Should be back within a few hours
              </div>
            </div>
          </div>

          {/* CTA: Refresh */}
          {/* <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-95 cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
              color: theme.accentForeground,
              boxShadow: `0 4px 14px ${theme.accent}30`
            }}
          >
            Try Again
            <ArrowRight className="w-4 h-4" />
          </button> */}

        </div>
      </div>

      {/* Footer */}
      <p 
        className="relative z-10 text-xs mt-8 font-medium"
        style={{ color: theme.textMuted }}
      >
        © {new Date().getFullYear()} Recruit-OS  •  We appreciate your patience
      </p>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
