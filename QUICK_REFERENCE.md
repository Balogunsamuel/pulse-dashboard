# Quick Reference Guide

## Notes
- These snippets show how to use the provided components/contexts; they still expect real backend data/WS events.
- Auth/RBAC in this repo is mock-only—replace with your real session/permissions logic before production.

## High Priority Features - At a Glance

### 🔌 WebSocket Usage

```typescript
import { useLiveTransactions, useLivePrices, useWebSocket } from './contexts/WebSocketContext';

// In your component
function MyComponent() {
  // Listen to live transactions
  useLiveTransactions((tx) => {
    console.log('New transaction:', tx);
  });

  // Listen to price updates
  useLivePrices((prices) => {
    console.log('Price update:', prices);
  });

  // Access WebSocket directly
  const { status, send } = useWebSocket();

  return <div>WebSocket status: {status}</div>;
}
```

---

### 🔍 Advanced Filtering

```typescript
import { AdvancedFilter, FilterField } from './components/AdvancedFilter';

const filterFields: FilterField[] = [
  {
    type: 'text',
    field: 'username',
    label: 'Username',
    placeholder: 'Search by username',
  },
  {
    type: 'select',
    field: 'blockchain',
    label: 'Blockchain',
    options: [
      { label: 'Solana', value: 'solana' },
      { label: 'Ethereum', value: 'ethereum' },
    ],
  },
  {
    type: 'date',
    field: 'dateRange',
    label: 'Date Range',
  },
];

<AdvancedFilter
  fields={filterFields}
  onFilterChange={(filters) => {
    console.log('Active filters:', filters);
    // Apply filters to your data
  }}
  storageKey="my_custom_filters"
/>
```

---

### 🔔 Notifications

```typescript
import { useNotifications } from './contexts/NotificationContext';

function MyComponent() {
  const { addNotification, notifications, unreadCount } = useNotifications();

  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Action Complete',
      message: 'Your action was successful!',
      priority: 'medium',
      actionUrl: '/transactions',
      actionLabel: 'View Details',
    });
  };

  return (
    <div>
      <button onClick={handleAction}>Do Something</button>
      <span>Unread: {unreadCount}</span>
    </div>
  );
}
```

---

### 📊 Analytics

```typescript
import { TimeSeriesChart } from './components/analytics/TimeSeriesChart';

const data = [
  { timestamp: '2024-01-01T00:00:00Z', value: 100 },
  { timestamp: '2024-01-02T00:00:00Z', value: 150 },
  { timestamp: '2024-01-03T00:00:00Z', value: 120 },
];

<TimeSeriesChart
  data={data}
  title="Transaction Volume"
  type="area"
  color="#0ea5e9"
  valueFormatter={(v) => `$${v.toLocaleString()}`}
/>
```

---

### 👥 User Management & Permissions

```typescript
import { useAuth, PermissionGuard, RoleGuard } from './contexts/AuthContext';

function MyComponent() {
  const { user, hasPermission, hasRole } = useAuth();

  // Check permission programmatically
  if (hasPermission('manage_users')) {
    // Show admin controls
  }

  // Check role programmatically
  if (hasRole(['admin', 'moderator'])) {
    // Show moderator features
  }

  return (
    <div>
      {/* Component-level permission guard */}
      <PermissionGuard permission="manage_users">
        <AdminPanel />
      </PermissionGuard>

      {/* Component-level role guard */}
      <RoleGuard role="admin">
        <DeleteButton />
      </RoleGuard>

      {/* With fallback */}
      <PermissionGuard
        permission="export_data"
        fallback={<span>No permission to export</span>}
      >
        <ExportButton />
      </PermissionGuard>
    </div>
  );
}
```

---

## Component Imports

```typescript
// Real-time components
import { LiveTransactionFeed } from './components/LiveTransactionFeed';
import { LivePriceWidget } from './components/LivePriceWidget';
import { WebSocketStatus } from './components/WebSocketStatus';

// Filtering
import { AdvancedFilter } from './components/AdvancedFilter';

// Notifications
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationPreferences } from './components/NotificationPreferences';

// Analytics
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TimeSeriesChart } from './components/analytics/TimeSeriesChart';

// User Management
import { UserManagement } from './components/UserManagement';
import { AuditLog } from './components/AuditLog';
```

---

