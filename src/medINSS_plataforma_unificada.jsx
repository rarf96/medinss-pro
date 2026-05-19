import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   DESIGN SYSTEM — Executive Legal-Tech
   Fonte: Inter (Google Fonts)
   Paleta: Slate profundo + âmbar discreto + verde funcional
   Raio: 4–6px máximo — bordas retas, linguagem corporativa
   Sombras: quase imperceptíveis — não decorativas
   Sem emojis no chrome principal — ícones textuais/Unicode
───────────────────────────────────────────────────────── */
const F = "'Inter', 'Helvetica Neue', Arial, sans-serif";

const T = {
  bg:      "#f1f3f6",
  surface: "#ffffff",
  card:    "#ffffff",
  border:  "#dde1e7",
  borderS: "#c8cdd6",
  navy:    "#0f2137",
  navyMd:  "#1a3350",
  navyLt:  "#254a72",
  slate:   "#3d4f63",
  slateL:  "#5c6f83",
  muted:   "#8a97a6",
  dim:     "#e8eaed",
  text:    "#0f2137",
  textMd:  "#3d4f63",
  textLt:  "#6b7d8f",
  amber:   "#b45309",
  amberBg: "#fef3e2",
  amberBd: "#f6d28a",
  green:   "#166534",
  greenBg: "#f0fdf4",
  greenBd: "#86efac",
  red:     "#991b1b",
  redBg:   "#fef2f2",
  blue:    "#1d4ed8",
  blueBg:  "#eff6ff",
  blueBd:  "#bfdbfe",
  purple:  "#5b21b6",
  wa:      "#128C7E",
  sh:      "0 1px 2px rgba(0,0,0,.06)",
  shMd:    "0 2px 8px rgba(0,0,0,.08)",
  shLg:    "0 4px 20px rgba(0,0,0,.10)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${F}; background: ${T.bg}; color: ${T.text}; }
  input, button, textarea, select { font-family: inherit; outline: none; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.borderS}; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes dots { 0%,100%{opacity:.25} 50%{opacity:.9} }
  .fade-in { animation: fadeIn .35s ease both; }
  .fade-in-1 { animation: fadeIn .35s .06s ease both; opacity:0; animation-fill-mode:forwards; }
  .fade-in-2 { animation: fadeIn .35s .12s ease both; opacity:0; animation-fill-mode:forwards; }
  .fade-in-3 { animation: fadeIn .35s .20s ease both; opacity:0; animation-fill-mode:forwards; }
  .hov-card { transition: box-shadow .15s, border-color .15s; cursor: pointer; }
  .hov-card:hover { box-shadow: ${T.shMd} !important; border-color: ${T.borderS} !important; }
  @media (max-width:680px) { .login-left { display:none !important; } .login-right { width:100% !important; } }
`;

/* ── Helpers ─────────────────────────────────────────── */
const fmt  = (n) => (n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});
const fmtN = (n) => (n||0).toLocaleString("pt-BR");
const dt   = () => new Date().toLocaleDateString("pt-BR");
const calcCred = (v, m) => {
  const exc = Math.max((v-1)*7786.02*0.2, 0);
  const bruto = exc*m, selic = bruto*(0.1175*m/12), total = bruto+selic;
  return { exc, bruto, selic, total, hon:total*0.25 };
};

/* ── Primitive UI ────────────────────────────────────── */
function Btn({ children, onClick, variant="primary", color, small, disabled, full, style={} }) {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6,
    padding: small ? "5px 14px" : "8px 20px",
    borderRadius: 4,
    fontSize: small ? 12 : 13,
    fontWeight: 600,
    fontFamily: F,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .15s",
    border: "1.5px solid",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.55 : 1,
    width: full ? "100%" : undefined,
    ...style,
  };
  const variants = {
    primary:  { background: color||T.navy,    borderColor: color||T.navy,    color:"#fff"        },
    outline:  { background: "transparent",    borderColor: color||T.borderS, color: color||T.textMd },
    ghost:    { background: "transparent",    borderColor: "transparent",    color: color||T.textMd },
    danger:   { background: T.red,            borderColor: T.red,            color:"#fff"        },
    success:  { background: T.green,          borderColor: T.green,          color:"#fff"        },
    amber:    { background: T.amber,          borderColor: T.amber,          color:"#fff"        },
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...variants[variant]}}>{children}</button>;
}

function Badge({ children, color=T.slateL, bg=T.dim }) {
  return (
    <span style={{
      display:"inline-block", fontSize:10, fontWeight:600, letterSpacing:"0.04em",
      padding:"2px 8px", borderRadius:2, background:bg, color,
      textTransform:"uppercase", whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

function Label({ children, style={} }) {
  return (
    <div style={{
      fontSize:10, fontWeight:700, letterSpacing:"0.08em",
      textTransform:"uppercase", color:T.muted, marginBottom:8, ...style
    }}>{children}</div>
  );
}

function Divider({ style={} }) {
  return <div style={{height:1, background:T.border, margin:"16px 0", ...style}} />;
}

function Card({ children, style={}, onClick, hover }) {
  return (
    <div onClick={onClick} className={hover?"hov-card":undefined}
      style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:6,
        boxShadow:T.sh, padding:20, ...style}}>
      {children}
    </div>
  );
}

function Stat({ label, value, color=T.text, delta, mono }) {
  return (
    <div style={{padding:"16px 20px"}}>
      <div style={{fontSize:11, fontWeight:600, color:T.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6}}>{label}</div>
      <div style={{fontSize:20, fontWeight:700, color, fontFamily: mono?"'Courier New',monospace":F, lineHeight:1}}>{value}</div>
      {delta && <div style={{fontSize:11, color:T.muted, marginTop:4}}>{delta}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", style={} }) {
  const [focus, setFocus] = useState(false);
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
      style={{
        width:"100%", padding:"9px 12px", borderRadius:4,
        border:`1.5px solid ${focus?T.navyLt:T.border}`,
        background: focus?"#fff":T.bg,
        color:T.text, fontSize:13, fontFamily:F,
        transition:"border .15s, background .15s", ...style
      }} />
  );
}

function ProgressBar({ pct, color=T.green, height=5 }) {
  return (
    <div style={{height, borderRadius:2, background:T.dim, overflow:"hidden"}}>
      <div style={{height:"100%", borderRadius:2, background:color, width:Math.min(pct,100)+"%", transition:"width .4s"}}/>
    </div>
  );
}

function Check({ checked, onClick, label, color=T.green }) {
  return (
    <div onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
      borderRadius:4, cursor:"pointer",
      background: checked ? T.greenBg : T.surface,
      border:`1px solid ${checked ? T.greenBd : T.border}`,
      transition:"all .15s", marginBottom:6,
    }}>
      <div style={{
        width:18, height:18, borderRadius:3, flexShrink:0,
        border:`1.5px solid ${checked?color:T.borderS}`,
        background:checked?color:"transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:11, color:"#fff", fontWeight:800,
      }}>{checked?"✓":""}</div>
      <span style={{fontSize:13, color:checked?T.green:T.textMd, fontWeight:checked?500:400}}>{label}</span>
    </div>
  );
}

/* ── TopBar ──────────────────────────────────────────── */
function TopBar({ title, sub, accentColor=T.navy, onBack, nav }) {
  return (
    <div style={{background:T.surface, borderBottom:`1px solid ${T.border}`, flexShrink:0, boxShadow:T.sh}}>
      <div style={{display:"flex", alignItems:"center", gap:12, padding:"0 24px", height:52}}>
        {onBack && (
          <Btn variant="outline" small onClick={onBack} style={{marginRight:4}}>
            ← Voltar
          </Btn>
        )}
        <div style={{
          width:30, height:30, borderRadius:4, background:accentColor,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, color:"#fff", fontWeight:800, flexShrink:0, letterSpacing:"-0.5px",
        }}>M</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:14, fontWeight:700, color:T.navy, letterSpacing:"-0.01em"}}>{title}</div>
          {sub && <div style={{fontSize:10, color:T.muted, letterSpacing:"0.05em", textTransform:"uppercase"}}>{sub}</div>}
        </div>
      </div>
      {nav && (
        <div style={{display:"flex", gap:0, padding:"0 24px", overflowX:"auto"}}>
          {nav.options.map(([id,lbl]) => (
            <button key={id} onClick={()=>nav.onChange(id)} style={{
              padding:"10px 16px", fontSize:12, fontWeight:600, fontFamily:F,
              background:"transparent", border:"none", borderBottom:`2px solid ${nav.active===id?accentColor:"transparent"}`,
              color:nav.active===id?accentColor:T.slateL,
              cursor:"pointer", whiteSpace:"nowrap", transition:"all .15s",
            }}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatStrip({ items }) {
  return (
    <div style={{display:"flex", background:T.surface, borderBottom:`1px solid ${T.border}`, flexShrink:0}}>
      {items.map((s,i) => (
        <div key={i} style={{flex:1, borderRight:`1px solid ${T.border}`, padding:"12px 20px"}}>
          <div style={{fontSize:10, fontWeight:600, color:T.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4}}>{s.l}</div>
          <div style={{fontSize:17, fontWeight:700, color:s.c||T.navy, fontFamily:"'Courier New',monospace"}}>{s.v}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   TYPEWRITER
══════════════════════════════════════════════════════ */
const WORDS = [
  "recuperação de INSS patronal",
  "honorários por êxito",
  "prospecção automatizada com IA",
  "contratos gerados em segundos",
  "gestão completa de 3.000 médicos",
];

function useTypewriter(words) {
  const [txt, setTxt] = useState("");
  const s = useRef({wi:0, ci:0, del:false});
  useEffect(() => {
    let t;
    const tick = () => {
      const w = words[s.current.wi];
      if (!s.current.del && s.current.ci < w.length) {
        s.current.ci++; setTxt(w.slice(0,s.current.ci)); t = setTimeout(tick,55);
      } else if (!s.current.del) {
        t = setTimeout(() => { s.current.del=true; tick(); }, 2000);
      } else if (s.current.ci > 0) {
        s.current.ci--; setTxt(w.slice(0,s.current.ci)); t = setTimeout(tick,25);
      } else {
        s.current.del=false; s.current.wi=(s.current.wi+1)%words.length; setTimeout(tick,150);
      }
    };
    t = setTimeout(tick,600);
    return () => clearTimeout(t);
  }, []);
  return txt;
}

/* ══════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════ */
function Login({ onLogin }) {
  const [email,setEmail] = useState("");
  const [pass,setPass]   = useState("");
  const [show,setShow]   = useState(false);
  const [err,setErr]     = useState("");
  const [load,setLoad]   = useState(false);
  const typed = useTypewriter(WORDS);

  const submit = async () => {
    setErr("");
    if (!email||!pass) { setErr("Preencha e-mail e senha."); return; }
    setLoad(true);
    await new Promise(r=>setTimeout(r,800));
    if (email==="admin@medinss.com.br" && pass==="Med@2025") { onLogin(); }
    else { setErr("Credenciais inválidas."); setLoad(false); }
  };

  return (
    <div style={{minHeight:"100vh", display:"flex", fontFamily:F}}>
      <style>{GLOBAL_CSS}</style>

      {/* Painel esquerdo — identidade */}
      <div className="login-left" style={{
        flex:1, background:T.navy,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"72px 80px", position:"relative", overflow:"hidden",
      }}>
        {/* Grade discreta */}
        <div style={{position:"absolute",inset:0,opacity:.04,
          backgroundImage:`linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)`,
          backgroundSize:"40px 40px"}}/>

        <div style={{position:"relative", zIndex:1}}>
          {/* Logo */}
          <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:72}}>
            <div style={{
              width:44, height:44, borderRadius:4, background:T.amber,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-1px",
            }}>M</div>
            <div>
              <div style={{fontSize:18, fontWeight:700, color:"#fff", letterSpacing:"-0.02em"}}>MedINSS Pro</div>
              <div style={{fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:"0.12em", textTransform:"uppercase"}}>Plataforma Tributária</div>
            </div>
          </div>

          <div style={{fontSize:11, color:T.amber, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16, fontWeight:600}}>
            Recuperação de INSS para Médicos
          </div>

          <div style={{fontSize:36, fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:"-0.03em", marginBottom:24}}>
            Transforme excesso de<br/>
            contribuição em<br/>
            <span style={{color:T.amber}}>resultado financeiro.</span>
          </div>

          <div style={{fontSize:15, color:"rgba(255,255,255,.45)", lineHeight:1.7, marginBottom:56, minHeight:26}}>
            Especializada em{" "}
            <span style={{color:"rgba(255,255,255,.75)", fontStyle:"italic"}}>
              {typed}<span style={{animation:"blink 1s step-end infinite", color:T.amber}}>|</span>
            </span>
          </div>

          {/* Métricas */}
          <div style={{display:"flex", gap:48}}>
            {[{n:"3.284",l:"Médicos na base"},{n:"R$ 1,4M",l:"Pipeline total"},{n:"23",l:"Contratos ativos"}].map((s,i)=>(
              <div key={i}>
                <div style={{fontSize:24, fontWeight:700, color:T.amber, fontFamily:"'Courier New',monospace"}}>{s.n}</div>
                <div style={{fontSize:11, color:"rgba(255,255,255,.35)", marginTop:2, letterSpacing:"0.03em"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Rodapé legal */}
          <div style={{marginTop:64, fontSize:10, color:"rgba(255,255,255,.2)", lineHeight:1.7}}>
            Base legal: Art. 28, Lei 8.212/91 · IN RFB 971/2009<br/>
            Prazo prescricional: 5 anos · Teto 2025: R$ 7.786,02
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="login-right" style={{
        width:440, background:"#fff",
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"64px 52px", borderLeft:`1px solid ${T.border}`,
      }}>
        <div style={{fontSize:22, fontWeight:700, color:T.navy, letterSpacing:"-0.02em", marginBottom:4}}>
          Acesso restrito
        </div>
        <div style={{fontSize:13, color:T.textLt, marginBottom:40}}>
          Entre com suas credenciais para continuar.
        </div>

        <Label>E-mail</Label>
        <Input value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="admin@medinss.com.br" style={{marginBottom:18}} />

        <Label>Senha</Label>
        <div style={{position:"relative", marginBottom:28}}>
          <Input value={pass} onChange={e=>setPass(e.target.value)}
            type={show?"text":"password"} placeholder="••••••••••"
            style={{paddingRight:40}} />
          <button onClick={()=>setShow(!show)} style={{
            position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer",
            fontSize:12, color:T.muted, fontFamily:F,
          }}>{show?"Ocultar":"Mostrar"}</button>
        </div>

        {err && (
          <div style={{
            padding:"9px 14px", borderRadius:4, marginBottom:20,
            background:T.redBg, border:`1px solid #fecaca`,
            fontSize:12, color:T.red, fontWeight:500,
          }}>
            {err}
          </div>
        )}

        <Btn full disabled={load} onClick={submit} style={{padding:"11px",fontSize:14,borderRadius:4}}>
          {load ? "Verificando..." : "Entrar"}
        </Btn>

        <Divider />

        <div style={{padding:"12px 14px", borderRadius:4, background:T.amberBg, border:`1px solid ${T.amberBd}`, fontSize:12, color:"#78350f", lineHeight:1.8}}>
          <strong style={{display:"block", marginBottom:2}}>Acesso demonstração</strong>
          admin@medinss.com.br &nbsp;/&nbsp; Med@2025
        </div>

        <div style={{marginTop:"auto", paddingTop:40, fontSize:11, color:T.muted}}>
          © 2025 MedINSS Consultoria Tributária Ltda
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   HUB
══════════════════════════════════════════════════════ */
const ALERTS_DATA = [
  {type:"Reunião",  msg:"Dr. João Carvalho — 10h00", t:"agora",  c:T.amber},
  {type:"WhatsApp", msg:"Dra. Maria Eugênia respondeu", t:"3 min", c:T.green},
  {type:"Contrato", msg:"Dr. Roberto Alves — aguarda assinatura", t:"1h", c:T.blue},
  {type:"NPS",      msg:"Dra. Juliana Castro — nota 10", t:"2h",   c:T.green},
];

