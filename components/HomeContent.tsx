'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

/* ─── data ─────────────────────────────────────────── */
const CARDS = [
  { n: '01 / 04', type: 'Question Hook',  text: '"You\'ve been doing this wrong your entire career…"',  pct: '+87%', bg: '#fff2f2', col: '#e8002d' },
  { n: '02 / 04', type: 'Curiosity Hook', text: '"Nobody talks about what really happens at 1M followers."', pct: '+79%', bg: '#f5f5f5', col: '#111'    },
  { n: '03 / 04', type: 'Visual Hook',    text: '"Watch exactly what happens in the first 3 seconds."',   pct: '+92%', bg: '#fff8f0', col: '#e8002d' },
  { n: '04 / 04', type: 'Warning Hook',   text: '"Stop posting until you see this. Seriously."',          pct: '+83%', bg: '#f0f4ff', col: '#3730a3' },
];

const FEATS = [
  { n:'01', words:['Upload','Analyze','Improve'], scr:0 as const,
    desc:'Upload any Reel, TikTok, or Short. AI watches every frame and maps exactly where attention drops.',
    chip:['Any Format','MP4 · MOV · WebM'] },
  { n:'02', words:['Detect','Pinpoint','Compare'], scr:1 as const,
    desc:'See the exact second viewers leave and why. Compare your hook side-by-side with a proven winner.',
    chip:['Split View','Hook comparison'] },
  { n:'03', words:['Write','Copy','Post'], scr:2 as const,
    desc:'Get a ready-made hook script that replaces your weak opening. Copy it, post it, grow.',
    chip:['Ready Script','Copy & Post'] },
];

/* ─── phone mockup ──────────────────────────────────── */
function Phone({ scr }: { scr: 0|1|2 }) {
  return (
    <div style={{
      width:200,height:400,flexShrink:0,
      background:'#0d1117',borderRadius:32,
      border:'1.5px solid rgba(255,255,255,0.08)',
      boxShadow:'0 48px 96px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)',
      overflow:'hidden',position:'relative',
    }}>
      {/* island */}
      <div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',width:72,height:20,background:'#000',borderRadius:10,zIndex:2}}/>
      {/* bar */}
      <div style={{height:40,display:'flex',alignItems:'flex-end',justifyContent:'space-between',padding:'0 16px 7px',fontSize:10,color:'rgba(255,255,255,0.7)',fontWeight:600}}>
        <span>9:41</span><span>●●●</span>
      </div>

      {scr===0&&<div style={{padding:'12px 12px'}}>
        <div style={{fontSize:12,color:'#fff',fontWeight:700,marginBottom:12}}>Analyze Hook</div>
        <div style={{border:'1.5px dashed rgba(232,0,45,0.4)',borderRadius:14,height:120,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7,background:'rgba(232,0,45,0.04)'}}>
          <div style={{width:28,height:28,background:'#e8002d',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:0,height:0,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderBottom:'10px solid white',marginBottom:1}}/>
          </div>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>Drop video here</span>
        </div>
        <div style={{marginTop:10,display:'flex',gap:5}}>
          {['MP4','MOV','WebM'].map(f=><div key={f} style={{background:'#1f2937',borderRadius:5,padding:'3px 8px',fontSize:9,color:'rgba(255,255,255,0.45)',fontWeight:600}}>{f}</div>)}
        </div>
        <div style={{marginTop:14}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.2)',marginBottom:6}}>Analyzing frames…</div>
          <div style={{height:3,background:'#1f2937',borderRadius:2}}>
            <div style={{height:'100%',width:'68%',background:'linear-gradient(90deg,#e8002d,#ff6b6b)',borderRadius:2}}/>
          </div>
        </div>
      </div>}

      {scr===1&&<div style={{padding:'10px 10px'}}>
        <div style={{fontSize:11,color:'#fff',fontWeight:700,marginBottom:8}}>Hook Analysis</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
          <div style={{background:'#1c1c1c',borderRadius:10,height:80,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:'45%',background:'rgba(232,0,45,0.35)'}}/>
            <div style={{position:'absolute',top:5,left:5,fontSize:8,color:'rgba(255,255,255,0.35)'}}>Your video</div>
            <div style={{position:'absolute',bottom:4,left:5,fontSize:8,color:'#e8002d',fontWeight:700}}>⚠ WEAK</div>
          </div>
          <div style={{background:'#0d1117',borderRadius:10,height:80,position:'relative'}}>
            <div style={{position:'absolute',top:5,left:5,fontSize:8,color:'rgba(255,255,255,0.35)'}}>Library</div>
            <div style={{position:'absolute',bottom:4,left:5,fontSize:8,color:'#4ade80',fontWeight:700}}>✓ STRONG</div>
          </div>
        </div>
        <div style={{background:'#1a1a1a',borderRadius:10,padding:'8px 10px',marginBottom:7}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:9,color:'rgba(255,255,255,0.35)'}}>Hook Score</span>
            <span style={{fontSize:10,color:'#e8002d',fontWeight:800}}>63%</span>
          </div>
          <div style={{height:3,background:'#333',borderRadius:2}}>
            <div style={{width:'63%',height:'100%',background:'#e8002d',borderRadius:2}}/>
          </div>
        </div>
        <div style={{background:'#111',borderRadius:10,padding:'7px 9px'}}>
          <div style={{fontSize:8,color:'rgba(255,255,255,0.25)',marginBottom:3}}>Weak zone: 0:00–0:03</div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',lineHeight:1.4}}>Opening too slow. Viewers leave before your message.</div>
        </div>
      </div>}

      {scr===2&&<div style={{padding:'12px 12px'}}>
        <div style={{fontSize:11,color:'#fff',fontWeight:700,marginBottom:9}}>Hook Script</div>
        <div style={{background:'#1a1a1a',borderRadius:12,padding:10,marginBottom:8}}>
          <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',marginBottom:5}}>AI · Question Hook</div>
          <div style={{fontSize:10,color:'#fff',lineHeight:1.6}}>&ldquo;Stop. You&apos;ve been posting at the wrong time — I can prove it in 10 seconds…&rdquo;</div>
        </div>
        <div style={{background:'#111',borderRadius:12,padding:'7px 10px',marginBottom:10}}>
          <div style={{fontSize:8,color:'rgba(255,255,255,0.3)',marginBottom:3}}>Expected boost</div>
          <div style={{fontFamily:'Syne,system-ui',fontSize:18,color:'#4ade80',fontWeight:900}}>+87%</div>
        </div>
        <div style={{background:'#e8002d',borderRadius:10,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:10,color:'#fff',fontWeight:700}}>Copy Script</span>
        </div>
      </div>}
    </div>
  );
}

