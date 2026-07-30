// src/lib/auth_screens.jsx
// Auth screens — SignupScreen, SigninScreen, AuthPrompt,
//                ForgotPasswordScreen, ForgotPINScreen

import { useState, useEffect } from 'react';
import { useStore } from './store';
import { fetchSchools, fetchCities } from './supabase_sync';

const fieldStyle = {
  width:'100%', padding:'13px 15px', border:'1.5px solid #e5e7eb',
  borderRadius:11, fontFamily:'inherit', fontSize:15, color:'#111',
  outline:'none', marginBottom:14
};

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

// ─── AUTH PROMPT ───────────────────────────────────────────────────────────
export function AuthPrompt({ setScreen, goHome, mandatory = false }) {
  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'32px 20px 48px', textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🚀</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', marginBottom:6 }}>
          {mandatory ? 'Almost there!' : "You're on a roll!"}
        </div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:14, lineHeight:1.6 }}>
          {mandatory
            ? 'Create a free account to keep practising and save your progress. It takes 30 seconds!'
            : 'Sign in or create a free account to save your progress and practise unlimited questions.'}
        </div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        <div style={{ background:'#f0effe', borderRadius:16, padding:20, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#4338ca', marginBottom:4 }}>Already have an account?</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:14 }}>Sign in to continue where you left off.</div>
          <button style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:'#4338ca', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}
            onClick={() => setScreen('signin')}>Sign In →</button>
        </div>
        <div style={{ background:'#f0fdf4', borderRadius:16, padding:20, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#166534', marginBottom:4 }}>New to Leap IQ?</div>
          <div style={{ fontSize:12, color:'#6b7280', marginBottom:14 }}>Create a free account — takes 30 seconds.</div>
          <button style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:'#166534', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}
            onClick={() => setScreen('signup')}>Create Free Account →</button>
        </div>
        {!mandatory && (
          <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}
            onClick={goHome}>Maybe later — go home</button>
        )}
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:16, lineHeight:1.5 }}>
          Free forever · No credit card needed · Your data stays private
        </p>
      </div>
    </div>
  );
}

