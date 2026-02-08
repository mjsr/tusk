# db-gui - PostgreSQL Desktop Client

## Project Overview

A modern PostgreSQL database GUI built with Electron and React. Designed to provide a clean, intuitive interface for database management and query execution.

## Status: Phase 5 In Progress

**Progress: 90%** - Saved queries implemented

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Desktop Framework | Electron |
| Frontend | React + TypeScript |
| Styling | TailwindCSS |
| State Management | Zustand or React Context |
| Database Driver | node-postgres (pg) |
| Query Editor | Monaco Editor (VS Code editor) |
| Build Tool | Vite |

---

## Core Features

### Phase 1 - Foundation ✅
- [x] Project setup (Electron + React + Vite)
- [x] Connection manager (save/load PostgreSQL connections)
- [x] Basic connection testing

### Phase 2 - Query Editor ✅
- [x] Monaco-based SQL editor with syntax highlighting
- [x] Execute queries and display results in table format
- [x] Query history
- [x] Multiple query tabs
- [x] Keyboard shortcuts (Cmd+Enter to execute, etc.)

### Phase 3 - Schema Browser ✅
- [x] Database tree view (schemas → tables → columns)
- [x] View table structure (columns, types, constraints)
- [x] View indexes and foreign keys
- [x] Quick table preview (first 100 rows)

### Phase 4 - Data Editing ✅
- [x] Inline cell editing in results table
- [x] Add new rows
- [x] Delete rows (with visual indication)
- [x] SQL preview before execution

### Phase 5 - Polish (In Progress)
- [x] Dark/light theme support (10 themes!)
- [ ] Query formatting/beautify
- [ ] Export results (CSV, JSON)
- [x] Saved queries library

---

## Proposed Directory Structure

```
db-gui/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts
│   │   ├── database.ts    # PostgreSQL connection handling
│   │   └── ipc.ts         # IPC handlers
│   ├── renderer/          # React frontend
│   │   ├── components/
│   │   │   ├── ConnectionManager/
│   │   │   ├── QueryEditor/
│   │   │   ├── ResultsTable/
│   │   │   ├── SchemaTree/
│   │   │   └── Layout/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── shared/            # Shared types/utils
│       └── types.ts
├── claude/
│   └── planning/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Next Steps (Phase 5 - Final Polish)

1. Add query formatting/beautify
2. Implement export results (CSV, JSON)

---

## Design Considerations

- **Security**: Store connection credentials securely (consider electron-store with encryption)
- **Performance**: Virtual scrolling for large result sets
- **UX**: Keyboard-first navigation, minimal clicks to run queries
- **Reliability**: Proper connection pooling and error handling

---

## References

- [Electron Documentation](https://www.electronjs.org/docs)
- [node-postgres](https://node-postgres.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [electron-vite](https://electron-vite.org/)

---

*Last updated: 2026-02-07*

---

## Changelog

### 2026-02-07
- Saved queries library: save, organize in folders, rename, delete
- Theme system: 10 color themes with live switching (Tokyo Night, Dracula, Nord, etc.)
- Data editing: inline editing with SQL preview before execution
- Schema browser: tree view with table structure, indexes, foreign keys
- Security hardening: encrypted passwords, IPC validation, sandbox mode

### 2026-02-06
- Phase 2 complete: Monaco SQL editor, query execution, results table, tabs, history
- Phase 1 complete: Project scaffolding, connection manager UI, PostgreSQL connection logic
- Technologies: Electron 40, React 19, Vite 7, TailwindCSS 4, node-postgres, Monaco Editor
