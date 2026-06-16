// Chat panel mockups — Before / After redesigns

function IcoSend() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  )
}
function IcoSparkle() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.09 7.02L22 12l-7.91 2.98L12 22l-2.09-7.02L2 12l7.91-2.98z"/>
    </svg>
  )
}
function IcoFile() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

// ── BEFORE: current chat ───────────────────────────────────────────────────────
function ChatBefore() {
  return (
    <div style={{ height:'500px', display:'flex', flexDirection:'column', background:'#09090B', fontFamily:'"Inter",-apple-system,sans-serif', overflow:'hidden' }}>

      {/* Tiny de-emphasised toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:12,
        borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'5px 16px' }}>
        <span style={{ fontSize:9, color:'#3F3F46', fontFamily:'monospace' }}>↓ export</span>
        <span style={{ fontSize:9, color:'#3F3F46', fontFamily:'monospace' }}>✕ clear</span>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:'20px 0', display:'flex', flexDirection:'column', gap:18, overflow:'hidden' }}>
        {/* User bubble */}
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'0 16px' }}>
          <div style={{ maxWidth:'72%', borderRadius:12, borderTopRightRadius:3,
            background:'rgba(255,255,255,0.06)', padding:'10px 14px' }}>
            <p style={{ fontSize:13, color:'#D4D4D8', lineHeight:1.5, margin:0 }}>
              Where is authentication handled?
            </p>
          </div>
        </div>

        {/* AI — only a left border to distinguish it */}
        <div style={{ borderLeft:'2px solid #6366F1', paddingLeft:16, paddingRight:16 }}>
          <p style={{ fontSize:13, color:'#A1A1AA', lineHeight:1.65, margin:'0 0 10px' }}>
            Authentication is handled in{' '}
            <code style={{ color:'#818CF8', fontFamily:'monospace', fontSize:12 }}>lib/supabase/</code>
            {' '}— a browser client in{' '}
            <code style={{ color:'#818CF8', fontFamily:'monospace', fontSize:12 }}>client.ts</code>
            {' '}and a server client using cookies for SSR.
          </p>
          {/* Source files — very dim */}
          <div style={{ display:'flex', gap:5 }}>
            {['lib/supabase/client.ts','lib/supabase/server.ts'].map(f => (
              <span key={f} style={{ padding:'2px 7px', borderRadius:4,
                border:'1px solid rgba(255,255,255,0.06)', fontSize:9, color:'#52525B', fontFamily:'monospace' }}>{f}</span>
            ))}
          </div>
        </div>

        {/* User bubble 2 */}
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'0 16px' }}>
          <div style={{ maxWidth:'72%', borderRadius:12, borderTopRightRadius:3,
            background:'rgba(255,255,255,0.06)', padding:'10px 14px' }}>
            <p style={{ fontSize:13, color:'#D4D4D8', lineHeight:1.5, margin:0 }}>
              How is error handling structured?
            </p>
          </div>
        </div>

        {/* Typing — left border again */}
        <div style={{ borderLeft:'2px solid #6366F1', paddingLeft:16 }}>
          <div style={{ display:'flex', gap:4 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#6366F1', opacity:0.6 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Input — small send button, tiny help text */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8, borderRadius:12,
          border:'1px solid rgba(255,255,255,0.07)', background:'#0C0C0E', padding:'10px 14px' }}>
          <div style={{ flex:1, fontSize:13, color:'#52525B', lineHeight:1.5 }}>
            Ask anything about the codebase…
          </div>
          <div style={{ width:24, height:24, borderRadius:6, background:'rgba(99,102,241,0.28)',
            display:'flex', alignItems:'center', justifyContent:'center', color:'#818CF8', flexShrink:0 }}>
            <IcoSend />
          </div>
        </div>
        <p style={{ fontSize:9, color:'#3F3F46', margin:'5px 0 0', fontFamily:'monospace' }}>
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  )
}

// ── AFTER: redesigned chat ─────────────────────────────────────────────────────
const chatSafe = {
  bg:'#08080D', surface:'#111118', card:'#18181F',
  accent:'#6366F1', accentDim:'rgba(99,102,241,0.10)',
  text:'#F4F4FA', text2:'#9090AC', muted:'#52526A',
  border:'rgba(255,255,255,0.06)'
}

