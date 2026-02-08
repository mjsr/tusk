# db-gui - Project Guidelines

## Overview
A modern PostgreSQL desktop client built with Electron and React.

## Tech Stack
- **Runtime**: Electron 40
- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7 + electron-vite
- **Styling**: TailwindCSS 4
- **Editor**: Monaco Editor
- **Database**: node-postgres (pg)
- **Testing**: Vitest + React Testing Library

## Project Structure
```
src/
├── main/           # Electron main process
├── renderer/       # React frontend
│   ├── components/ # UI components
│   ├── hooks/      # Custom React hooks
│   ├── stores/     # State management
│   └── styles/     # Global styles
├── shared/         # Shared types/utils
└── __tests__/      # Test files
```

## Commands
```bash
npm run dev        # Start development
npm run build      # Build for production
npm run test       # Run tests
npm run test:ui    # Run tests with UI
npm run typecheck  # Type checking
```

## Testing Guidelines

### Test Organization
- Place tests in `src/__tests__/` mirroring the source structure
- Use `.test.tsx` extension for component tests
- Use `.test.ts` extension for utility tests

### What to Test
1. **Components**: Rendering, user interactions, state changes
2. **Utilities**: Edge cases, error handling
3. **Integration**: Component interactions, data flow

### Test Patterns
```tsx
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Component from '../renderer/components/Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<Component />)
    await fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

## Styling Guidelines

### Design Principles
- **Dark-first**: Optimize for dark mode, the primary theme
- **Minimal**: Clean, uncluttered interface
- **Consistent**: Use design tokens for colors, spacing
- **Accessible**: Proper contrast ratios, keyboard navigation

### Color Palette
```css
--color-db-dark: #1a1b26      /* Primary background */
--color-db-darker: #13141c    /* Secondary background */
--color-db-border: #2a2b3d    /* Borders */
--color-db-accent: #7aa2f7    /* Primary accent (blue) */
--color-db-success: #9ece6a   /* Success states */
--color-db-warning: #e0af68   /* Warning states */
--color-db-error: #f7768e     /* Error states */
--color-db-text: #c0caf5      /* Primary text */
--color-db-muted: #565f89     /* Muted text */
```

### Component Patterns
- Use subtle gradients and shadows for depth
- Rounded corners (4-8px) for modern feel
- Smooth transitions (150-200ms)
- Hover states with subtle background changes

## Code Style

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object shapes
- Avoid `any`, use `unknown` when necessary

### React
- Functional components with hooks
- Memoize expensive computations
- Extract reusable logic into custom hooks
- Keep components focused and small

### Commits
- Use conventional commits format
- Keep commits atomic and focused

## Security Guidelines

### Electron Security (CRITICAL)

This is a desktop app with access to the filesystem and network. Security is paramount.

#### 1. Context Isolation & Sandbox (Required)
```typescript
// In main process window creation - ALWAYS use these settings
webPreferences: {
  contextIsolation: true,   // REQUIRED: Isolates renderer from Node
  nodeIntegration: false,   // REQUIRED: No Node.js in renderer
  sandbox: true             // REQUIRED: OS-level sandboxing
}
```

**Never disable these settings.** They prevent malicious code in the renderer from accessing Node.js APIs.

#### 2. IPC Validation (Required)
All data from the renderer process is untrusted. Always validate:

```typescript
// BAD - trusting renderer input
ipcMain.handle('db:query', async (_, sql: string) => {
  return client.query(sql)  // No validation!
})

// GOOD - validate all inputs
ipcMain.handle('db:query', async (_, rawSql: unknown) => {
  const sql = validateSQL(rawSql)  // Validate type, length, etc.
  return client.query(sql)
})
```

Use validators from `src/main/validation.ts` for all IPC handlers.

#### 3. SQL Injection Prevention
- **User queries**: Users can run arbitrary SQL (that's the app's purpose) - this is intentional
- **Schema queries**: MUST use parameterized queries or validated identifiers

```typescript
// BAD - string interpolation with user input
const result = await client.query(`SELECT * FROM ${schema}.${table}`)

// GOOD - parameterized query
const result = await client.query(
  'SELECT * FROM information_schema.tables WHERE table_schema = $1',
  [schema]
)

// GOOD - validated identifier (only safe characters allowed)
const schema = validateSchemaName(rawSchema)  // Throws if invalid
const result = await client.query(`SELECT * FROM "${schema}"."${table}" LIMIT $1`, [limit])
```

#### 4. Credential Storage
- **Never store passwords in plain text**
- Use `safeStorage` API (OS keychain) for sensitive data:

```typescript
import { safeStorage } from 'electron'

