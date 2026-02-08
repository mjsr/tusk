import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { setupDatabaseHandlers } from './database'
import { setupConnectionStore } from './store'
import { setupAutoUpdater } from './updater'
import { setupExportHandlers } from './export'
import { setupLicenseHandlers } from './license'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow: BrowserWindow | null = null

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