// ─── SIGN UP ───────────────────────────────────────────────────────────────
export function SignupScreen({ setScreen, goHome }) {
  const [name,           setName]           = useState('');
  const [email,          setEmail]          = useState('');
  const [pass,           setPass]           = useState('');
  const [pass2,          setPass2]          = useState('');
  const [grade,          setGrade]          = useState('');
  const [city,           setCity]           = useState('');
  const [schoolId,       setSchoolId]       = useState('');
  const [shareData,      setShareData]      = useState(null);
  const [cities,         setCities]         = useState([]);
  const [schools,        setSchools]        = useState([]);
  const [loadingCities,  setLoadingCities]  = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [err,            setErr]            = useState('');
  const [submitting,     setSubmitting]     = useState(false);

  const GRADES = ['Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Other'];

  useEffect(() => {
    async function loadCities() {
      try {
        const data = await fetchCities();
        setCities(data || []);
      } catch(e) {
        console.error('Failed to load cities:', e);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  useEffect(() => {
    if (!city) { setSchools([]); setSchoolId(''); setShareData(null); return; }
    setLoadingSchools(true);
    setSchoolId('');
    setShareData(null);
    async function loadSchools() {
      try {
        const data = await fetchSchools(city);
        setSchools(data || []);
      } catch(e) {
        console.error('Failed to load schools:', e);
      } finally {
        setLoadingSchools(false);
      }
    }
    loadSchools();
  }, [city]);

  function handleSchoolChange(e) {
    setSchoolId(e.target.value);
    setShareData(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    setErr('');
    if (!name.trim())         { setErr('Please enter your name.'); return; }
    if (!email.includes('@')) { setErr('Please enter a valid email.'); return; }
    if (!grade)               { setErr('Please select your grade.'); return; }
    if (pass.length < 6)      { setErr('Password must be at least 6 characters.'); return; }
    if (pass !== pass2)       { setErr('Passwords do not match.'); return; }
    if (schoolId && shareData === null) { setErr('Please tell us if you want to share data with your school.'); return; }

    setSubmitting(true);
    try {
      await useStore.getState().register({
        name:      name.trim(),
        email:     email.trim().toLowerCase(),
        grade,
        city,
        password:  pass,
        schoolId:  shareData ? schoolId : null,
        shareData: shareData || false,
      });
      setScreen('signup_done');
    } catch(err) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'32px 20px 48px', textAlign:'center' }}>
        <div style={{ textAlign:'left', marginBottom:8 }}>
          <button style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 13px', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}
            onClick={goHome}>← Back</button>
        </div>
        <div style={{ fontSize:48, marginBottom:8 }}>🚀</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:24, fontWeight:800, color:'#fff', marginBottom:6 }}>Join Leap IQ</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:14 }}>Free to start · Track your progress</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18, overflowY:'auto' }}>
        <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column' }}>

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Your Name</label>
          <input style={fieldStyle} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Arjun Sharma" />

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Email Address</label>
          <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Your Grade</label>
          <select style={fieldStyle} value={grade} onChange={e=>setGrade(e.target.value)}>
            <option value="">Select grade...</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>
            Your City <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span>
          </label>
          <select style={fieldStyle} value={city} onChange={e=>setCity(e.target.value)} disabled={loadingCities}>
            <option value="">{loadingCities ? 'Loading cities...' : 'Select city...'}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {city && (
            <>
              <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>
                Your School <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span>
              </label>
              <select style={fieldStyle} value={schoolId} onChange={handleSchoolChange} disabled={loadingSchools}>
                <option value="">{loadingSchools ? 'Loading schools...' : 'Select school...'}</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </>
          )}

          {schoolId && (
            <div style={{ background:'#f0effe', borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#4338ca', marginBottom:6 }}>📊 Share progress with your school?</div>
              <div style={{ fontSize:12, color:'#6b7280', marginBottom:12, lineHeight:1.5 }}>
                Your school will be able to see your practice progress and scores. They will need to accept your request first.
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button"
                  style={{ flex:1, padding:'10px 0', borderRadius:10, border:`2px solid ${shareData===true?'#4338ca':'#e5e7eb'}`, background:shareData===true?'#4338ca':'#fff', color:shareData===true?'#fff':'#374151', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}
                  onClick={() => setShareData(true)}>✓ Yes, share</button>
                <button type="button"
                  style={{ flex:1, padding:'10px 0', borderRadius:10, border:`2px solid ${shareData===false?'#374151':'#e5e7eb'}`, background:shareData===false?'#374151':'#fff', color:shareData===false?'#fff':'#374151', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer' }}
                  onClick={() => setShareData(false)}>✗ No, keep private</button>
              </div>
            </div>
          )}

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Password</label>
          <input style={fieldStyle} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="At least 6 characters" />

          <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Confirm Password</label>
          <input style={fieldStyle} type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Retype password" />

          {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}

          <button type="submit" disabled={submitting}
            style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:submitting?'#9ca3af':'#4338ca', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:submitting?'not-allowed':'pointer' }}>
            {submitting ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:16 }}>
          <div style={{ fontSize:13, color:'#6b7280', marginBottom:8 }}>Already have an account?</div>
          <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}
            onClick={() => setScreen('signin')}>Sign In →</button>
        </div>
        <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer', marginTop:10 }}
          onClick={goHome}>Skip for now</button>
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:16, lineHeight:1.5 }}>
          Your data is private and never shared without your consent.
        </p>
      </div>
    </div>
  );
}

