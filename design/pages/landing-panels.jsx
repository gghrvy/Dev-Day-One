// Landing page — redesigned: dark navy (not black), editorial layout

// ── Palette (landing-specific — navy, not near-black) ─────────────────────────
const L = {
  bg:      '#080D1A',
  surface: '#0D1526',
  card:    '#111D33',
  raised:  '#16243E',
  accent:  '#6366F1',
  accentB: '#818CF8',
  success: '#10B981',
  text:    '#EEF0FA',
  text2:   '#8892B0',
  muted:   '#4A5578',
  border:  'rgba(120,140,200,0.10)',
  borderB: 'rgba(120,140,200,0.18)',
}

function Arr() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}

// ── Mini product UI (hero right-side visual) ───────────────────────────────────
const MINI_PAGES = ['Overview','Ask','Architecture','Patterns','Impact']
function MiniAppUI() {
  return (
    <div style={{ borderRadius:12, border:`1px solid ${L.borderB}`, overflow:'hidden', background:L.surface, boxShadow:`0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px ${L.border}` }}>
      {/* Mini window chrome */}
      <div style={{ display:'flex', alignItems:'center', height:32, borderBottom:`1px solid ${L.border}`, background:L.card, padding:'0 12px', gap:5 }}>
        {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width:8, height:8, borderRadius:'50%', background:c }} />)}
        <span style={{ marginLeft:'auto', fontFamily:'monospace', fontSize:9, color:L.muted }}>app.devdayone.io</span>
      </div>
      <div style={{ display:'flex', height:340 }}>
        {/* Mini sidebar */}
        <div style={{ width:136, borderRight:`1px solid ${L.border}`, background:L.card, display:'flex', flexDirection:'column', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 10px 8px', borderBottom:`1px solid ${L.border}` }}>
            <div style={{ width:18, height:18, borderRadius:4, background:L.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:900, color:'#fff', flexShrink:0 }}>D</div>
            <span style={{ fontSize:10, fontWeight:700, color:L.text, lineHeight:1 }}>Dev Day One</span>
          </div>
          <div style={{ padding:'8px 6px' }}>
            <div style={{ fontSize:8, color:L.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, paddingLeft:4 }}>Repositories</div>
            <div style={{ padding:'5px 6px', borderRadius:5, background:L.raised, border:`1px solid rgba(99,102,241,0.2)`, marginBottom:3 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:L.success }} />
                <span style={{ fontSize:9, fontWeight:600, color:L.text }}>next.js</span>
              </div>
            </div>
            <div style={{ paddingLeft:8, borderLeft:`1px solid rgba(255,255,255,0.05)`, marginLeft:4, marginTop:2 }}>
              {MINI_PAGES.map((p, i) => (
                <div key={p} style={{ padding:'3px 7px', borderRadius:3, fontSize:9, marginBottom:1,
                  color: i===1 ? L.accentB : L.muted,
                  background: i===1 ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: i===1 ? `2px solid ${L.accent}` : '2px solid transparent',
                  fontWeight: i===1 ? 600 : 400 }}>{p}</div>
              ))}
            </div>
            {['my-app','devtools'].map(r => (
              <div key={r} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 6px', borderRadius:5, marginTop:3 }}>
                <div style={{ width:5, height:5, borderRadius:'50%', background:L.muted, opacity:0.5 }} />
                <span style={{ fontSize:9, color:L.muted }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini chat */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:L.surface }}>
          <div style={{ borderBottom:`1px solid ${L.border}`, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:16, height:16, borderRadius:4, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#818CF8"><path d="M12 2l2.09 7.02L22 12l-7.91 2.98L12 22l-2.09-7.02L2 12l7.91-2.98z"/></svg>
            </div>
            <span style={{ fontSize:10, fontWeight:600, color:L.text }}>Ask</span>
            <span style={{ fontSize:10, color:L.muted }}>/ next.js</span>
          </div>
          <div style={{ flex:1, padding:'10px 12px', display:'flex', flexDirection:'column', gap:10, overflow:'hidden' }}>
            {/* User */}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <div style={{ maxWidth:'80%', padding:'7px 10px', borderRadius:8, borderTopRightRadius:2, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontSize:10, color:L.text, margin:0, lineHeight:1.4 }}>Where is authentication handled?</p>
              </div>
            </div>
            {/* AI */}
            <div style={{ display:'flex', gap:7, alignItems:'flex-start' }}>
              <div style={{ width:18, height:18, borderRadius:4, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="#818CF8"><path d="M12 2l2.09 7.02L22 12l-7.91 2.98L12 22l-2.09-7.02L2 12l7.91-2.98z"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:10, color:L.text2, margin:'0 0 7px', lineHeight:1.5 }}>
                  Auth lives in <code style={{ color:L.accentB, background:'rgba(99,102,241,0.1)', padding:'1px 4px', borderRadius:3, fontSize:9, fontFamily:'monospace' }}>lib/supabase/</code> — JWT for SSR, browser client for CSR.
                </p>
                <div style={{ display:'flex', gap:5 }}>
                  {['lib/supabase/client.ts','lib/supabase/server.ts'].map(f => (
                    <span key={f} style={{ fontFamily:'monospace', fontSize:8, color:L.muted, background:L.raised, padding:'2px 6px', borderRadius:3, border:`1px solid ${L.border}` }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Input */}
          <div style={{ borderTop:`1px solid ${L.border}`, padding:'8px 12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:7, border:`1px solid ${L.border}`, background:L.card }}>
              <span style={{ flex:1, fontSize:10, color:L.muted }}>Ask next.js anything…</span>
              <div style={{ width:22, height:22, borderRadius:5, background:L.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function LandingHero() {
  return (
    <div style={{ width:'100%', height:720, background:L.bg, fontFamily:'"Inter",-apple-system,sans-serif', overflow:'hidden', position:'relative' }}>
      {/* Subtle grid texture */}
      <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(${L.border} 1px, transparent 1px), linear-gradient(90deg, ${L.border} 1px, transparent 1px)`, backgroundSize:'64px 64px', opacity:0.5 }} />
      {/* Glow */}
      <div style={{ position:'absolute', top:-120, left:-80, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', pointerEvents:'none' }} />

      {/* Nav */}
      <nav style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', height:52, borderBottom:`1px solid ${L.border}`, padding:'0 44px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:L.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#fff' }}>D</div>
          <span style={{ fontSize:14, fontWeight:700, color:L.text, letterSpacing:'-0.02em' }}>Dev Day One</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          {['Features','How it works','Sign in'].map(l => (
            <span key={l} style={{ fontSize:13, color:L.text2, cursor:'pointer' }}>{l}</span>
          ))}
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:7, background:L.accent, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            Get early access <Arr />
          </div>
        </div>
      </nav>

      {/* Hero body */}
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, padding:'56px 44px 0', maxWidth:1200, margin:'0 auto', alignItems:'flex-start' }}>
        {/* Left */}
        <div style={{ paddingTop:20 }}>
          <h1 style={{ fontSize:56, fontWeight:900, lineHeight:1.0, letterSpacing:'-0.04em', color:L.text, margin:'0 0 24px' }}>
            Your codebase,<br />
            <span style={{ color:L.accentB }}>finally legible.</span>
          </h1>
          <p style={{ fontSize:15, lineHeight:1.7, color:L.text2, margin:'0 0 36px', maxWidth:400 }}>
            Connect a GitHub repo and let AI answer the questions your docs never covered — so engineers ship on day one, not week four.
          </p>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 22px', borderRadius:8, background:L.accent, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Connect a repo <Arr />
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 18px', borderRadius:8, border:`1px solid ${L.borderB}`, color:L.text2, fontSize:13, cursor:'pointer' }}>
              See how it works
            </div>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['acme/backend','vercel/next.js','stripe/stripe-node'].map(r => (
              <span key={r} style={{ fontFamily:'monospace', fontSize:10, color:L.muted, background:L.surface, border:`1px solid ${L.border}`, padding:'3px 9px', borderRadius:20 }}>{r}</span>
            ))}
          </div>
        </div>

        {/* Right — actual product UI */}
        <MiniAppUI />
      </div>
    </div>
  )
}

// ── FEATURES — editorial numbered list ───────────────────────────────────────
const FEAT = [
  { n:'01', title:'Ask the codebase',       desc:'Where is auth handled? How does payment flow? Get cited, code-grounded answers instead of hunting through files.' },
  { n:'02', title:'Onboard new engineers',  desc:'Auto-generate a first-week guide from your actual code — not a wiki someone last updated in 2022.'               },
  { n:'03', title:'Map your architecture',  desc:'Understand module boundaries, dependency chains, and code ownership across the entire repo at a glance.'          },
  { n:'04', title:'Analyze change impact',  desc:'Know which files break, which paths change, and what to test before you merge — not after.'                       },
]

function LandingFeatures() {
  return (
    <div style={{ height:560, background:L.bg, fontFamily:'"Inter",-apple-system,sans-serif', overflow:'hidden' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 44px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:80, alignItems:'flex-start' }}>
          {/* Label column */}
          <div style={{ paddingTop:6 }}>
            <p style={{ fontFamily:'monospace', fontSize:10, color:L.muted, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 16px' }}>Capabilities</p>
            <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:'-0.03em', color:L.text, lineHeight:1.05, margin:'0 0 20px' }}>
              Built for<br />engineers.
            </h2>
            <p style={{ fontSize:13, color:L.text2, lineHeight:1.65, margin:0, maxWidth:220 }}>
              Not another docs generator. A live AI over the source of truth.
            </p>
          </div>

          {/* Feature rows */}
          <div>
            {FEAT.map((f, i) => (
              <div key={f.n} style={{ display:'grid', gridTemplateColumns:'36px 1fr', gap:20, padding:'22px 0',
                borderTop:`1px solid ${L.border}`, alignItems:'baseline' }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:L.muted }}>{f.n}</span>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:L.text, margin:'0 0 7px', letterSpacing:'-0.01em' }}>{f.title}</h3>
                  <p style={{ fontSize:13, color:L.text2, lineHeight:1.65, margin:0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ height:1, background:L.border }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HOW IT WORKS — minimal text-only ─────────────────────────────────────────
function LandingHowItWorks() {
  return (
    <div style={{ height:380, background:L.surface, fontFamily:'"Inter",-apple-system,sans-serif', overflow:'hidden', borderTop:`1px solid ${L.border}` }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 44px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:80 }}>
          <div>
            <p style={{ fontFamily:'monospace', fontSize:10, color:L.muted, textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 16px' }}>How it works</p>
            <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:'-0.03em', color:L.text, lineHeight:1.05, margin:'0 0 20px' }}>
              Live in<br />five minutes.
            </h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:0, paddingTop:4 }}>
            {[
              ['Connect',  'Paste any GitHub URL — public or private. That\'s the whole setup.'],
              ['Index',    'We chunk and embed the entire repo using pgvector. Done in under 60 seconds.'],
              ['Ask',      'Your team gets instant, source-cited answers directly from the code.'],
            ].map(([title, desc], i) => (
              <div key={title} style={{ display:'grid', gridTemplateColumns:'20px 1fr', gap:24, padding:'20px 0', borderTop:`1px solid ${L.border}`, alignItems:'baseline' }}>
                <span style={{ fontSize:13, fontWeight:800, color:L.accent }}>{i+1}</span>
                <div>
                  <span style={{ fontSize:14, fontWeight:700, color:L.text, letterSpacing:'-0.01em' }}>{title}</span>
                  <span style={{ fontSize:13, color:L.text2, marginLeft:12 }}>{desc}</span>
                </div>
              </div>
            ))}
            <div style={{ height:1, background:L.border }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CTA FOOTER ────────────────────────────────────────────────────────────────
function LandingCTA() {
  return (
    <div style={{ height:300, background:L.bg, fontFamily:'"Inter",-apple-system,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', borderTop:`1px solid ${L.border}`, overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'relative', textAlign:'center', maxWidth:520 }}>
        <h2 style={{ fontSize:42, fontWeight:900, letterSpacing:'-0.03em', color:L.text, lineHeight:1.05, margin:'0 0 16px' }}>
          Ready when<br />your team is.
        </h2>
        <p style={{ fontSize:14, color:L.text2, lineHeight:1.6, margin:'0 0 32px' }}>
          Connect your first repository for free — no credit card, no config.
        </p>
        <div style={{ display:'flex', gap:0, maxWidth:400, margin:'0 auto', borderRadius:9, overflow:'hidden', border:`1px solid ${L.borderB}`, background:L.surface }}>
          <input readOnly defaultValue="github.com/your-org/repo" style={{ flex:1, background:'transparent', border:'none', padding:'11px 16px', fontFamily:'monospace', fontSize:12, color:L.text2, outline:'none' }} />
          <div style={{ padding:'0 20px', background:L.accent, color:'#fff', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6, cursor:'pointer', whiteSpace:'nowrap' }}>
            Index it <Arr />
          </div>
        </div>
        <p style={{ fontSize:11, color:L.muted, marginTop:12 }}>Free for public repos. Private repos on the team plan.</p>
      </div>
    </div>
  )
}

Object.assign(window, { LandingHero, LandingFeatures, LandingHowItWorks, LandingCTA })
