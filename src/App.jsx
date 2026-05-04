import { useState, useEffect, useRef } from 'react';
import { useStore, SUBJECTS } from './lib/store';
import { selectNextQuestion, updateRecord, sessionEndMessage, strengthSummary, 
         fullTopicBreakdown, checkLevelGraduation, DIFF_LABEL, DIFF_TIME } from './lib/engine';
import { QB } from './lib/questions';

const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
const tl  = t => t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const genPin = () => String(Math.floor(100000 + Math.random() * 900000));

const OK_MSGS    = ["You got it! ⭐","Doing great! 🔥","Awesome! 🎉","Brilliant! 🚀","Keep it up! 💪","Superstar! 🌟","Nailed it! ✨","Amazing! 🏆"];
const WRONG_MSGS = ["Almost! Keep going 💪","Good try! Next one! 🚀","You've got this! 💫","Learning in action! ⭐"];

// ─── CSS ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Syne:wght@700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{-webkit-font-smoothing:antialiased;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeToast{0%{opacity:0;transform:translateX(-50%) translateY(-8px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes levelUp{0%{opacity:0;transform:translateX(-50%) scale(0.8)}20%{opacity:1;transform:translateX(-50%) scale(1.05)}80%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) scale(1)}}
.subj-card{background:#fff;border-radius:18px;padding:18px;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.07);animation:fadeUp 0.4s both;transition:transform 0.15s,box-shadow 0.15s;}
.subj-card:active{transform:scale(0.97);}
.info-card{background:#fff;border-radius:18px;padding:18px;box-shadow:0 2px 12px rgba(0,0,0,0.06);}
.q-card{background:#fff;border-radius:18px;padding:20px;margin-bottom:16px;font-size:17px;font-weight:700;color:#111;line-height:1.5;box-shadow:0 4px 16px rgba(0,0,0,0.07);}
.opt-btn{background:#fff;border:1.5px solid #e5e7eb;border-radius:13px;padding:13px 14px;text-align:left;font-size:14px;font-weight:600;color:#111;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:11px;transition:all 0.15s;width:100%;}
.primary-btn{width:100%;padding:15px;border:none;border-radius:13px;background:#4338ca;color:#fff;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;}
.secondary-btn{width:100%;padding:13px;border:1.5px solid #e5e7eb;border-radius:13px;background:#fff;color:#374151;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;margin-top:10px;}
.field{width:100%;padding:13px 15px;border:1.5px solid #e5e7eb;border-radius:11px;font-family:inherit;font-size:15px;color:#111;outline:none;margin-bottom:14px;}
.field:focus{border-color:#4338ca;}
.ghost-btn{background:rgba(255,255,255,0.15);border:none;color:#fff;border-radius:8px;padding:7px 13px;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;}
.back-btn{background:rgba(255,255,255,0.15);border:none;color:#fff;border-radius:8px;padding:6px 13px;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;}
.spinner{width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#4338ca;border-radius:50%;animation:spin 0.7s linear infinite;}
.pin-box{display:flex;gap:10px;justify-content:center;margin:16px 0;}
.pin-digit{width:46px;height:54px;border:2px solid #e5e7eb;border-radius:12px;font-size:22px;font-weight:800;text-align:center;font-family:inherit;color:#111;outline:none;transition:border-color 0.15s;}
.pin-digit:focus{border-color:#4338ca;}
.pin-digit.pin-error{border-color:#dc2626;background:#fee2e2;}
.error-box{color:#dc2626;font-size:13px;font-weight:600;padding:10px 14px;background:#fee2e2;border-radius:10px;margin-bottom:12px;}
.lbl{display:block;font-size:13px;font-weight:700;color:#374151;margin-bottom:6px;}
.level-toast{position:fixed;top:80px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#059669,#0D9488);color:#fff;border-radius:14px;padding:14px 22px;font-size:14px;font-weight:700;z-index:9999;pointer-events:none;animation:levelUp 3.5s ease-in-out forwards;white-space:nowrap;text-align:center;box-shadow:0 8px 24px rgba(5,150,105,0.4);}
@media(min-width:480px){body>div{max-width:480px;margin:0 auto;box-shadow:0 0 60px rgba(0,0,0,0.12);}}
`;

// ─── PIN INPUT ─────────────────────────────────────────────────────────────
function PinInput({ onComplete }) {
  const refs = useRef([]);
  const [vals, setVals] = useState(['','','','','','']);
  const [hasError, setHasError] = useState(false);

  function handleChange(i, v) {
    const digit = v.replace(/\D/,'').slice(-1);
    const next = [...vals]; next[i] = digit;
    setVals(next);
    if (digit && i < 5) refs.current[i+1]?.focus();
    if (next.every(d => d)) onComplete?.(next.join(''));
  }
  function handleKey(i, e) {
    if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i-1]?.focus();
  }
  function handlePaste(e) {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    const next = ['','','','','',''];
    p.split('').forEach((c,i) => { next[i] = c; });
    setVals(next);
    refs.current[Math.min(p.length,5)]?.focus();
    if (next.every(d => d)) onComplete?.(next.join(''));
  }

  return (
    <div className="pin-box">
      {vals.map((v,i) => (
        <input key={i} ref={el => refs.current[i]=el} type="tel" maxLength={1} value={v}
          className={`pin-digit${hasError?' pin-error':''}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function showToast(msg, bg='#1e1b4b') {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', top:'70px', left:'50%', transform:'translateX(-50%)',
    background:bg, color:'#fff', borderRadius:'99px', padding:'10px 22px',
    fontSize:'15px', fontWeight:'700', zIndex:'9999', pointerEvents:'none',
    animation:'fadeToast 2s ease-in-out forwards', whiteSpace:'nowrap'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2100);
}

// ─── LEVEL UP TOAST (bigger, special celebration) ──────────────────────────
function showLevelUpToast(msg) {
  const t = document.createElement('div');
  t.className = 'level-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3600);
}

// ─── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]               = useState('home');
  const [activeSubject, setActiveSubject] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const { isLoggedIn } = useStore();

  const subj = SUBJECTS.find(s => s.id === activeSubject);

  function startSubject(sid) {
    useStore.getState().startSession(sid);
    setActiveSubject(sid);
    setScreen('practice');
  }

  function onSessionEnd(result) {
    useStore.getState().endSession(result.subject, result.questionsAnswered);
    setSessionResult(result);
    setScreen('session_end');
  }

  function goHome() { setScreen('home'); }

  return (
    <div style={{ fontFamily:"'Nunito',system-ui,sans-serif", minHeight:'100dvh', background:'#f0effe', overflowX:'hidden' }}>
      <style>{CSS}</style>
      {screen === 'home'         && <HomeScreen       setScreen={setScreen} startSubject={startSubject} />}
      {screen === 'practice'     && <PracticeScreen   setScreen={setScreen} subject={activeSubject} subj={subj} onEnd={onSessionEnd} onLoginRequired={() => setScreen('signup')} />}
      {screen === 'session_end'  && <SessionEndScreen setScreen={setScreen} result={sessionResult} subj={subj} startSubject={startSubject} goHome={goHome} />}
      {screen === 'report'       && <StudentReport    setScreen={setScreen} goHome={goHome} />}
      {screen === 'signup'       && <SignupScreen     setScreen={setScreen} goHome={goHome} />}
      {screen === 'signup_done'  && <SignupDone       setScreen={setScreen} goHome={goHome} />}
      {screen === 'parent_login' && <ParentLogin      setScreen={setScreen} goHome={goHome} />}
      {screen === 'parent_pin'   && <ParentChangePin  setScreen={setScreen} goHome={goHome} />}
      {screen === 'parent_dash'  && <ParentDashboard  setScreen={setScreen} goHome={goHome} />}
    </div>
  );
}

// ─── HOME ──────────────────────────────────────────────────────────────────
function HomeScreen({ setScreen, startSubject }) {
  const { user, isLoggedIn, topicRecords, sessionHistory, lastSession } = useStore();
  const name       = user?.name?.split(' ')[0] || 'Superstar';
  const hasHistory = sessionHistory.length > 0;
  const q          = lastSession?.questionsAnswered || 0;
  const greeting   = hasHistory ? `Welcome back, ${name}! 👋` : `Welcome, ${name}! 👋`;
  const sub        = hasHistory
    ? `You practised ${q} questions last time — amazing! Let's try ${Math.max(5, Math.round(q * 0.4))} more today! 🚀`
    : "Ready to start your learning journey? Let's go! 🚀";

  function sessForSubj(sid) {
    return sessionHistory.filter(h => h.subject === sid).length;
  }
  function avgForSubj(sid) {
    const ks = Object.keys(topicRecords).filter(k => k.startsWith(sid + '_'));
    if (!ks.length) return null;
    const sc = ks.map(k => {
      const r = topicRecords[k];
      return r.answered >= 3 ? Math.round((r.correct / r.answered) * 100) : null;
    }).filter(s => s !== null);
    return sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null;
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#4338ca 60%,#7c3aed 100%)', padding:'0 0 52px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }}/>
        {/* Nav */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px' }}>
          <div>
            <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff' }}>🚀 Leap IQ</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', marginTop:1 }}>Adaptive Learning · Grades 5–10</div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="ghost-btn" onClick={() => setScreen('report')}>📊 Progress</button>
            {isLoggedIn
              ? <button className="ghost-btn" onClick={() => useStore.getState().logout()}>Sign out</button>
              : <button style={{ background:'#fff', border:'none', color:'#4338ca', borderRadius:'99px', padding:'7px 16px', cursor:'pointer', fontFamily:'inherit', fontWeight:800, fontSize:13 }} onClick={() => setScreen('signup')}>Sign in</button>
            }
          </div>
        </div>
        {/* Greeting */}
        <div style={{ padding:'6px 18px 0' }}>
          <h1 style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', margin:'0 0 6px' }}>{greeting}</h1>
          <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13, margin:'0 0 18px', lineHeight:1.5 }}>{sub}</p>
          {/* Stats row */}
          <div style={{ display:'flex', gap:8 }}>
            {SUBJECTS.map(s => (
              <div key={s.id} style={{ flex:1, background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 6px', textAlign:'center' }}>
                <div style={{ fontSize:16 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',system-ui", fontSize:14, fontWeight:700, color:'#fff', marginTop:3 }}>{sessForSubj(s.id)}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>sessions</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:'0 14px', marginTop:-20 }}>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:15, fontWeight:700, color:'#1e1b4b', margin:'10px 0' }}>Pick a subject to practise</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
          {SUBJECTS.map((s, i) => {
            const avg  = avgForSubj(s.id);
            const sess = sessForSubj(s.id);
            return (
              <div key={s.id} className="subj-card" style={{ animationDelay:`${i * 60}ms` }} onClick={() => startSubject(s.id)}>
                <div style={{ width:46, height:46, borderRadius:12, background:s.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontFamily:"'Syne',system-ui", fontSize:14, fontWeight:700, color:'#111', marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>adaptive · mixed topics</div>
                {avg !== null ? (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:11, color:'#6b7280' }}>{sess} sessions</span>
                      <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{avg}%</span>
                    </div>
                    <div style={{ background:'#f3f4f6', borderRadius:99, height:5 }}>
                      <div style={{ background:s.color, borderRadius:99, height:5, width:`${avg}%` }}/>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize:11, color:'#9ca3af', fontStyle:'italic' }}>Tap to start!</div>
                )}
                <div style={{ position:'absolute', bottom:12, right:12, width:26, height:26, borderRadius:7, background:s.light, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontWeight:800, fontSize:13 }}>→</div>
              </div>
            );
          })}
        </div>

        {/* Parent Portal */}
        <div className="info-card" style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:"'Syne',system-ui", fontSize:13, fontWeight:700, color:'#111' }}>👨‍👩‍👧 Parent / Teacher Portal</div>
            <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>Separate secure login · Full report card</div>
          </div>
          <button style={{ background:'#1e1b4b', border:'none', color:'#fff', borderRadius:10, padding:'8px 16px', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}
            onClick={() => setScreen('parent_login')}>Login →</button>
        </div>

        {!isLoggedIn && (
          <div style={{ background:'linear-gradient(135deg,#4338ca,#7c3aed)', borderRadius:14, padding:'14px 18px', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', textAlign:'center', marginTop:12, marginBottom:20 }}
            onClick={() => setScreen('signup')}>
            📬 Sign in to save your progress →
          </div>
        )}
        <div style={{ height:20 }}/>
      </div>
    </div>
  );
}

// ─── PRACTICE ──────────────────────────────────────────────────────────────
function PracticeScreen({ setScreen, subject, subj, onEnd, onLoginRequired }) {
  const { topicRecords, sessionHistory, isGuestLimited, recordAnswer, user } = useStore();
  const allQs    = QB[subject] || [];
  const grade    = user?.grade || 'Grade 6'; // ← student grade for level filtering

  const [current,   setCurrent]   = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [answered,  setAnswered]  = useState(false);
  const [isLate,    setIsLate]    = useState(false);
  const [timer,     setTimer]     = useState(60);
  const [timerMax,  setTimerMax]  = useState(60);
  const [qCount,    setQCount]    = useState(0);
  const [recentIds, setRecentIds] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => { loadNext(); return () => clearInterval(timerRef.current); }, []);

  function loadNext() {
    if (isGuestLimited(subject)) { onLoginRequired(); return; }

    // ← pass grade so engine filters by active levels
    const res = selectNextQuestion(
      allQs, topicRecords, sessionHistory.length, recentIds, subject, grade
    );
    if (!res) return;

    const { question: q } = res;
    const di = q.difficulty === 'easy' ? 0 : q.difficulty === 'medium' ? 1 : 2;
    const t  = DIFF_TIME[di];
    setCurrent(res);
    setSelected(null);
    setAnswered(false);
    setIsLate(false);
    setTimer(t);
    setTimerMax(t);
    setRecentIds(prev => [q.id, ...prev].slice(0, 15));
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setIsLate(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function handleAnswer(opt) {
    if (answered) return;
    clearInterval(timerRef.current);
    const late    = timer <= 0;
    const correct = opt === current.question.ans;
    setSelected(opt);
    setAnswered(true);
    setIsLate(late);

    // ← pass question_level as 3rd argument
    recordAnswer(
      subject,
      current.question.topic,
      current.question.question_level || current.question.grade || '6',
      correct,
      late,
      current.question.id
    );

    setQCount(c => c + 1);
    showToast(
      correct
        ? OK_MSGS[Math.floor(Math.random() * OK_MSGS.length)]
        : WRONG_MSGS[Math.floor(Math.random() * WRONG_MSGS.length)]
    );

    // ← check for level graduation after recording
    const graduation = checkLevelGraduation(
      useStore.getState().topicRecords,
      subject,
      grade
    );
    if (graduation.graduated) {
      setTimeout(() => showLevelUpToast(graduation.message), 600);
    }
  }

  function handleNext() { loadNext(); }

  function handlePracticeLater() {
    clearInterval(timerRef.current);
    onEnd({ subject, questionsAnswered: qCount, subj });
  }

  if (!current) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div className="spinner"/>
      <div style={{ color:'#6b7280', fontWeight:600 }}>Loading questions…</div>
    </div>
  );

  const q  = current.question;
  const di = q.difficulty === 'easy' ? 0 : q.difficulty === 'medium' ? 1 : 2;
  const pct = Math.max(0, Math.round((timer / timerMax) * 100));

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      {/* Top bar */}
      <div style={{ background:subj?.color || '#4338ca', padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <button className="back-btn" onClick={handlePracticeLater}>Practice Later</button>
          <div style={{ flex:1, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.85)', fontWeight:600 }}>
            {subj?.short} · {qCount} answered
          </div>
          <span style={{ fontSize:18 }}>{subj?.icon}</span>
        </div>
        {/* Timer bar */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, background:'rgba(255,255,255,0.25)', borderRadius:99, height:6, overflow:'hidden' }}>
            <div style={{ background:'#fff', borderRadius:99, height:6, width:`${pct}%`, transition:'width 1s linear', animation:timer===0?'pulse 1s ease-in-out infinite':'none' }}/>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:timer<=15&&timer>0?'#fbbf24':timer===0?'#fca5a5':'#fff', minWidth:36, textAlign:'right' }}>
            {timer === 0 ? '⏰' : fmt(timer)}
          </div>
        </div>
        {timer === 0 && !answered && (
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.8)', marginTop:4, textAlign:'center' }}>Time's up — but you can still answer! ⏰</div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 14px 100px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:13 }}>
          <span style={{ fontSize:11, color:'#9ca3af', fontWeight:600 }}>{tl(q.topic)}</span>
          <span style={{ fontSize:11, fontWeight:700, background:subj?.light, color:subj?.color, borderRadius:99, padding:'3px 11px' }}>
            {DIFF_LABEL[di]}
          </span>
        </div>
        <div className="q-card">{q.q}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
          {q.opts.map((opt, i) => {
            const isCorrect = opt === q.ans;
            const isSel     = opt === selected;
            let bg='#fff', border='1.5px solid #e5e7eb', color='#111', bBg='#f3f4f6', bColor='#6b7280';
            if (answered) {
              if (isCorrect)      { bg='#dcfce7'; border='2px solid #16a34a'; color='#15803d'; bBg='#16a34a'; bColor='#fff'; }
              else if (isSel)     { bg='#fee2e2'; border='2px solid #dc2626'; color='#dc2626'; bBg='#dc2626'; bColor='#fff'; }
            } else if (isSel)     { bg=subj?.light; border=`2px solid ${subj?.color}`; color=subj?.color; }
            return (
              <button key={i} className="opt-btn" disabled={answered} onClick={() => handleAnswer(opt)}
                style={{ background:bg, border, color, cursor:answered?'default':'pointer' }}>
                <span style={{ width:27, height:27, borderRadius:7, background:bBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:bColor, flexShrink:0 }}>
                  {answered && isCorrect ? '✓' : answered && isSel && !isCorrect ? '✗' : 'ABCD'[i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <>
            <div style={{ borderRadius:13, padding:14, background:selected===q.ans?'#dcfce7':'#fee2e2', display:'flex', gap:9, alignItems:'flex-start', marginBottom:12 }}>
              <span style={{ fontSize:18 }}>{selected===q.ans?'🎉':'💡'}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:selected===q.ans?'#15803d':'#dc2626' }}>
                  {selected===q.ans
                    ? (isLate ? 'Correct! (Take your time next time ⏱)' : 'Correct!')
                    : `Answer: ${q.ans}`}
                </div>
                {q.exp && <div style={{ fontSize:12, color:'#4b5563', marginTop:3, lineHeight:1.5 }}>{q.exp}</div>}
              </div>
            </div>
            <button className="primary-btn" style={{ background:subj?.color }} onClick={handleNext}>
              Next Question →
            </button>
          </>
        )}
      </div>

      {!answered && (
        <div style={{ position:'fixed', bottom:20, left:0, right:0, display:'flex', justifyContent:'center' }}>
          <button onClick={handlePracticeLater} style={{ background:'rgba(30,27,75,0.9)', color:'#fff', border:'none', borderRadius:99, padding:'12px 28px', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Practice Later →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SESSION END ────────────────────────────────────────────────────────────
function SessionEndScreen({ setScreen, result, subj, startSubject, goHome }) {
  const { topicRecords } = useStore();
  if (!result) { goHome(); return null; }
  const { subject, questionsAnswered } = result;
  const msg = sessionEndMessage(topicRecords, subject, questionsAnswered);
  return (
    <div style={{ minHeight:'100dvh', background:'#f0effe', padding:'32px 16px 40px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div className="info-card" style={{ maxWidth:420, width:'100%', textAlign:'center', marginBottom:16 }}>
        <div style={{ fontSize:64, marginBottom:12 }}>🌟</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#111', marginBottom:10 }}>{msg.main}</div>
        <div style={{ background:subj?.light||'#EEF2FF', borderRadius:14, padding:'14px 16px', color:subj?.color||'#4338ca', fontSize:14, fontWeight:600, lineHeight:1.6, marginBottom:20 }}>{msg.hint}</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[['q', questionsAnswered, 'questions answered'],['s', subj?.short, 'subject practised']].map(([k,v,l], i) => (
            <div key={k} style={{ background:'#f8f7ff', borderRadius:11, padding:'14px 8px' }}>
              <div style={{ fontFamily:"'Syne',system-ui", fontSize:i===0?24:20, fontWeight:800, color:subj?.color||'#4338ca' }}>{v}</div>
              <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:420 }}>
        <button className="primary-btn" style={{ background:subj?.color||'#4338ca' }} onClick={() => startSubject(subject)}>Keep Practising! 🚀</button>
        <button className="secondary-btn" onClick={goHome}>Choose Another Subject</button>
        <button className="secondary-btn" onClick={() => setScreen('report')}>📊 See My Progress</button>
      </div>
    </div>
  );
}

// ─── STUDENT REPORT ─────────────────────────────────────────────────────────
function StudentReport({ setScreen, goHome }) {
  const { topicRecords, sessionHistory, user } = useStore();
  return (
    <div style={{ minHeight:'100dvh' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'20px 18px 40px' }}>
        <button className="back-btn" onClick={goHome}>← Back</button>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', margin:'14px 0 4px' }}>⭐ My Strengths</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>{user?.name||'Learning Champion'} · {sessionHistory.length} sessions</div>
      </div>
      <div style={{ padding:'10px 16px 40px', marginTop:-12 }}>
        {SUBJECTS.map(subj => {
          const sum = strengthSummary(topicRecords, subj.id);
          const sc  = sessionHistory.filter(h => h.subject === subj.id).length;
          return (
            <div key={subj.id} className="info-card" style={{ marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:sum?12:0 }}>
                <div style={{ width:44, height:44, borderRadius:11, background:subj.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{subj.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Syne',system-ui", fontSize:14, fontWeight:700, color:'#111' }}>{subj.label}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{sc} session{sc!==1?'s':''}</div>
                </div>
              </div>
              {sum
                ? <div style={{ background:subj.light, borderRadius:10, padding:'10px 14px', fontSize:13, color:subj.color, fontWeight:600, lineHeight:1.5 }}>{sum}</div>
                : <div style={{ fontSize:12, color:'#9ca3af', fontStyle:'italic' }}>Start practising to unlock your strengths! 💪</div>
              }
            </div>
          );
        })}
        <div className="info-card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>💪</div>
          <div style={{ fontFamily:"'Syne',system-ui", fontSize:15, fontWeight:700, color:'#111', marginBottom:6 }}>Keep Going!</div>
          <div style={{ fontSize:13, color:'#6b7280', lineHeight:1.5 }}>Every question makes you smarter. The more you practise, the better we understand your strengths!</div>
        </div>
      </div>
    </div>
  );
}

// ─── SIGNUP ────────────────────────────────────────────────────────────────
function SignupScreen({ setScreen, goHome }) {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [mobile, setMobile] = useState('');
  const [pass,  setPass]  = useState('');
  const [pass2, setPass2] = useState('');
  const [err,   setErr]   = useState('');

  // Grade options matching students table
  const GRADES = ['Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Other'];

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim())          { setErr('Please enter your name.'); return; }
    if (!email.includes('@'))  { setErr('Please enter a valid email.'); return; }
    if (!mobile.trim())        { setErr('Please enter your mobile number.'); return; }
    if (!grade)                { setErr('Please select your grade.'); return; }
    if (pass.length < 6)       { setErr('Password must be at least 6 characters.'); return; }
    if (pass !== pass2)        { setErr('Passwords do not match.'); return; }

    const pin = genPin();
    useStore.getState().login({
      id:              Date.now() + '',
      name:            name.trim(),
      email:           email.trim().toLowerCase(),
      mobile:          mobile.trim(),
      grade,                          // ← stored as 'Grade 6', 'Grade 7' etc.
      parentPin:       pin,
      parentPinChanged: false,
    });
    setScreen('signup_done');
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'32px 20px 48px', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>🚀</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', marginBottom:6 }}>Join Leap IQ</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:14 }}>Free to start · Track your progress</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18, overflowY:'auto' }}>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column' }}>
          <label className="lbl">Your Name</label>
          <input className="field" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Arjun Sharma" />

          <label className="lbl">Email Address</label>
          <input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />

          <label className="lbl">Mobile Number</label>
          <input className="field" type="tel" value={mobile} onChange={e=>setMobile(e.target.value)} placeholder="+91 98765 43210" />

          <label className="lbl">Your Grade</label>
          <select className="field" value={grade} onChange={e=>setGrade(e.target.value)}>
            <option value="">Select grade...</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <label className="lbl">Password</label>
          <input className="field" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="At least 6 characters" />

          <label className="lbl">Confirm Password</label>
          <input className="field" type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Retype password" />

          {err && <div className="error-box">{err}</div>}
          <button type="submit" className="primary-btn">Create Account →</button>
        </form>
        <button className="secondary-btn" onClick={goHome}>Skip for now</button>
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:16, lineHeight:1.5 }}>Your data is private and never shared.</p>
      </div>
    </div>
  );
}

// ─── SIGNUP DONE ────────────────────────────────────────────────────────────
function SignupDone({ setScreen, goHome }) {
  const { user } = useStore();
  const pin = user?.parentPin || '------';
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#059669,#0D9488)', padding:'32px 20px 48px', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🎉</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', marginBottom:6 }}>Welcome, {user?.name?.split(' ')[0]}!</div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:14 }}>Your account is ready. Here's something important:</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        <div style={{ background:'#f0fdf4', border:'2px solid #86efac', borderRadius:16, padding:20, textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#15803d', marginBottom:4 }}>🔑 Parent Access PIN</div>
          <div style={{ fontFamily:"'Syne',system-ui", fontSize:36, fontWeight:800, color:'#166534', letterSpacing:6, margin:'12px 0' }}>{pin}</div>
          <div style={{ fontSize:12, color:'#166534', lineHeight:1.6 }}>Share this with your parent or teacher so they can view your full progress report.</div>
          <div style={{ fontSize:11, color:'#15803d', marginTop:10, fontWeight:600, background:'#dcfce7', borderRadius:8, padding:'8px 12px' }}>
            ⚠ Your parent will set a private PIN on their first login.
          </div>
        </div>
        <button style={{ width:'100%', padding:12, border:'1.5px solid #86efac', borderRadius:12, background:'#f0fdf4', color:'#15803d', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer', marginBottom:14 }}
          onClick={() => { navigator.clipboard.writeText(pin).then(()=>showToast('PIN copied! 📋','#059669')).catch(()=>showToast(pin,'#059669')); }}>
          📋 Copy PIN
        </button>
        <button className="primary-btn" onClick={goHome}>Let's Start Learning! 🚀</button>
      </div>
    </div>
  );
}

// ─── PARENT LOGIN ───────────────────────────────────────────────────────────
function ParentLogin({ setScreen, goHome }) {
  const { user } = useStore();
  const [email, setEmail] = useState('');
  const [pin,   setPin]   = useState('');
  const [err,   setErr]   = useState('');

  function handleLogin(e) {
    e.preventDefault();
    setErr('');
    if (!email.trim())   { setErr("Please enter the student's email."); return; }
    if (pin.length < 6)  { setErr('Please enter the full 6-digit PIN.'); return; }
    if (!user || user.email.toLowerCase() !== email.trim().toLowerCase())
      { setErr('No student found with this email.'); return; }
    if (pin !== user.parentPin) { setErr('Incorrect PIN. Please try again.'); return; }
    if (!user.parentPinChanged) { setScreen('parent_pin'); }
    else { setScreen('parent_dash'); }
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'28px 20px 44px', textAlign:'center' }}>
        <div style={{ textAlign:'left' }}><button className="back-btn" onClick={goHome}>← Back</button></div>
        <div style={{ fontSize:44, marginBottom:8 }}>🔐</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Parent / Teacher Login</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.6 }}>Enter the student's email and their 6-digit Parent Access PIN</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column' }}>
          <label className="lbl">Student's Email Address</label>
          <input className="field" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@email.com" />
          <label className="lbl">6-Digit Parent Access PIN</label>
          <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>The student received this PIN when they registered</div>
          <input className="field" type="tel" maxLength={6} value={pin}
            onChange={e=>setPin(e.target.value.replace(/\D/,'').slice(0,6))}
            placeholder="••••••" style={{ letterSpacing:8, fontSize:22, textAlign:'center' }}/>
          {err && <div className="error-box">{err}</div>}
          <button type="submit" className="primary-btn">Access Dashboard →</button>
        </form>
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:20, lineHeight:1.6 }}>On your first login you'll set a private PIN the student won't know.</p>
      </div>
    </div>
  );
}

// ─── PARENT CHANGE PIN ──────────────────────────────────────────────────────
function ParentChangePin({ setScreen, goHome }) {
  const { user } = useStore();
  const [newPin,  setNewPin]  = useState('');
  const [confPin, setConfPin] = useState('');
  const [err,     setErr]     = useState('');

  function handleSave(e) {
    e.preventDefault();
    setErr('');
    if (newPin.length < 6)  { setErr('Please enter a full 6-digit PIN.'); return; }
    if (confPin.length < 6) { setErr('Please confirm your PIN.'); return; }
    if (newPin !== confPin) { setErr('PINs do not match.'); return; }
    const s = useStore.getState();
    useStore.setState({ user: { ...s.user, parentPin: newPin, parentPinChanged: true } });
    showToast('PIN set successfully! 🔒', '#059669');
    setScreen('parent_dash');
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'28px 20px 44px', textAlign:'center' }}>
        {user?.parentPinChanged && <div style={{ textAlign:'left' }}><button className="back-btn" onClick={() => setScreen('parent_dash')}>← Back</button></div>}
        <div style={{ fontSize:44, marginBottom:8 }}>🔑</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Set Your Private PIN</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.6 }}>Create a 6-digit PIN only you will know.</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column' }}>
          <label className="lbl">Choose your new PIN:</label>
          <input className="field" type="tel" maxLength={6} value={newPin}
            onChange={e=>setNewPin(e.target.value.replace(/\D/,'').slice(0,6))}
            placeholder="••••••" style={{ letterSpacing:8, fontSize:22, textAlign:'center' }}/>
          <label className="lbl">Confirm your new PIN:</label>
          <input className="field" type="tel" maxLength={6} value={confPin}
            onChange={e=>setConfPin(e.target.value.replace(/\D/,'').slice(0,6))}
            placeholder="••••••" style={{ letterSpacing:8, fontSize:22, textAlign:'center' }}/>
          {err && <div className="error-box">{err}</div>}
          <div style={{ background:'#EEF2FF', borderRadius:12, padding:'12px 14px', marginBottom:16, fontSize:12, color:'#4338ca', fontWeight:600, lineHeight:1.6 }}>
            ⚠ Once set, the student's original PIN will stop working.
          </div>
          <button type="submit" className="primary-btn">Set PIN & Enter Dashboard →</button>
        </form>
      </div>
    </div>
  );
}

// ─── PARENT DASHBOARD ───────────────────────────────────────────────────────
function ParentDashboard({ setScreen, goHome }) {
  const { topicRecords, sessionHistory, user } = useStore();

  return (
    <div style={{ minHeight:'100dvh' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'20px 18px 40px' }}>
        <button className="back-btn" onClick={goHome}>← Home</button>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', margin:'14px 0 4px' }}>📊 Full Report Card</div>
        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>
          {user?.name||'Student'} · {user?.grade||'—'} · {sessionHistory.length} sessions
        </div>
        <button style={{ marginTop:12, background:'rgba(255,255,255,0.15)', border:'none', color:'rgba(255,255,255,0.85)', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12 }}
          onClick={() => setScreen('parent_pin')}>🔑 Change PIN</button>
      </div>

      <div style={{ padding:'10px 16px 40px', marginTop:-12 }}>
        {SUBJECTS.map(subj => {
          const breakdown = fullTopicBreakdown(topicRecords, subj.id);
          const sessCount = sessionHistory.filter(s => s.subject === subj.id).length;
          const scores    = breakdown.filter(t => t.score !== null).map(t => t.score);
          const oa        = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
          const oaColor   = oa===null?'#d1d5db':oa>=70?'#16a34a':oa>=50?'#d97706':'#dc2626';

          // Group by level for display
          const byLevel = {};
          for (const t of breakdown) {
            if (!byLevel[t.levelLabel]) byLevel[t.levelLabel] = [];
            byLevel[t.levelLabel].push(t);
          }

          return (
            <div key={subj.id} className="info-card" style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:11, background:subj.light, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{subj.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Syne',system-ui", fontSize:14, fontWeight:700, color:'#111' }}>{subj.label}</div>
                  <div style={{ fontSize:11, color:'#9ca3af' }}>{sessCount} sessions</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:oaColor }}>{oa===null?'—':`${oa}%`}</div>
                  <div style={{ fontSize:10, color:'#9ca3af' }}>overall</div>
                </div>
              </div>

              {breakdown.length > 0 ? (
                <>
                  {/* Grouped by level */}
                  {Object.entries(byLevel).map(([lvlLabel, topics]) => (
                    <div key={lvlLabel} style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:1, marginBottom:6, padding:'4px 8px', background:'#f3f4f6', borderRadius:6 }}>
                        {lvlLabel}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {topics.map(t => (
                          <div key={t.topic} style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:11, color:'#6b7280', width:110, flexShrink:0 }}>{t.label}</span>
                            <div style={{ flex:1, background:'#f3f4f6', borderRadius:99, height:7 }}>
                              <div style={{ background:t.needsWork?'#ef4444':subj.color, borderRadius:99, height:7, width:`${t.score||0}%` }}/>
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:t.needsWork?'#dc2626':subj.color, width:34, textAlign:'right' }}>
                              {t.score===null?'—':`${t.score}%`}
                            </span>
                            <span style={{ fontSize:10, background:t.needsWork?'#fee2e2':subj.light, color:t.needsWork?'#dc2626':subj.color, borderRadius:99, padding:'2px 7px', fontWeight:700, minWidth:44, textAlign:'center' }}>
                              {t.needsWork?'⚠ Weak':['Easy','Medium','Hard'][t.diffLevel]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {breakdown.filter(t=>t.needsWork).length > 0
                    ? <div style={{ background:'#fef3c7', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#92400e', fontWeight:600 }}>
                        ⚠ Needs attention: {breakdown.filter(t=>t.needsWork).map(t=>t.label).join(', ')}
                      </div>
                    : <div style={{ background:'#dcfce7', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#15803d', fontWeight:600 }}>
                        ✅ All topics looking strong!
                      </div>
                  }
                </>
              ) : (
                <div style={{ fontSize:12, color:'#9ca3af', fontStyle:'italic' }}>No sessions yet for this subject.</div>
              )}
            </div>
          );
        })}

        {sessionHistory.length > 0 && (
          <div className="info-card">
            <div style={{ fontFamily:"'Syne',system-ui", fontSize:14, fontWeight:700, color:'#111', marginBottom:12 }}>Recent Sessions</div>
            {sessionHistory.slice(0, 10).map((s, i, arr) => {
              const sub = SUBJECTS.find(sub => sub.id === s.subject);
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:8, marginBottom:8, borderBottom:i<arr.length-1?'1px solid #f3f4f6':'none' }}>
                  <span style={{ fontSize:16 }}>{sub?.icon||'📚'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#111' }}>{sub?.label||s.subject}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{new Date(s.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#4338ca' }}>{s.questionsAnswered} Qs</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