const FUNNEL_DATA = [
  {l:"Base total",   n:3284, pct:100, c:T.slateL},
  {l:"Contatados",  n:980,  pct:30,  c:T.blue},
  {l:"Responderam", n:196,  pct:6,   c:T.purple},
  {l:"Reuniões",    n:59,   pct:1.8, c:T.amber},
  {l:"Contratos",   n:23,   pct:0.7, c:T.green},
];

function Hub({ onLogout, onGo }) {
  const h = new Date().getHours();
  const greet = h<12?"Bom dia":h<18?"Boa tarde":"Boa noite";

  return (
    <div style={{minHeight:"100vh", background:T.bg, fontFamily:F}}>
      {/* Header principal */}
      <div style={{background:T.navy, borderBottom:`1px solid rgba(255,255,255,.06)`}}>
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:12, padding:"0 32px", height:56,
        }}>
          <div style={{display:"flex", alignItems:"center", gap:12, flexShrink:0}}>
            <div style={{
              width:32, height:32, borderRadius:4, background:T.amber,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:15, fontWeight:800, color:"#fff",
            }}>M</div>
            <div>
              <div style={{fontSize:15, fontWeight:700, color:"#fff", letterSpacing:"-0.01em"}}>MedINSS Pro</div>
              <div style={{fontSize:9, color:"rgba(255,255,255,.35)", letterSpacing:"0.1em", textTransform:"uppercase"}}>Plataforma Tributária</div>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:20}}>
            <div style={{display:"flex", alignItems:"center", gap:6}}>
              <div style={{width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11, color:"rgba(255,255,255,.45)", letterSpacing:"0.02em"}}>Sistema operacional</span>
            </div>
            <span style={{fontSize:11, color:"rgba(255,255,255,.35)"}}>admin@medinss.com.br</span>
            <Btn variant="outline" small onClick={onLogout}
              style={{borderColor:"rgba(255,255,255,.2)", color:"rgba(255,255,255,.65)", padding:"5px 14px"}}>
              Sair
            </Btn>
          </div>
        </div>
      </div>

      <div style={{padding:"32px", overflowY:"auto"}}>
        {/* Saudação */}
        <div className="fade-in" style={{marginBottom:32}}>
          <div style={{fontSize:22, fontWeight:700, color:T.navy, letterSpacing:"-0.02em", marginBottom:4}}>
            {greet}, Rafael.
          </div>
          <div style={{fontSize:13, color:T.textLt}}>
            {new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </div>
        </div>

        {/* KPIs */}
        <div className="fade-in-1" style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginBottom:32, background:T.border, borderRadius:6, overflow:"hidden", boxShadow:T.sh}}>
          {[
            {l:"Médicos na base",  v:"3.284", delta:"+12 nos últimos 7 dias",  c:T.navy},
            {l:"Leads em aberto",  v:"47",    delta:"+3 esta semana",           c:T.navy},
            {l:"Contratos ativos", v:"23",    delta:"R$ 1,4M em pipeline",      c:T.navy},
            {l:"Receita estimada", v:"R$ 1,4M",delta:"honorários potenciais",  c:T.amber},
          ].map((s,i)=>(
            <div key={i} style={{background:T.surface, padding:"20px 24px"}}>
              <div style={{fontSize:10,fontWeight:600,color:T.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>{s.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Courier New',monospace",letterSpacing:"-0.02em",marginBottom:4}}>{s.v}</div>
              <div style={{fontSize:11,color:T.textLt}}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Módulos */}
        <Label style={{marginBottom:16}}>Módulos</Label>
        <div className="fade-in-2" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32}}>
          {/* Prospecção */}
          <div className="hov-card" onClick={()=>onGo("prospeccao")}
            style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:28, boxShadow:T.sh}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20}}>
              <div style={{fontSize:11, fontWeight:700, color:T.green, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${T.greenBd}`, padding:"3px 10px", borderRadius:2, background:T.greenBg}}>
                Ativo · 24h
              </div>
              <div style={{fontSize:20, color:T.slateL}}>→</div>
            </div>
            <div style={{fontSize:18, fontWeight:700, color:T.navy, letterSpacing:"-0.02em", marginBottom:8}}>
              Prospecção & IA
            </div>
            <div style={{fontSize:13, color:T.textLt, lineHeight:1.65, marginBottom:20}}>
              Agente conversacional via WhatsApp, disparo sequenciado para 3.000 médicos, qualificação automática e integração com Google Calendar.
            </div>
            <Divider style={{margin:"0 0 16px"}}/>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {["WhatsApp API","Agente IA","n8n Workflow","Google Calendar"].map((t,i)=>(
                <Badge key={i} color={T.green} bg={T.greenBg}>{t}</Badge>
              ))}
            </div>
          </div>

          {/* CRM */}
          <div className="hov-card" onClick={()=>onGo("crm")}
            style={{background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:28, boxShadow:T.sh}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20}}>
              <div style={{fontSize:11, fontWeight:700, color:T.amber, letterSpacing:"0.06em", textTransform:"uppercase", border:`1px solid ${T.amberBd}`, padding:"3px 10px", borderRadius:2, background:T.amberBg}}>
                23 contratos
              </div>
              <div style={{fontSize:20, color:T.slateL}}>→</div>
            </div>
            <div style={{fontSize:18, fontWeight:700, color:T.navy, letterSpacing:"-0.02em", marginBottom:8}}>
              CRM & Gestão
            </div>
            <div style={{fontSize:13, color:T.textLt, lineHeight:1.65, marginBottom:20}}>
              Funil Kanban, histórico de conversas, geração de contratos por IA, checklist documental, pipeline de execução, financeiro e Customer Success.
            </div>
            <Divider style={{margin:"0 0 16px"}}/>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {["Kanban","Contratos IA","Financeiro","NPS"].map((t,i)=>(
                <Badge key={i} color={T.amber} bg={T.amberBg}>{t}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Painéis inferiores */}
        <div className="fade-in-3" style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
          {/* Notificações */}
          <Card>
            <Label>Notificações recentes</Label>
            {ALERTS_DATA.map((a,i)=>(
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 0", borderBottom: i<ALERTS_DATA.length-1?`1px solid ${T.dim}`:"none",
              }}>
                <Badge color={a.c} bg={a.c+"18"}>{a.type}</Badge>
                <span style={{flex:1, fontSize:12, color:T.textMd}}>{a.msg}</span>
                <span style={{fontSize:11, color:T.muted, whiteSpace:"nowrap"}}>{a.t}</span>
              </div>
            ))}
          </Card>

          {/* Funil */}
          <Card>
            <Label>Funil de conversão</Label>
            {FUNNEL_DATA.map((r,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:5}}>
                  <span style={{fontSize:12, color:T.textMd}}>{r.l}</span>
                  <div style={{display:"flex", gap:12}}>
                    <span style={{fontSize:12, fontWeight:600, color:r.c, fontFamily:"'Courier New',monospace"}}>{fmtN(r.n)}</span>
                    <span style={{fontSize:11, color:T.muted, width:34, textAlign:"right"}}>{r.pct}%</span>
                  </div>
                </div>
                <ProgressBar pct={r.pct} color={r.c} height={3}/>
              </div>
            ))}
          </Card>
        </div>

        <div style={{marginTop:40, fontSize:11, color:T.muted, textAlign:"center"}}>
          MedINSS Pro · v3.0 · Art. 28, Lei 8.212/91 · IN RFB 971/2009 · Teto 2025: R$ 7.786,02
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PROSPECÇÃO
══════════════════════════════════════════════════════ */
const MEDICOS = [
  {id:1,nome:"Dr. João Carvalho",   esp:"Anestesiologia",    cidade:"São Paulo",      vinculos:3, meses:52, fase:3},
  {id:2,nome:"Dra. Maria Eugênia",  esp:"Medicina Intensiva", cidade:"Rio de Janeiro", vinculos:4, meses:60, fase:2},
  {id:3,nome:"Dr. Carlos Meireles", esp:"Cardiologia",        cidade:"Belo Horizonte", vinculos:2, meses:36, fase:1},
  {id:4,nome:"Dra. Fernanda Lopes", esp:"Clínica Médica",     cidade:"Porto Alegre",   vinculos:2, meses:48, fase:0},
  {id:5,nome:"Dr. Roberto Alves",   esp:"Cirurgia Geral",     cidade:"Salvador",       vinculos:3, meses:55, fase:4},
];
const FASES = [
  {l:"Não contatado", c:T.muted},
  {l:"Mensagem enviada", c:T.blue},
  {l:"Respondeu", c:T.purple},
  {l:"Reunião confirmada", c:T.amber},
  {l:"Contrato fechado", c:T.green},
];

function Prospeccao({ onBack }) {
  const [sel,setSel]   = useState(MEDICOS[0]);
  const [conv,setConv] = useState([]);
  const [inp,setInp]   = useState("");
  const [load,setLoad] = useState(false);
  const [sub,setSub]   = useState("wa");
  const chatRef = useRef(null);

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop=9999; },[conv,load]);

  const disparar = () => {
    const cr=calcCred(sel.vinculos,sel.meses);
    const h=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    setConv([{de:"bot",t:h,msg:`Prezado(a) ${sel.nome},\n\nMeu nome é Rafael Mendes. Sou especialista em recuperação de INSS patronal para médicos.\n\nMédicos que atuam em mais de um vínculo frequentemente recolhem acima do teto legal de R$ 7.786,02 — o excesso é um crédito junto à Receita Federal.\n\nCom ${sel.vinculos} vínculos, a estimativa preliminar para o seu caso é de ${fmt(cr.total)}.\n\nPoderia dedicar 20 minutos para que eu apresente o diagnóstico completo, sem custo?`}]);
  };

  const enviar = async () => {
    if(!inp.trim()||load) return;
    const cr=calcCred(sel.vinculos,sel.meses);
    const h=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    const msgs=[...conv,{de:"med",t:h,msg:inp}];
    setConv(msgs); setInp(""); setLoad(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:400,
          system:`Você é Rafael Mendes, consultor tributário especializado em recuperação de INSS patronal para médicos. Está em uma conversa via WhatsApp com ${sel.nome}, ${sel.esp}, que atua em ${sel.vinculos} vínculos. O crédito estimado é ${fmt(cr.total)}. Seu objetivo é agendar uma reunião de 20 minutos. Use linguagem profissional e direta, sem excessos. Responda em no máximo 3 parágrafos curtos. Português formal.`,
          messages:msgs.map(m=>({role:m.de==="bot"?"assistant":"user",content:m.msg})),
        }),
      });
      const d=await res.json();
      const h2=new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      setConv([...msgs,{de:"bot",t:h2,msg:d.content?.[0]?.text||"Compreendido. Retorno em breve."}]);
    } catch {
      setConv([...msgs,{de:"bot",t:"--",msg:"Problema de conexão. Tentarei novamente em instantes."}]);
    }
    setLoad(false);
  };

  const cr=calcCred(sel.vinculos,sel.meses);

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:F}}>
      <TopBar title="Prospecção & IA" sub="WhatsApp · Agente · Automação" accentColor={T.green} onBack={onBack}
        nav={{options:[["wa","WhatsApp"],["arq","Hospedagem"],["flow","Workflow n8n"]],active:sub,onChange:setSub,accentColor:T.green}}
      />

      {sub==="wa" && (
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Lista */}
          <div style={{width:268,borderRight:`1px solid ${T.border}`,background:T.surface,display:"flex",flexDirection:"column"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.bg}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:T.muted,textTransform:"uppercase"}}>Conversas ativas</div>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {MEDICOS.map(m=>{
                const f=FASES[m.fase]; const cr2=calcCred(m.vinculos,m.meses);
                const isSel=sel.id===m.id;
                return (
                  <div key={m.id} onClick={()=>{setSel(m);setConv([]);}}
                    style={{
                      padding:"12px 16px", borderBottom:`1px solid ${T.dim}`,
                      cursor:"pointer",
                      background:isSel?"#f0f7ff":T.surface,
                      borderLeft:`3px solid ${isSel?T.blue:"transparent"}`,
                      transition:"all .12s",
                    }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                      <div style={{fontSize:12,fontWeight:600,color:T.navy,letterSpacing:"-0.01em"}}>{m.nome}</div>
                      <Badge color={f.c} bg={f.c+"12"}>{f.l}</Badge>
                    </div>
                    <div style={{fontSize:11,color:T.textLt,marginBottom:5}}>{m.esp}</div>
                    <div style={{fontSize:12,fontWeight:700,color:T.green,fontFamily:"'Courier New',monospace"}}>{fmt(cr2.total)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat */}
          <div style={{flex:1,display:"flex",flexDirection:"column",background:"#f7f9fb"}}>
            {/* Header chat */}
            <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.border}`,background:T.surface,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:T.navy}}>{sel.nome}</div>
                <div style={{fontSize:11,color:T.textLt}}>{sel.esp} · {sel.cidade} · {sel.vinculos} vínculos</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:700,color:T.green,fontFamily:"'Courier New',monospace"}}>{fmt(cr.total)}</div>
                <div style={{fontSize:10,color:T.muted}}>Crédito estimado · Hon. {fmt(cr.hon)}</div>
              </div>
            </div>

            {/* Mensagens */}
            <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:10}}>
              {conv.length===0 && (
                <div style={{textAlign:"center",marginTop:60,color:T.muted}}>
                  <div style={{fontSize:32,marginBottom:12,opacity:.3}}>◉</div>
                  <div style={{fontSize:13,fontWeight:500}}>Clique em "Iniciar disparo" para enviar a primeira mensagem.</div>
                </div>
              )}
              {conv.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.de==="bot"?"flex-start":"flex-end"}}>
                  <div style={{
                    maxWidth:"68%",padding:"10px 14px",borderRadius:4,
                    borderTopLeftRadius:m.de==="bot"?0:4,
                    borderTopRightRadius:m.de==="med"?0:4,
                    background:m.de==="bot"?T.surface:T.navy,
                    border:m.de==="bot"?`1px solid ${T.border}`:"none",
                    boxShadow:T.sh,
                  }}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",
                      color:m.de==="bot"?T.blue:"rgba(255,255,255,.45)",marginBottom:5}}>
                      {m.de==="bot"?"MedINSS · Agente":sel.nome.split(" ").slice(0,2).join(" ")}
                    </div>
                    <div style={{fontSize:13,color:m.de==="bot"?T.text:"#fff",lineHeight:1.65,whiteSpace:"pre-wrap"}}>{m.msg}</div>
                    <div style={{fontSize:9,color:m.de==="bot"?T.muted:"rgba(255,255,255,.35)",textAlign:"right",marginTop:5}}>
                      {m.t}{m.de==="bot"?" · Lido":""}
                    </div>
                  </div>
                </div>
              ))}
              {load && (
                <div style={{display:"flex",gap:4,padding:"10px 14px",background:T.surface,borderRadius:4,width:"fit-content",border:`1px solid ${T.border}`,boxShadow:T.sh}}>
                  {[0,1,2].map(d=><div key={d} style={{width:6,height:6,borderRadius:"50%",background:T.slateL,animation:`dots 1.2s ${d*.2}s ease-in-out infinite`}}/>)}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{padding:"14px 20px",borderTop:`1px solid ${T.border}`,background:T.surface,display:"flex",gap:10,alignItems:"center"}}>
              <Btn onClick={disparar} variant="success" style={{flexShrink:0}}>Iniciar disparo</Btn>
              <input value={inp} onChange={e=>setInp(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&enviar()}
                placeholder={`Simule resposta de ${sel.nome.split(" ").slice(0,2).join(" ")}...`}
                style={{flex:1,padding:"9px 12px",borderRadius:4,border:`1px solid ${T.border}`,background:T.bg,color:T.text,fontSize:13,fontFamily:F}}/>
              <Btn onClick={enviar} style={{flexShrink:0, padding:"9px 20px"}}>Enviar</Btn>
            </div>
          </div>

          {/* Painel direito */}
          <div style={{width:224,borderLeft:`1px solid ${T.border}`,background:T.surface,overflowY:"auto"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,background:T.bg}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:T.muted,textTransform:"uppercase"}}>Diagnóstico</div>
            </div>
            <div style={{padding:"16px"}}>
              {[
                {l:"Excesso mensal",   v:fmt(cr.exc),   c:T.blue},
                {l:"Crédito bruto",    v:fmt(cr.bruto), c:T.slate},
                {l:"Correção SELIC",   v:fmt(cr.selic), c:T.slate},
                {l:"Total estimado",   v:fmt(cr.total), c:T.green, big:true},
                {l:"Honorários 25%",   v:fmt(cr.hon),   c:T.amber},
              ].map((r,i)=>(
                <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:r.big?`1px solid ${T.border}`:"none"}}>
                  <div style={{fontSize:10,color:T.muted,letterSpacing:"0.04em",marginBottom:3}}>{r.l}</div>
                  <div style={{fontSize:r.big?15:12,fontWeight:r.big?700:500,color:r.c,fontFamily:"'Courier New',monospace"}}>{r.v}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"0 16px 16px"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:T.muted,textTransform:"uppercase",marginBottom:10}}>Automação</div>
              {[
                {l:"Disparo Dia 1",  ok:conv.length>0},
                {l:"Follow-up Dia 3",ok:false},
                {l:"Follow-up Dia 7",ok:false},
                {l:"IA ativa 24h",   ok:true},
                {l:"Google Calendar",ok:sel.fase>=3},
              ].map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.dim}`}}>
                  <span style={{fontSize:11,color:T.textMd}}>{a.l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:a.ok?T.green:T.muted}}>{a.ok?"Ativo":"Pendente"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub==="arq" && (
        <div style={{flex:1,overflowY:"auto",padding:32}}>
          <div style={{fontSize:20,fontWeight:700,color:T.navy,letterSpacing:"-0.02em",marginBottom:4}}>Arquitetura de Hospedagem</div>
          <div style={{fontSize:13,color:T.textLt,marginBottom:28}}>Infraestrutura completa para operação. Custo mensal estimado: R$ 287</div>
          {[
            {t:"Vercel",            sub:"Hospedagem do CRM React",     d:"Deploy automático via GitHub. URL pública em menos de 2 minutos.", c:T.blue,  v:"Gratuito"},
            {t:"Z-API",             sub:"Integração WhatsApp Business", d:"Vincula seu número real. Configuração única via QR Code.",         c:T.green, v:"R$ 97/mês"},
            {t:"n8n Cloud",         sub:"Orquestração de automações",   d:"Workflow visual sem código. Gerencia toda a sequência de disparos.",c:T.amber, v:"~R$ 100/mês"},
            {t:"Claude API",        sub:"Motor de inteligência artificial",d:"Respostas personalizadas em tempo real. Custo por uso.",         c:T.slate, v:"~R$ 50/mês"},
            {t:"Google Calendar API",sub:"Agendamento automático",      d:"Cria eventos com link Meet e envia convites ao médico.",           c:T.red,   v:"Gratuito"},
          ].map((b,i)=>(
            <Card key={i} style={{display:"flex",gap:20,alignItems:"center",marginBottom:10,padding:"16px 20px"}}>
              <div style={{width:3,height:36,borderRadius:2,background:b.c,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:T.navy,marginBottom:2}}>{b.t} <span style={{fontSize:11,fontWeight:400,color:T.textLt}}>— {b.sub}</span></div>
                <div style={{fontSize:12,color:T.textLt}}>{b.d}</div>
              </div>
              <Badge color={b.c} bg={b.c+"12"}>{b.v}</Badge>
            </Card>
          ))}
        </div>
      )}

      {sub==="flow" && (
        <div style={{flex:1,overflowY:"auto",padding:32}}>
          <div style={{fontSize:20,fontWeight:700,color:T.navy,letterSpacing:"-0.02em",marginBottom:4}}>Workflow n8n — Sequência automática</div>
          <div style={{fontSize:13,color:T.textLt,marginBottom:28}}>Cada médico percorre este fluxo sem intervenção manual</div>
          {[
            {n:"01",t:"Cron diário 08:00",   d:"Executa diariamente no horário de Brasília. Verifica quem está no prazo de Dia 1, 3 ou 7."},
            {n:"02",t:"Consulta à base",     d:"Filtra médicos elegíveis para contato no Supabase. Recupera histórico e dados do perfil."},
            {n:"03",t:"Geração de mensagem", d:"Claude API personaliza o texto com nome, especialidade, cidade e crédito estimado do médico."},
            {n:"04",t:"Envio via Z-API",     d:"Mensagem disparada para o número real do médico via API do WhatsApp."},
            {n:"05",t:"Webhook de resposta", d:"Z-API notifica o n8n em tempo real sempre que o médico responde."},
            {n:"06",t:"Classificação de intenção",d:"IA analisa a resposta: interesse, dúvida, objeção ou solicitação de horário."},
            {n:"07",t:"Agendamento Google", d:"Quando horário é confirmado, cria evento no Calendar com link Meet e envia convite ao médico."},
          ].map((n,i,arr)=>(
            <div key={i} style={{display:"flex",gap:0,alignItems:"stretch"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:40,flexShrink:0}}>
                <div style={{width:28,height:28,borderRadius:3,background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0,marginTop:10}}>{n.n}</div>
                {i<arr.length-1 && <div style={{flex:1,width:1,background:T.border,margin:"4px 0"}}/>}
              </div>
              <div style={{flex:1,padding:"10px 0 22px 16px"}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:4}}>{n.t}</div>
                <div style={{fontSize:12,color:T.textLt,lineHeight:1.6}}>{n.d}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CRM
══════════════════════════════════════════════════════ */
const LEADS = [
  {id:1,nome:"Dr. João Carvalho",esp:"Anestesiologia",cidade:"São Paulo",uf:"SP",
   cpf:"123.456.789-00",crm2:"CRM/SP 123456",email:"joao@email.com",tel:"(11) 99901-0001",
   vinculos:3,meses:52,col:"reuniao",nps:null,contratoAssinado:false,
   conv:[{de:"bot",msg:"Prezado Dr. Carvalho, atua em mais de um hospital simultaneamente?"},{de:"med",msg:"Sim, três hospitais."},{de:"bot",msg:"Com 3 vínculos, o crédito estimado é de R$ 93.000. Posso apresentar o diagnóstico em 20 minutos?"}],
   docs:{holerites:false,cnis:false,rg:false,cpfDoc:false,compEndereco:false,procuracao:false},
   tarefas:[],financeiro:null},
  {id:2,nome:"Dra. Maria Eugênia Costa",esp:"Medicina Intensiva",cidade:"Rio de Janeiro",uf:"RJ",
   cpf:"987.654.321-00",crm2:"CRM/RJ 654321",email:"maria@email.com",tel:"(21) 98802-0002",
   vinculos:4,meses:60,col:"proposta",nps:null,contratoAssinado:false,
   conv:[{de:"bot",msg:"Prezada Dra. Costa, com 4 vínculos o crédito estimado é R$ 140.000."},{de:"med",msg:"Como funciona o processo?"}],
   docs:{holerites:false,cnis:false,rg:false,cpfDoc:false,compEndereco:false,procuracao:false},
   tarefas:[],financeiro:null},
  {id:3,nome:"Dr. Roberto Alves",esp:"Cirurgia Geral",cidade:"Salvador",uf:"BA",
   cpf:"555.666.777-88",crm2:"CRM/BA 555666",email:"roberto@email.com",tel:"(71) 95505-0005",
   vinculos:3,meses:55,col:"execucao",nps:9,contratoAssinado:true,
   conv:[{de:"med",msg:"Tenho interesse. Pode enviar o contrato?"},{de:"bot",msg:"Contrato enviado. Aguardo assinatura."}],
   docs:{holerites:true,cnis:true,rg:true,cpfDoc:true,compEndereco:false,procuracao:false},
   tarefas:[
     {id:"t1",label:"Coleta de documentos",feito:true,data:"12/05/2025"},
     {id:"t2",label:"Análise CNIS e holerites",feito:true,data:"14/05/2025"},
     {id:"t3",label:"Relatório de crédito emitido",feito:true,data:"15/05/2025"},
     {id:"t4",label:"PER/DCOMP protocolado",feito:false,data:null},
     {id:"t5",label:"Acompanhamento Receita Federal",feito:false,data:null},
     {id:"t6",label:"Restituição recebida",feito:false,data:null},
   ],
   financeiro:{creditoTotal:98000,honorarios:24500,impostos:2205,advogado:3675,operacional:800,lucro:17820,status:"Em andamento"}},
  {id:4,nome:"Dra. Juliana Castro",esp:"Anestesiologia",cidade:"Brasília",uf:"DF",
   cpf:"222.333.444-55",crm2:"CRM/DF 121212",email:"juliana@email.com",tel:"(61) 92208-0008",
   vinculos:4,meses:58,col:"sucesso",nps:10,contratoAssinado:true,
   conv:[{de:"med",msg:"Recebi a restituição. Muito obrigada pelo trabalho."}],
   docs:{holerites:true,cnis:true,rg:true,cpfDoc:true,compEndereco:true,procuracao:true},
   tarefas:[
     {id:"t1",label:"Coleta de documentos",feito:true,data:"03/04/2025"},
     {id:"t2",label:"Análise CNIS e holerites",feito:true,data:"05/04/2025"},
     {id:"t3",label:"Relatório de crédito emitido",feito:true,data:"06/04/2025"},
     {id:"t4",label:"PER/DCOMP protocolado",feito:true,data:"10/04/2025"},
     {id:"t5",label:"Acompanhamento Receita Federal",feito:true,data:"20/04/2025"},
     {id:"t6",label:"Restituição recebida",feito:true,data:"02/05/2025"},
   ],
   financeiro:{creditoTotal:132000,honorarios:33000,impostos:2970,advogado:4950,operacional:800,lucro:24280,status:"Concluído"}},
];

const COLUNAS = [
  {id:"contato", l:"Contato",          c:T.muted},
  {id:"reuniao", l:"Reunião",           c:T.blue},
  {id:"proposta",l:"Proposta enviada",  c:T.amber},
  {id:"execucao",l:"Em execução",       c:T.purple},
  {id:"sucesso", l:"Concluído",         c:T.green},
];

const DOCS_MAP = {
  holerites:    "Holerites — últimos 5 anos (todos os vínculos)",
  cnis:         "Extrato CNIS via gov.br",
  rg:           "Documento de identidade (RG ou CNH)",
  cpfDoc:       "CPF",
  compEndereco: "Comprovante de residência",
  procuracao:   "Procuração — necessária para ação judicial",
};

const TAR_PADRAO = [
  "Coleta e conferência de documentos",
  "Análise CNIS e holerites",
  "Relatório de crédito emitido",
  "Reunião de validação e assinatura",
  "PER/DCOMP protocolado (via administrativa)",
  "Distribuição da ação judicial (se aplicável)",
  "Acompanhamento Receita Federal",
  "Decisão / sentença obtida",
  "Restituição recebida pelo cliente",
  "Honorários liquidados e distribuídos",
];

function LeadModal({ lead, onClose, onUpdate }) {
  const cr = calcCred(lead.vinculos, lead.meses);
  const [aba,setAba]     = useState("hist");
  const [docs,setDocs]   = useState({...lead.docs});
  const [tars,setTars]   = useState(lead.tarefas.length ? lead.tarefas : TAR_PADRAO.map((l,i)=>({id:"t"+i,label:l,feito:false,data:null})));
  const [contrato,setCont] = useState("");
  const [loadC,setLoadC] = useState(false);
  const [resumo,setRes]  = useState("");
  const [loadR,setLoadR] = useState(false);

  const toggleDoc = k => { const nd={...docs,[k]:!docs[k]}; setDocs(nd); onUpdate({...lead,docs:nd}); };
  const toggleT   = id => {
    const nt=tars.map(t=>t.id===id?{...t,feito:!t.feito,data:!t.feito?dt():null}:t);
    setTars(nt); onUpdate({...lead,tarefas:nt});
  };

  const gerarContrato = async () => {
    setLoadC(true); setAba("contrato");
    const r = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,
        system:"Você é advogado especialista em direito tributário. Redija um contrato de prestação de serviços de honorários de êxito para recuperação de INSS. Formal, completo, com todas as cláusulas necessárias para segurança jurídica de ambas as partes (objeto, remuneração, prazo, obrigações das partes, rescisão, foro). Use linguagem jurídica precisa em português.",
        messages:[{role:"user",content:`Dados do contrato:\nContratante: ${lead.nome}\nCPF: ${lead.cpf}\nInscrição profissional: ${lead.crm2}\nEndereço: ${lead.cidade}/${lead.uf}\nE-mail: ${lead.email} | Tel: ${lead.tel}\nContratada: MedINSS Consultoria Tributária Ltda | CNPJ: XX.XXX.XXX/0001-XX\nObjeto: Recuperação de INSS patronal pago acima do teto legal (Art. 28, Lei 8.212/91, IN RFB 971/2009)\nCrédito estimado: ${fmt(cr.total)} (sujeito a apuração definitiva)\nHonorários: 25% (vinte e cinco por cento) do valor efetivamente recuperado\nCondição de pagamento: somente após recebimento pelo contratante\nData: ${dt()}`}]})});
    const d=await r.json(); setCont(d.content?.[0]?.text||"Erro ao gerar."); setLoadC(false);
  };

  const gerarResumo = async () => {
    setLoadR(true);
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
        system:"Analise o histórico de conversa e produza um relatório executivo com: 1) Síntese da conversa (3 linhas), 2) Pontos de interesse identificados, 3) Objeções ou dúvidas levantadas, 4) Próximos passos recomendados. Use formato de tópicos. Português formal e objetivo.",
        messages:[{role:"user",content:`Médico: ${lead.nome} | ${lead.esp} | ${lead.vinculos} vínculos | Crédito estimado: ${fmt(cr.total)}\n\nHistórico:\n${lead.conv.map(m=>`${m.de==="bot"?"Consultor":"Médico"}: ${m.msg}`).join("\n")}`}]})});
    const d=await r.json(); setRes(d.content?.[0]?.text||"Erro."); setLoadR(false);
  };

  const progDoc = Object.values(docs).filter(Boolean).length;
  const progTar = tars.length ? tars.filter(t=>t.feito).length/tars.length*100 : 0;
  const ABAS = [{id:"hist",l:"Histórico"},{id:"docs",l:"Documentos"},{id:"tarefas",l:"Pipeline"},{id:"contrato",l:"Contrato"},{id:"fin",l:"Financeiro"}];

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:T.surface, border:`1px solid ${T.border}`, borderRadius:6,
        width:740, maxHeight:"92vh", overflowY:"auto", boxShadow:T.shLg,
      }}>
        {/* Header do modal */}
        <div style={{padding:"20px 24px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:T.navy,letterSpacing:"-0.02em",marginBottom:2}}>{lead.nome}</div>
            <div style={{fontSize:12,color:T.textLt}}>{lead.esp} · {lead.cidade}/{lead.uf} · {lead.crm2}</div>
          </div>
          <button onClick={onClose} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:4,color:T.textLt,cursor:"pointer",width:30,height:30,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F,flexShrink:0}}>✕</button>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,borderBottom:`1px solid ${T.border}`}}>
          {[
            {l:"Crédito estimado",v:fmt(cr.total),c:T.green},
            {l:"Honorários (25%)",v:fmt(cr.hon),c:T.amber},
            {l:"Vínculos",        v:lead.vinculos+" empreg.",c:T.navy},
            {l:"Prazo analisado", v:lead.meses+" meses",c:T.navy},
          ].map((s,i)=>(
            <div key={i} style={{padding:"14px 18px",borderRight:i<3?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:10,color:T.muted,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:5}}>{s.l}</div>
              <div style={{fontSize:15,fontWeight:700,color:s.c,fontFamily:"'Courier New',monospace"}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border}`,background:T.bg}}>
          {ABAS.map(a=>(
            <button key={a.id} onClick={()=>setAba(a.id)} style={{
              padding:"10px 18px",fontSize:12,fontWeight:600,fontFamily:F,
              background:"transparent",border:"none",cursor:"pointer",
              borderBottom:`2px solid ${aba===a.id?T.navy:"transparent"}`,
              color:aba===a.id?T.navy:T.slateL,transition:"all .15s",
            }}>{a.l}</button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        <div style={{padding:"24px"}}>

          {aba==="hist" && (
            <div>
              <div style={{background:T.bg,borderRadius:4,border:`1px solid ${T.border}`,padding:16,maxHeight:240,overflowY:"auto",marginBottom:16}}>
                {lead.conv.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.de==="bot"?"flex-start":"flex-end",marginBottom:10}}>
                    <div style={{
                      maxWidth:"76%",padding:"9px 13px",borderRadius:4,
                      borderTopLeftRadius:m.de==="bot"?0:4, borderTopRightRadius:m.de==="med"?0:4,
                      background:m.de==="bot"?T.surface:T.navy,
                      border:m.de==="bot"?`1px solid ${T.border}`:"none",
                      boxShadow:T.sh,
                    }}>
                      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:m.de==="bot"?T.blue:"rgba(255,255,255,.4)",marginBottom:4}}>
                        {m.de==="bot"?"Consultor MedINSS":lead.nome.split(" ").slice(0,2).join(" ")}
                      </div>
                      <div style={{fontSize:12,color:m.de==="bot"?T.text:"#fff",lineHeight:1.6}}>{m.msg}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!resumo && (
                <Btn variant="outline" onClick={gerarResumo} disabled={loadR}>
                  {loadR?"Analisando conversa...":"Gerar análise IA da conversa"}
                </Btn>
              )}
              {resumo && (
                <div style={{background:T.blueBg,border:`1px solid ${T.blueBd}`,borderRadius:4,padding:16,marginTop:12}}>
                  <Label style={{color:T.blue}}>Análise IA — Relatorio executivo</Label>
                  <div style={{fontSize:12,color:T.textMd,lineHeight:1.75,whiteSpace:"pre-line"}}>{resumo}</div>
                </div>
              )}
            </div>
          )}

          {aba==="docs" && (
            <div>
              <div style={{fontSize:13,color:T.textLt,marginBottom:16,lineHeight:1.6}}>
                Clique para registrar o recebimento de cada documento. O progresso é salvo automaticamente.
              </div>
              {Object.entries(DOCS_MAP).map(([k,label])=>(
                <Check key={k} checked={docs[k]} onClick={()=>toggleDoc(k)} label={label}/>
              ))}
              <div style={{marginTop:16,padding:"10px 14px",borderRadius:4,background:T.bg,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:T.textMd}}>Documentação recebida</span>
                <span style={{fontSize:13,fontWeight:700,color:T.green}}>{progDoc} / {Object.keys(docs).length}</span>
              </div>
            </div>
          )}

          {aba==="tarefas" && (
            <div>
              <div style={{fontSize:13,color:T.textLt,marginBottom:16}}>Pipeline de execução pós-contrato. Clique para marcar como concluído.</div>
              {tars.map(t=>(
                <Check key={t.id} checked={t.feito} onClick={()=>toggleT(t.id)} label={t.label}/>
              ))}
              <div style={{marginTop:16}}>
                <ProgressBar pct={progTar} color={T.green} height={6}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  <span style={{fontSize:11,color:T.textLt}}>{tars.filter(t=>t.feito).length} de {tars.length} etapas concluídas</span>
                  <span style={{fontSize:11,fontWeight:600,color:T.green}}>{progTar.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}

          {aba==="contrato" && (
            <div>
              {!contrato && !loadC && (
                <div style={{textAlign:"center",padding:"40px 20px"}}>
                  <div style={{fontSize:40,marginBottom:16,opacity:.2,color:T.navy}}>§</div>
                  <div style={{fontSize:16,fontWeight:600,color:T.navy,marginBottom:8}}>Contrato de Honorários de Êxito</div>
                  <div style={{fontSize:13,color:T.textLt,maxWidth:380,margin:"0 auto 24px",lineHeight:1.7}}>
                    Gera um contrato completo com dados do cliente, crédito estimado, honorários e cláusulas de segurança jurídica para ambas as partes.
                  </div>
                  <Btn variant="amber" onClick={gerarContrato} style={{padding:"10px 28px",fontSize:14}}>
                    Gerar contrato
                  </Btn>
                </div>
              )}
              {loadC && <div style={{textAlign:"center",padding:40,fontSize:14,color:T.textLt}}>Redigindo contrato — aguarde...</div>}
              {contrato && (
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    <Btn variant="outline" small onClick={()=>navigator.clipboard?.writeText(contrato)}>Copiar texto</Btn>
                    <Btn variant="outline" small onClick={gerarContrato} color={T.muted}>Regenerar</Btn>
                  </div>
                  <div style={{
                    background:"#fafafa",border:`1px solid ${T.border}`,borderRadius:4,
                    padding:"20px 24px",fontFamily:"Georgia, 'Times New Roman', serif",
                    fontSize:12.5,lineHeight:2,color:T.text,maxHeight:400,overflowY:"auto",whiteSpace:"pre-wrap",
                  }}>{contrato}</div>
                </div>
              )}
            </div>
          )}

          {aba==="fin" && (
            <div>
              {lead.financeiro ? (
                <div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border,borderRadius:4,overflow:"hidden",marginBottom:20}}>
                    {[
                      {l:"Crédito recuperado",v:fmt(lead.financeiro.creditoTotal),c:T.green,bg:T.greenBg},
                      {l:"Honorários brutos (25%)",v:fmt(lead.financeiro.honorarios),c:T.amber,bg:T.amberBg},
                      {l:"Lucro líquido empresa",v:fmt(lead.financeiro.lucro),c:T.green,bg:T.greenBg},
                    ].map((r,i)=>(
                      <div key={i} style={{padding:"16px 20px",background:r.bg}}>
                        <div style={{fontSize:10,color:T.muted,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:6}}>{r.l}</div>
                        <div style={{fontSize:18,fontWeight:700,color:r.c,fontFamily:"'Courier New',monospace"}}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  <Label>Distribuição dos honorários</Label>
                  {[
                    {l:"ISS e outros impostos (~9%)",v:fmt(lead.financeiro.impostos),pct:9,  c:T.red},
                    {l:"Advogado parceiro (15%)",   v:fmt(lead.financeiro.advogado),pct:15, c:T.blue},
                    {l:"Custo operacional",          v:fmt(lead.financeiro.operacional),pct:3,c:T.slateL},
                    {l:"Lucro líquido empresa",      v:fmt(lead.financeiro.lucro),pct:73,   c:T.green},
                  ].map((r,i)=>(
                    <div key={i} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:12,color:T.textMd}}>{r.l}</span>
                        <div style={{display:"flex",gap:16}}>
                          <span style={{fontSize:12,fontWeight:600,color:r.c,fontFamily:"'Courier New',monospace"}}>{r.v}</span>
                          <span style={{fontSize:11,color:T.muted,width:28,textAlign:"right"}}>{r.pct}%</span>
                        </div>
                      </div>
                      <ProgressBar pct={r.pct} color={r.c} height={3}/>
                    </div>
                  ))}
                  <div style={{marginTop:16,padding:"10px 14px",borderRadius:4,background:T.bg,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:12,color:T.textMd}}>Status do processo</span>
                    <Badge color={lead.financeiro.status==="Concluído"?T.green:T.amber} bg={lead.financeiro.status==="Concluído"?T.greenBg:T.amberBg}>
                      {lead.financeiro.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:"center",padding:"48px 20px",color:T.textLt}}>
                  <div style={{fontSize:32,opacity:.15,marginBottom:16,color:T.navy}}>$</div>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>Painel disponível após assinatura do contrato</div>
                  <div style={{fontSize:12}}>Crédito estimado: <strong style={{color:T.green}}>{fmt(cr.total)}</strong> · Honorários: <strong style={{color:T.amber}}>{fmt(cr.hon)}</strong></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CRM({ onBack }) {
  const [leads,setLeads] = useState(LEADS);
  const [open,setOpen]   = useState(null);
  const [aba,setAba]     = useState("kanban");

  const upd = u => { setLeads(p=>p.map(l=>l.id===u.id?u:l)); setOpen(u); };

  const totalCred = leads.reduce((s,l)=>s+calcCred(l.vinculos,l.meses).total,0);
  const totalHon  = leads.reduce((s,l)=>s+calcCred(l.vinculos,l.meses).hon,0);
  const fechados  = leads.filter(l=>l.col==="sucesso").length;

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:F}}>
      <TopBar title="CRM & Gestão" sub="Kanban · Contratos · Financeiro · Customer Success" accentColor={T.amber} onBack={onBack}
        nav={{options:[["kanban","Kanban"],["fin","Financeiro"],["cs","Customer Success"]],active:aba,onChange:setAba}}
      />

      <StatStrip items={[
        {l:"Leads",              v:leads.length,                               c:T.navy},
        {l:"Pipeline crédito",   v:fmt(totalCred),                             c:T.green},
        {l:"Honorários potenc.", v:fmt(totalHon),                              c:T.amber},
        {l:"Concluídos",         v:fechados,                                   c:T.green},
        {l:"Conversão",          v:(fechados/leads.length*100).toFixed(0)+"%", c:T.navy},
      ]}/>

      {aba==="kanban" && (
        <div style={{flex:1,display:"flex",gap:1,padding:"20px 16px",overflowX:"auto",overflowY:"hidden",background:T.border}}>
          {COLUNAS.map(col=>{
            const cl=leads.filter(l=>l.col===col.id);
            return (
              <div key={col.id} style={{
                width:234, minWidth:234, display:"flex", flexDirection:"column",
                background:T.bg, flexShrink:0,
              }}>
                {/* Cabeçalho da coluna */}
                <div style={{padding:"10px 14px",background:T.surface,borderBottom:`2px solid ${col.c}`,marginBottom:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:700,color:T.navy,letterSpacing:"-0.01em"}}>{col.l}</span>
                    <span style={{fontSize:11,fontWeight:700,color:col.c,background:col.c+"12",padding:"1px 7px",borderRadius:2}}>{cl.length}</span>
                  </div>
                  {cl.length>0 && <div style={{fontSize:10,color:T.muted,fontFamily:"'Courier New',monospace"}}>{fmt(cl.reduce((s,l)=>s+calcCred(l.vinculos,l.meses).total,0))}</div>}
                </div>

                {/* Cards */}
                <div style={{flex:1,overflowY:"auto",padding:"6px",display:"flex",flexDirection:"column",gap:4}}>
                  {cl.map(l=>{
                    const cr2=calcCred(l.vinculos,l.meses);
                    const tp=l.tarefas.filter(t=>t.feito).length, tt=l.tarefas.length;
                    return (
                      <div key={l.id} onClick={()=>setOpen(l)} style={{
                        background:T.surface,
                        border:`1px solid ${T.border}`,
                        borderLeft:`3px solid ${l.nps>=9?T.green:l.contratoAssinado?T.amber:col.c}`,
                        borderRadius:4,padding:13,cursor:"pointer",
                        boxShadow:T.sh,transition:"box-shadow .12s",
                      }}>
                        <div style={{fontSize:12,fontWeight:600,color:T.navy,marginBottom:2,letterSpacing:"-0.01em"}}>{l.nome}</div>
                        <div style={{fontSize:10,color:T.textLt,marginBottom:8}}>{l.esp} · {l.cidade}</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:tt>0?8:0}}>
                          <span style={{fontSize:13,fontWeight:700,color:T.green,fontFamily:"'Courier New',monospace"}}>{fmt(cr2.total)}</span>
                          <span style={{fontSize:10,color:T.amber,fontFamily:"'Courier New',monospace"}}>{fmt(cr2.hon)}</span>
                        </div>
                        {tt>0 && (
                          <div>
                            <ProgressBar pct={tp/tt*100} color={col.c} height={2}/>
                            <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                              {l.contratoAssinado && <Badge color={T.green} bg={T.greenBg}>Contrato</Badge>}
                              <Badge color={T.slateL} bg={T.bg}>{tp}/{tt} etapas</Badge>
                              {l.nps!==null && <Badge color={l.nps>=9?T.green:T.amber} bg={l.nps>=9?T.greenBg:T.amberBg}>NPS {l.nps}</Badge>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {cl.length===0 && <div style={{textAlign:"center",padding:"24px 10px",color:T.muted,fontSize:11}}>Sem registros</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {aba==="fin" && (
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{fontSize:20,fontWeight:700,color:T.navy,letterSpacing:"-0.02em",marginBottom:24}}>Painel Financeiro</div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border,borderRadius:4,overflow:"hidden",marginBottom:24,boxShadow:T.sh}}>
            {[
              {l:"Pipeline total de créditos",v:fmt(totalCred),c:T.green,bg:T.greenBg},
              {l:"Honorários potenciais",v:fmt(totalHon),c:T.amber,bg:T.amberBg},
              {l:"Lucro líquido realizado",v:fmt(leads.filter(l=>l.financeiro).reduce((s,l)=>s+(l.financeiro?.lucro||0),0)),c:T.green,bg:T.greenBg},
            ].map((s,i)=>(
              <div key={i} style={{padding:"20px 24px",background:s.bg}}>
                <div style={{fontSize:10,fontWeight:600,color:T.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>{s.l}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"'Courier New',monospace"}}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:4,overflow:"hidden",boxShadow:T.sh}}>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",padding:"10px 16px",background:T.bg,borderBottom:`1px solid ${T.border}`}}>
              {["Cliente","Crédito total","Honorários","Status"].map((h,i)=>(
                <div key={i} style={{fontSize:10,fontWeight:700,color:T.muted,letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</div>
              ))}
            </div>
            {leads.map((l,i)=>{
              const cr2=calcCred(l.vinculos,l.meses);
              return (
                <div key={l.id} onClick={()=>setOpen(l)} style={{
                  display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",
                  padding:"13px 16px",borderBottom:`1px solid ${T.dim}`,
                  background:i%2===0?T.surface:"#fafbfd",
                  cursor:"pointer",transition:"background .1s",
                }}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500,color:T.navy}}>{l.nome}</div>
                    <div style={{fontSize:10,color:T.textLt}}>{l.esp}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:T.green,fontFamily:"'Courier New',monospace"}}>{fmt(l.financeiro?.creditoTotal||cr2.total)}</div>
                  <div style={{fontSize:13,color:T.amber,fontFamily:"'Courier New',monospace"}}>{fmt(l.financeiro?.honorarios||cr2.hon)}</div>
                  <div><Badge color={l.financeiro?.status==="Concluído"?T.green:l.financeiro?T.amber:T.muted} bg={l.financeiro?.status==="Concluído"?T.greenBg:l.financeiro?T.amberBg:T.bg}>{l.financeiro?.status||"Estimado"}</Badge></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {aba==="cs" && (
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{fontSize:20,fontWeight:700,color:T.navy,letterSpacing:"-0.02em",marginBottom:24}}>Customer Success</div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:T.border,borderRadius:4,overflow:"hidden",marginBottom:24,boxShadow:T.sh}}>
            {[
              {l:"Promotores (NPS 9–10)",v:leads.filter(l=>l.nps>=9).length,c:T.green,bg:T.greenBg},
              {l:"Neutros (NPS 7–8)",v:leads.filter(l=>l.nps>=7&&l.nps<9).length,c:T.amber,bg:T.amberBg},
              {l:"Sem avaliação",v:leads.filter(l=>l.nps===null).length,c:T.muted,bg:T.bg},
            ].map((s,i)=>(
              <div key={i} style={{padding:"20px 24px",background:s.bg}}>
                <div style={{fontSize:10,fontWeight:600,color:T.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>{s.l}</div>
                <div style={{fontSize:28,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28}}>
            {leads.map(l=>{
              const prog=l.tarefas.length?l.tarefas.filter(t=>t.feito).length/l.tarefas.length*100:0;
              return (
                <div key={l.id} onClick={()=>setOpen(l)} className="hov-card"
                  style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:4,padding:"14px 18px",display:"flex",alignItems:"center",gap:16,boxShadow:T.sh}}>
                  <div style={{width:36,height:36,borderRadius:4,background:T.navyMd,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>
                    {l.nome.split(" ")[1][0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:600,color:T.navy}}>{l.nome}</span>
                      <span style={{fontSize:11,color:T.textLt}}>{l.esp}</span>
                    </div>
                    {l.tarefas.length>0 && (
                      <div>
                        <ProgressBar pct={prog} color={prog===100?T.green:T.blue} height={3}/>
                        <div style={{fontSize:10,color:T.textLt,marginTop:3}}>{prog.toFixed(0)}% do pipeline concluído</div>
                      </div>
                    )}
                  </div>
                  <div style={{flexShrink:0}}>
                    {l.nps!==null
                      ? <div style={{textAlign:"center"}}>
                          <div style={{fontSize:20,fontWeight:700,color:l.nps>=9?T.green:l.nps>=7?T.amber:T.red}}>{l.nps}</div>
                          <div style={{fontSize:9,color:T.muted}}>NPS</div>
                        </div>
                      : <Badge color={T.muted} bg={T.bg}>Sem NPS</Badge>
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <Label>Serviços adicionais — portfólio</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {t:"Planejamento Tributário PJ",d:"Abertura e gestão de CNPJ médico. Redução de carga sobre pró-labore.",v:"R$ 3.000–8.000 / ano"},
              {t:"Revisão IRPF — 5 anos",d:"Deduções não aproveitadas e regularização de malha fina.",v:"R$ 1.500–5.000"},
              {t:"Defesa em Autuações Fiscais",d:"Representação administrativa e judicial perante a Receita Federal.",v:"20–30% sobre o valor autuado"},
              {t:"Consultoria Previdenciária",d:"Planejamento de aposentadoria para médicos autônomos.",v:"Honorário fixo negociável"},
            ].map((p,i)=>(
              <Card key={i} style={{padding:"16px 18px"}}>
                <div style={{fontSize:13,fontWeight:600,color:T.navy,marginBottom:5}}>{p.t}</div>
                <div style={{fontSize:11,color:T.textLt,lineHeight:1.6,marginBottom:10}}>{p.d}</div>
                <Badge color={T.amber} bg={T.amberBg}>{p.v}</Badge>
              </Card>
            ))}
          </div>
        </div>
      )}

      {open && <LeadModal lead={open} onClose={()=>setOpen(null)} onUpdate={upd}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
export default function App() {
  const [tela, setTela] = useState("login");
  return (
    <>
      {tela==="login"      && <Login       onLogin={()=>setTela("hub")} />}
      {tela==="hub"        && <Hub         onLogout={()=>setTela("login")} onGo={setTela} />}
      {tela==="prospeccao" && <Prospeccao  onBack={()=>setTela("hub")} />}
      {tela==="crm"        && <CRM         onBack={()=>setTela("hub")} />}
    </>
  );
}
