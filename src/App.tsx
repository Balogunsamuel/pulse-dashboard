import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from './services/api';
import Dashboard from './components/Dashboard';
import TokenList from './components/TokenList';
import SecurityDashboard from './components/SecurityDashboard';
import TrustLevelDashboard from './components/TrustLevelDashboard';
import MonitoringDashboard from './components/MonitoringDashboard';
import ApiKeyPrompt from './components/ApiKeyPrompt';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardSkeleton } from './components/LoadingSkeleton';
import { CommandPalette, Command } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { WebSocketStatus } from './components/WebSocketStatus';
import { NotificationPreferences } from './components/NotificationPreferences';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { UserManagement } from './components/UserManagement';
import { AuditLog } from './components/AuditLog';
import { useKeyboardShortcuts, useCommandPalette } from './hooks/useKeyboardShortcuts';
import { useSessionTimeout } from './hooks/useSessionTimeout';

type ActiveView = 'overview' | 'security' | 'trust' | 'monitoring' | 'tokens' | 'analytics' | 'users' | 'audit' | 'notification-settings';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const { login: authLogin, logout: authLogout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    // Check if we have a saved session or API key
    const storedSessionToken = localStorage.getItem('pulse_buy_bot_session_token');
    const storedApiKey = localStorage.getItem('pulse_buy_bot_api_key');

    if (storedSessionToken) {
      // Try to use existing session token
      verifySession();
    } else if (storedApiKey) {
      // Login with stored API key to get new session
      verifyApiKey(storedApiKey);
    } else {
      setLoading(false);
    }
  }, []);

  const verifySession = async () => {
    try {
      // Session token is already loaded in api constructor
      await authLogin(''); // Empty string since we're using session token
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Invalid session, need to login:', error);
      // Session expired, check if we have API key to re-login
      const storedApiKey = localStorage.getItem('pulse_buy_bot_api_key');
      if (storedApiKey) {
        verifyApiKey(storedApiKey);
      } else {
        api.clearSession();
        setIsAuthenticated(false);
        setLoading(false);
      }
    }
  };

  const verifyApiKey = async (apiKey: string) => {
    try {
      // Login with API key to get session token
      await api.login(apiKey);
      await authLogin(apiKey);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Invalid API key:', error);
      localStorage.removeItem('pulse_buy_bot_api_key');
      api.clearSession();
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const handleApiKeySubmit = async (key: string) => {
    setLoading(true);

    try {
      // Login with API key to get session token
      await api.login(key);
      await authLogin(key);
      localStorage.setItem('pulse_buy_bot_api_key', key);
      setIsAuthenticated(true);
    } catch (error) {
      alert('Invalid API key or unable to fetch user profile. Please try again.');
      api.clearSession();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse_buy_bot_api_key');
    authLogout();
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  // Session timeout
  useSessionTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes
    onTimeout: () => {
      toast.warning('Session expired. Please login again.');
      handleLogout();
    },
    enabled: isAuthenticated,
  });

  // Command palette
  useCommandPalette(() => setCommandPaletteOpen(true));

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: '1',
        altKey: true,
        action: () => setActiveView('overview'),
        description: 'Go to Overview',
      },
      {
        key: '2',
        altKey: true,
        action: () => setActiveView('security'),
        description: 'Go to Security',
      },
      {
        key: '3',
        altKey: true,
        action: () => setActiveView('trust'),
        description: 'Go to Trust Levels',
      },
      {
        key: 'd',
        altKey: true,
        action: toggleTheme,
        description: 'Toggle dark mode',
      },
    ],
    isAuthenticated
  );

  // Commands for command palette
  const commands: Command[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: '📊',
      action: () => setActiveView('overview'),
      category: 'Navigation',
      keywords: ['home', 'dashboard', 'stats'],
    },
    {
      id: 'security',
      label: 'Security Dashboard',
      icon: '🛡️',
      action: () => setActiveView('security'),
      category: 'Navigation',
      keywords: ['spam', 'raid', 'protection'],
    },
    {
      id: 'trust',
      label: 'Trust Levels',
      icon: '⭐',
      action: () => setActiveView('trust'),
      category: 'Navigation',
      keywords: ['users', 'levels', 'reputation'],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: '📊',
      action: () => setActiveView('monitoring'),
      category: 'Navigation',
      keywords: ['health', 'uptime', 'performance'],
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: '💎',
      action: () => setActiveView('tokens'),
      category: 'Navigation',
      keywords: ['crypto', 'blockchain', 'assets'],
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: '📈',
      action: () => setActiveView('analytics'),
      category: 'Navigation',
      keywords: ['charts', 'trends', 'stats', 'analysis'],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      action: () => setActiveView('users'),
      category: 'Navigation',
      keywords: ['roles', 'permissions', 'admin', 'invite'],
    },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: '📋',
      action: () => setActiveView('audit'),
      category: 'Navigation',
      keywords: ['logs', 'history', 'changes', 'activity'],
    },
    {
      id: 'notification-settings',
      label: 'Notification Settings',
      icon: '🔔',
      action: () => setActiveView('notification-settings'),
      category: 'Settings',
      keywords: ['notifications', 'alerts', 'preferences'],
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Dark Mode',
      icon: theme === 'dark' ? '☀️' : '🌙',
      action: toggleTheme,
      category: 'Appearance',
      keywords: ['dark', 'light', 'theme', 'mode'],
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: '🚪',
      action: handleLogout,
      category: 'Account',
      keywords: ['sign out', 'exit', 'leave'],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ApiKeyPrompt onSubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💎 Pulse Buy Bot</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time Trade Alerts & Analytics</p>
            </div>
            <div className="flex items-center gap-3">
              {/* WebSocket Status */}
              <WebSocketStatus />

              {/* Notification Center */}
              <NotificationCenter />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle dark mode (Alt+D)"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Open command palette"
              >
                <span>⌘K</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'overview'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'analytics'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setActiveView('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'security'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              🛡️ Security
            </button>
            <button
              onClick={() => setActiveView('trust')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'trust'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              ⭐ Trust Levels
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'users'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveView('audit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'audit'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              📋 Audit Log
            </button>
            <button
              onClick={() => setActiveView('monitoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'monitoring'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              📊 Monitoring
            </button>
            <button
              onClick={() => setActiveView('tokens')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'tokens'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              💎 Tokens
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {activeView === 'overview' && (
            <>
              <Dashboard />
              <TokenList />
            </>
          )}

          {activeView === 'analytics' && <AnalyticsDashboard />}

          {activeView === 'security' && <SecurityDashboard />}

          {activeView === 'trust' && <TrustLevelDashboard />}

          {activeView === 'users' && <UserManagement />}

          {activeView === 'audit' && <AuditLog />}

          {activeView === 'monitoring' && <MonitoringDashboard />}

          {activeView === 'notification-settings' && <NotificationPreferences />}

          {activeView === 'tokens' && <TokenList />}
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Built with ❤️ for the crypto community
          </p>
        </div>
      </footer> */}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <WebSocketProvider autoConnect={true}>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </WebSocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
