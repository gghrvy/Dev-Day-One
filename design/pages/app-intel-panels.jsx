// Architecture, Patterns, Impact pages
const { C, AppShell, AppPageHeader, AppBtn, StatusBadge } = window

// ── ARCHITECTURE ──────────────────────────────────────────────────────────────
const ARCH_NODES = [
  { id:'fe',  label:'Next.js Frontend', x:190, y:28,  w:158, h:34, color:'#6366F1' },
  { id:'api', label:'API Routes',       x:80,  y:120, w:118, h:34, color:'#8B5CF6' },
  { id:'auth',label:'Supabase Auth',    x:250, y:120, w:128, h:34, color:'#0EA5E9' },
  { id:'db',  label:'PostgreSQL',       x:80,  y:212, w:118, h:34, color:'#10B981' },
  { id:'vec', label:'pgvector',         x:250, y:212, w:108, h:34, color:'#10B981' },
  { id:'ext', label:'GitHub API',       x:420, y:120, w:108, h:34, color:'#F59E0B' },
]
const ARCH_EDGES = [
  ['fe','api'],['fe','auth'],['api','db'],['auth','vec'],['api','ext'],
]
const cx = n => n.x + n.w / 2
const cy = n => n.y + n.h / 2

function ArchitecturePage() {
  return (
    <AppShell activeRepo="next.js" activePage="Architecture" height={680}>
      <AppPageHeader title="Architecture" meta="AI-generated · Jun 12, 2025" action={<AppBtn small>Regenerate</AppBtn>} />
      <div style={{ flex:1, padding:'16px 24px', display:'flex', gap:16, overflow:'hidden' }}>
        {/* Graph */}
        <div style={{ flex:1, position:'relative', background:C.surface, borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
          {/* Dot grid */}
          <div style={{ position:'absolute', inset:0, backgroundImage:`radial-gradient(${C.border} 1px,transparent 1px)`, backgroundSize:'28px 28px' }} />
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible' }}>
            {ARCH_EDGES.map(([a, b]) => {
              const fn = ARCH_NODES.find(n => n.id === a)
              const tn = ARCH_NODES.find(n => n.id === b)
              return (
                <line key={`${a}-${b}`}
                  x1={cx(fn)+20} y1={cy(fn)+20}
                  x2={cx(tn)+20} y2={cy(tn)+20}
                  stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="5,4"/>
              )
            })}
          </svg>
          {ARCH_NODES.map(n => (
            <div key={n.id} style={{ position:'absolute', left:n.x+20, top:n.y+20, width:n.w, height:n.h,
              background:`${n.color}18`, border:`1px solid ${n.color}40`, borderRadius:8,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, color:n.color, fontWeight:600, cursor:'pointer' }}>{n.label}</div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ width:148, flexShrink:0 }}>
          <div style={{ fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Node Types</div>
          {[
            { color:'#6366F1', label:'Layer'    },
            { color:'#8B5CF6', label:'Module'   },
            { color:'#0EA5E9', label:'Service'  },
            { color:'#10B981', label:'Database' },
            { color:'#F59E0B', label:'External' },
          ].map(t => (
            <div key={t.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:`${t.color}28`, border:`1px solid ${t.color}55` }} />
              <span style={{ fontSize:11, color:C.text2 }}>{t.label}</span>
            </div>
          ))}
          <div style={{ marginTop:20, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:'monospace', fontSize:10, color:C.muted, marginBottom:4 }}>6 nodes</div>
            <div style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>5 edges</div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

// ── PATTERNS ──────────────────────────────────────────────────────────────────
const PATTERNS = [
  { name:'Repository Pattern', conf:'high',   desc:'Data access abstracted behind repository interfaces with a consistent API throughout the codebase.', ev:['lib/api/client.ts','hooks/use-indexing-progress.ts'] },
  { name:'Service Layer',      conf:'high',   desc:'Business logic separated from UI and data layers, providing clear separation of concerns.',           ev:['lib/supabase/server.ts','app/(dashboard)/layout.tsx'] },
  { name:'Error Boundaries',   conf:'medium', desc:'Structured error handling via React Error Boundaries wrapping major component trees.',               ev:['components/ui/error-boundary.tsx'] },
  { name:'Factory Pattern',    conf:'low',    desc:'Some evidence of factory-style object creation but not consistently applied across modules.',         ev:['lib/utils.ts'] },
]
const confBg    = { high:'rgba(16,185,129,0.08)', medium:'rgba(245,158,11,0.08)', low:'rgba(82,82,106,0.08)' }
const confColor = { high:'#10B981', medium:'#F59E0B', low:'#52526A' }
const confBd    = { high:'rgba(16,185,129,0.2)', medium:'rgba(245,158,11,0.2)', low:'rgba(82,82,106,0.2)' }

function PatternsPage() {
  return (
    <AppShell activeRepo="next.js" activePage="Patterns" height={680}>
      <AppPageHeader title="Patterns" meta="AI-detected · Jun 12, 2025" action={<AppBtn small>Re-detect</AppBtn>} />
      <div style={{ padding:'16px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {PATTERNS.map(p => (
          <div key={p.name} style={{ borderRadius:10, border:`1px solid ${C.border}`, background:C.card, padding:16 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <h3 style={{ fontSize:13, fontWeight:600, color:C.text, margin:0 }}>{p.name}</h3>
              <span style={{ padding:'2px 7px', borderRadius:4,
                background:confBg[p.conf], border:`1px solid ${confBd[p.conf]}`,
                color:confColor[p.conf], fontSize:9, fontWeight:600, fontFamily:'monospace' }}>{p.conf}</span>
            </div>
            <p style={{ fontSize:12, color:C.text2, lineHeight:1.65, margin:'0 0 10px' }}>{p.desc}</p>
            {p.ev.map(e => (
              <div key={e} style={{ fontFamily:'monospace', fontSize:10, color:C.muted, marginBottom:3 }}>↳ {e}</div>
            ))}
          </div>
        ))}
      </div>
    </AppShell>
  )
}

// ── IMPACT ────────────────────────────────────────────────────────────────────
const IMPACT_FILES = [
  { path:'middleware/auth.ts',           risk:'high',   reason:'Direct modification target — every request passes through this file' },
  { path:'app/api/repos/route.ts',       risk:'high',   reason:'Uses withAuth HOC on every handler; removing it breaks all protected routes' },
  { path:'lib/supabase/server.ts',       risk:'medium', reason:'Session token parsing depends on middleware-injected request format' },
  { path:'components/providers.tsx',     risk:'low',    reason:'Re-exports auth context; may need re-wiring but not breaking' },
]

function ImpactPage() {
  return (
    <AppShell activeRepo="next.js" activePage="Impact" height={680}>
      <AppPageHeader title="Impact Analysis" meta="What breaks if I change X?" />
      <div style={{ padding:'16px 24px', display:'flex', flexDirection:'column', gap:16 }}>
        {/* Query */}
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, padding:'10px 14px', borderRadius:8, border:`1px solid rgba(99,102,241,0.3)`, background:C.surface, fontSize:12, color:C.text, fontFamily:'inherit' }}>
            What breaks if I change the auth middleware?
          </div>
          <AppBtn>⚡ Analyze</AppBtn>
        </div>

        {/* Result summary */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <StatusBadge status="high" />
          <p style={{ fontSize:12, color:C.text2, lineHeight:1.6, margin:0 }}>
            Changing the auth middleware would affect 14 files across the API layer and break session handling in 3 critical paths.
          </p>
        </div>

        {/* Affected files */}
        <div style={{ borderRadius:10, border:`1px solid ${C.border}`, background:C.card, overflow:'hidden' }}>
          <div style={{ borderBottom:`1px solid ${C.border}`, padding:'8px 16px' }}>
            <span style={{ fontFamily:'monospace', fontSize:9, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em' }}>Affected Files</span>
          </div>
          {IMPACT_FILES.map((f, i) => (
            <div key={f.path} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 16px',
              borderBottom: i < IMPACT_FILES.length-1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ marginTop:2 }}><StatusBadge status={f.risk} /></div>
              <div>
                <div style={{ fontFamily:'monospace', fontSize:11, color:C.text, marginBottom:3 }}>{f.path}</div>
                <div style={{ fontSize:11, color:C.text2 }}>{f.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

Object.assign(window, { ArchitecturePage, PatternsPage, ImpactPage })
