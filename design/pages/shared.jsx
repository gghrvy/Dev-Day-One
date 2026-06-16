// Shared design tokens, icons, AppShell, Sidebar, PageHeader
// Must load before all app/landing panel files

// ── Tokens — navy palette (matches landing page) ──────────────────────────────
const C = {
  bg:        '#080D1A',
  sidebar:   '#0B1223',
  surface:   '#0F1A2E',
  card:      '#13202F',
  accent:    '#6366F1',
  accentDim: 'rgba(99,102,241,0.10)',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  text:      '#EEF0FA',
  text2:     '#8892B0',
  muted:     '#4A5578',
  border:    'rgba(120,140,200,0.09)',
  borderB:   'rgba(120,140,200,0.18)',
  mono:      '"JetBrains Mono",ui-monospace,monospace',
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function SIcoSettings() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function SIcoSearch() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function SIcoChevron() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function SIcoPlus() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function SIcoTrash() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
function SIcoLogOut() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

// ── Sidebar data ───────────────────────────────────────────────────────────────
const SIDEBAR_REPOS = [
  { name: 'next.js',    indexed: true  },
  { name: 'my-app',     indexed: false },
  { name: 'devtools',   indexed: true  },
]
const SIDEBAR_PAGES = ['Overview','Ask','Onboard','Architecture','Patterns','Impact','Knowledge','ADRs','APIs','Index History']

// ── AppSidebar ─────────────────────────────────────────────────────────────────
function AppSidebar({ activeRepo, activePage }) {
  return (
    <div style={{ width:220, flexShrink:0, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 16px 14px', borderBottom:`1px solid ${C.border}` }}>
        <div style={{ width:28, height:28, borderRadius:7, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 80 80" fill="none">
            <polyline points="30,12 12,40 30,68" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="50,12 68,40 50,68" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M40 26 L42.8 37.2 L54 40 L42.8 42.8 L40 54 L37.2 42.8 L26 40 L37.2 37.2 Z" fill="white" opacity="0.85"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:C.text, lineHeight:1.1 }}>Dev Day One</div>
          <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>Repository Intelligence</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding:'10px 12px 6px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:7, background:C.surface, border:`1px solid ${C.border}` }}>
          <span style={{ color:C.muted, display:'flex' }}><SIcoSearch /></span>
          <span style={{ fontSize:11, color:C.muted }}>Filter repos…</span>
        </div>
      </div>

      {/* Section label */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px 4px' }}>
        <span style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>Repositories</span>
        <span style={{ fontSize:16, color:C.muted, lineHeight:1, marginTop:-2, cursor:'pointer' }}>+</span>
      </div>

      {/* Repos */}
      <div style={{ padding:'0 8px', overflow:'hidden' }}>
        {SIDEBAR_REPOS.map(repo => {
          const isActive = repo.name === activeRepo
          return (
            <div key={repo.name} style={{ marginBottom:2 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7,
                background: isActive ? C.card : 'transparent',
                border: isActive ? `1px solid rgba(99,102,241,0.2)` : '1px solid transparent',
                cursor:'pointer' }}>
                <div style={{ width:6, height:6, borderRadius:'50%',
                  background: repo.indexed ? C.success : C.muted,
                  flexShrink:0, opacity: repo.indexed ? 1 : 0.5 }} />
                <span style={{ flex:1, fontSize:11, fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.text : C.text2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {repo.name}
                </span>
                {!repo.indexed && <span style={{ fontSize:9, color:C.warning, fontFamily:'monospace' }}>idle</span>}
                {isActive && repo.indexed && <span style={{ color:C.muted, display:'flex' }}><SIcoChevron /></span>}
              </div>
              {isActive && (
                <div style={{ marginLeft:6, marginTop:2, paddingLeft:10, borderLeft:`1px solid rgba(255,255,255,0.05)` }}>
                  {SIDEBAR_PAGES.map(p => (
                    <div key={p} style={{ padding:'4px 10px', borderRadius:5, fontSize:11, marginBottom:1,
                      color:      p === activePage ? C.accent : C.text2,
                      background: p === activePage ? C.accentDim : 'transparent',
                      borderLeft: p === activePage ? `2px solid ${C.accent}` : '2px solid transparent',
                      fontWeight: p === activePage ? 600 : 400, cursor:'pointer' }}>{p}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        <div style={{ marginTop:8, paddingLeft:8, fontSize:10, color:C.muted, cursor:'pointer' }}>
          + Connect repository
        </div>
      </div>

      <div style={{ flex:1 }} />

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${C.border}`, padding:'10px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px', borderRadius:6, marginBottom:2,
          background: activePage === 'Settings' ? C.accentDim : 'transparent',
          color:      activePage === 'Settings' ? C.accent : C.text2,
          cursor:'pointer' }}>
          <span style={{ display:'flex' }}><SIcoSettings /></span>
          <span style={{ fontSize:11 }}>Settings</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px' }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:C.card,
            border:`1px solid ${C.border}`, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:8, fontWeight:600, color:C.text2, flexShrink:0 }}>JD</div>
          <span style={{ fontSize:11, color:C.text2 }}>john@dev.io</span>
        </div>
      </div>
    </div>
  )
}

// ── AppShell ──────────────────────────────────────────────────────────────────
function AppShell({ activeRepo, activePage, height, children }) {
  return (
    <div style={{ display:'flex', height: height || 680, fontFamily:'"Inter",-apple-system,sans-serif', background:C.bg, overflow:'hidden' }}>
      <AppSidebar activeRepo={activeRepo} activePage={activePage} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, overflow:'hidden' }}>
        {children}
      </div>
    </div>
  )
}

// ── AppPageHeader ─────────────────────────────────────────────────────────────
function AppPageHeader({ title, meta, action }) {
  return (
    <div style={{ padding:'20px 24px 0', flexShrink:0 }}>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:'-0.02em', lineHeight:1, margin:0 }}>{title}</h1>
          {meta && <p style={{ fontSize:9, color:C.muted, marginTop:4, fontFamily:'monospace', margin:'4px 0 0' }}>{meta}</p>}
        </div>
        {action && <div style={{ marginBottom:2 }}>{action}</div>}
      </div>
      <div style={{ position:'relative', height:1, background:C.border }}>
        <div style={{ position:'absolute', left:0, top:0, height:1, width:32, background:C.accent }} />
      </div>
    </div>
  )
}

// ── AppBtn ────────────────────────────────────────────────────────────────────
function AppBtn({ children, variant, small }) {
  const isPrimary = !variant || variant === 'primary'
  return (
    <button style={{ display:'inline-flex', alignItems:'center', gap:5,
      padding: small ? '4px 10px' : '6px 14px',
      borderRadius:7,
      background: isPrimary ? C.accent : 'transparent',
      border: isPrimary ? 'none' : `1px solid ${C.border}`,
      color: isPrimary ? '#fff' : C.text2,
      fontSize: small ? 10 : 11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
      {children}
    </button>
  )
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  indexed:        { bg:'rgba(16,185,129,0.1)',  color:'#10B981', border:'rgba(16,185,129,0.25)'  },
  'not indexed':  { bg:'rgba(82,82,106,0.1)',   color:'#52526A', border:'rgba(82,82,106,0.25)'   },
  high:           { bg:'rgba(239,68,68,0.1)',   color:'#EF4444', border:'rgba(239,68,68,0.25)'   },
  medium:         { bg:'rgba(245,158,11,0.1)',  color:'#F59E0B', border:'rgba(245,158,11,0.25)'  },
  low:            { bg:'rgba(16,185,129,0.1)',  color:'#10B981', border:'rgba(16,185,129,0.25)'  },
  accepted:       { bg:'rgba(16,185,129,0.1)',  color:'#10B981', border:'rgba(16,185,129,0.25)'  },
  proposed:       { bg:'rgba(245,158,11,0.1)',  color:'#F59E0B', border:'rgba(245,158,11,0.25)'  },
  deprecated:     { bg:'rgba(239,68,68,0.1)',   color:'#EF4444', border:'rgba(239,68,68,0.25)'   },
  active:         { bg:'rgba(16,185,129,0.1)',  color:'#10B981', border:'rgba(16,185,129,0.25)'  },
  internal:       { bg:'rgba(99,102,241,0.1)',  color:'#6366F1', border:'rgba(99,102,241,0.25)'  },
  external:       { bg:'rgba(139,92,246,0.1)',  color:'#8B5CF6', border:'rgba(139,92,246,0.25)'  },
}
function StatusBadge({ status }) {
  const s = BADGE_STYLES[status] || BADGE_STYLES['not indexed']
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 7px', borderRadius:4,
      border:`1px solid ${s.border}`, background:s.bg, color:s.color,
      fontSize:9, fontWeight:600, fontFamily:'monospace', whiteSpace:'nowrap' }}>
      {status}
    </span>
  )
}

Object.assign(window, { C, AppShell, AppSidebar, AppPageHeader, AppBtn, StatusBadge, SIcoSettings, SIcoSearch, SIcoChevron, SIcoPlus, SIcoTrash, SIcoLogOut })
