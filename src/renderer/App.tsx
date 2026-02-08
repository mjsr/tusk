import { useState } from 'react'
import ConnectionManager from './components/ConnectionManager/ConnectionManager'
import Layout from './components/Layout/Layout'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionName, setConnectionName] = useState<string>('')

  const handleConnect = (name: string) => {
    setConnectionName(name)
    setIsConnected(true)
  }

  const handleDisconnect = async () => {
    await window.api.disconnect()
    setIsConnected(false)
    setConnectionName('')
  }

  return (
    <ThemeProvider>
      {!isConnected ? (
        <ConnectionManager onConnect={handleConnect} />
      ) : (
        <Layout connectionName={connectionName} onDisconnect={handleDisconnect} />
      )}
    </ThemeProvider>
  )
}