/* ─── dot matrix bar chart ──────────────────────────── */
function DotMatrix({ bars, on }: { bars:number[]; on:boolean }) {
  const H = 10;
  return (
    <div style={{display:'flex',gap:5,alignItems:'flex-end',marginTop:18}}>
      {bars.map((h,c)=>(
        <div key={c} style={{display:'flex',flexDirection:'column-reverse',gap:4}}>
          {Array.from({length:H}).map((_,r)=>(
            <div key={r} style={{
              width:7,height:7,borderRadius:'50%',
              background: r<h ? '#0a0a0a' : 'rgba(10,10,10,0.08)',
              opacity: on?1:0,
              transform: on?'scale(1)':'scale(0)',
              transition:`opacity .25s ${(c*H+r)*16}ms, transform .25s ${(c*H+r)*16}ms`,
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function HomeContent() {
  const [idx, setIdx]     = useState(0);
  const [statsOn, setOn]  = useState(false);
  const statRef           = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const t = setInterval(()=>setIdx(i=>(i+1)%CARDS.length), 4500);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    const el = statRef.current; if(!el) return;
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setOn(true); },{threshold:.25});
    obs.observe(el); return ()=>obs.disconnect();
  },[]);

  const card = CARDS[idx];
  const prev = CARDS[(idx-1+CARDS.length)%CARDS.length];

  return (
    <div style={{overflowX:'hidden'}}>

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section style={{
        minHeight:'92vh', background:'#080808', position:'relative',
        overflow:'hidden', display:'flex', flexDirection:'column',
        justifyContent:'space-between',
        padding:'clamp(24px,4vw,48px) clamp(24px,4vw,48px)',
      }}>
        {/* Blob A – upper right – red */}
        <div style={{
          position:'absolute', top:'-15%', right:'-10%',
          width:'clamp(280px,42vw,540px)', height:'clamp(280px,42vw,540px)',
          background:'radial-gradient(circle at 38% 38%, #ff1a3c 0%, #e8002d 30%, #8b0018 65%, transparent 100%)',
          animation:'blob-morph 13s ease-in-out infinite, blob-drift 19s ease-in-out infinite',
          opacity:.8, zIndex:0,
        }}/>
        {/* Blob B – lower left – deeper red/rose */}
        <div style={{
          position:'absolute', bottom:'-5%', left:'-15%',
          width:'clamp(320px,50vw,620px)', height:'clamp(320px,50vw,620px)',
          background:'radial-gradient(circle at 55% 55%, #6b0010 0%, #c0001f 40%, #e8002d 65%, #ff6b6b 85%, transparent 100%)',
          animation:'blob-morph 17s ease-in-out infinite 5s, blob-drift-2 23s ease-in-out infinite',
          opacity:.5, zIndex:0,
        }}/>

        {/* top bar */}
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.25em',color:'rgba(255,255,255,0.3)'}}>Early Access</span>
          <Link href="/pro" style={{background:'#fff',color:'#080808',padding:'8px 20px',borderRadius:999,fontSize:12,fontWeight:700,textDecoration:'none',letterSpacing:'-.01em'}}>
            Try Free →
          </Link>
        </div>

        {/* title + phone */}
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:32}}>
          <div>
            <h1 style={{
              fontFamily:'Syne,system-ui,sans-serif', fontWeight:900,
              fontSize:'clamp(3rem,10.5vw,9rem)', lineHeight:.88,
              letterSpacing:'-.04em', color:'#fff', textTransform:'uppercase',
              marginBottom:24,
            }}>
              STOP THE<br/>
              <span style={{color:'#e8002d'}}>SCROLL.</span><br/>
              HOOK THEM.
            </h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'clamp(13px,1.4vw,15px)',maxWidth:380,lineHeight:1.7}}>
              Upload your Reel. AI finds the exact second viewers leave.
              Get a script that makes them stay.
            </p>
          </div>
          {/* Phone visible in hero on desktop */}
          <div className="hidden md:block" style={{flexShrink:0, marginBottom:-32}}>
            <Phone scr={0}/>
          </div>
        </div>

        {/* bottom bar */}
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'rgba(255,255,255,0.3)'}}>
            <ArrowDown size={13}/> Explore Further
          </span>
          <span style={{fontSize:10,color:'rgba(255,255,255,0.18)'}}>© HookedAI 2026</span>
        </div>
      </section>

      {/* ═══ FEATURES 01 / 02 / 03 ══════════════════════════ */}
      {FEATS.map(({n,words,scr,desc,chip})=>(
        <section key={n} style={{
          minHeight:'90vh', background:'#080808',
          borderTop:'1px solid rgba(255,255,255,0.05)',
          position:'relative', overflow:'hidden',
          display:'flex', alignItems:'center',
          padding:'clamp(40px,6vw,72px) clamp(24px,5vw,56px)',
        }}>
          {/* faint bg number */}
          <div style={{
            position:'absolute', top:'8%', left:'clamp(20px,3vw,40px)',
            fontFamily:'Syne,system-ui', fontWeight:900,
            fontSize:'clamp(100px,16vw,200px)', lineHeight:1,
            color:'rgba(255,255,255,0.03)', letterSpacing:'-.06em',
            userSelect:'none', zIndex:0,
          }}>{n}</div>

          <div className="feat-grid" style={{position:'relative',zIndex:1}}>
            {/* LEFT */}
            <div style={{display:'flex',flexDirection:'column',gap:20,paddingTop:80}}>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',maxWidth:240,lineHeight:1.7}}>{desc}</p>
              <div style={{background:'#151515',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:'14px 16px',width:'fit-content'}}>
                <div style={{fontSize:12,color:'#e8002d',fontWeight:700,marginBottom:4}}>{chip[0]}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>{chip[1]}</div>
              </div>
            </div>

            {/* CENTER */}
            <div className="feat-phone"><Phone scr={scr}/></div>

            {/* RIGHT */}
            <div className="feat-words" style={{textAlign:'right'}}>
              {words.map(w=>(
                <div key={w} style={{
                  fontFamily:'Syne,system-ui', fontWeight:900,
                  fontSize:'clamp(1.8rem,4.2vw,4.2rem)',
                  color:'#fff', lineHeight:.98,
                  letterSpacing:'-.03em', textTransform:'uppercase',
                }}>{w}</div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ═══ EXPLORE HOOKS (dark) + CTA (light) ════════════ */}
      <section style={{background:'#080808',padding:'clamp(48px,7vw,80px) clamp(24px,4vw,48px) clamp(80px,10vw,120px)',position:'relative'}}>

        <h2 style={{
          fontFamily:'Syne,system-ui', fontWeight:900,
          fontSize:'clamp(2rem,5vw,3.5rem)', color:'#fff',
          textAlign:'center', marginBottom:60, letterSpacing:'-.02em',
        }}>Explore Hooks</h2>

        {/* stacked cards */}
        <div style={{position:'relative',height:300,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {/* card behind */}
          <div style={{
            position:'absolute',
            width:'clamp(260px,38vw,340px)', height:250,
            background:prev.bg, borderRadius:28,
            transform:'rotate(-7deg) scale(.88) translateY(20px)',
            opacity:.45, boxShadow:'0 24px 64px rgba(0,0,0,0.4)',
          }}/>
          {/* active card */}
          <div key={idx} style={{
            position:'absolute',
            width:'clamp(260px,38vw,340px)', height:250,
            background:card.bg, borderRadius:28,
            padding:'24px 22px', boxShadow:'0 36px 88px rgba(0,0,0,0.5)',
            transform:'rotate(-3deg)', display:'flex', flexDirection:'column',
            justifyContent:'space-between',
            animation:'card-in .45s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',letterSpacing:'.14em',color:card.col}}>{card.type}</div>
            <div style={{fontSize:'clamp(13px,1.5vw,15px)',color:'#0a0a0a',lineHeight:1.55,fontStyle:'italic'}}>{card.text}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'#888'}}>Hook Score</span>
              <span style={{fontFamily:'Syne,system-ui',fontSize:22,fontWeight:900,color:card.col}}>{card.pct}</span>
            </div>
          </div>
        </div>

        {/* counter */}
        <div style={{textAlign:'center',fontSize:11,color:'rgba(255,255,255,0.22)',marginTop:24,letterSpacing:'.2em'}}>{card.n}</div>
        {/* dots */}
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
          {CARDS.map((_,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{
              width:i===idx?24:7, height:7, borderRadius:4, border:'none',
              background:i===idx?'#e8002d':'rgba(255,255,255,0.18)',
              transition:'all .3s', cursor:'pointer', padding:0,
            }}/>
          ))}
        </div>
      </section>

      {/* CTA light section – overlapping */}
      <section style={{background:'#f0f0f0',padding:'clamp(48px,7vw,72px) clamp(24px,4vw,48px)',marginTop:-40}}>
        <h2 style={{
          fontFamily:'Syne,system-ui', fontWeight:900,
          fontSize:'clamp(1.8rem,4.2vw,3.2rem)', color:'#080808',
          lineHeight:1.05, marginBottom:36, maxWidth:520, letterSpacing:'-.025em',
        }}>Never Lose Your<br/>Viewers Again</h2>
        <div style={{display:'flex',alignItems:'center',gap:12,maxWidth:500,borderBottom:'1.5px solid #bbb',paddingBottom:4}}>
          <input type="email" placeholder="your@email.com" style={{
            flex:1, background:'none', border:'none', outline:'none',
            fontSize:14, color:'#333', padding:'10px 0', fontFamily:'inherit',
          }}/>
          <Link href="/pro" style={{
            background:'#080808', color:'#fff',
            padding:'10px 22px', borderRadius:999,
            fontSize:12, fontWeight:700, textDecoration:'none',
            whiteSpace:'nowrap', flexShrink:0,
          }}>Try Free →</Link>
        </div>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════ */}
      <section ref={statRef} style={{background:'#fff',padding:'clamp(56px,8vw,80px) clamp(24px,4vw,48px)'}}>
        <p style={{fontSize:11,textTransform:'uppercase',letterSpacing:'.18em',color:'#aaa',textAlign:'center',marginBottom:8}}>By the numbers</p>
        <h2 style={{fontFamily:'Syne,system-ui',fontWeight:900,fontSize:'clamp(1.6rem,3.5vw,2.5rem)',color:'#080808',textAlign:'center',marginBottom:44,letterSpacing:'-.02em'}}>
          Trusted by creators worldwide
        </h2>
        <div className="stats-grid">
          {[
            {label:'Hooks in Library',   val:'1000+', bars:[3,5,4,6,7,5,8,6,7,8,7,8,6,8]},
            {label:'Avg Retention Boost',val:'80%',   bars:[2,4,3,5,4,6,5,7,6,8,7,8,8,7]},
            {label:'Critical Hook Window',val:'3 sec', bars:[8,7,7,6,5,5,4,4,3,3,2,2,1,1]},
          ].map(({label,val,bars})=>(
            <div key={label} style={{background:'#f5f5f5',borderRadius:20,padding:'clamp(18px,2.5vw,28px)'}}>
              <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.16em',color:'#aaa',marginBottom:8,lineHeight:1.4}}>{label}</div>
              <div style={{fontFamily:'Syne,system-ui',fontWeight:900,fontSize:'clamp(2rem,5vw,3.5rem)',lineHeight:1,color:'#080808'}}>{val}</div>
              <DotMatrix bars={bars} on={statsOn}/>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT TEXT ══════════════════════════════════════ */}
      <section style={{background:'#080808',padding:'clamp(64px,9vw,100px) clamp(24px,4vw,48px)'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <p style={{fontSize:10,color:'rgba(255,255,255,0.2)',textTransform:'uppercase',letterSpacing:'.22em',marginBottom:28}}>HookedAI</p>
          <p style={{fontSize:'clamp(15px,2vw,19px)',color:'rgba(255,255,255,0.78)',lineHeight:1.78,fontWeight:300}}>
            Most creators lose their audience in the first 3 seconds without ever knowing why.
            HookedAI watches your video the way an algorithm does — spotting the exact frame
            where attention drops, matching it to hooks that retain, and giving you a script
            to fix it. No guesswork. No vanity metrics. Just the data that matters,
            and the words that work.
          </p>
        </div>
      </section>

      {/* ═══ FOOTER – giant brand text ═══════════════════════ */}
      <section style={{background:'#fff',padding:'clamp(40px,5vw,56px) clamp(24px,4vw,48px) 0',overflow:'hidden'}}>
        {/* nav */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40,flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',gap:28}}>
            {[['/', 'Home'],['/library','Library'],['/pricing','Pricing']].map(([href,label])=>(
              <Link key={href} href={href} style={{fontSize:12,color:'#999',textDecoration:'none'}}>{label}</Link>
            ))}
          </div>
          <div style={{display:'flex',gap:24}}>
            <Link href="/privacy" style={{fontSize:12,color:'#999',textDecoration:'none'}}>Privacy</Link>
            <Link href="/pricing" style={{fontSize:12,color:'#999',textDecoration:'none'}}>Terms</Link>
          </div>
        </div>

        {/* giant text with animated blobs behind it */}
        <div style={{position:'relative',lineHeight:0}}>
          <div style={{
            position:'absolute', top:'5%', left:'15%',
            width:'70%', height:'90%',
            background:'radial-gradient(ellipse at 35% 50%, #e8002d 0%, #ff4d6d 35%, #c0001f 60%, transparent 85%)',
            animation:'blob-drift 16s ease-in-out infinite',
            opacity:.7, filter:'blur(4px)', zIndex:0,
          }}/>
          <div style={{
            position:'absolute', top:'20%', right:'5%',
            width:'40%', height:'70%',
            background:'radial-gradient(ellipse at 60% 40%, #7f0015 0%, #e8002d 55%, transparent 85%)',
            animation:'blob-drift-2 20s ease-in-out infinite 2s',
            opacity:.5, filter:'blur(8px)', zIndex:0,
          }}/>
          <p style={{
            fontFamily:'Syne,system-ui', fontWeight:900,
            fontSize:'clamp(5rem,18vw,17rem)', lineHeight:.82,
            letterSpacing:'-.04em', textTransform:'uppercase',
            background:'linear-gradient(130deg,#e8002d 0%,#ff4d6d 28%,#c0001f 52%,#ff1a3c 78%,#e8002d 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            position:'relative', zIndex:1, userSelect:'none',
          }}>HOOKEDAI</p>
        </div>
      </section>

    </div>
  );
}
