# Testing Setup Guide

## Status
No testing dependencies or configs are installed in this repo yet. Use this guide to add them.

## Overview
This guide outlines a testing setup for the Pulse Buy Bot Dashboard, including unit tests, integration tests, and end-to-end tests.

---

## Installation

### 1. Install Testing Dependencies

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @vitest/ui \
  vitest \
  jsdom \
  @playwright/test \
  @tanstack/react-query
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Configuration Files

### vitest.config.ts (create at repo root or adjust paths to match your setup)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### playwright.config.ts (optional E2E)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### src/test/setup.ts (create)

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;
```

---

## Test Examples (add once deps are installed)

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton, CardSkeleton, TableSkeleton, DashboardSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton', () => {
  describe('Skeleton', () => {
    it('renders with default className', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="h-4 w-24" />);
      expect(container.firstChild).toHaveClass('h-4', 'w-24');
    });

    it('applies dark mode classes', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('dark:bg-gray-700');
    });
  });

  describe('CardSkeleton', () => {
    it('renders card structure', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('renders with default 5 rows', () => {
      const { container } = render(<TableSkeleton />);
      const rows = container.querySelectorAll('.flex.space-x-4');
      expect(rows).toHaveLength(5);
    });

    it('renders with custom row count', () => {
      const { container } = render(<TableSkeleton rows={10} />);
      const rows = container.querySelectorAll('.flex.space-x-4');
      expect(rows).toHaveLength(10);
    });
  });

  describe('DashboardSkeleton', () => {
    it('renders dashboard skeleton structure', () => {
      render(<DashboardSkeleton />);
      // Should render 4 card skeletons in grid
      const { container } = render(<DashboardSkeleton />);
      expect(container.querySelector('.grid-cols-1')).toBeInTheDocument();
    });
  });
});
```

#### src/components/__tests__/CommandPalette.test.tsx

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette, Command } from '../CommandPalette';

describe('CommandPalette', () => {
  const mockCommands: Command[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: '📊',
      action: vi.fn(),
      category: 'Navigation',
    },
    {
      id: 'security',
      label: 'Security Dashboard',
      icon: '🛡️',
      action: vi.fn(),
      category: 'Navigation',
      keywords: ['spam', 'raid'],
    },
  ];

  const mockOnClose = vi.fn();

  it('does not render when closed', () => {
    render(<CommandPalette isOpen={false} onClose={mockOnClose} commands={mockCommands} />);
    expect(screen.queryByPlaceholderText(/type a command/i)).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    expect(screen.getByPlaceholderText(/type a command/i)).toBeInTheDocument();
  });

  it('displays all commands initially', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    expect(screen.getByText('Overview Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Security Dashboard')).toBeInTheDocument();
  });

  it('filters commands based on search', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    fireEvent.change(input, { target: { value: 'Overview' } });

    expect(screen.getByText('Overview Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Security Dashboard')).not.toBeInTheDocument();
  });

  it('filters commands by keywords', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    fireEvent.change(input, { target: { value: 'spam' } });

    expect(screen.queryByText('Overview Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Security Dashboard')).toBeInTheDocument();
  });

  it('executes command and closes on enter', () => {
    const action = vi.fn();
    const commands: Command[] = [
      { id: 'test', label: 'Test Command', action },
    ];

    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={commands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(action).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes on escape key', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates with arrow keys', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    // Press down arrow
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // The second item should be selected
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('bg-primary-50');
  });

  it('closes when clicking backdrop', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const backdrop = document.querySelector('.bg-black');

    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows "no commands found" message', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} commands={mockCommands} />);
    const input = screen.getByPlaceholderText(/type a command/i);

    fireEvent.change(input, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });
});
```

#### src/hooks/__tests__/useKeyboardShortcuts.test.tsx

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('triggers action on matching key press', () => {
    const action = vi.fn();
    const shortcuts = [
      { key: 'k', ctrlKey: true, action, description: 'Test' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not trigger on non-matching key', () => {
    const action = vi.fn();
    const shortcuts = [
      { key: 'k', ctrlKey: true, action, description: 'Test' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'j', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('respects enabled flag', () => {
    const action = vi.fn();
    const shortcuts = [
      { key: 'k', ctrlKey: true, action, description: 'Test' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts, false));

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const action = vi.fn();
    const shortcuts = [
      { key: 'k', ctrlKey: true, action, description: 'Test' },
    ];

    const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

#### src/__tests__/integration/App.test.tsx

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { api } from '../../services/api';

vi.mock('../../services/api');

describe('App Integration', () => {
  it('shows login prompt when not authenticated', () => {
    localStorage.removeItem('pulse_buy_bot_api_key');

    render(<App />);

    expect(screen.getByText(/enter api key/i)).toBeInTheDocument();
  });

  it('authenticates and shows dashboard', async () => {
    vi.mocked(api.getHealth).mockResolvedValue({ status: 'ok' });

    render(<App />);

    const input = screen.getByPlaceholderText(/api key/i);
    const button = screen.getByRole('button', { name: /submit/i });

    await userEvent.type(input, 'test-api-key');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/pulse buy bot/i)).toBeInTheDocument();
    });
  });

  it('toggles dark mode', async () => {
    localStorage.setItem('pulse_buy_bot_api_key', 'test-key');
    vi.mocked(api.getHealth).mockResolvedValue({ status: 'ok' });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTitle(/toggle dark mode/i)).toBeInTheDocument();
    });

    const themeButton = screen.getByTitle(/toggle dark mode/i);
    await userEvent.click(themeButton);

    const html = document.documentElement;
    expect(html.classList.contains('dark')).toBe(true);
  });
});
```