function ChatAfter() {
  const c = chatSafe
  return (
    <div style={{ height:'500px', display:'flex', flexDirection:'column', background:c.bg, fontFamily:'"Inter",-apple-system,sans-serif', overflow:'hidden' }}>

      {/* Proper header with context + real buttons */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${c.border}`, padding:'10px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:22, height:22, borderRadius:6, background:c.accentDim,
            border:`1px solid rgba(99,102,241,0.22)`, display:'flex', alignItems:'center',
            justifyContent:'center', color:c.accent }}>
            <IcoSparkle />
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:c.text }}>Ask</span>
          <span style={{ fontSize:12, color:c.muted }}>/ next.js</span>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {['Export ↓', 'Clear'].map(label => (
            <button key={label} style={{ padding:'4px 10px', borderRadius:6,
              border:`1px solid ${c.border}`, background:'transparent',
              color:c.text2, fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, padding:20, display:'flex', flexDirection:'column', gap:16, overflow:'hidden' }}>
        {/* User bubble — accent tinted */}
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <div style={{ maxWidth:'68%', borderRadius:14, borderTopRightRadius:4,
            background:c.accentDim, border:`1px solid rgba(99,102,241,0.16)`, padding:'10px 16px' }}>
            <p style={{ fontSize:13, color:c.text, lineHeight:1.5, margin:0 }}>
              Where is authentication handled?
            </p>
          </div>
        </div>

        {/* AI — avatar icon + full bubble area */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:26, height:26, borderRadius:7, background:c.accentDim,
            border:`1px solid rgba(99,102,241,0.22)`, display:'flex', alignItems:'center',
            justifyContent:'center', color:c.accent, flexShrink:0 }}>
            <IcoSparkle />
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, color:c.text2, lineHeight:1.7, margin:'0 0 12px' }}>
              Authentication lives in{' '}
              <code style={{ color:c.accent, background:c.accentDim, padding:'1px 5px',
                borderRadius:4, fontSize:12, fontFamily:'monospace' }}>lib/supabase/</code>
              {' '}— a browser client for CSR and a server client using cookies for SSR.
            </p>
            {/* Source file chips — visible & clickable */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['lib/supabase/client.ts','lib/supabase/server.ts'].map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 8px',
                  borderRadius:5, border:`1px solid ${c.border}`, background:c.surface,
                  fontSize:10, color:c.text2, fontFamily:'monospace', cursor:'pointer' }}>
                  <span style={{ color:c.accent, display:'flex' }}><IcoFile /></span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User bubble 2 */}
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <div style={{ maxWidth:'68%', borderRadius:14, borderTopRightRadius:4,
            background:c.accentDim, border:`1px solid rgba(99,102,241,0.16)`, padding:'10px 16px' }}>
            <p style={{ fontSize:13, color:c.text, lineHeight:1.5, margin:0 }}>
              How is error handling structured?
            </p>
          </div>
        </div>

        {/* Typing — avatar + dots */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:26, height:26, borderRadius:7, background:c.accentDim,
            border:`1px solid rgba(99,102,241,0.22)`, display:'flex', alignItems:'center',
            justifyContent:'center', color:c.accent, flexShrink:0 }}>
            <IcoSparkle />
          </div>
          <div style={{ display:'flex', gap:4, paddingTop:8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:c.accent, opacity:0.6 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Input — larger send, cleaner container */}
      <div style={{ borderTop:`1px solid ${c.border}`, padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, borderRadius:14,
          border:`1px solid ${c.border}`, background:c.surface, padding:'12px 16px' }}>
          <div style={{ flex:1, fontSize:13, color:c.muted, lineHeight:1.5 }}>
            Ask anything about next.js…
          </div>
          <button style={{ width:30, height:30, borderRadius:9, background:c.accent,
            border:'none', display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', cursor:'pointer', flexShrink:0 }}>
            <IcoSend />
          </button>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, padding:'0 2px' }}>
          <span style={{ fontSize:10, color:c.muted, fontFamily:'monospace' }}>⇧ Enter for newline</span>
          <span style={{ fontSize:10, color:c.muted }}>Sources cited automatically</span>
        </div>
      </div>
    </div>
  )
}

// ── Notes card ────────────────────────────────────────────────────────────────
function ChatNotes() {
  const probs = [
    'AI messages: only a left border, no avatar or identity',
    'Source file chips: 9px monospace, near-invisible',
    'Export / Clear toolbar: de-emphasised to invisibility',
    'Send button: 24px, hard target on small screens',
    'No page header \u2014 unclear which repo / mode you\u2019re in',
  ]
  const fixes = [
    'AI avatar icon marks every response clearly',
    'User messages: accent-tinted background vs plain gray',
    'Source file chips: larger, icon + path, clearly clickable',
    'Export / Clear: real buttons in the header row',
    'Solid 30px send button with full accent fill',
    'Header shows "Ask / next.js" breadcrumb context',
  ]
  const row = (text, ok) => (
    <div key={text} style={{ display:'flex', gap:9, alignItems:'flex-start', marginBottom:7 }}>
      <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, marginTop:1,
        background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
        border:`1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: ok ? '#10B981' : '#EF4444',
        fontWeight:900, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {ok ? '✓' : '✕'}
      </div>
      <span style={{ fontSize:10.5, color: ok ? '#9090AC' : '#A1A1AA', lineHeight:1.5 }}>{text}</span>
    </div>
  )
  return (
    <div style={{ height:'500px', background:'#0F0F14', fontFamily:'"Inter",-apple-system,sans-serif',
      padding:'20px 18px', overflow:'hidden' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'#FAFAFA', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.1em' }}>What Changed</div>
      <div style={{ fontSize:9, color:'#52525B', marginBottom:16, fontFamily:'monospace' }}>Chat Interface (Ask / Onboard)</div>
      <div style={{ fontSize:9, fontWeight:700, color:'#EF4444', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Problems</div>
      {probs.map(t => row(t, false))}
      <div style={{ width:'100%', height:1, background:'rgba(255,255,255,0.05)', margin:'12px 0' }} />
      <div style={{ fontSize:9, fontWeight:700, color:'#10B981', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Improvements</div>
      {fixes.map(t => row(t, true))}
    </div>
  )
}

Object.assign(window, { ChatBefore, ChatAfter, ChatNotes })
