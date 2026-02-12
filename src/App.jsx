import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth.jsx";

const C = {
  cream:"#FDF6EC", cream2:"#FFF9F4", amber:"#D4622A", amberLight:"#F08040",
  amberPale:"#FDE8D8", brown:"#2C1810", brownMid:"#5C3A2A", brownLight:"#8B6355",
  gold:"#E8A83A", goldPale:"#FDF0D0", green:"#2D6A4F", greenPale:"#D8F0E6",
  white:"#FFFFFF", border:"#EED8C8",
};

const GS = [
  "@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');",
  "*{box-sizing:border-box;margin:0;padding:0;}",
  "body{font-family:'DM Sans',sans-serif;background:#FDF6EC;color:#2C1810;}",
  ":root{scroll-behavior:smooth;}",
  "input,select,textarea,button{font-family:'DM Sans',sans-serif;}",
  "@keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}",
  "@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}",
  "@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}",
].join("\n");

const SERVICES = [
  { id:1, tier:"Starter", price:2500, badge:"🌱", accent:C.green,
    features:["Landing page or simple web app","Responsive design","Up to 5 pages","Basic SEO setup","2 revision rounds","1 month support"],
    description:"Perfect for getting your idea off the ground fast." },
  { id:2, tier:"Growth", price:7500, badge:"🚀", accent:C.amber, popular:true,
    features:["Full-stack web application","Auth & user accounts","Database design & API","Payment integration","Admin dashboard","4 revision rounds","3 months support"],
    description:"The sweet spot for startups ready to scale." },
  { id:3, tier:"Enterprise", price:18000, badge:"💎", accent:C.gold,
    features:["Custom platform or SaaS product","Microservices architecture","CI/CD pipeline setup","Performance optimization","Security audit","Team onboarding","Unlimited revisions","6 months support"],
    description:"Built for ambitious teams that need the full picture." },
];

const ADDONS = [
  { id:"a1", name:"UI/UX Design Sprint", price:1200, icon:"🎨" },
  { id:"a2", name:"SEO & Analytics Setup", price:600,  icon:"📊" },
  { id:"a3", name:"Mobile App (React Native)", price:4500, icon:"📱" },
  { id:"a4", name:"AI Feature Integration", price:3000, icon:"🤖" },
];

const MOCK_PROJECTS = [
  { id:1, name:"E-Commerce Platform",    status:"In Progress", progress:68,  due:"Mar 15, 2026", tier:"Growth" },
  { id:2, name:"Marketing Landing Page", status:"Review",      progress:90,  due:"Feb 20, 2026", tier:"Starter" },
  { id:3, name:"Internal Dashboard",     status:"Completed",   progress:100, due:"Jan 10, 2026", tier:"Enterprise" },
];

const MOCK_MESSAGES = [
  { id:1, from:"Alex (Dev)", avatar:"A", text:"The API integration is done. Ready for your review!", time:"10:32 AM", unread:true },
  { id:2, from:"Support",    avatar:"S", text:"Your invoice for January has been generated.",        time:"Yesterday", unread:false },
  { id:3, from:"Alex (Dev)", avatar:"A", text:"Pushed the staging build. Can you test checkout?",   time:"Mon",       unread:false },
];

const MOCK_INVOICES = [
  { id:"INV-001", amount:3750, status:"Paid",       date:"Jan 5, 2026" },
  { id:"INV-002", amount:3750, status:"Due Feb 28", date:"Feb 1, 2026" },
];

// ── Shared Components ─────────────────────────────
const Spin = () => (
  <span style={{width:16,height:16,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>
);

const Btn = ({ children, variant="primary", onClick, style={}, size="md", disabled=false }) => {
  const [hov, setHov] = useState(false);
  const pad = size==="lg" ? "16px 32px" : size==="sm" ? "8px 16px" : "12px 24px";
  const fs  = size==="lg" ? 17 : size==="sm" ? 13 : 15;
  const base = { border:"none", borderRadius:12, fontWeight:600, transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:8, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.6:1, padding:pad, fontSize:fs };
  const vs = {
    primary:   { background:hov?C.amberLight:C.amber, color:"#fff", boxShadow:hov?"0 8px 24px #D4622A55":"none" },
    secondary: { background:hov?C.border:"transparent", color:C.brown, border:"2px solid "+C.border },
    ghost:     { background:hov?C.amberPale:"transparent", color:C.amber, border:"2px solid "+C.amber },
    dark:      { background:hov?C.brownMid:C.brown, color:"#fff" },
  };
  return (
    <button style={{...base,...vs[variant],...style}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={!disabled?onClick:undefined}>
      {children}
    </button>
  );
};

const Card = ({ children, style={}, hover=false }) => {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background:C.white, borderRadius:20, border:"1px solid "+C.border, padding:28,
      transition:"all 0.25s", transform:hover&&hov?"translateY(-4px)":"none",
      boxShadow:hover&&hov?"0 16px 48px #D4622A18":"0 2px 12px rgba(0,0,0,0.04)", ...style }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </div>
  );
};

const Badge = ({ children, color=C.amberPale, text=C.amber }) => (
  <span style={{ background:color, color:text, borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:600 }}>
    {children}
  </span>
);

const Input = ({ label, type="text", value, onChange, placeholder, icon, required }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    {label && <label style={{ fontSize:13, fontWeight:600, color:C.brownMid }}>{label}{required && " *"}</label>}
    <div style={{ position:"relative" }}>
      {icon && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>{icon}</span>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:icon?"12px 16px 12px 44px":"12px 16px", borderRadius:10,
          border:"1.5px solid "+C.border, fontSize:14, outline:"none", background:C.cream2, color:C.brown }}
        onFocus={e=>e.target.style.borderColor=C.amber}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  </div>
);

