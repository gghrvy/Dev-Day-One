// Repo List, Repo Overview, Connect Repo pages
const { C, AppShell, AppPageHeader, AppBtn, StatusBadge, SIcoPlus, SIcoTrash } = window

const REPOS = [
  { name:'next.js',       full:'vercel/next.js',        desc:'The React Framework for the Web',    indexed:true,  date:'Jun 12' },
  { name:'my-app',        full:'acme/my-app',            desc:'Main customer-facing application',   indexed:false, date:'Jun 8'  },
  { name:'devtools',      full:'acme/devtools',          desc:'Internal developer utilities',       indexed:true,  date:'May 29' },
  { name:'backend-api',   full:'acme/backend-api',       desc:'REST API server',                    indexed:true,  date:'May 21' },
  { name:'design-system', full:'acme/design-system',     desc:'Shared UI components',               indexed:false, date:'May 15' },
]

// ── REPO LIST ──────────────────────────────────────────────────────────────────
function RepoListPage() {
  const action = (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <select style={{ padding:'5px 10px', borderRadius:6, border:`1px solid ${C.border}`, background:C.surface, color:C.text2, fontSize:10, outline:'none', fontFamily:'inherit', cursor:'pointer' }}>
        <option>Newest</option><option>Name</option><option>Indexed first</option>
      </select>
      <AppBtn><SIcoPlus /> Connect repo</AppBtn>
    </div>
  )
  return (
    <AppShell activeRepo={null} activePage={null} height={680}>
      <AppPageHeader title="Repositories" meta="5 connected" action={action} />
      <div style={{ marginTop:16 }}>
        {REPOS.map((r, i) => (
          <div key={r.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            borderBottom:`1px solid ${C.border}`, padding:'11px 24px',
            background: i === 0 ? 'rgba(99,102,241,0.03)' : 'transparent' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
              <div style={{ width:6, height:6, borderRadius:'50%',
                background: r.indexed ? C.success : C.muted,
                flexShrink:0, opacity: r.indexed ? 1 : 0.5 }} />
              <span style={{ fontFamily:'monospace', fontSize:12, color:C.text, fontWeight:500 }}>{r.full}</span>
              <span style={{ fontSize:11, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.desc}</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              <span style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>{r.date}</span>
              <StatusBadge status={r.indexed ? 'indexed' : 'not indexed'} />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}

// ── REPO OVERVIEW ─────────────────────────────────────────────────────────────
function RepoOverviewPage() {
  const action = (
    <button style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:6,
      border:'1px solid rgba(239,68,68,0.2)', background:'transparent', color:'#EF4444',
      fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
      <SIcoTrash /> Remove
    </button>
  )
  return (
    <AppShell activeRepo="next.js" activePage="Overview" height={680}>
      <AppPageHeader title="next.js" meta="indexed Jun 12, 2025" action={action} />
      <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, background:C.border, borderRadius:8, overflow:'hidden' }}>
          {[
            { label:'Status',       value:'Indexed',      color:C.success,  mono:false },
            { label:'Repository',   value:'vercel/next.js', color:C.text,   mono:true  },
            { label:'Last indexed', value:'Jun 12, 2025',  color:C.text,   mono:true  },
          ].map(s => (
            <div key={s.label} style={{ background:C.bg, padding:'12px 16px' }}>
              <div style={{ fontFamily:'monospace', fontSize:9, color:C.muted, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
              <div style={{ fontSize:12, color:s.color, fontFamily: s.mono ? 'monospace' : 'inherit', fontWeight:500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <p style={{ fontSize:13, color:C.text2, lineHeight:1.65, margin:0 }}>
          The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create high-quality web applications with the power of React.
        </p>

        {/* Indexing block */}
        <div style={{ borderRadius:10, border:`1px solid ${C.border}`, background:C.card, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <span style={{ fontFamily:'monospace', fontSize:10, color:C.muted, textTransform:'uppercase', letterSpacing:'0.06em' }}>Indexing</span>
            <AppBtn small>Re-index</AppBtn>
          </div>
          <div style={{ height:2, background:C.border, borderRadius:1, marginBottom:8 }}>
            <div style={{ height:2, width:'72%', background:C.accent, borderRadius:1 }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>72% — chunking files</span>
            <span style={{ fontFamily:'monospace', fontSize:10, color:C.muted }}>2,047 / 2,847 files</span>
          </div>
        </div>

        {/* Quick-nav chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {['Ask a question →', 'View architecture →', 'Generate ADRs →', 'See patterns →'].map(l => (
            <div key={l} style={{ padding:'7px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, fontSize:11, color:C.text2, cursor:'pointer' }}>{l}</div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

// ── CONNECT REPO ──────────────────────────────────────────────────────────────
function ConnectRepoPage() {
  return (
    <AppShell activeRepo={null} activePage={null} height={680}>
      <AppPageHeader title="Connect Repository" meta="Add a GitHub repository to Dev Day One" />
      <div style={{ padding:'28px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
        {/* Form */}
        <div>
          <label style={{ display:'block', fontFamily:'monospace', fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted, marginBottom:8 }}>GitHub Repository</label>
          <input readOnly style={{ width:'100%', borderRadius:8, border:`1px solid ${C.border}`, background:C.surface, padding:'10px 14px', fontFamily:'monospace', fontSize:13, color:C.text, outline:'none', marginBottom:6, boxSizing:'border-box', cursor:'text' }} defaultValue="vercel/next.js" />
          <p style={{ fontFamily:'monospace', fontSize:9, color:C.muted, margin:'0 0 20px' }}>e.g. vercel/next.js or your-org/private-repo</p>
          <AppBtn>Connect repository →</AppBtn>
        </div>

        {/* Info column */}
        <div style={{ borderLeft:`1px solid ${C.border}`, paddingLeft:32 }}>
          <div style={{ fontFamily:'monospace', fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', color:C.muted, marginBottom:16 }}>What happens next</div>
          {[
            'We fetch the repository metadata from GitHub.',
            'You trigger indexing — we chunk and embed the code.',
            'Ask the AI anything about your codebase.',
          ].map((step, i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:16 }}>
              <span style={{ fontFamily:'monospace', fontSize:10, color:C.accent, flexShrink:0, marginTop:1 }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontSize:12, color:C.text2, lineHeight:1.6 }}>{step}</span>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:C.text2 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:C.success }} /> Public repos — always supported
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:C.text2 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:C.warning }} /> Private repos — sign in with GitHub
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

Object.assign(window, { RepoListPage, RepoOverviewPage, ConnectRepoPage })
