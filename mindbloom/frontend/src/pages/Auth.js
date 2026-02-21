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
      if (error) setError(error.message);
      else navigate('/');
    } else {
      if (!name) return setError('Please enter your name'), setLoading(false);
      const { error } = await signUp(email, password, name);
      if (error) setError(error.message);
      else setMessage('Check your email to confirm your account!');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
          <h1>MindBloom</h1>
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
