import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);

    if (tab === 'signin') {
      const { error } = await signIn(email, password);
      if (error) { setError(error.message); setLoading(false); return; }
      // Show intro only if they haven't seen it before
      const seenIntro = localStorage.getItem('mindbloom_seen_intro');
      navigate(seenIntro ? '/' : '/intro');
    } else {
      if (!name) { setError('Please enter your name'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else setMessage('Account created! Sign in to continue.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
          <h1>MindBloom <span style={{ fontSize: '0.38em', fontWeight: 700, background: 'rgba(45,90,61,0.12)', color: 'var(--teal, #2d7a55)', border: '1px solid rgba(45,90,61,0.25)', borderRadius: 5, padding: '2px 7px', verticalAlign: 'middle', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }}>Beta</span></h1>
          <p>Your daily mental wellness companion</p>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => setTab('signin')}>Sign In</div>
          <div className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</div>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label>Your name</label>
              <input type="text" placeholder="What should we call you?" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ color: '#e53e3e', fontSize: 14, marginBottom: 16 }}>{error}</p>}
          {message && <p style={{ color: '#2d5a3d', fontSize: 14, marginBottom: 16, background: '#e8f3eb', padding: '10px 14px', borderRadius: 8 }}>{message}</p>}

          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', width: '100%' }}>
            {loading ? 'Please wait...' : tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: 12, marginTop: 20 }}>
          Your data is private and secure 🔒
        </p>
      </div>
    </div>
  );
}
