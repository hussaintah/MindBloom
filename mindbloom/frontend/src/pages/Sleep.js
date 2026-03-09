import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';

const QUALITY_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Great'];

const SLEEP_VIDEOS = [
  { title: 'The Benefits of a Good Night\'s Sleep', channel: 'TED-Ed', url: 'https://www.youtube.com/watch?v=gedoSfZvBgE', thumb: '😴' },
  { title: 'Master Your Sleep & Be More Alert When Awake', channel: 'Dr. Andrew Huberman', url: 'https://www.youtube.com/watch?v=nm1TxQj9IsQ', thumb: '🧠' },
  { title: 'Sleep is Your Superpower', channel: 'TED', url: 'https://www.youtube.com/watch?v=5MuIMqhT8DM', thumb: '✨' },
  { title: 'How To Cure Insomnia & Build Better Sleep Habits', channel: 'Psych2Go', url: 'https://www.youtube.com/watch?v=ZkY3OWYW0Gk', thumb: '🌙' },
  { title: '6 Tips for Better Sleep', channel: 'TED', url: 'https://www.youtube.com/watch?v=t0kACis_dJE', thumb: '🔬' },
  { title: 'The Science of Sleep & Dreams', channel: 'CrashCourse', url: 'https://www.youtube.com/watch?v=rMHus-0wFSo', thumb: '⏰' },
];

export default function Sleep() {
  const { user } = useAuth();
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState([]);
  const [today, setToday] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/tracking/history/${user.id}`)
      .then(r => r.json()).then(d => setHistory(d.sleep || []));
    fetch(`${API_URL}/api/tracking/today/${user.id}`)
      .then(r => r.json()).then(d => {
        if (d.sleep) { setToday(d.sleep); setHours(d.sleep.hours); setQuality(d.sleep.quality); setNotes(d.sleep.notes || ''); }
      });
  }, [user]);

  const save = async () => {
    setLoading(true);
    await fetch(`${API_URL}/api/tracking/sleep`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, hours, quality, notes })
    });
    setSaved(true); setLoading(false);
    setTimeout(() => setSaved(false), 3000);
    const d = await fetch(`${API_URL}/api/tracking/today/${user.id}`).then(r => r.json());
    setToday(d.sleep);
    const hist = await fetch(`${API_URL}/api/tracking/history/${user.id}`).then(r => r.json());
    setHistory(hist.sleep || []);
  };

  const avgSleep = history.length ? (history.reduce((a, b) => a + b.hours, 0) / history.length).toFixed(1) : 0;
  const chartData = history.map(s => ({ date: s.date.slice(5), hours: s.hours }));

  const getSleepTip = (h) => {
    if (h < 6) return "You're sleeping less than recommended. Try going to bed 30 minutes earlier tonight.";
    if (h < 7) return "You're close to optimal sleep! Aim for 7-9 hours for better mental health.";
    if (h <= 9) return "Great sleep duration! Consistent sleep is key to emotional wellbeing.";
    return "More than 9 hours — if you feel groggy, try adjusting your sleep schedule.";
  };

  return (
    <div>
      <div className="page-header">
        <h1>Sleep Analysis 🌙</h1>
        <p>Quality sleep is the foundation of mental health</p>
      </div>

      <div className="grid-2 gap-20">
        {/* Log form */}
        <div className="card">
          <h3 style={{ color: 'var(--forest)', marginBottom: 20 }}>
            {today ? "Update today's sleep" : "Log last night's sleep"}
          </h3>
          <div className="form-group">
            <label>Hours slept</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <input type="range" min="0" max="12" step="0.5" value={hours}
                onChange={e => setHours(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--sage)' }} />
              <span style={{ fontFamily: 'Fraunces', fontSize: 28, color: 'var(--forest)', minWidth: 60 }}>{hours}h</span>
            </div>
            <div style={{ background: 'var(--sage-pale)', borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--forest)' }}>💡 {getSleepTip(hours)}</p>
            </div>
          </div>
          <div className="form-group">
            <label>Sleep quality</label>
            <div className="quality-slider">
              {QUALITY_LABELS.map((label, i) => (
                <button key={i} className={`quality-btn ${quality === i + 1 ? 'selected' : ''}`} onClick={() => setQuality(i + 1)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea rows={3} placeholder="Any dreams? Woke up during the night? Stress affecting sleep?"
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={save} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Saving...' : saved ? '✓ Saved!' : today ? 'Update Log' : 'Save Sleep Log'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card card-sm">
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div className="stat-icon">😴</div>
                <div className="stat-value">{avgSleep}h</div>
                <div className="stat-label">7-day average</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Sleep Health</div>
                <div style={{ fontFamily: 'Fraunces', fontSize: 22, color: avgSleep >= 7 ? 'var(--sage)' : 'var(--sunrise)' }}>
                  {avgSleep >= 7 ? 'Good 🟢' : avgSleep >= 6 ? 'Fair 🟡' : 'Poor 🔴'}
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginTop: 16 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, (avgSleep / 9) * 100)}%` }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Target: 7-9 hours</p>
          </div>

          <div className="card card-sm">
            <h3 style={{ color: 'var(--forest)', marginBottom: 16 }}>Sleep History (7d)</h3>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine y={7} stroke="#4a7c59" strokeDasharray="3 3" />
                  <ReferenceLine y={9} stroke="#4a7c59" strokeDasharray="3 3" />
                  <Bar dataKey="hours" fill="#7ab08a" radius={[4, 4, 0, 0]} name="Hours slept" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>Green lines = ideal range (7-9h)</p>
          </div>
        </div>
      </div>

      {/* Sleep Videos Section */}
      <div style={{ marginTop: 36 }}>
        <h2 style={{ fontFamily: 'Fraunces, Georgia, serif', color: 'var(--forest)', fontSize: 22, marginBottom: 6 }}>
          🎬 Learn About Sleep
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
          Watch these videos to understand the science of sleep and how to improve yours.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {SLEEP_VIDEOS.map((video, i) => (
            <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                transition: 'all 0.2s', cursor: 'pointer', border: '1px solid var(--border)'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--sage)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: 'var(--sage-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0
                }}>{video.thumb}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--forest)', lineHeight: 1.4, marginBottom: 4 }}>{video.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>▶ {video.channel} · YouTube</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
