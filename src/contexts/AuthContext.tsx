import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { api } from '../services/api';

export type UserRole = 'admin' | 'moderator' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage_users'
  | 'manage_security'
  | 'manage_settings'
  | 'export_data'
  | 'view_analytics'
  | 'manage_tokens'
  | 'manage_trust_levels';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_security',
    'manage_settings',
    'export_data',
    'view_analytics',
    'manage_tokens',
    'manage_trust_levels',
  ],
  moderator: [
    'read',
    'write',
    'manage_security',
    'export_data',
    'view_analytics',
    'manage_trust_levels',
  ],
  viewer: ['read', 'view_analytics'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;

  const login = useCallback(async (apiKey: string) => {
    // API key is already set on the api client upstream; fetch current user profile
    const profile = await api.getCurrentUser();
    const role = (profile?.role as UserRole) || 'viewer';
    const permissions: Permission[] = profile?.permissions?.length
      ? profile.permissions
      : ROLE_PERMISSIONS[role] || [];

    const normalizedUser: User = {
      id: profile?.id?.toString?.() || 'unknown',
      username: profile?.username || profile?.email || 'user',
      email: profile?.email || 'unknown',
      role,
      permissions,
      avatar: profile?.avatar,
      createdAt: profile?.createdAt || new Date().toISOString(),
      lastLogin: profile?.lastLogin || new Date().toISOString(),
    };

    setUser(normalizedUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pulse_buy_bot_api_key');
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user]
  );

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Permission guard component
interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Role guard component
interface RoleGuardProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
