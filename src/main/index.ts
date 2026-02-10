import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { setupDatabaseHandlers } from './database'
import { setupConnectionStore } from './store'
import { setupAutoUpdater } from './updater'
import { setupExportHandlers } from './export'
import { setupLicenseHandlers } from './license'
import { setupSecureStorageHandlers } from './secureStorage'
import { setupAuthHandlers, handleAuthDeepLink, setMainWindowGetter } from './auth'
import { setupShellHandlers } from './shell'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Register tusk:// protocol for deep links (magic link auth)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('tusk', process.execPath, [process.argv[1]])
  }
} else {
  app.setAsDefaultProtocolClient('tusk')
}

// Handle deep link on macOS (app already running)
app.on('open-url', (event, url) => {
  event.preventDefault()
  handleAuthDeepLink(url)
})

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

// Ensure single instance - deep links go to existing window (skip in dev mode)
if (!isDev) {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    // Handle deep link on Windows/Linux (second instance tries to launch)
    app.on('second-instance', (_event, commandLine) => {
      // Find the deep link URL in command line args
      const url = commandLine.find(arg => arg.startsWith('tusk://'))
      if (url) {
        handleAuthDeepLink(url)
      }

      // Focus the main window
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true  // Secure: renderer process runs in sandbox
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1b26'
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Set up IPC handlers BEFORE creating window
  setupDatabaseHandlers()
  setupConnectionStore()
  setupExportHandlers()
  setupLicenseHandlers()
  setupSecureStorageHandlers()
  setupAuthHandlers()
  setupShellHandlers()
  setMainWindowGetter(getMainWindow)
  createWindow()

  // Set up auto-updater after window is created
  if (mainWindow) {
    setupAutoUpdater(mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
