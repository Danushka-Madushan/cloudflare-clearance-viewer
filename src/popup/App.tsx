import { useEffect, useState } from 'react'

type Cookie = {
  name: string
  value: string
  domain: string
}

type PageState = {
  cookies: Cookie[]
  status: string
  error: string
  url: string
}

const initialState: PageState = {
  cookies: [],
  status: 'Loading current tab…',
  error: '',
  url: '',
}

const App = () => {
  const [state, setState] = useState<PageState>(initialState)

  const loadCookies = async () => {
    setState(prev => ({
      ...prev,
      status: 'Checking active tab and cookies…',
      error: '',
      cookies: [],
    }))

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs.length || !tabs[0].url) {
        setState(prev => ({
          ...prev,
          status: 'No active tab URL available.',
          url: '',
        }))
        return
      }

      const url = tabs[0].url
      const allCookies = await chrome.cookies.getAll({ url })

      if (allCookies.length === 0) {
        setState(prev => ({
          ...prev,
          status: 'No cookies found on the active tab.',
          url,
        }))
        return
      }

      const cookies: Cookie[] = allCookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain ?? '',
      }))

      setState(prev => ({
        ...prev,
        cookies,
        status: `Found ${cookies.length} cookie(s).`,
        url,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        status: 'Failed to read cookies.',
        error: message,
      }))
    }
  }

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setState(prev => ({
        ...prev,
        status: 'Cookie copied to clipboard.',
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Copy failed'
      setState(prev => ({
        ...prev,
        status: 'Copy failed.',
        error: message,
      }))
    }
  }

  useEffect(() => {
    loadCookies()
  }, [])

  return (
    <div className="app-container" style={{ fontFamily: 'system-ui, sans-serif', padding: 18, width: 360, maxHeight: '600px', overflowY: 'auto' }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>Page Cookies</h1>
      <div style={{ marginBottom: 12, color: '#444' }}>
        {state.url ? <span>Active tab: <strong>{state.url}</strong></span> : <span>{state.status}</span>}
      </div>

      {state.error && (
        <div style={{ marginBottom: 12, color: '#a33' }}>
          Error: {state.error}
        </div>
      )}

      {state.cookies.length > 0 ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {state.cookies.map((cookie, index) => (
            <div key={index} style={{ wordBreak: 'break-all', background: '#f4f4f6', padding: 12, borderRadius: 8, border: '1px solid #dcdfe3' }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Cookie name</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>{cookie.name}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Domain</div>
              <div style={{ fontSize: 12, marginBottom: 10 }}>{cookie.domain}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Value</div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', marginBottom: 10, maxHeight: '100px', overflowY: 'auto' }}>{cookie.value}</div>
              <button onClick={() => copyValue(cookie.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #1f6feb', background: '#1f6feb', color: '#fff', cursor: 'pointer', width: '100%' }}>
                Copy
              </button>
            </div>
          ))}
          <button onClick={loadCookies} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #666', background: '#f2f2f5', color: '#111', cursor: 'pointer', width: '100%' }}>
            Refresh
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: 12, background: '#f7f7fa', borderRadius: 8, border: '1px solid #e0e0e8', color: '#333' }}>
          {state.status}
        </div>
      )}
    </div>
  )
}

export default App
