import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null

export function setupAutoUpdater(window: BrowserWindow): void {
  mainWindow = window

  // Configure auto-updater
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // Check for updates on startup (in production only)
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdates()
  }

  // Event handlers
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking-for-update')
  })

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('update-not-available')
  })

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('update-error', err.message)
  })

  autoUpdater.on('download-progress', (progress) => {
    sendStatusToWindow('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('update-downloaded', info)
  })

  // IPC handlers for renderer to trigger updates
  ipcMain.handle('updater:check', async () => {
    return autoUpdater.checkForUpdates()
  })

  ipcMain.handle('updater:download', async () => {
    return autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall()
  })
}

function sendStatusToWindow(status: string, data?: unknown): void {
  if (mainWindow) {
    mainWindow.webContents.send('updater:status', { status, data })
  }
}