// ── Nav ───────────────────────────────────────────
const Nav = ({ setPage }) => {
  const { isLoggedIn, displayName, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:scrolled?"rgba(253,246,236,0.95)":"transparent",
      backdropFilter:scrolled?"blur(12px)":"none",
      borderBottom:scrolled?"1px solid "+C.border:"none",
      transition:"all 0.3s", padding:"0 5%" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:68 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>setPage("home")}>
          <div style={{ width:36, height:36, borderRadius:10, background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⚡</div>
          <span style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:20, color:C.brown }}>DevCraft Hub</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {loading ? <Spin /> : !isLoggedIn ? (
            <>
              <Btn variant="ghost" size="sm" onClick={()=>setPage("login")}>Sign In</Btn>
              <Btn size="sm" onClick={()=>setPage("signup")}>Get Started</Btn>
            </>
          ) : (
            <>
              <Btn variant="ghost" size="sm" onClick={()=>setPage("dashboard")}>Dashboard</Btn>
              <div style={{ width:36, height:36, borderRadius:99, background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14 }}
                onClick={()=>setPage("dashboard")}>
                {(displayName?.[0] || "U").toUpperCase()}
              </div>
              <Btn variant="secondary" size="sm" onClick={async()=>{ await logout(); setPage("home"); }}>Log out</Btn>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ── Auth Page ─────────────────────────────────────
const AuthPage = ({ mode, setPage }) => {
  const { login, register } = useAuth();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handle = async () => {
    if (!email || !password) { setError("Please fill in all required fields."); return; }
    if (mode === "signup" && !name) { setError("Name is required."); return; }
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        await register(name, email, password);
        setSuccess("Account created! Check your email to confirm, then sign in.");
      } else {
        await login(email, password);
        setPage("dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      padding:"80px 5%", background:"radial-gradient(ellipse 60% 80% at 30% 50%, #FDE8D866, #FDF6EC)" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>{mode==="login" ? "👋" : "🚀"}</div>
          <h1 style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:C.brown }}>
            {mode==="login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color:C.brownLight, marginTop:8 }}>
            {mode==="login" ? "Sign in to your client portal." : "Start your project journey today."}
          </p>
        </div>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {mode==="signup" && <Input label="Full Name" value={name} onChange={setName} placeholder="Jordan Smith" icon="👤" required />}
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" icon="✉️" required />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" required />
            {error   && <div style={{ background:"#FEE2E2", color:"#C0392B", padding:"10px 14px", borderRadius:8, fontSize:13 }}>⚠️ {error}</div>}
            {success && <div style={{ background:C.greenPale, color:C.green, padding:"10px 14px", borderRadius:8, fontSize:13 }}>✅ {success}</div>}
            <Btn onClick={handle} style={{ justifyContent:"center", marginTop:4 }} disabled={loading}>
              {loading
                ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><Spin />{mode==="login" ? "Signing in..." : "Creating account..."}</span>
                : mode==="login" ? "Sign In →" : "Create Account →"
              }
            </Btn>
            <div style={{ textAlign:"center", marginTop:4, fontSize:14, color:C.brownLight }}>
              {mode==="login"
                ? <>Don't have an account? <span style={{ color:C.amber, fontWeight:600, cursor:"pointer" }} onClick={()=>setPage("signup")}>Sign up</span></>
                : <>Already have an account? <span style={{ color:C.amber, fontWeight:600, cursor:"pointer" }} onClick={()=>setPage("login")}>Sign in</span></>
              }
            </div>
          </div>
        </Card>
        <p style={{ textAlign:"center", fontSize:12, color:C.brownLight, marginTop:20 }}>🔒 Your data is encrypted and never shared.</p>
      </div>
    </div>
  );
};

// ── Home ──────────────────────────────────────────
const Home = ({ setPage }) => {
  const features = [
    { icon:"🛡️", title:"Secure by Default",    desc:"Every project ships with security best practices baked in." },
    { icon:"⚡",  title:"Fast Delivery",         desc:"Agile sprints with weekly demos so you're always in the loop." },
    { icon:"🤝",  title:"Collaborative",         desc:"A real partner in your success, not just a vendor." },
    { icon:"🔧",  title:"Full-Stack Expertise",  desc:"React, Node, Python, cloud — whatever your stack needs." },
  ];
  return (
    <div style={{ paddingTop:68 }}>
      <section style={{ minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        textAlign:"center", padding:"60px 5%", background:"radial-gradient(ellipse 80% 60% at 50% 0%, #FDE8D888, transparent)",
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"10%", left:"5%", width:300, height:300, borderRadius:"50%", background:"#E8A83A22", filter:"blur(60px)" }}/>
        <div style={{ position:"absolute", bottom:"10%", right:"5%", width:400, height:400, borderRadius:"50%", background:"#D4622A18", filter:"blur(80px)" }}/>
        <Badge>✨ Currently accepting new clients</Badge>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:"clamp(38px,6vw,80px)", fontWeight:700, lineHeight:1.1,
          color:C.brown, maxWidth:860, marginTop:16, marginBottom:24 }}>
          Software built with <em style={{ color:C.amber }}>care</em>,<br/>delivered with craft.
        </h1>
        <p style={{ fontSize:"clamp(16px,2vw,20px)", color:C.brownLight, maxWidth:600, lineHeight:1.7, marginBottom:40 }}>
          From landing pages to full SaaS platforms — I build software that works beautifully, scales gracefully, and feels like home to your users.
        </p>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center" }}>
          <Btn size="lg" onClick={()=>setPage("services")}>See Service Packages →</Btn>
          <Btn variant="secondary" size="lg" onClick={()=>setPage("calendar")}>Book a Free Call</Btn>
        </div>
        <div style={{ marginTop:72, display:"flex", gap:48, flexWrap:"wrap", justifyContent:"center" }}>
          {[["50+","Projects Delivered"],["98%","Client Satisfaction"],["5 yrs","Experience"],["12hr","Avg. Response Time"]].map(([val,lbl]) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:C.amber }}>{val}</div>
              <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding:"80px 5%", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:38, fontWeight:700, color:C.brown }}>Why clients come back</h2>
          <p style={{ color:C.brownLight, marginTop:12, fontSize:17 }}>Building software is a relationship, not a transaction.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
          {features.map(f => (
            <Card key={f.title} hover>
              <div style={{ fontSize:36, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:600, color:C.brown, marginBottom:8 }}>{f.title}</h3>
              <p style={{ color:C.brownLight, fontSize:14, lineHeight:1.7 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
      <section style={{ padding:"80px 5%", background:C.cream2 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:38, fontWeight:700, color:C.brown, marginBottom:16 }}>Choose your package</h2>
          <p style={{ color:C.brownLight, fontSize:17, marginBottom:48 }}>Transparent pricing, no surprises.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, textAlign:"left" }}>
            {SERVICES.map(s => (
              <div key={s.id} style={{ background:s.popular?C.amber:C.white, borderRadius:24, padding:32,
                border:"2px solid "+(s.popular?C.amber:C.border), transform:s.popular?"scale(1.03)":"none",
                boxShadow:s.popular?"0 20px 60px #D4622A30":"0 4px 16px rgba(0,0,0,0.05)" }}>
                {s.popular && <Badge color="rgba(255,255,255,0.25)" text="#fff">⭐ Most Popular</Badge>}
                <div style={{ fontSize:40, marginBottom:12, marginTop:s.popular?8:0 }}>{s.badge}</div>
                <h3 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700, color:s.popular?"#fff":C.brown }}>{s.tier}</h3>
                <p style={{ color:s.popular?"rgba(255,255,255,0.8)":C.brownLight, fontSize:14, margin:"8px 0 20px" }}>{s.description}</p>
                <div style={{ marginBottom:24 }}>
                  <span style={{ fontFamily:"'Lora',serif", fontSize:40, fontWeight:700, color:s.popular?"#fff":C.brown }}>${s.price.toLocaleString()}</span>
                  <span style={{ color:s.popular?"rgba(255,255,255,0.7)":C.brownLight, fontSize:14 }}> / project</span>
                </div>
                <Btn style={{ width:"100%", justifyContent:"center", background:s.popular?"#fff":C.amber, color:s.popular?C.amber:"#fff" }} onClick={()=>setPage("services")}>
                  Get Started
                </Btn>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding:"100px 5%", textAlign:"center" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:42, fontWeight:700, color:C.brown, lineHeight:1.2 }}>
            Ready to build something <em style={{ color:C.amber }}>great</em>?
          </h2>
          <p style={{ color:C.brownLight, fontSize:18, margin:"20px 0 40px", lineHeight:1.7 }}>
            Start with a free 30-minute discovery call.
          </p>
          <Btn size="lg" onClick={()=>setPage("calendar")}>Book Your Free Call →</Btn>
        </div>
      </section>
    </div>
  );
};

// ── Services Page ─────────────────────────────────
const ServicesPage = ({ setPage, setSelectedService }) => {
  const [selected, setSelected] = useState(null);
  const [addons,   setAddons]   = useState([]);
  const toggle = id => setAddons(p => p.includes(id) ? p.filter(a=>a!==id) : [...p,id]);
  const total  = selected ? SERVICES.find(s=>s.id===selected).price + addons.reduce((sum,id)=>sum+ADDONS.find(a=>a.id===id).price,0) : 0;
  return (
    <div style={{ paddingTop:100, padding:"100px 5% 80px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:48, fontWeight:700, color:C.brown }}>Service Packages</h1>
        <p style={{ color:C.brownLight, fontSize:18, marginTop:12 }}>Choose the package that fits your vision.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24, marginBottom:48 }}>
        {SERVICES.map(s => (
          <div key={s.id} onClick={()=>setSelected(s.id)}
            style={{ background:selected===s.id?s.accent:C.white, borderRadius:24, padding:32, cursor:"pointer",
              border:"2px solid "+(selected===s.id?s.accent:C.border),
              transform:selected===s.id?"translateY(-6px)":"none",
              boxShadow:selected===s.id?"0 20px 60px "+s.accent+"35":"0 4px 16px rgba(0,0,0,0.04)",
              transition:"all 0.3s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ fontSize:40 }}>{s.badge}</div>
              {s.popular && <Badge>Most Popular</Badge>}
              {selected===s.id && <span style={{ background:"rgba(255,255,255,0.3)", color:"#fff", borderRadius:99, padding:"4px 12px", fontSize:12, fontWeight:700 }}>✓ Selected</span>}
            </div>
            <h3 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700, color:selected===s.id?"#fff":C.brown, marginBottom:6 }}>{s.tier}</h3>
            <p style={{ color:selected===s.id?"rgba(255,255,255,0.8)":C.brownLight, fontSize:14, marginBottom:20 }}>{s.description}</p>
            <div style={{ marginBottom:24 }}>
              <span style={{ fontFamily:"'Lora',serif", fontSize:38, fontWeight:700, color:selected===s.id?"#fff":C.brown }}>${s.price.toLocaleString()}</span>
              <span style={{ color:selected===s.id?"rgba(255,255,255,0.7)":C.brownLight, fontSize:14 }}> / project</span>
            </div>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
              {s.features.map(f => (
                <li key={f} style={{ fontSize:14, color:selected===s.id?"rgba(255,255,255,0.9)":C.brownMid, display:"flex", gap:8 }}>
                  <span style={{ color:selected===s.id?"rgba(255,255,255,0.7)":C.amber }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Card style={{ marginBottom:32 }}>
        <h2 style={{ fontFamily:"'Lora',serif", fontSize:26, fontWeight:700, color:C.brown, marginBottom:6 }}>Enhance with Add-ons</h2>
        <p style={{ color:C.brownLight, fontSize:14, marginBottom:24 }}>Mix and match to build your ideal package.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {ADDONS.map(a => (
            <div key={a.id} onClick={()=>toggle(a.id)}
              style={{ padding:"16px 20px", borderRadius:14, cursor:"pointer",
                border:"2px solid "+(addons.includes(a.id)?C.amber:C.border),
                background:addons.includes(a.id)?C.amberPale:C.cream2, transition:"all 0.2s", display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:24 }}>{a.icon}</span>
                {addons.includes(a.id) && <span style={{ color:C.amber, fontWeight:700 }}>✓</span>}
              </div>
              <div style={{ fontWeight:600, fontSize:14, color:C.brown }}>{a.name}</div>
              <div style={{ fontFamily:"'Lora',serif", fontWeight:700, color:C.amber }}>+${a.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
      {selected && (
        <div style={{ position:"sticky", bottom:24, background:C.brown, borderRadius:20, padding:"20px 28px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
          boxShadow:"0 20px 60px #2C181055" }}>
          <div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:13, marginBottom:4 }}>
              {SERVICES.find(s=>s.id===selected).tier} Package{addons.length>0?` + ${addons.length} add-on${addons.length>1?"s":""}` : ""}
            </div>
            <div style={{ fontFamily:"'Lora',serif", fontSize:32, fontWeight:700, color:"#fff" }}>
              ${total.toLocaleString()} <span style={{ fontSize:16, color:"rgba(255,255,255,0.5)" }}>total</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <Btn variant="ghost" style={{ color:"#fff", borderColor:"rgba(255,255,255,0.3)" }} onClick={()=>setPage("calendar")}>📅 Schedule First</Btn>
            <Btn style={{ background:C.amber }} onClick={()=>{ setSelectedService({service:selected,addons,total}); setPage("checkout"); }}>Proceed to Checkout →</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Calendar Page ─────────────────────────────────
const CalendarPage = ({ setPage }) => {
  const { isLoggedIn } = useAuth();
  const today = new Date(2026,1,12);
  const [month,   setMonth]   = useState(new Date(2026,1,1));
  const [day,     setDay]     = useState(null);
  const [time,    setTime]    = useState(null);
  const [type,    setType]    = useState("discovery");
  const [booked,  setBooked]  = useState(false);
  const [loading, setLoading] = useState(false);
  const TIMES   = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"];
  const BLOCKED = ["10:00 AM","2:30 PM","9:30 AM"];
  const dim = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const fd  = new Date(month.getFullYear(),month.getMonth(),1).getDay();
  const mn  = month.toLocaleString("default",{month:"long",year:"numeric"});
  const unavail = d => { const dt=new Date(month.getFullYear(),month.getMonth(),d); return dt.getDay()===0||dt.getDay()===6||dt<today; };
  const confirm = async () => {
    if (!isLoggedIn) { setPage("signup"); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setBooked(true); }, 1200);
  };
  if (booked) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"80px 5%" }}>
      <div style={{ textAlign:"center", maxWidth:480 }}>
        <div style={{ fontSize:72, marginBottom:24 }}>🎉</div>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:38, fontWeight:700, color:C.brown, marginBottom:16 }}>You're booked!</h1>
        <p style={{ color:C.brownLight, fontSize:17, lineHeight:1.7, marginBottom:32 }}>
          Your {type==="discovery"?"30-minute discovery call":"project kickoff meeting"} is confirmed for{" "}
          <strong>{day && new Date(month.getFullYear(),month.getMonth(),day).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</strong>{" "}
          at <strong>{time}</strong>.<br/><br/>A calendar invite has been sent to your email.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <Btn onClick={()=>setPage("home")}>Back to Home</Btn>
          {isLoggedIn && <Btn variant="secondary" onClick={()=>setPage("dashboard")}>View Dashboard</Btn>}
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ paddingTop:100, padding:"100px 5% 80px", maxWidth:1000, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:48 }}>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:48, fontWeight:700, color:C.brown }}>Book a Session</h1>
        <p style={{ color:C.brownLight, fontSize:18, marginTop:12 }}>Pick a time that works. All calls via Google Meet.</p>
      </div>
      <div style={{ display:"flex", gap:12, marginBottom:36, flexWrap:"wrap" }}>
        {[{id:"discovery",label:"🔍 Discovery Call",dur:"30 min · Free"},{id:"kickoff",label:"🚀 Project Kickoff",dur:"60 min · Clients only"}].map(c=>(
          <div key={c.id} onClick={()=>setType(c.id)}
            style={{ padding:"16px 24px", borderRadius:14, cursor:"pointer", flex:"1 1 200px",
              border:"2px solid "+(type===c.id?C.amber:C.border), background:type===c.id?C.amberPale:C.white, transition:"all 0.2s" }}>
            <div style={{ fontWeight:600, fontSize:16, color:C.brown }}>{c.label}</div>
            <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{c.dur}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:24 }}>
        <Card>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.brownLight, padding:"4px 8px" }}>‹</button>
            <h3 style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:20, color:C.brown }}>{mn}</h3>
            <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:C.brownLight, padding:"4px 8px" }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, textAlign:"center" }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} style={{ fontSize:12, fontWeight:600, color:C.brownLight, padding:"8px 0" }}>{d}</div>)}
            {Array(fd).fill(null).map((_,i)=><div key={"e"+i}/>)}
            {Array(dim).fill(null).map((_,i)=>{
              const d=i+1, un=unavail(d), sel=day===d;
              const isTd=today.getDate()===d&&today.getMonth()===month.getMonth()&&today.getFullYear()===month.getFullYear();
              return (
                <div key={d} onClick={()=>!un&&(setDay(d),setTime(null))}
                  style={{ padding:"10px 4px", borderRadius:10, fontSize:14, fontWeight:sel?700:400,
                    cursor:un?"not-allowed":"pointer", background:sel?C.amber:isTd?C.amberPale:"transparent",
                    color:sel?"#fff":un?C.border:C.brown,
                    border:isTd&&!sel?"2px solid "+C.amber:"2px solid transparent", transition:"all 0.15s" }}>
                  {d}
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <Card style={{ flex:1 }}>
            {!day ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:C.brownLight }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📅</div>
                <p style={{ fontSize:14 }}>Select a date to see available times</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily:"'Lora',serif", fontWeight:600, fontSize:16, color:C.brown, marginBottom:16 }}>
                  {new Date(month.getFullYear(),month.getMonth(),day).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}
                </h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {TIMES.map(t => {
                    const bl=BLOCKED.includes(t), sel=time===t;
                    return (
                      <div key={t} onClick={()=>!bl&&setTime(t)}
                        style={{ padding:"11px 16px", borderRadius:10, fontSize:14, fontWeight:sel?600:400,
                          cursor:bl?"not-allowed":"pointer", background:sel?C.amber:bl?C.cream2:C.cream,
                          color:sel?"#fff":bl?C.border:C.brown, border:"1.5px solid "+(sel?C.amber:C.border),
                          transition:"all 0.15s", display:"flex", justifyContent:"space-between" }}>
                        <span>{t}</span>
                        {bl && <span style={{ fontSize:11, color:C.border }}>Taken</span>}
                        {sel && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
          {day && time && (
            <Btn style={{ width:"100%", justifyContent:"center" }} onClick={confirm} disabled={loading}>
              {loading ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><Spin/>Confirming...</span> : "Confirm Booking →"}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Checkout Page ─────────────────────────────────
const CheckoutPage = ({ selectedService }) => {
  const { user } = useAuth();
  const [step,    setStep]    = useState(1);
  const [card,    setCard]    = useState("");
  const [expiry,  setExpiry]  = useState("");
  const [cvv,     setCvv]     = useState("");
  const [name,    setName]    = useState(user?.user_metadata?.full_name || "");
  const [loading, setLoading] = useState(false);
  const svc   = selectedService ? SERVICES.find(s=>s.id===selectedService.service) : SERVICES[1];
  const total = selectedService?.total || svc.price;
  const fmtC  = v => v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})/g,"$1 ").trim();
  const fmtE  = v => v.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2");
  const pay   = () => { setLoading(true); setTimeout(()=>{ setLoading(false); setStep(3); },2200); };
  const steps = ["Review","Payment","Confirmed"];
  return (
    <div style={{ paddingTop:100, padding:"100px 5% 80px", maxWidth:900, margin:"0 auto" }}>
      <h1 style={{ fontFamily:"'Lora',serif", fontSize:42, fontWeight:700, color:C.brown, marginBottom:32 }}>Checkout</h1>
      <div style={{ display:"flex", marginBottom:48, position:"relative" }}>
        {steps.map((s,i) => (
          <div key={s} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", position:"relative" }}>
            {i>0 && <div style={{ position:"absolute", top:16, left:0, right:"50%", height:2, background:step>i?C.amber:C.border }}/>}
            {i<steps.length-1 && <div style={{ position:"absolute", top:16, left:"50%", right:0, height:2, background:step>i+1?C.amber:C.border }}/>}
            <div style={{ width:32, height:32, borderRadius:"50%", zIndex:1,
              background:step>i?C.amber:step===i+1?C.brown:C.border,
              color:step>i||step===i+1?"#fff":C.brownLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700 }}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{ fontSize:12, marginTop:8, color:step===i+1?C.brown:C.brownLight, fontWeight:step===i+1?600:400 }}>{s}</span>
          </div>
        ))}
      </div>
      {step===3 ? (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:72, marginBottom:24 }}>✅</div>
          <h2 style={{ fontFamily:"'Lora',serif", fontSize:38, fontWeight:700, color:C.brown, marginBottom:16 }}>Payment Successful!</h2>
          <p style={{ color:C.brownLight, fontSize:17, lineHeight:1.7, maxWidth:480, margin:"0 auto 32px" }}>
            Your <strong>{svc.tier} Package</strong> is confirmed. Welcome email coming within 24 hours.
          </p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:28, alignItems:"start" }}>
          <div>
            {step===1 && (
              <Card>
                <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:C.brown, marginBottom:20 }}>Order Review</h2>
                <div style={{ borderRadius:14, background:C.amberPale, padding:"20px 24px", marginBottom:20, display:"flex", gap:16, alignItems:"center" }}>
                  <span style={{ fontSize:40 }}>{svc.badge}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:18, color:C.brown }}>{svc.tier} Package</div>
                    <div style={{ color:C.brownLight, fontSize:14, marginTop:4 }}>{svc.description}</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:C.amber }}>${svc.price.toLocaleString()}</div>
                </div>
                <Btn style={{ width:"100%", justifyContent:"center" }} onClick={()=>setStep(2)}>Continue to Payment →</Btn>
              </Card>
            )}
            {step===2 && (
              <Card>
                <h2 style={{ fontFamily:"'Lora',serif", fontSize:24, fontWeight:700, color:C.brown, marginBottom:24 }}>Payment Details</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                  <Input label="Cardholder Name" value={name} onChange={setName} placeholder="Your Name" icon="👤"/>
                  <Input label="Card Number" value={card} onChange={v=>setCard(fmtC(v))} placeholder="1234 5678 9012 3456" icon="💳"/>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <Input label="Expiry" value={expiry} onChange={v=>setExpiry(fmtE(v))} placeholder="MM/YY" icon="📅"/>
                    <Input label="CVV" type="password" value={cvv} onChange={v=>setCvv(v.slice(0,4))} placeholder="•••" icon="🔒"/>
                  </div>
                  <div style={{ background:C.greenPale, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, fontSize:13, color:C.green }}>
                    🔒 <span>256-bit SSL. Card info never stored here.</span>
                  </div>
                  <Btn style={{ width:"100%", justifyContent:"center" }} onClick={pay} disabled={loading||!card||!expiry||!cvv||!name}>
                    {loading
                      ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><Spin/>Processing…</span>
                      : "Pay $" + total.toLocaleString() + " →"
                    }
                  </Btn>
                </div>
              </Card>
            )}
          </div>
          <Card style={{ position:"sticky", top:100 }}>
            <h3 style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:18, color:C.brown, marginBottom:20 }}>Order Summary</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}>
                <span style={{ color:C.brownLight }}>{svc.tier} Package</span>
                <span>${svc.price.toLocaleString()}</span>
              </div>
              {selectedService?.addons?.map(id=>{
                const a=ADDONS.find(x=>x.id===id);
                return <div key={id} style={{ display:"flex", justifyContent:"space-between", fontSize:14 }}><span style={{ color:C.brownLight }}>{a.name}</span><span>+${a.price.toLocaleString()}</span></div>;
              })}
            </div>
            <div style={{ borderTop:"2px solid "+C.border, paddingTop:16, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontWeight:700, color:C.brown }}>Total</span>
              <span style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:C.amber }}>${total.toLocaleString()}</span>
            </div>
            <div style={{ marginTop:20, background:C.goldPale, borderRadius:10, padding:"12px 16px", fontSize:13, color:C.brownMid }}>
              💡 50% due today, 50% on delivery.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────
