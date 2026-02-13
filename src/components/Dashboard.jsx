// ── Dashboard ─────────────────────────────────────
// Drop-in replacement for the Dashboard component in App.jsx
// Uses real Supabase data with loading states and empty states

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./hooks/useAuth.jsx"
import { getProjects, getInvoices, getMessages, markMessageRead } from "./lib/supabase.js"

const C = {
  cream:"#FDF6EC", cream2:"#FFF9F4", amber:"#D4622A", amberLight:"#F08040",
  amberPale:"#FDE8D8", brown:"#2C1810", brownMid:"#5C3A2A", brownLight:"#8B6355",
  gold:"#E8A83A", goldPale:"#FDF0D0", green:"#2D6A4F", greenPale:"#D8F0E6",
  white:"#FFFFFF", border:"#EED8C8", cream2:"#FFF9F4",
}

const Spin = () => (
  <span style={{ width:20, height:20, border:"2px solid "+C.amber, borderTopColor:"transparent",
    borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }}/>
)

const Badge = ({ children, color=C.amberPale, text=C.amber }) => (
  <span style={{ background:color, color:text, borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:600 }}>
    {children}
  </span>
)

const Card = ({ children, style={}, hover=false }) => {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ background:C.white, borderRadius:20, border:"1px solid "+C.border, padding:28,
      transition:"all 0.25s", transform:hover&&hov?"translateY(-4px)":"none",
      boxShadow:hover&&hov?"0 16px 48px #D4622A18":"0 2px 12px rgba(0,0,0,0.04)", ...style }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </div>
  )
}

const EmptyState = ({ icon, title, sub, action, onAction }) => (
  <div style={{ textAlign:"center", padding:"48px 24px", color:C.brownLight }}>
    <div style={{ fontSize:48, marginBottom:16 }}>{icon}</div>
    <h3 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown, marginBottom:8 }}>{title}</h3>
    <p style={{ fontSize:14, lineHeight:1.6, marginBottom:action?24:0 }}>{sub}</p>
    {action && (
      <button onClick={onAction} style={{ background:C.amber, color:"#fff", border:"none", borderRadius:10,
        padding:"10px 24px", fontWeight:600, fontSize:14, cursor:"pointer" }}>
        {action}
      </button>
    )}
  </div>
)

const LoadingBlock = ({ lines=3 }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:12, padding:"8px 0" }}>
    {Array(lines).fill(null).map((_,i) => (
      <div key={i} style={{ height:16, borderRadius:8, background:"linear-gradient(90deg, #f0e8e0 25%, #fdf6ec 50%, #f0e8e0 75%)",
        backgroundSize:"200% 100%", animation:"shimmer 1.5s infinite", opacity:0.7, width: i===0?"80%":i===1?"60%":"70%" }}/>
    ))}
  </div>
)