### E2E Tests

#### e2e/dashboard.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Login
    await page.fill('input[placeholder*="API"]', 'test-api-key');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForSelector('text=Pulse Buy Bot');
  });

  test('should display dashboard header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pulse Buy Bot');
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.click('text=Security');
    await expect(page.locator('h2')).toContainText('Security');

    await page.click('text=Trust Levels');
    await expect(page.locator('h2')).toContainText('Trust');

    await page.click('text=Settings');
    await expect(page.locator('h2')).toContainText('Settings');
  });

  test('should open command palette with Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.locator('input[placeholder*="command"]')).toBeVisible();

    await page.keyboard.type('security');
    await expect(page.locator('text=Security Dashboard')).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('h2')).toContainText('Security');
  });

  test('should toggle dark mode', async ({ page }) => {
    const html = page.locator('html');

    // Check initial state (light mode)
    await expect(html).not.toHaveClass(/dark/);

    // Toggle to dark mode
    await page.click('button[title*="dark mode"]');
    await expect(html).toHaveClass(/dark/);

    // Toggle back to light mode
    await page.click('button[title*="dark mode"]');
    await expect(html).not.toHaveClass(/dark/);
  });

  test('should persist dark mode preference', async ({ page, context }) => {
    // Enable dark mode
    await page.click('button[title*="dark mode"]');
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Reload page
    await page.reload();
    await page.waitForSelector('h1');

    // Dark mode should persist
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('text=Logout');
    await expect(page.locator('input[placeholder*="API"]')).toBeVisible();
  });
});
```

#### e2e/keyboard-shortcuts.spec.ts

```typescript
import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="API"]', 'test-api-key');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Pulse Buy Bot');
  });

  test('Alt+1 navigates to Overview', async ({ page }) => {
    await page.keyboard.press('Alt+2'); // Go to another view first
    await page.keyboard.press('Alt+1');
    await expect(page.locator('button:has-text("Overview")')).toHaveClass(/border-primary-500/);
  });

  test('Alt+2 navigates to Security', async ({ page }) => {
    await page.keyboard.press('Alt+2');
    await expect(page.locator('button:has-text("Security")')).toHaveClass(/border-primary-500/);
  });

  test('Alt+D toggles dark mode', async ({ page }) => {
    const html = page.locator('html');

    await expect(html).not.toHaveClass(/dark/);

    await page.keyboard.press('Alt+d');
    await expect(html).toHaveClass(/dark/);

    await page.keyboard.press('Alt+d');
    await expect(html).not.toHaveClass(/dark/);
  });
});
```

---

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

1. **Test Naming:** Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert:** Structure tests with clear setup, execution, and verification
3. **Test Isolation:** Each test should be independent
4. **Mock External Dependencies:** Mock API calls and external services
5. **Coverage Goals:** Aim for >80% coverage for critical paths
6. **Accessibility Testing:** Include accessibility assertions in tests

---

## Coverage Goals

- **Unit Tests:** >80% coverage
- **Integration Tests:** Critical user flows
- **E2E Tests:** Main user journeys

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "Cannot find module"
**Solution:** Check your `vitest.config.ts` path aliases

**Issue:** E2E tests timeout
**Solution:** Increase timeout in `playwright.config.ts`

**Issue:** Dark mode tests fail
**Solution:** Ensure `window.matchMedia` is mocked in setup

---

## Next Steps

1. Run `npm install` to add testing dependencies
2. Create configuration files
3. Run initial test suite
4. Set up CI/CD pipeline
5. Add tests for new features