const Dashboard = ({ setPage }) => {
  const { user, displayName, isLoggedIn, logout } = useAuth();
  const [tab,  setTab]  = useState("overview");
  const [read, setRead] = useState([]);
  const unread = MOCK_MESSAGES.filter(m=>m.unread&&!read.includes(m.id)).length;
  const tabs = [
    {id:"overview",  label:"Overview",  icon:"🏠"},
    {id:"projects",  label:"Projects",  icon:"📂"},
    {id:"messages",  label:"Messages",  icon:"💬"},
    {id:"invoices",  label:"Invoices",  icon:"🧾"},
  ];
  if (!isLoggedIn) return null;
  return (
    <div style={{ paddingTop:68, display:"flex", minHeight:"100vh" }}>
      <div style={{ width:240, background:C.brown, padding:"32px 0", display:"flex", flexDirection:"column", gap:4,
        position:"sticky", top:68, height:"calc(100vh - 68px)", overflowY:"auto" }}>
        <div style={{ padding:"0 20px 24px", borderBottom:"1px solid rgba(255,255,255,0.1)", marginBottom:8 }}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, marginBottom:10 }}>
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
              color:tab===t.id?"#fff":"rgba(255,255,255,0.55)", fontSize:14, fontWeight:tab===t.id?600:400,
              transition:"all 0.15s", position:"relative" }}>
            <span>{t.icon}</span>{t.label}
            {t.id==="messages" && unread>0 && (
              <span style={{ position:"absolute", right:16, background:C.amber, color:"#fff", borderRadius:99, padding:"2px 7px", fontSize:11, fontWeight:700 }}>{unread}</span>
            )}
          </div>
        ))}
        <div style={{ marginTop:"auto", padding:"24px 20px 0", borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          <div onClick={()=>setPage("services")} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:14 }}>➕ New Project</div>
          <div onClick={()=>setPage("calendar")} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", cursor:"pointer", color:"rgba(255,255,255,0.55)", fontSize:14 }}>📅 Book a Call</div>
          <div onClick={async()=>{ await logout(); setPage("home"); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:14 }}>🚪 Sign Out</div>
        </div>
      </div>
      <div style={{ flex:1, padding:"40px", overflowY:"auto", background:C.cream }}>
        {tab==="overview" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:4 }}>
              Welcome back, {displayName?.split(" ")[0] || "there"} 👋
            </h1>
            <p style={{ color:C.brownLight, marginBottom:36 }}>Here's what's happening with your projects.</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20, marginBottom:36 }}>
              {[
                {label:"Active Projects", val:"2",          icon:"📂", color:C.amberPale},
                {label:"Next Meeting",    val:"Feb 18",     icon:"📅", color:C.goldPale},
                {label:"Amount Due",      val:"$3,750",     icon:"💸", color:"#FEE2E2"},
                {label:"Messages",        val:unread+" new",icon:"💬", color:C.greenPale},
              ].map(s => (
                <Card key={s.label} style={{ background:s.color, border:"none", padding:"20px 24px" }}>
                  <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
                  <div style={{ fontFamily:"'Lora',serif", fontSize:28, fontWeight:700, color:C.brown }}>{s.val}</div>
                  <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{s.label}</div>
                </Card>
              ))}
            </div>
            <Card style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown, marginBottom:20 }}>Active Projects</h2>
              {MOCK_PROJECTS.filter(p=>p.status!=="Completed").map(p => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 0", borderBottom:"1px solid "+C.border }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:C.amberPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                    {p.status==="In Progress"?"⚙️":"👁️"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, color:C.brown }}>{p.name}</div>
                    <div style={{ fontSize:13, color:C.brownLight, marginTop:2 }}>{p.tier} · Due {p.due}</div>
                    <div style={{ marginTop:8, background:C.cream, borderRadius:99, height:6, overflow:"hidden" }}>
                      <div style={{ width:p.progress+"%", height:"100%", background:C.amber, borderRadius:99 }}/>
                    </div>
                    <div style={{ fontSize:12, color:C.brownLight, marginTop:4 }}>{p.progress}% complete</div>
                  </div>
                  <Badge color={p.status==="Review"?C.goldPale:C.amberPale} text={p.status==="Review"?C.gold:C.amber}>{p.status}</Badge>
                </div>
              ))}
            </Card>
            <Card>
              <h2 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown, marginBottom:20 }}>Recent Messages</h2>
              {MOCK_MESSAGES.map(m => (
                <div key={m.id} onClick={()=>setRead(p=>[...p,m.id])}
                  style={{ display:"flex", gap:14, padding:"12px 16px", borderRadius:12, marginBottom:8, cursor:"pointer",
                    background:m.unread&&!read.includes(m.id)?C.amberPale:C.cream2 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, flexShrink:0 }}>{m.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontWeight:600, fontSize:14, color:C.brown }}>{m.from}</span>
                      <span style={{ fontSize:12, color:C.brownLight }}>{m.time}</span>
                    </div>
                    <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>{m.text}</div>
                  </div>
                  {m.unread&&!read.includes(m.id)&&<div style={{ width:8, height:8, borderRadius:"50%", background:C.amber, flexShrink:0, marginTop:6 }}/>}
                </div>
              ))}
            </Card>
          </div>
        )}
        {tab==="projects" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:36 }}>
              <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown }}>Projects</h1>
              <Btn onClick={()=>setPage("services")}>+ New Project</Btn>
            </div>
            {MOCK_PROJECTS.map(p => (
              <Card key={p.id} hover style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:p.status==="Completed"?C.greenPale:C.amberPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                    {p.status==="Completed"?"✅":p.status==="Review"?"👁️":"⚙️"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <h3 style={{ fontFamily:"'Lora',serif", fontSize:20, fontWeight:700, color:C.brown }}>{p.name}</h3>
                      <Badge color={p.status==="Completed"?C.greenPale:p.status==="Review"?C.goldPale:C.amberPale} text={p.status==="Completed"?C.green:p.status==="Review"?C.gold:C.amber}>{p.status}</Badge>
                    </div>
                    <div style={{ fontSize:13, color:C.brownLight, margin:"6px 0 16px" }}>{p.tier} Package · Due {p.due}</div>
                    <div style={{ background:C.cream, borderRadius:99, height:8, overflow:"hidden" }}>
                      <div style={{ width:p.progress+"%", height:"100%", background:p.status==="Completed"?C.green:C.amber, borderRadius:99 }}/>
                    </div>
                    <div style={{ fontSize:13, color:C.brownLight, marginTop:6 }}>{p.progress}% complete</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab==="messages" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:36 }}>Messages</h1>
            {MOCK_MESSAGES.map(m => (
              <Card key={m.id} style={{ background:m.unread&&!read.includes(m.id)?C.amberPale:C.white, marginBottom:12 }}>
                <div style={{ display:"flex", gap:16, cursor:"pointer" }} onClick={()=>setRead(p=>[...p,m.id])}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:C.amber, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:18, flexShrink:0 }}>{m.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:15, color:C.brown }}>{m.from}</span>
                      <span style={{ fontSize:13, color:C.brownLight }}>{m.time}</span>
                    </div>
                    <p style={{ fontSize:14, color:C.brownMid, lineHeight:1.6 }}>{m.text}</p>
                  </div>
                  {m.unread&&!read.includes(m.id)&&<div style={{ width:10, height:10, borderRadius:"50%", background:C.amber, flexShrink:0, marginTop:4 }}/>}
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab==="invoices" && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <h1 style={{ fontFamily:"'Lora',serif", fontSize:34, fontWeight:700, color:C.brown, marginBottom:36 }}>Invoices</h1>
            {MOCK_INVOICES.map(inv => (
              <Card key={inv.id} hover style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:inv.status==="Paid"?C.greenPale:C.amberPale, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                    {inv.status==="Paid"?"✅":"💳"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:16, color:C.brown }}>{inv.id}</div>
                    <div style={{ fontSize:13, color:C.brownLight, marginTop:4 }}>Issued {inv.date}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Lora',serif", fontSize:22, fontWeight:700, color:C.brown }}>${inv.amount.toLocaleString()}</div>
                    <Badge color={inv.status==="Paid"?C.greenPale:C.amberPale} text={inv.status==="Paid"?C.green:C.amber}>{inv.status}</Badge>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginLeft:16 }}>
                    <Btn variant="secondary" size="sm">Download</Btn>
                    {inv.status!=="Paid" && <Btn size="sm">Pay Now</Btn>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── App Root ──────────────────────────────────────
export default function App() {
  const { isLoggedIn, loading } = useAuth();
  const [page,            setPage]            = useState("home");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(()=>{ window.scrollTo({top:0,behavior:"smooth"}); },[page]);

  useEffect(()=>{
    if (!loading && isLoggedIn && (page==="login"||page==="signup")) setPage("dashboard");
  },[isLoggedIn,loading,page]);

  const render = () => {
    switch(page) {
      case "home":      return <Home setPage={setPage}/>;
      case "login":     return <AuthPage mode="login" setPage={setPage}/>;
      case "signup":    return <AuthPage mode="signup" setPage={setPage}/>;
      case "services":  return <ServicesPage setPage={setPage} setSelectedService={setSelectedService}/>;
      case "calendar":  return <CalendarPage setPage={setPage}/>;
      case "checkout":  return <CheckoutPage selectedService={selectedService}/>;
      case "dashboard": return isLoggedIn ? <Dashboard setPage={setPage}/> : <AuthPage mode="login" setPage={setPage}/>;
      default:          return <Home setPage={setPage}/>;
    }
  };
  return (
    <>
      <style>{GS}</style>
      <Nav setPage={setPage}/>
      <div key={page} style={{ animation:"fadeIn 0.35s ease" }}>{render()}</div>
    </>
  );
}