## Context Providers

```typescript
// Wrap your app with these providers
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider autoConnect={true}>
        <NotificationProvider>
          <YourApp />
        </NotificationProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette |
| `Alt+1` | Go to Overview |
| `Alt+2` | Go to Security |
| `Alt+3` | Go to Trust Levels |
| `Alt+D` | Toggle dark mode |
| `Esc` | Close modals/dialogs |

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

---

## Common Patterns

### Conditional Rendering by Permission

```typescript
{hasPermission('manage_users') && (
  <button>Admin Only</button>
)}
```

### Loading States

```typescript
import { DashboardSkeleton, CardSkeleton, TableSkeleton } from './components/LoadingSkeleton';

{loading ? <DashboardSkeleton /> : <YourContent />}
```

### Error Handling

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Dark Mode

```typescript
import { useTheme } from './contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

---

## TypeScript Types

### WebSocket

```typescript
import type { WebSocketStatus, WebSocketChannel, WebSocketMessage } from './contexts/WebSocketContext';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';
type WebSocketChannel = 'transactions' | 'prices' | 'security' | 'user_activity' | 'system' | 'notifications';
```

### Notifications

```typescript
import type { Notification, NotificationType, NotificationPriority } from './contexts/NotificationContext';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'security';
type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
```

### Auth

```typescript
import type { User, UserRole, Permission } from './contexts/AuthContext';

type UserRole = 'admin' | 'moderator' | 'viewer';
type Permission = 'read' | 'write' | 'delete' | 'manage_users' | ...;
```

### Filters

```typescript
import type { FilterField, FilterValue, FilterPreset } from './components/AdvancedFilter';
```

---

## API Endpoints Required

### WebSocket
```
ws://localhost:3000/ws
```

### REST API
```
GET  /api/analytics/transactions/trends
GET  /api/users
POST /api/users/invite
GET  /api/audit-logs
GET  /api/notifications
```

---

## File Locations

```
dashboard/
├── src/
│   ├── components/
│   │   ├── AdvancedFilter.tsx
│   │   ├── AuditLog.tsx
│   │   ├── LivePriceWidget.tsx
│   │   ├── LiveTransactionFeed.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationPreferences.tsx
│   │   ├── UserManagement.tsx
│   │   ├── WebSocketStatus.tsx
│   │   └── analytics/
│   │       ├── AnalyticsDashboard.tsx
│   │       └── TimeSeriesChart.tsx
│   └── contexts/
│       ├── AuthContext.tsx
│       ├── NotificationContext.tsx
│       └── WebSocketContext.tsx
```

---

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | All permissions |
| **Moderator** | read, write, manage_security, export_data, view_analytics, manage_trust_levels |
| **Viewer** | read, view_analytics |

---

## Common Issues & Solutions

### WebSocket not connecting
```typescript
// Check environment variable
console.log(import.meta.env.VITE_WS_URL);

// Check connection status
const { status } = useWebSocket();
console.log('Status:', status);
```

### Permissions not working
```typescript
// Check user object
const { user } = useAuth();
console.log('User:', user);
console.log('Permissions:', user?.permissions);
```

### Filters not persisting
```typescript
// Check localStorage
console.log(localStorage.getItem('your_storage_key'));
```

---

## Testing Examples

```typescript
// Test WebSocket connection
const { status, send } = useWebSocket();
console.log('WebSocket status:', status);

// Test notification
addNotification({
  type: 'info',
  title: 'Test',
  message: 'This is a test notification',
  priority: 'low',
});

// Test permission
console.log('Can manage users:', hasPermission('manage_users'));

// Test filter
const filters = { username: 'test', blockchain: 'solana' };
console.log('Active filters:', filters);
```

---

## Performance Tips

```typescript
// Memo expensive components
import { memo } from 'react';
export const MyComponent = memo(MyComponentImpl);

// Debounce filters
import { useMemo } from 'react';
const debouncedFilter = useMemo(
  () => debounce(handleFilter, 300),
  []
);

// Lazy load heavy components
import { lazy, Suspense } from 'react';
const Analytics = lazy(() => import('./components/analytics/AnalyticsDashboard'));

<Suspense fallback={<Loading />}>
  <Analytics />
</Suspense>
```

---

*Quick Reference for High Priority Features v2.0.0*
