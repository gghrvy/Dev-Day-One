// Nav panel mockups — Before / Safe / Bold redesigns

// ── Icons ─────────────────────────────────────────────────────────────────────
function IcoGit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M18 9a9 9 0 0 1-9 9"/>
    </svg>
  )
}
function IcoSettings() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function IcoSearch() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IcoChevron() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

// ── Callout annotation badge ───────────────────────────────────────────────────
function ProblemPin({ n, top, left }) {
  return (
    <div style={{ position:'absolute', top, left, zIndex:99, pointerEvents:'none',
      width:18, height:18, borderRadius:'50%', background:'#EF4444', color:'#fff',
      fontWeight:800, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center',
      boxShadow:'0 0 0 2px #09090B, 0 2px 8px rgba(239,68,68,0.5)',
      fontFamily:'system-ui' }}>{n}</div>
  )
}

const PAGES = ['Overview','Ask','Onboard','Architecture','Patterns','Impact','Knowledge','ADRs','APIs']

// ── BEFORE: current icon-rail + context-panel ─────────────────────────────────
function NavBefore() {
  return (
    <div style={{ position:'relative', display:'flex', height:'580px', fontFamily:'"Inter",-apple-system,sans-serif', background:'#09090B', overflow:'hidden' }}>

      {/* Icon rail — only 44 px, just 2 buttons */}
      <div style={{ width:44, flexShrink:0, background:'#080809', borderRight:'1px solid rgba(255,255,255,0.04)',
        display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0', gap:2 }}>
        <div style={{ width:22, height:22, borderRadius:5, background:'#F59E0B', display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:10, fontWeight:900, color:'#09090B', marginBottom:12 }}>D</div>
        <div style={{ position:'relative', display:'flex', justifyContent:'center', width:'100%', padding:'2px 0' }}>
          <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)',
            width:2, height:20, background:'#F59E0B', borderRadius:'0 2px 2px 0' }} />
          <div style={{ width:32, height:32, borderRadius:7, background:'#1C1C1F',
            display:'flex', alignItems:'center', justifyContent:'center', color:'#e4e4e7' }}><IcoGit /></div>
        </div>
        <div style={{ width:32, height:32, borderRadius:7, display:'flex', alignItems:'center',
          justifyContent:'center', color:'#52525B' }}><IcoSettings /></div>
        <div style={{ flex:1 }} />
        <div style={{ width:22, height:22, borderRadius:'50%', background:'#1C1C1F',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:600, color:'#71717A' }}>JD</div>
      </div>

      {/* Context panel — 168 px */}
      <div style={{ width:168, flexShrink:0, background:'#0C0C0E', borderRight:'1px solid rgba(255,255,255,0.05)',
        display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px 12px 6px', fontSize:11, fontWeight:700, color:'#FAFAFA' }}>Repositories</div>
        <div style={{ padding:'0 8px 8px' }}>
          <div style={{ marginBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 6px', borderRadius:5, background:'#1C1C1F' }}>
              <div style={{ width:2, height:14, borderRadius:1, background:'#4ADE80', flexShrink:0 }} />
              <span style={{ flex:1, fontSize:10, fontWeight:600, color:'#FAFAFA', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>next.js</span>
              <span style={{ color:'#52525B', display:'flex' }}><IcoChevron /></span>
            </div>
            <div style={{ marginLeft:8, marginTop:2, borderLeft:'1px solid rgba(255,255,255,0.04)' }}>
              {PAGES.map((p, i) => (
                <div key={p} style={{ padding:'3px 8px', marginLeft:4, borderRadius:4, fontSize:10,
                  color: i===1 ? '#818CF8' : '#52525B',
                  background: i===1 ? 'rgba(99,102,241,0.06)' : 'transparent',
                  borderLeft: i===1 ? '2px solid #6366F1' : '2px solid transparent',
                  fontWeight: i===1 ? 600 : 400 }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 6px', borderRadius:5 }}>
            <div style={{ width:2, height:14, borderRadius:1, background:'#3F3F46', opacity:0.4, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:10, fontWeight:600, color:'#52525B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>my-app</span>
            <span style={{ fontSize:8, color:'#F59E0B' }}>•</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 6px', borderRadius:5 }}>
            <div style={{ width:2, height:14, borderRadius:1, background:'#4ADE80', flexShrink:0 }} />
            <span style={{ flex:1, fontSize:10, fontWeight:600, color:'#52525B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>devtools</span>
          </div>
          <div style={{ marginTop:10, paddingLeft:6, fontSize:10, color:'#3F3F46' }}>+ Connect</div>
        </div>
      </div>

      {/* Content placeholder */}
      <div style={{ flex:1, background:'#09090B', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:10, color:'#1C1C1F', fontFamily:'monospace' }}>content area</span>
      </div>

      {/* Problem pins */}
      <ProblemPin n={1} top={8} left={8} />
      <ProblemPin n={2} top={8} left={52} />
      <ProblemPin n={3} top={90} left={8} />
    </div>
  )
}

// ── AFTER — SAFE: unified 220px sidebar, indigo accent ────────────────────────
const navSafe = {
  bg:'#08080D', sidebar:'#0D0D15', surface:'#111118', card:'#18181F',
  accent:'#6366F1', accentDim:'rgba(99,102,241,0.10)',
  success:'#10B981',
  text:'#F4F4FA', text2:'#9090AC', muted:'#52526A',
  border:'rgba(255,255,255,0.06)'
}

function NavAfterSafe() {
  const c = navSafe
  return (
    <div style={{ display:'flex', height:'580px', fontFamily:'"Inter",-apple-system,sans-serif', background:c.bg, overflow:'hidden' }}>
      <div style={{ width:220, flexShrink:0, background:c.sidebar, borderRight:`1px solid ${c.border}`, display:'flex', flexDirection:'column' }}>
        {/* Logo + name */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 16px 14px', borderBottom:`1px solid ${c.border}` }}>
          <div style={{ width:26, height:26, borderRadius:7, background:c.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#fff', flexShrink:0 }}>D</div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:c.text, lineHeight:1.1 }}>Dev Day One</div>
            <div style={{ fontSize:9, color:c.muted, marginTop:2 }}>Repository Intelligence</div>
          </div>
        </div>
        {/* Search */}
        <div style={{ padding:'10px 12px 6px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:7, background:c.surface, border:`1px solid ${c.border}` }}>
            <span style={{ color:c.muted, display:'flex' }}><IcoSearch /></span>
            <span style={{ fontSize:11, color:c.muted }}>Filter repos…</span>
          </div>
        </div>
        {/* Section label */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px 4px' }}>
          <span style={{ fontSize:9, fontWeight:700, color:c.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>Repositories</span>
          <span style={{ fontSize:16, color:c.muted, lineHeight:1, marginTop:-2 }}>+</span>
        </div>
        {/* Repos */}
        <div style={{ padding:'0 8px 8px' }}>
          <div style={{ marginBottom:2 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7, background:c.card, border:`1px solid rgba(99,102,241,0.2)` }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:c.success, flexShrink:0 }} />
              <span style={{ flex:1, fontSize:11, fontWeight:600, color:c.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>next.js</span>
              <span style={{ color:c.muted, display:'flex' }}><IcoChevron /></span>
            </div>
            <div style={{ marginLeft:6, marginTop:2, paddingLeft:10, borderLeft:`1px solid rgba(255,255,255,0.05)` }}>
              {PAGES.map((p, i) => (
                <div key={p} style={{ padding:'4px 10px', borderRadius:5, fontSize:11, marginBottom:1,
                  color: i===1 ? c.accent : c.text2,
                  background: i===1 ? c.accentDim : 'transparent',
                  borderLeft: i===1 ? `2px solid ${c.accent}` : '2px solid transparent',
                  fontWeight: i===1 ? 600 : 400 }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7, marginBottom:2 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:c.muted, flexShrink:0, opacity:0.5 }} />
            <span style={{ flex:1, fontSize:11, color:c.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>my-app</span>
            <span style={{ fontSize:9, color:'#F59E0B', fontFamily:'monospace' }}>idle</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:c.success, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:11, color:c.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>devtools</span>
          </div>
        </div>
        <div style={{ flex:1 }} />
        {/* Bottom */}
        <div style={{ borderTop:`1px solid ${c.border}`, padding:'10px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px', borderRadius:6, marginBottom:2 }}>
            <span style={{ color:c.muted, display:'flex' }}><IcoSettings /></span>
            <span style={{ fontSize:11, color:c.text2 }}>Settings</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:c.card, border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:600, color:c.text2 }}>JD</div>
            <span style={{ fontSize:11, color:c.text2 }}>john@dev.io</span>
          </div>
        </div>
      </div>
      <div style={{ flex:1, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:10, color:'#16161C', fontFamily:'monospace' }}>content area</span>
      </div>
    </div>
  )
}

// ── AFTER — BOLD: 240px sidebar, violet palette, gradient logo ────────────────
const navBold = {
  bg:'#0A0713', sidebar:'#0E0C1B', surface:'#150F26', card:'#1B1530',
  accent:'#8B5CF6', accentDim:'rgba(139,92,246,0.12)',
  success:'#34D399',
  text:'#EDE8FA', text2:'#9088C0', muted:'#5C5490',
  border:'rgba(255,255,255,0.06)'
}

function NavAfterBold() {
  const c = navBold
  return (
    <div style={{ display:'flex', height:'580px', fontFamily:'"Inter",-apple-system,sans-serif', background:c.bg, overflow:'hidden' }}>
      <div style={{ width:240, flexShrink:0, background:c.sidebar, borderRight:`1px solid ${c.border}`, display:'flex', flexDirection:'column' }}>
        {/* Logo — gradient with glow */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 16px 16px', borderBottom:`1px solid ${c.border}` }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#8B5CF6,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff', flexShrink:0, boxShadow:'0 4px 14px rgba(139,92,246,0.4)' }}>D</div>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:c.text, letterSpacing:'-0.01em', lineHeight:1 }}>Dev Day One</div>
            <div style={{ fontSize:9, color:c.muted, marginTop:3, letterSpacing:'0.06em', textTransform:'uppercase' }}>AI Code Intel</div>
          </div>
        </div>
        {/* Repos header + Add button */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 14px 6px' }}>
          <span style={{ fontSize:9, fontWeight:800, color:c.muted, textTransform:'uppercase', letterSpacing:'0.12em' }}>Repos</span>
          <span style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 9px', borderRadius:20, background:c.accentDim, border:`1px solid rgba(139,92,246,0.25)`, color:c.accent, fontSize:9, fontWeight:700 }}>+ Add</span>
        </div>
        {/* Repos */}
        <div style={{ padding:'0 10px 10px' }}>
          <div style={{ marginBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, background:`linear-gradient(to right,${c.card},rgba(139,92,246,0.04))`, border:`1px solid rgba(139,92,246,0.2)` }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:c.success, flexShrink:0, boxShadow:`0 0 8px ${c.success}55` }} />
              <span style={{ flex:1, fontSize:12, fontWeight:700, color:c.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>next.js</span>
              <span style={{ fontSize:8, color:c.text2, background:'rgba(255,255,255,0.05)', padding:'2px 5px', borderRadius:3, fontFamily:'monospace' }}>main</span>
            </div>
            <div style={{ marginLeft:8, marginTop:3, paddingLeft:10, borderLeft:`1px solid rgba(139,92,246,0.15)` }}>
              {PAGES.map((p, i) => (
                <div key={p} style={{ padding:'5px 10px', borderRadius:6, fontSize:11, marginBottom:1,
                  color: i===1 ? c.accent : c.text2,
                  background: i===1 ? c.accentDim : 'transparent',
                  borderLeft: i===1 ? `2px solid ${c.accent}` : '2px solid transparent',
                  fontWeight: i===1 ? 600 : 400 }}>{p}</div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, marginBottom:3 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:c.muted, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:12, color:c.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>my-app</span>
            <span style={{ fontSize:8, color:'#F59E0B', background:'rgba(245,158,11,0.1)', padding:'2px 6px', borderRadius:3, fontFamily:'monospace' }}>idle</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:c.success, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:12, color:c.text2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>devtools</span>
          </div>
        </div>
        <div style={{ flex:1 }} />
        {/* Footer */}
        <div style={{ borderTop:`1px solid ${c.border}`, padding:'10px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px', borderRadius:6, marginBottom:2 }}>
            <span style={{ color:c.muted, display:'flex' }}><IcoSettings /></span>
            <span style={{ fontSize:11, color:c.text2 }}>Settings</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 6px' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'#fff', flexShrink:0 }}>JD</div>
            <span style={{ fontSize:11, color:c.text2 }}>john@dev.io</span>
          </div>
        </div>
      </div>
      <div style={{ flex:1, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:10, color:'#18122A', fontFamily:'monospace' }}>content area</span>
      </div>
    </div>
  )
}

// ── Notes card ────────────────────────────────────────────────────────────────
function NavNotes() {
  const probs = [
    'Icon rail: 44px for just 2 buttons',
    'Logo mark only — no product name shown',
    'Settings icon is tiny, easy to miss',
  ]
  const fixes = [
    'Merged into one 220–240px sidebar',
    'Logo now shows "Dev Day One" + tagline',
    'Settings & user placed in sidebar footer',
    'Repo search filter built into sidebar',
    'Idle / branch status badges on repos',
    'Bold: violet palette + glowing logo',
    'Bold: gradient avatar for user identity',
  ]
  const row = (text, ok) => (
    <div key={text} style={{ display:'flex', gap:9, alignItems:'flex-start', marginBottom:7 }}>
      <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, marginTop:1,
        background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: ok ? '#10B981' : '#EF4444',
        fontWeight:900, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {ok ? '✓' : '✕'}
      </div>
      <span style={{ fontSize:10.5, color: ok ? '#9090AC' : '#A1A1AA', lineHeight:1.5 }}>{text}</span>
    </div>
  )
  return (
    <div style={{ height:'580px', background:'#0F0F14', fontFamily:'"Inter",-apple-system,sans-serif', padding:'20px 18px', overflow:'hidden' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#FAFAFA', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>What Changed</div>
      <div style={{ fontSize:9, color:'#52525B', marginBottom:16, fontFamily:'monospace' }}>Sidebar & Navigation</div>
      <div style={{ fontSize:9, fontWeight:700, color:'#EF4444', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Problems</div>
      {probs.map(t => row(t, false))}
      <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.05)', margin:'12px 0' }} />
      <div style={{ fontSize:9, fontWeight:700, color:'#10B981', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Improvements</div>
      {fixes.map(t => row(t, true))}
    </div>
  )
}

Object.assign(window, { NavBefore, NavAfterSafe, NavAfterBold, NavNotes })