export default function Dashboard({ setPage }) {
  const { user, displayName, isLoggedIn, logout } = useAuth()
  const [tab,      setTab]      = useState("overview")
  const [projects, setProjects] = useState([])
  const [invoices, setInvoices] = useState([])
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState({ projects:true, invoices:true, messages:true })

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading({ projects:true, invoices:true, messages:true })
    const [p, inv, msg] = await Promise.allSettled([
      getProjects(user.id),
      getInvoices(user.id),
      getMessages(user.id),
    ])
    if (p.status   === "fulfilled") setProjects(p.value)
    if (inv.status === "fulfilled") setInvoices(inv.value)
    if (msg.status === "fulfilled") setMessages(msg.value)
    setLoading({ projects:false, invoices:false, messages:false })
  }, [user])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleMarkRead = async (msg) => {
    if (msg.is_read) return
    await markMessageRead(msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_read:true} : m))
  }

  const unread = messages.filter(m => !m.is_read).length
  const activeProjects = projects.filter(p => p.status !== "Completed")
  const amountDue = invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + Number(i.amount), 0)

  const tabs = [
    { id:"overview",  label:"Overview",  icon:"🏠" },
    { id:"projects",  label:"Projects",  icon:"📂" },
    { id:"messages",  label:"Messages",  icon:"💬" },
    { id:"invoices",  label:"Invoices",  icon:"🧾" },
  ]

  if (!isLoggedIn) return null

  const statusColor = (status) => {
    if (status === "Completed") return { bg:C.greenPale,  text:C.green }
    if (status === "Review")    return { bg:C.goldPale,   text:C.gold }
    return                             { bg:C.amberPale,  text:C.amber }
  }

  return (
    <div style={{ paddingTop:68, display:"flex", minHeight:"100vh" }}>
      {/* Sidebar */}
      <div style={{ width:240, background:C.brown, padding:"32px 0", display:"flex", flexDirection:"column",
        gap:4, position:"sticky", top:68, height:"calc(100vh - 68px)", overflowY:"auto" }}>
        <div style={{ padding:"0 20px 24px", borderBottom:"1px solid rgba(255,255,255,0.1)", marginBottom:8 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:C.amber, display:"flex",
            alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, marginBottom:10 }}>
            {(displayName?.[0] || "U").toUpperCase()}
          </div>
          <div style={{ fontWeight:700, color:"#fff", fontSize:15 }}>{displayName || "Client"}</div>
          <div style={{ color:"rgba(255,255,255,0.5)", fontSize:12, marginTop:2 }}>{user?.email}</div>
        </div>
        {tabs.map(t => (
          <div key={t.id} onClick={()=>setTab(t.id)}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", cursor:"pointer",
              background:tab===t.id?"rgba(212,98,42,0.25)":"transparent",
              borderLeft:tab===t.id?"3px solid "+C.amber:"3px solid transparent",
              color:tab===t.id?"#fff":"rgba(255,255,255,0.55)", fontSize:14,
              fontWeight:tab===t.id?600:400, transition:"all 0.15s", position:"relative" }}>
            <span>{t.icon}</span>{t.label}
            {t.id==="messages" && unread>0 && (
              <span style={{ position:"absolute", right:16, background:C.amber, color:"#fff",
                borderRadius:99, padding:"2px 7px", fontSize:11, fontWeight:700 }}>{unread}</span>
            )}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"24px 20px 0", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <div onClick={()=>setPage("services")} style={{ display:"flex", alignItems:"center", gap:12,
            padding:"12px 0", cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:14 }}>➕ New Project</div>
          <div onClick={()=>setPage("calendar")} style={{ display:"flex", alignItems:"center", gap:12,
            padding:"12px 0", cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:14 }}>📅 Book a Call</div>
          <div onClick={async()=>{ await logout(); setPage("home"); }} style={{ display:"flex",
            alignItems:"center", gap:12, padding:"12px 0", cursor:"pointer",
            color:"rgba(255,255,255,0.4)", fontSize:14 }}>🚪 Sign Out</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, padding:"40px", overflowY:"auto", background:C.cream }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

        {/* ── Overview ── */}
        {tab==="overview" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:4 }}>
              Welcome back, {displayName?.split(" ")[0] || "there"} 👋
            </h1>
            <p style={{ color:C.brownLight, marginBottom:36 }}>Here's what's happening with your projects.</p>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20, marginBottom:36 }}>
              {[
                { label:"Active Projects", val: loading.projects ? null : activeProjects.length.toString(), icon:"📂", color:C.amberPale },
                { label:"Unread Messages", val: loading.messages ? null : unread.toString(), icon:"💬", color:C.greenPale },
                { label:"Total Invoices",  val: loading.invoices ? null : invoices.length.toString(), icon:"🧾", color:C.goldPale },
                { label:"Amount Due",      val: loading.invoices ? null : amountDue > 0 ? "$"+amountDue.toLocaleString() : "All clear", icon:"💸", color:amountDue>0?"#FEE2E2":C.greenPale },
              ].map(s => (
                <Card key={s.label} style={{ background:s.color, border:"none", padding:"20px 24px" }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                  {s.val === null
                    ? <LoadingBlock lines={1}/>
                    : <div style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700, color:C.brown }}>{s.val}</div>
                  }
                  <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Active projects */}
            <Card style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown, marginBottom:20 }}>Active Projects</h2>
              {loading.projects ? (
                <LoadingBlock lines={4}/>
              ) : activeProjects.length === 0 ? (
                <EmptyState icon="📂" title="No active projects yet"
                  sub="Once you start a project, it'll show up here with live progress updates."
                  action="Browse Packages" onAction={()=>setPage("services")}/>
              ) : (
                activeProjects.map(p => {
                  const sc = statusColor(p.status)
                  return (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 0", borderBottom:"1px solid "+C.border }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:C.amberPale,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                        {p.status==="In Progress"?"⚙️":"👁️"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, color:C.brown }}>{p.name}</div>
                        <div style={{ fontSize:13, color:C.brownLight, marginTop:2 }}>{p.tier} · Due {p.due_date ? new Date(p.due_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "TBD"}</div>
                        <div style={{ marginTop:8, background:C.cream, borderRadius:99, height:6, overflow:"hidden" }}>
                          <div style={{ width:p.progress+"%", height:"100%", background:C.amber, borderRadius:99 }}/>
                        </div>
                        <div style={{ fontSize:12, color:C.brownLight, marginTop:4 }}>{p.progress}% complete</div>
                      </div>
                      <Badge color={sc.bg} text={sc.text}>{p.status}</Badge>
                    </div>
                  )
                })
              )}
            </Card>

            {/* Recent messages */}
            <Card>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown, marginBottom:20 }}>Recent Messages</h2>
              {loading.messages ? (
                <LoadingBlock lines={3}/>
              ) : messages.length === 0 ? (
                <EmptyState icon="💬" title="No messages yet"
                  sub="Messages from your project team will appear here."/>
              ) : (
                messages.slice(0,3).map(m => (
                  <div key={m.id} onClick={()=>handleMarkRead(m)}
                    style={{ display:"flex", gap:14, padding:"12px 16px", borderRadius:12, marginBottom:8,
                      cursor:"pointer", background:!m.is_read?C.amberPale:C.cream2 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:C.amber,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#fff", fontWeight:700, flexShrink:0 }}>{m.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontWeight:600, fontSize:14, color:C.brown }}>{m.from_name}</span>
                        <span style={{ fontSize:12, color:C.brownLight }}>
                          {new Date(m.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                        </span>
                      </div>
                      <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{m.body}</div>
                    </div>
                    {!m.is_read && <div style={{ width:8, height:8, borderRadius:"50%", background:C.amber, flexShrink:0, marginTop:6 }}/>}
                  </div>
                ))
              )}
            </Card>
          </div>
        )}

        {/* ── Projects tab ── */}
        {tab==="projects" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36 }}>
              <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown }}>Projects</h1>
              <button onClick={()=>setPage("services")} style={{ background:C.amber, color:"#fff", border:"none",
                borderRadius:12, padding:"12px 24px", fontWeight:600, fontSize:15, cursor:"pointer" }}>
                + New Project
              </button>
            </div>
            {loading.projects ? (
              <Card><LoadingBlock lines={5}/></Card>
            ) : projects.length === 0 ? (
              <Card>
                <EmptyState icon="🚀" title="No projects yet"
                  sub="Choose a service package to kick off your first project."
                  action="Browse Packages" onAction={()=>setPage("services")}/>
              </Card>
            ) : (
              projects.map(p => {
                const sc = statusColor(p.status)
                return (
                  <Card key={p.id} hover style={{ marginBottom:20 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                      <div style={{ width:52, height:52, borderRadius:14,
                        background:p.status==="Completed"?C.greenPale:C.amberPale,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                        {p.status==="Completed"?"✅":p.status==="Review"?"👁️":"⚙️"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <h3 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown }}>{p.name}</h3>
                          <Badge color={sc.bg} text={sc.text}>{p.status}</Badge>
                        </div>
                        <div style={{ fontSize:13, color:C.brownLight, margin:"6px 0 16px" }}>
                          {p.tier} Package · Due {p.due_date ? new Date(p.due_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "TBD"}
                        </div>
                        <div style={{ background:C.cream, borderRadius:99, height:8, overflow:"hidden" }}>
                          <div style={{ width:p.progress+"%", height:"100%",
                            background:p.status==="Completed"?C.green:C.amber, borderRadius:99 }}/>
                        </div>
                        <div style={{ fontSize:13, color:C.brownLight, marginTop:6 }}>{p.progress}% complete</div>
                        {p.description && <p style={{ fontSize:13, color:C.brownLight, marginTop:10, lineHeight:1.5 }}>{p.description}</p>}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* ── Messages tab ── */}
        {tab==="messages" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:36 }}>Messages</h1>
            {loading.messages ? (
              <Card><LoadingBlock lines={5}/></Card>
            ) : messages.length === 0 ? (
              <Card>
                <EmptyState icon="💬" title="No messages yet"
                  sub="Your project team will send updates and questions here. Check back after your project kicks off."/>
              </Card>
            ) : (
              messages.map(m => (
                <Card key={m.id} style={{ background:!m.is_read?C.amberPale:C.white, marginBottom:12 }}>
                  <div style={{ display:"flex", gap:16, cursor:"pointer" }} onClick={()=>handleMarkRead(m)}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:C.amber,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"#fff", fontWeight:700, fontSize:18, flexShrink:0 }}>{m.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontWeight:700, fontSize:15, color:C.brown }}>{m.from_name}</span>
                        <span style={{ fontSize:13, color:C.brownLight }}>
                          {new Date(m.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                        </span>
                      </div>
                      <p style={{ fontSize:14, color:C.brownMid, lineHeight:1.6 }}>{m.body}</p>
                    </div>
                    {!m.is_read && <div style={{ width:10, height:10, borderRadius:"50%", background:C.amber, flexShrink:0, marginTop:4 }}/>}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* ── Invoices tab ── */}
        {tab==="invoices" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:36 }}>Invoices</h1>
            {loading.invoices ? (
              <Card><LoadingBlock lines={4}/></Card>
            ) : invoices.length === 0 ? (
              <Card>
                <EmptyState icon="🧾" title="No invoices yet"
                  sub="Invoices will appear here once your project is underway. You'll be able to view, download, and pay them directly."/>
              </Card>
            ) : (
              invoices.map(inv => {
                const paid = inv.status === "Paid"
                return (
                  <Card key={inv.id} hover style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:48, height:48, borderRadius:12,
                        background:paid?C.greenPale:C.amberPale,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                        {paid?"✅":"💳"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:16, color:C.brown }}>{inv.invoice_number}</div>
                        <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>
                          Issued {new Date(inv.issued_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                          {inv.due_date && !paid && ` · Due ${new Date(inv.due_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}
                        </div>
                        {inv.description && <div style={{ fontSize:12, color:C.brownLight, marginTop:2 }}>{inv.description}</div>}
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:C.brown }}>
                          ${Number(inv.amount).toLocaleString()}
                        </div>
                        <Badge color={paid?C.greenPale:C.amberPale} text={paid?C.green:C.amber}>{inv.status}</Badge>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:8, marginLeft:16 }}>
                        <button style={{ background:"transparent", border:"1.5px solid "+C.border, borderRadius:8,
                          padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:C.brown }}>
                          Download
                        </button>
                        {!paid && (
                          <button onClick={()=>setPage("checkout")} style={{ background:C.amber, border:"none",
                            borderRadius:8, padding:"7px 14px", fontWeight:600, fontSize:13, cursor:"pointer", color:"#fff" }}>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