// ─── SIGN IN — 3 tabs (or 2 tabs for parent portal) ───────────────────────
export function SigninScreen({ setScreen, goHome, parentOnly = false }) {
  const [tab, setTab] = useState(parentOnly ? 'parent' : 'student');

  // Tabs to show
  const tabs = parentOnly
    ? [['parent','Parent'],['school','School']]
    : [['student','Student'],['parent','Parent'],['school','School']];

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'28px 20px 48px', textAlign:'center' }}>
        <div style={{ textAlign:'left', marginBottom:8 }}>
          <button style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 13px', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}
            onClick={goHome}>← Back</button>
        </div>
        <div style={{ fontSize:44, marginBottom:8 }}>👋</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', marginBottom:16 }}>
          {parentOnly ? 'Parent / Teacher Login' : 'Welcome back!'}
        </div>
        <div style={{ display:'flex', background:'rgba(255,255,255,0.15)', borderRadius:12, padding:4, gap:4 }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ flex:1, padding:'9px 0', borderRadius:9, border:'none', fontFamily:'inherit', fontWeight:700, fontSize:13, cursor:'pointer',
                background: tab===id ? '#fff' : 'transparent',
                color:      tab===id ? '#4338ca' : 'rgba(255,255,255,0.8)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex:1, background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18, overflowY:'auto' }}>
        {tab === 'student' && <StudentLoginTab setScreen={setScreen} goHome={goHome} />}
        {tab === 'parent'  && <ParentLoginTab  setScreen={setScreen} goHome={goHome} />}
        {tab === 'school'  && <SchoolLoginTab  setScreen={setScreen} goHome={goHome} />}
      </div>
    </div>
  );
}

