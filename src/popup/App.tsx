import { useEffect, useState, useCallback } from 'react'

type Cookie = {
  name: string
  value: string
  domain: string
  isPartitioned: boolean
}

type PageState = {
  cookies: Cookie[]
  status: 'loading' | 'success' | 'error' | 'empty'
  message: string
}

const COLORS = {
  textPrimary: '#202124',
  textSecondary: '#5f6368',
  googleBlue: '#1a73e8',
  googleGreen: '#1e8e3e',
  border: '#dadce0',
  surface: '#ffffff',
  bg: '#f8f9fa',
  badgeBg: '#e8f0fe',
}

const App = () => {
  const [state, setState] = useState<PageState>({
    cookies: [],
    status: 'loading',
    message: 'Initializing...',
  })
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const loadCookies = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading' }))
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.url) {
        setState({ cookies: [], status: 'error', message: 'No active tab access' })
        return
      }

      const url = tab.url
      const filter = { name: 'cf_clearance' }

      const [unpartitioned, partitioned] = await Promise.all([
        chrome.cookies.getAll({ ...filter, url }),
        chrome.cookies.getAll({ ...filter, partitionKey: { topLevelSite: url } }).catch(() => [])
      ])

      const combined = [...unpartitioned, ...partitioned].map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        isPartitioned: !!c.partitionKey
      }))

      setState({
        cookies: combined,
        status: combined.length > 0 ? 'success' : 'empty',
        message: combined.length > 0 ? '' : 'No clearance tokens found',
      })
    } catch (err) {
      setState({ cookies: [], status: 'error', message: 'Permission denied' })
    }
  }, [])

  const copyToClipboard = async (value: string, index: number) => {
    await navigator.clipboard.writeText(value)
    setCopiedId(index)
    setTimeout(() => setCopiedId(null), 2000)
  }

  useEffect(() => { loadCookies() }, [loadCookies])

  return (
    <div style={{
      width: 340,
      backgroundColor: COLORS.surface,
      color: COLORS.textPrimary,
      fontFamily: 'Segoe UI, Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none'
    }}>
      <header style={{
        padding: '10px 20px',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.googleBlue }} />
          <h1 style={{ fontSize: 15, fontWeight: 500, margin: 0, letterSpacing: '0.2px' }}>Cloudflare Clearance</h1>
        </div>
        <button onClick={loadCookies} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.2s'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={COLORS.textSecondary}>
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </button>
      </header>

      <main style={{ padding: '20px', minHeight: '180px' }}>
        {state.status === 'loading' && <p style={{
          fontSize: '13px',
          color: COLORS.textSecondary,
          textAlign: 'center' as const,
          marginTop: 40
        }}>Scanning encrypted storage...</p>}

        {(state.status === 'error' || state.status === 'empty') && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 }}>{state.message}</div>
            <button onClick={loadCookies} style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: '#fff',
              fontSize: '13px',
              color: COLORS.googleBlue,
              cursor: 'pointer'
            }}>Try again</button>
          </div>
        )}

        {state.status === 'success' && state.cookies.map((cookie, i) => (
          <div key={i} style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: COLORS.surface,
            boxShadow: '0 1px 2px rgba(60,64,67,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: COLORS.textSecondary,
                  marginBottom: '4px',
                  letterSpacing: '0.5px'
                }}>DOMAIN</div>
                <div style={{
                  fontSize: '13px',
                  color: COLORS.textPrimary,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '160px'
                }}>{cookie.domain}</div>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '100px',
                textTransform: 'uppercase' as const,
                backgroundColor: cookie.isPartitioned ? COLORS.badgeBg : '#f1f3f4',
                color: cookie.isPartitioned ? COLORS.googleBlue : COLORS.textSecondary
              }}>
                {cookie.isPartitioned ? 'Partitioned' : 'Standard'}
              </span>
            </div>

            {/* Added custom-scroll class here */}
            <div className="custom-scroll" style={{
              backgroundColor: COLORS.bg,
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'SFMono-Regular, Consolas, monospace',
              wordBreak: 'break-all' as const,
              maxHeight: '60px',
              overflowY: 'auto' as const,
              color: '#3c4043',
              border: '1px inset rgba(0,0,0,0.02)',
              marginBottom: '16px'
            }}>
              {cookie.value}
            </div>

            <button
              onClick={() => copyToClipboard(cookie.value, i)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                outline: 'none',
                backgroundColor: copiedId === i ? COLORS.googleGreen : COLORS.googleBlue,
              }}
            >
              {copiedId === i ? 'Copied!' : 'Copy Clearance Token'}
            </button>
          </div>
        ))}
      </main>

      <footer style={{
        padding: '12px 20px',
        backgroundColor: COLORS.bg,
        fontSize: 11,
        color: COLORS.textSecondary,
        textAlign: 'center',
        borderTop: `1px solid ${COLORS.border}`
      }}>
        Cloudflare Clearance Viewer | <a href="https://github.com/Danushka-Madushan" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.googleBlue, textDecoration: 'none' }}>Github</a>
      </footer>
    </div>
  )
}

export default App
