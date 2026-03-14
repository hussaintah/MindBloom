import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';

export default function Settings() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [sleepReminder, setSleepReminder] = useState(true);
  const [morningCheckin, setMorningCheckin] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState('');
  const [message, setMessage] = useState('');

  const subscribe = async () => {
    setLoading(true);
    setMessage('');
    const res = await fetch(`${API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email, sleepReminder, morningCheckin })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSubscribed(true);
      setMessage('✓ Preferences saved! Check your email for a welcome message.');
    } else {
      setMessage('Error: ' + (data.error || 'Something went wrong'));
    }
  };

  const sendTest = async (type) => {
    setTestLoading(type);
    await fetch(`${API_URL}/api/notifications/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type })
    });
    setTestLoading('');
    setMessage(`✓ Test ${type} email sent to ${email}`);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Settings ⚙️</h1>
        <p>Customize your MindBloom experience</p>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Profile */}
        <div className="card mb-24">
          <h3 style={{ color: 'var(--forest)', marginBottom: 16 }}>Profile</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, color: 'white', fontFamily: 'Fraunces'
            }}>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>{user?.user_metadata?.full_name || 'Wellness Seeker'}</p>
              <p className="text-muted">{user?.email}</p>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--sage-pale)', padding: '10px 14px', borderRadius: 10 }}>
            🔒 Your wellness data is private and only visible to you.
          </p>
        </div>

        {/* Email Notifications */}
        <div className="card mb-24">
          <h3 style={{ color: 'var(--forest)', marginBottom: 6 }}>Email Reminders 📬</h3>
          <p className="text-muted mb-16">Get gentle nudges to keep your wellness habits consistent</p>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', background: 'var(--cream)', borderRadius: 12, cursor: 'pointer'
            }}>
              <div>
                <p style={{ fontWeight: 500 }}>🌙 Nightly sleep reminder</p>
                <p className="text-muted" style={{ fontSize: 12 }}>Sent at 10 PM to remind you to wind down</p>
              </div>
              <input
                type="checkbox" checked={sleepReminder}
                onChange={e => setSleepReminder(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--sage)', cursor: 'pointer' }}
              />
            </label>

            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px', background: 'var(--cream)', borderRadius: 12, cursor: 'pointer'
            }}>
              <div>
                <p style={{ fontWeight: 500 }}>🌅 Morning check-in</p>
                <p className="text-muted" style={{ fontSize: 12 }}>Sent at 8 AM with a daily affirmation</p>
              </div>
              <input
                type="checkbox" checked={morningCheckin}
                onChange={e => setMorningCheckin(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: 'var(--sage)', cursor: 'pointer' }}
              />
            </label>
          </div>

          <button className="btn btn-primary" onClick={subscribe} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
            {loading ? 'Saving...' : subscribed ? '✓ Saved!' : 'Save Notification Preferences'}
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={() => sendTest('morning')} disabled={testLoading === 'morning'}>
              {testLoading === 'morning' ? 'Sending...' : 'Test Morning Email'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => sendTest('sleep')} disabled={testLoading === 'sleep'}>
              {testLoading === 'sleep' ? 'Sending...' : 'Test Sleep Reminder'}
            </button>
          </div>

          {message && (
            <p style={{
              marginTop: 14, padding: '10px 14px', borderRadius: 10, fontSize: 14,
              background: message.startsWith('✓') ? 'var(--sage-pale)' : '#fff0f0',
              color: message.startsWith('✓') ? 'var(--forest)' : '#e53e3e'
            }}>
              {message}
            </p>
          )}
        </div>

        {/* About */}
        <div className="card" style={{ background: 'var(--forest)', color: 'rgba(255,255,255,0.8)' }}>
          <p style={{ fontFamily: 'Fraunces', fontSize: 18, color: 'white', marginBottom: 8 }}>About MindBloom 🌸 <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: 'white', borderRadius: 4, padding: '2px 6px', marginLeft: 4, letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'middle' }}>Beta</span></p>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            MindBloom is a mental wellness tracking app built to help you understand your patterns and build healthier habits.
            Track sleep, log your mood, breathe with intention, and talk to Bloom — your AI wellness companion.
          </p>
          <p style={{ fontSize: 12, marginTop: 12, color: 'rgba(255,255,255,0.5)' }}>
            Built with ❤️ for the Happiness Project
          </p>
        </div>
      </div>
    </div>
  );
}
