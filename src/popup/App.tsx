import { useEffect, useState, useCallback } from 'react'

type Cookie = {
  name: string
  value: string
  domain: string
  isPartitioned: boolean
}

type PageState = {
  cookies: Cookie[]
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty'
  message: string
  url: string
}

const GOOGLE_BLUE = '#1a73e8'
const BORDER_COLOR = '#dadce0'

const App = () => {
  const [state, setState] = useState<PageState>({
    cookies: [],
    status: 'loading',
    message: 'Finding cf_clearance...',
    url: '',
  })
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const loadCookies = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading' }))

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url) {
        setState(prev => ({ ...prev, status: 'error', message: 'No active tab URL' }))
        return
      }

      const url = tab.url
      const filter = { name: 'cf_clearance' }

      // Parallel fetch for unpartitioned and partitioned cookies
      const [unpartitioned, partitioned] = await Promise.all([
        chrome.cookies.getAll({ ...filter, url }),
        chrome.cookies.getAll({ ...filter, partitionKey: { topLevelSite: url } })
          .catch(() => []) // Graceful fail for older Chrome versions
      ])

      const combined = [...unpartitioned, ...partitioned].map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        isPartitioned: !!c.partitionKey
      }))

      setState({
        url,
        cookies: combined,
        status: combined.length > 0 ? 'success' : 'empty',
        message: combined.length > 0 ? '' : 'cf_clearance cookie not found on this page.',
      })
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error'
      }))
    }
  }, [])

  const copyToClipboard = async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(index)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  useEffect(() => {
    loadCookies()
  }, [loadCookies])

  return (
    <div style={{
      width: 320,
      backgroundColor: '#fff',
      color: '#202124',
      fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Cloudflare Clearance</h1>
        <button 
          onClick={loadCookies}
          title="Refresh"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flexGrow: 1 }}>
        {state.status === 'loading' && (
          <div style={{ fontSize: 13, color: '#5f6368', textAlign: 'center', marginTop: 20 }}>Scanning...</div>
        )}

        {state.status === 'empty' && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 13, color: '#5f6368' }}>{state.message}</div>
          </div>
        )}

        {state.status === 'success' && state.cookies.map((cookie, i) => (
          <div key={i} style={{
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            transition: 'box-shadow 0.2s',
            ':hover': { boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)' }
          } as any}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: GOOGLE_BLUE, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {cookie.isPartitioned ? 'Partitioned' : 'Standard'}
              </span>
              <span style={{ fontSize: 11, color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cookie.domain}
              </span>
            </div>
            
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '8px 10px', 
              borderRadius: 4, 
              fontSize: 12, 
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              maxHeight: 80,
              overflowY: 'auto',
              border: '1px solid #f1f3f4',
              color: '#3c4043'
            }}>
              {cookie.value}
            </div>

            <button
              onClick={() => copyToClipboard(cookie.value, i)}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '8px',
                borderRadius: 4,
                border: `1px solid ${BORDER_COLOR}`,
                backgroundColor: copiedId === i ? '#e6f4ea' : '#fff',
                color: copiedId === i ? '#1e8e3e' : GOOGLE_BLUE,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {copiedId === i ? 'Copied' : 'Copy value'}
            </button>
          </div>
        ))}
      </main>

      {/* Footer info */}
      <footer style={{ marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${BORDER_COLOR}`, fontSize: 10, color: '#bdc1c6', textAlign: 'center' }}>
        Cloudflare Clearance Filter • Chrome Extension
      </footer>
    </div>
  )
}

export default App