// ── Student Login Tab ───────────────────────────────────────────────────────
function StudentLoginTab({ setScreen, goHome }) {
  const { user } = useStore();
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignin(e) {
    e.preventDefault();
    setErr('');
    if (!email.trim()) { setErr('Please enter your email.'); return; }
    if (!pass.trim())  { setErr('Please enter your password.'); return; }

    setLoading(true);
    try {
      // Check localStorage first
      let foundUser = user;

      // If not in localStorage or email doesn't match — fetch from Supabase
      if (!foundUser || foundUser.email.toLowerCase() !== email.trim().toLowerCase()) {
        const { fetchStudentByEmail } = await import('./supabase_sync');
        const student = await fetchStudentByEmail(email.trim());

        if (!student) {
          setErr('No account found with this email. Please register first.');
          setLoading(false);
          return;
        }

        if (student.password_hash !== pass) {
          setErr('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        // Rebuild user object from Supabase data
        foundUser = {
          id:               student.id,
          supabaseId:       student.id,
          name:             student.full_name,
          email:            student.email,
          grade:            student.grade,
          city:             student.city || '',
          password:         student.password_hash,
          parentPin:        student.pin,
          parentPinChanged: false,
          streak:           0,
          lastPracticeDate: null,
        };
      } else {
        // Found in localStorage — verify password
        if (foundUser.password !== pass) {
          setErr('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }
      }

      useStore.getState().login(foundUser);
      showToast(`Welcome back, ${foundUser.name?.split(' ')[0]}! 👋`, '#4338ca');
      goHome();
    } catch (err) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding:'24px 20px' }}>
      <form onSubmit={handleSignin} style={{ display:'flex', flexDirection:'column' }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Email Address</label>
        <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />

        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Password</label>
        <input style={fieldStyle} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" />

        <button type="button"
          style={{ background:'none', border:'none', color:'#4338ca', fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'right', marginTop:-10, marginBottom:14, padding:0 }}
          onClick={() => setScreen('forgot_password')}>
          Forgot password?
        </button>

        {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}

        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:loading?'#9ca3af':'#4338ca', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:loading?'not-allowed':'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>
      </form>
      <div style={{ textAlign:'center', marginTop:20 }}>
        <div style={{ fontSize:13, color:'#6b7280', marginBottom:10 }}>Don't have an account yet?</div>
        <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}
          onClick={() => setScreen('signup')}>Create Free Account →</button>
      </div>
    </div>
  );
}

// ── Parent Login Tab ────────────────────────────────────────────────────────
function ParentLoginTab({ setScreen, goHome }) {
  const { user } = useStore();
  const [email,   setEmail]   = useState('');
  const [pin,     setPin]     = useState('');
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErr('');
    if (!email.trim())  { setErr("Please enter the student's email."); return; }
    if (pin.length < 6) { setErr('Please enter the full 6-digit PIN.'); return; }

    setLoading(true);
    try {
      let foundUser = user;

      // If not in localStorage — fetch from Supabase
      if (!foundUser || foundUser.email.toLowerCase() !== email.trim().toLowerCase()) {
        const { fetchStudentByEmail } = await import('./supabase_sync');
        const student = await fetchStudentByEmail(email.trim());

        if (!student) {
          setErr('No student found with this email.');
          setLoading(false);
          return;
        }

        if (pin !== student.pin) {
          setErr('Incorrect PIN. Please try again.');
          setLoading(false);
          return;
        }

        foundUser = {
          id:               student.id,
          supabaseId:       student.id,
          name:             student.full_name,
          email:            student.email,
          grade:            student.grade,
          city:             student.city || '',
          password:         student.password_hash,
          parentPin:        student.pin,
          parentPinChanged: false,
          streak:           0,
          lastPracticeDate: null,
        };
      } else {
        if (pin !== foundUser.parentPin) {
          setErr('Incorrect PIN. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Store found user then go to parent dashboard
      useStore.getState().login(foundUser);
      if (!foundUser.parentPinChanged) { setScreen('parent_pin'); }
      else { setScreen('parent_dash'); }
    } catch(err) {
      setErr('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding:'24px 20px' }}>
      <div style={{ background:'#f0effe', borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:12, color:'#4338ca', fontWeight:600, lineHeight:1.5 }}>
        🔐 Parents log in using their child's email address and the 6-digit PIN shown on registration.
      </div>
      <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column' }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Student's Email Address</label>
        <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@email.com" />

        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>6-Digit Parent PIN</label>
        <input style={{ ...fieldStyle, letterSpacing:8, fontSize:22, textAlign:'center' }}
          type="tel" maxLength={6} value={pin}
          onChange={e=>setPin(e.target.value.replace(/\D/,'').slice(0,6))}
          placeholder="••••••" />

        <button type="button"
          style={{ background:'none', border:'none', color:'#4338ca', fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'right', marginTop:-10, marginBottom:14, padding:0 }}
          onClick={() => setScreen('forgot_pin')}>
          Forgot PIN?
        </button>

        {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}

        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:loading?'#9ca3af':'#4338ca', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:loading?'not-allowed':'pointer' }}>
          {loading ? 'Checking...' : 'Access Dashboard →'}
        </button>
      </form>
      <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:20, lineHeight:1.6 }}>
        On your first login you'll set a private PIN the student won't know.
      </p>
    </div>
  );
}

// ── School Login Tab ────────────────────────────────────────────────────────
function SchoolLoginTab({ setScreen, goHome }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');

  function handleLogin(e) {
    e.preventDefault();
    setErr('School admin login coming soon. Please contact support@leapiq.app');
  }

  return (
    <div style={{ padding:'24px 20px' }}>
      <div style={{ background:'#fef3c7', borderRadius:12, padding:'12px 14px', marginBottom:20, fontSize:12, color:'#92400e', fontWeight:600, lineHeight:1.5 }}>
        🏫 School admin accounts are created by Leap IQ. Contact us at support@leapiq.app to set up your school account.
      </div>
      <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column' }}>
        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>School Admin Email</label>
        <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@school.com" />
        <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Password</label>
        <input style={fieldStyle} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Your password" />
        {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}
        <button type="submit" style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:'#1e1b4b', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}>
          School Login →
        </button>
      </form>
    </div>
  );
}

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
export function ForgotPasswordScreen({ setScreen, goHome }) {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);
  const [err,   setErr]   = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Please enter a valid email.'); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4338ca)', padding:'28px 20px 44px', textAlign:'center' }}>
        <div style={{ textAlign:'left' }}>
          <button style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 13px', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}
            onClick={() => setScreen('signin')}>← Back</button>
        </div>
        <div style={{ fontSize:44, marginBottom:8, marginTop:12 }}>🔑</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Forgot Password?</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>We'll send a reset link to your email</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column' }}>
            <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Your Email Address</label>
            <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
            {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}
            <button type="submit" style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:'#4338ca', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}>
              Send Reset Email →
            </button>
          </form>
        ) : (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📧</div>
            <div style={{ fontFamily:"'Syne',system-ui", fontSize:18, fontWeight:700, color:'#111', marginBottom:10 }}>Check your email!</div>
            <div style={{ fontSize:14, color:'#6b7280', lineHeight:1.6, marginBottom:24 }}>
              We've sent a password reset link to <strong>{email}</strong>.
            </div>
            <div style={{ background:'#FEF3C7', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#92400e', fontWeight:600, marginBottom:24 }}>
              ⚠ Email sending will be available once we set up the email service.
            </div>
            <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}
              onClick={() => setScreen('signin')}>Back to Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FORGOT PIN ────────────────────────────────────────────────────────────
export function ForgotPINScreen({ setScreen, goHome }) {
  const [email, setEmail] = useState('');
  const [sent,  setSent]  = useState(false);
  const [err,   setErr]   = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!email.includes('@')) { setErr('Please enter a valid email.'); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column' }}>
      <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', padding:'28px 20px 44px', textAlign:'center' }}>
        <div style={{ textAlign:'left' }}>
          <button style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:8, padding:'6px 13px', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13 }}
            onClick={() => setScreen('signin')}>← Back</button>
        </div>
        <div style={{ fontSize:44, marginBottom:8, marginTop:12 }}>🔐</div>
        <div style={{ fontFamily:"'Syne',system-ui", fontSize:22, fontWeight:800, color:'#fff', marginBottom:6 }}>Forgot Parent PIN?</div>
        <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>A new PIN will be sent to the student's email</div>
      </div>
      <div style={{ flex:1, padding:'24px 20px', background:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, marginTop:-18 }}>
        {!sent ? (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column' }}>
            <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:6 }}>Student's Email Address</label>
            <input style={fieldStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@email.com" />
            {err && <div style={{ color:'#dc2626', fontSize:13, fontWeight:600, padding:'10px 14px', background:'#fee2e2', borderRadius:10, marginBottom:12 }}>{err}</div>}
            <button type="submit" style={{ width:'100%', padding:15, border:'none', borderRadius:13, background:'#1e1b4b', color:'#fff', fontFamily:'inherit', fontWeight:800, fontSize:15, cursor:'pointer' }}>
              Send New PIN →
            </button>
          </form>
        ) : (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📧</div>
            <div style={{ fontFamily:"'Syne',system-ui", fontSize:18, fontWeight:700, color:'#111', marginBottom:10 }}>New PIN sent!</div>
            <div style={{ fontSize:14, color:'#6b7280', lineHeight:1.6, marginBottom:24 }}>
              A new Parent PIN has been sent to <strong>{email}</strong>.
            </div>
            <div style={{ background:'#FEF3C7', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#92400e', fontWeight:600, marginBottom:24 }}>
              ⚠ Email sending will be available once we set up the email service.
            </div>
            <button style={{ width:'100%', padding:13, border:'1.5px solid #e5e7eb', borderRadius:13, background:'#fff', color:'#374151', fontFamily:'inherit', fontWeight:700, fontSize:14, cursor:'pointer' }}
              onClick={() => setScreen('signin')}>Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
}
