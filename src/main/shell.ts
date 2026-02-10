import { ipcMain, shell } from 'electron'

// Allowlist of domains that can be opened externally
const ALLOWED_DOMAINS = [
  'tusk.dev',
  'github.com',
  'supabase.com',
  'stripe.com', // For billing
]

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)

    // Only allow https
    if (parsed.protocol !== 'https:') {
      return false
    }

    // Check if domain is in allowlist
    const hostname = parsed.hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export function setupShellHandlers(): void {
  ipcMain.handle('shell:open-external', async (_, rawUrl: unknown): Promise<{ success: boolean; error?: string }> => {
    if (typeof rawUrl !== 'string') {
      return { success: false, error: 'Invalid URL' }
    }

    if (!isAllowedUrl(rawUrl)) {
      return { success: false, error: 'URL not allowed' }
    }

    try {
      await shell.openExternal(rawUrl)
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to open URL' }
    }
  })
}
