import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBreadcrumb from './AppBreadcrumb';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { theme } from '@/config/theme';
import { useAuth } from '@/context/AuthContext';

const AppTopbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header
      className="h-16 flex items-center px-6 sticky top-0 z-40 relative"
      style={{
        background: theme.background,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex-1">
        <AppBreadcrumb />
      </div>

      {/* Profile Section */}
      <div className="ml-auto flex items-center gap-4 shrink-0 relative group">
        <button
          className="flex items-center gap-3 outline-none text-left rounded-full py-1 pl-1 pr-3 transition-colors"
          style={{ border: `1px solid transparent` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.surface;
            e.currentTarget.style.borderColor = theme.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Avatar className="size-8 shrink-0 ring-2" style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}>
            {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name || "User"} />}
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                background: theme.accentSoft,
                color: theme.accent,
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>{user?.name || 'User'}</p>
            <p className="text-[10px] uppercase" style={{ color: theme.textMuted }}>{user?.role || ''}</p>
          </div>
        </button>

        {/* Dropdown Menu (Hover based) */}
        <div 
          className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1"
          style={{ 
            background: theme.surface, 
            border: `1px solid ${theme.borderStrong}`,
            zIndex: 50 
          }}
        >
          <div className="px-3 py-2 border-b" style={{ borderColor: theme.border }}>
            <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>{user?.name || 'User'}</p>
            <p className="text-xs truncate" style={{ color: theme.textMuted }}>{user?.email || ''}</p>
          </div>

          <div className="p-1">
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.surfaceHover;
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              <UserIcon className="size-4" />
              Profile
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: theme.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.surfaceHover;
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }}
            >
              <Settings className="size-4" />
              Settings
            </button>
          </div>
          
          <div className="p-1 border-t" style={{ borderColor: theme.border }}>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors"
              style={{ color: theme.destructive }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.destructive + '15'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppTopbar;
