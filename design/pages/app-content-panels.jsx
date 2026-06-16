// Knowledge, ADRs, API Inventory, Settings pages
const { C, AppShell, AppPageHeader, AppBtn, StatusBadge, SIcoPlus, SIcoLogOut } = window

// ── KNOWLEDGE ─────────────────────────────────────────────────────────────────
const KNOWLEDGE = [
  { title:'Auth Flow Overview',  body:'The authentication flow uses Supabase Auth with JWT tokens. Browser client for CSR, server client with cookies for SSR.',                file:'lib/supabase/client.ts',  tags:['auth','supabase'] },
  { title:'API Client Pattern',  body:'All API calls go through apiFetch() in lib/api/client.ts which handles auth token injection and error formatting automatically.',         file:'lib/api/client.ts',       tags:['api','pattern']   },
  { title:'State Management',    body:'React Query (TanStack) handles all server state. Local UI state uses useState. No global state manager is needed or intended.',           file:null,                      tags:['react-query']     },
  { title:'Error Boundary Usage',body:'Error boundaries wrap each major section. Toast notifications used for non-fatal errors; full boundary for critical rendering failures.', file:'components/ui/error-boundary.tsx', tags:['errors'] },
]

function KnowledgePage() {
  return (
    <AppShell activeRepo="next.js" activePage="Knowledge" height={680}>
      <AppPageHeader title="Knowledge" meta="4 entries" action={<AppBtn><SIcoPlus /> Add entry</AppBtn>} />
      <div style={{ marginTop:16 }}>
        {KNOWLEDGE.map(e => (
          <div key={e.title} style={{ borderBottom:`1px solid ${C.border}`, padding:'14px 24px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
              <h3 style={{ fontSize:13, fontWeight:500, color:C.text, margin:0 }}>{e.title}</h3>
              <span style={{ fontSize:9, color:C.muted, fontFamily:'monospace', marginLeft:16, flexShrink:0 }}>Jun 10</span>
            </div>
            <p style={{ fontSize:12, color:C.text2, lineHeight:1.55, margin:'0 0 8px' }}>{e.body}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {e.file && (
                <span style={{ fontFamily:'monospace', fontSize:10, color:'#818CF8' }}>📄 {e.file}</span>
              )}
              {e.tags.map(t => (
                <span key={t} style={{ padding:'2px 7px', borderRadius:20, border:`1px solid ${C.border}`, fontSize:9, color:C.muted, fontFamily:'monospace' }}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}

// ── ADRs ──────────────────────────────────────────────────────────────────────
const ADRS = [
  { title:'Use Supabase for auth and database',  status:'accepted', decision:'Supabase chosen for built-in auth, Postgres, and real-time capabilities.', date:'May 20' },
  { title:'TanStack Query for server state',     status:'accepted', decision:'React Query handles caching, invalidation, and loading states without boilerplate.', date:'May 18' },
  { title:'Migrate to App Router from pages dir',status:'proposed', decision:'Next.js App Router enables server components and streaming for better performance.', date:'Jun 5' },
  { title:'Add Redis caching layer',             status:'proposed', decision:'Reduce DB load on frequently queried repos by caching indexing results in Redis.', date:'Jun 12' },
]

function ADRsPage() {
  return (
    <AppShell activeRepo="next.js" activePage="ADRs" height={680}>
      <AppPageHeader title="ADRs" meta="4 decision records" action={<AppBtn><SIcoPlus /> New ADR</AppBtn>} />
      <div style={{ marginTop:16 }}>
        {ADRS.map(adr => (
          <div key={adr.title} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
            borderBottom:`1px solid ${C.border}`, padding:'12px 24px' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:500, color:C.text, margin:'0 0 4px' }}>{adr.title}</p>
              <p style={{ fontSize:11, color:C.text2, margin:'0 0 5px', lineHeight:1.4 }}>{adr.decision}</p>
              <span style={{ fontFamily:'monospace', fontSize:9, color:C.muted }}>{adr.date}</span>
            </div>
            <div style={{ marginLeft:16, flexShrink:0, display:'flex', alignItems:'center', gap:6 }}>
              <StatusBadge status={adr.status} />
              <div style={{ padding:'3px 8px', borderRadius:4, border:`1px solid ${C.border}`, color:C.muted, fontSize:9, cursor:'pointer' }}>→</div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}

// ── API INVENTORY ─────────────────────────────────────────────────────────────
const APIS = [
  { name:'Supabase REST API',    type:'external', endpoint:'supabase.co/rest/v1',       status:'active',     file:'lib/supabase/client.ts'           },
  { name:'GitHub REST API',      type:'external', endpoint:'api.github.com',             status:'active',     file:'lib/api/client.ts'                },
  { name:'/repos CRUD',          type:'internal', endpoint:'/api/repos',                 status:'active',     file:'app/api/repos/route.ts'           },
  { name:'/repos/:id/index',     type:'internal', endpoint:'/api/repos/:id/index',       status:'active',     file:'app/api/repos/[id]/index/route.ts'},
  { name:'Legacy search',        type:'internal', endpoint:'/api/search',                status:'deprecated', file:'app/api/search/route.ts'          },
]

function APIsPage() {
  const colStyle = (w) => ({ width:w, flexShrink:0, paddingRight:12 })
  const header = (label, w) => (
    <div key={label} style={{ ...colStyle(w), fontSize:9, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</div>
  )
  return (
    <AppShell activeRepo="next.js" activePage="APIs" height={680}>
      <AppPageHeader title="API Inventory" meta="5 endpoints detected" />
      <div style={{ marginTop:16 }}>
        <div style={{ display:'flex', alignItems:'center', borderBottom:`1px solid ${C.border}`, padding:'6px 24px' }}>
          {header('Name', 200)}{header('Type', 90)}{header('Endpoint', 200)}{header('Status', 90)}{header('File', 210)}
        </div>
        {APIS.map((a, i) => (
          <div key={a.name} style={{ display:'flex', alignItems:'center',
            borderBottom: i < APIS.length-1 ? `1px solid ${C.border}` : 'none',
            padding:'10px 24px', background: i === 4 ? 'rgba(239,68,68,0.02)' : 'transparent' }}>
            <div style={{ ...colStyle(200), fontSize:12, color:C.text, fontWeight:500 }}>{a.name}</div>
            <div style={{ ...colStyle(90) }}><StatusBadge status={a.type} /></div>
            <div style={{ ...colStyle(200), fontFamily:'monospace', fontSize:10, color:C.text2 }}>{a.endpoint}</div>
            <div style={{ ...colStyle(90) }}><StatusBadge status={a.status} /></div>
            <div style={{ ...colStyle(210), fontFamily:'monospace', fontSize:10, color:C.muted }}>{a.file}</div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function SettingsPage() {
  const sectionWrap = (title, children) => (
    <div style={{ borderRadius:10, border:`1px solid ${C.border}`, background:C.card, marginBottom:12, overflow:'hidden' }}>
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:'8px 16px' }}>
        <span style={{ fontFamily:'monospace', fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted }}>{title}</span>
      </div>
      {children}
    </div>
  )
  return (
    <AppShell activeRepo={null} activePage="Settings" height={680}>
      <AppPageHeader title="Settings" meta="Account &amp; preferences" />
      <div style={{ padding:'20px 24px', maxWidth:560 }}>
        {sectionWrap('Profile',
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:C.accentDim, border:`1px solid rgba(99,102,241,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:C.accent, flexShrink:0 }}>JD</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:3 }}>John Doe</div>
              <div style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>john@dev.io</div>
            </div>
            <button style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`, background:'transparent', color:C.text2, fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
          </div>
        )}
        {sectionWrap('Connected Accounts',
          <div>
            {[{l:'GitHub',email:true},{l:'Google',email:false},{l:'Email / Password',email:false}].map((a,i) => (
              <div key={a.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize:12, color:C.text }}>{a.l}</span>
                <span style={{ fontFamily:'monospace', fontSize:10, color: a.email ? C.success : C.muted }}>{a.email ? 'connected' : 'not connected'}</span>
              </div>
            ))}
          </div>
        )}
        {sectionWrap('Account',
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px' }}>
            <div>
              <div style={{ fontSize:12, color:C.text, marginBottom:3 }}>Sign out</div>
              <div style={{ fontSize:10, color:C.muted }}>Sign out of your account on this device.</div>
            </div>
            <button style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(239,68,68,0.2)', background:'transparent', color:'#EF4444', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
              <SIcoLogOut /> Sign out
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}

Object.assign(window, { KnowledgePage, ADRsPage, APIsPage, SettingsPage })