// Encrypt before storing
const encrypted = safeStorage.encryptString(password)
store.set('password', encrypted.toString('base64'))

// Decrypt when needed
const decrypted = safeStorage.decryptString(Buffer.from(stored, 'base64'))
```

#### 5. Preload Script Rules
The preload script bridges main and renderer. Keep it minimal:

```typescript
// GOOD - only expose specific, validated functions
contextBridge.exposeInMainWorld('api', {
  query: (sql: string) => ipcRenderer.invoke('db:query', sql),
  connect: (config: ConnectionConfig) => ipcRenderer.invoke('db:connect', config)
})

// BAD - never expose raw IPC or Node APIs
contextBridge.exposeInMainWorld('electron', { ipcRenderer })  // DANGEROUS!
```

#### 6. Content Security Policy
Restrict what resources can load:

```typescript
// In index.html or via headers
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
">
```

### Security Checklist for New Features

Before adding any feature, verify:

- [ ] All IPC handlers validate their inputs
- [ ] No string interpolation with untrusted data in SQL
- [ ] Sensitive data uses `safeStorage` encryption
- [ ] No new Node APIs exposed to renderer
- [ ] `contextIsolation`, `nodeIntegration: false`, and `sandbox: true` unchanged
- [ ] No `eval()` or `new Function()` with user data
- [ ] External URLs open in system browser, not Electron window

### Dependencies
- Regularly run `npm audit` to check for vulnerabilities
- Keep Electron updated for security patches
- Avoid unnecessary dependencies that increase attack surface

## Release Workflow

### GitHub Repository
- **Repo**: https://github.com/mjsr/tusk
- **Releases**: https://github.com/mjsr/tusk/releases

### Prerequisites
1. GitHub token in `.env` file:
   ```
   GH_TOKEN=ghp_xxxxxxxxxxxx
   ```
2. Token needs `repo` scope (create at https://github.com/settings/tokens)

### Release Commands

```bash
# Build for current platform only (no upload)
npm run dist

# Build for specific platform (no upload)
npm run dist:mac
npm run dist:win
npm run dist:linux

# Build AND publish to GitHub Releases
export $(cat .env | xargs) && npm run release
```

### Release Checklist

1. **Update version** in `package.json`
2. **Commit changes**: `git add -A && git commit -m "Release vX.X.X"`
3. **Run release**: `export $(cat .env | xargs) && npm run release`
4. **Verify**: Check https://github.com/mjsr/tusk/releases
5. **Publish draft** (if needed): `gh release edit vX.X.X --draft=false`

### Output Files
Releases are built to `release/` folder:
- macOS: `Tusk-X.X.X-arm64.dmg`, `Tusk-X.X.X-arm64-mac.zip`
- Windows: `Tusk-X.X.X-setup.exe`, `Tusk-X.X.X-win.zip`
- Linux: `Tusk-X.X.X.AppImage`, `Tusk-X.X.X.deb`

### Auto-Updates
The app checks for updates on startup via `electron-updater`. Users are notified when a new version is available on GitHub Releases.

### Code Signing (Production)
For proper macOS distribution without Gatekeeper warnings:
1. Get Apple Developer account ($99/year)
2. Set environment variables:
   ```bash
   CSC_LINK=/path/to/certificate.p12
   CSC_KEY_PASSWORD=password
   APPLE_ID=your@email.com
   APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
   APPLE_TEAM_ID=XXXXXXXXXX
   ```
3. Add to `package.json` build config:
   ```json
   "mac": {
     "hardenedRuntime": true,
     "notarize": true
   }
   ```

## Website

### Development
```bash
cd website && npm run dev
# Runs at http://localhost:3000
```

### Deploy
The website is a Next.js app in `website/`. Deploy to Vercel:
```bash
cd website && npx vercel
```

### Download Links
Downloads point to GitHub Releases:
- macOS: `https://github.com/mjsr/tusk/releases/download/vX.X.X/Tusk-X.X.X-arm64.dmg`
- All releases: `https://github.com/mjsr/tusk/releases`

## Licensing (Open Core)

### Tiers
- **Free**: Basic GUI, multiple connections, query history
- **Pro**: AI queries, natural language SQL, CSV reports ($12/mo)
- **Team**: Visualizations, dashboards, collaboration ($29/user/mo)

### Demo License Keys (Testing)
- Pro: `TUSK-PRO-DEMO1234-ABCD`
- Team: `TUSK-TEAM-DEMO5678-EFGH`

### API Endpoints
- `POST /api/license/validate` - Validate license key
- `POST /api/ai/query` - AI query generation (Pro+)
