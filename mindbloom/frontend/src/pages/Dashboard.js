import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';

const QUOTES = [
  "Every day is a new beginning. Take a deep breath and start again.",
  "Small acts of self-care are revolutionary.",
  "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or frustrated.",
  "Rest is not idleness — it is essential.",
  "Progress, not perfection.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState({ sleep: [], mood: [] });
  const [today, setToday] = useState({ sleep: null, mood: null });
  const [loading, setLoading] = useState(true);
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`${API_URL}/api/tracking/history/${user.id}`).then(r => r.json()),
      fetch(`${API_URL}/api/tracking/today/${user.id}`).then(r => r.json()),
    ]).then(([hist, tod]) => {
      setHistory(hist);
      setToday(tod);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const avgSleep = history.sleep.length
    ? (history.sleep.reduce((a, b) => a + b.hours, 0) / history.sleep.length).toFixed(1)
    : '--';
  const avgMood = history.mood.length
    ? (history.mood.reduce((a, b) => a + b.score, 0) / history.mood.length).toFixed(1)
    : '--';

  const sleepStreak = history.sleep.length;

  const chartData = history.sleep.map((s, i) => ({
    date: s.date.slice(5),
    sleep: s.hours,
    mood: history.mood[i]?.score || null,
  }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-header">
        <h1>{greeting}, {name} 🌿</h1>
        <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: 8 }}>"{quote}"</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {!today.sleep && (
          <Link to="/sleep" className="btn btn-primary btn-sm">🌙 Log Sleep</Link>
        )}
        {!today.mood && (
          <Link to="/mood" className="btn btn-primary btn-sm">🌈 Log Mood</Link>
        )}
        <Link to="/chat" className="btn btn-outline btn-sm">💬 Talk to Bloom</Link>
        <Link to="/breathe" className="btn btn-outline btn-sm">🍃 Breathe</Link>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-24">
        <div className="card card-sm">
          <div className="stat-icon">😴</div>
          <div className="stat-value">{today.sleep ? today.sleep.hours + 'h' : avgSleep + 'h'}</div>
          <div className="stat-label">{today.sleep ? "Sleep last night" : "Avg sleep (7d)"}</div>
          {today.sleep && <span className="badge badge-green" style={{ marginTop: 8 }}>Logged today ✓</span>}
        </div>
        <div className="card card-sm">
          <div className="stat-icon">🌈</div>
          <div className="stat-value">{today.mood ? today.mood.score + '/5' : avgMood}</div>
          <div className="stat-label">{today.mood ? "Today's mood" : "Avg mood (7d)"}</div>
          {today.mood && <span className="badge badge-green" style={{ marginTop: 8 }}>Logged today ✓</span>}
        </div>
        <div className="card card-sm">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{sleepStreak}</div>
          <div className="stat-label">Days logged this week</div>
          {sleepStreak >= 5 && <span className="badge badge-orange" style={{ marginTop: 8 }}>Great streak! 🎉</span>}
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card mb-24">
          <h3 style={{ marginBottom: 16, color: 'var(--forest)' }}>7-Day Overview</h3>
          <div className="chart-wrap" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8a9a8e' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8a9a8e' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #d8e8db' }} />
                <Line type="monotone" dataKey="sleep" stroke="#4a7c59" strokeWidth={2.5} dot={{ fill: '#4a7c59', r: 4 }} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="mood" stroke="#b8a9d9" strokeWidth={2.5} dot={{ fill: '#b8a9d9', r: 4 }} name="Mood (/5)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-16 mt-16">
            <div className="flex items-center gap-8"><div style={{ width: 12, height: 12, borderRadius: 50, background: '#4a7c59' }} /><span className="text-muted">Sleep hours</span></div>
            <div className="flex items-center gap-8"><div style={{ width: 12, height: 12, borderRadius: 50, background: '#b8a9d9' }} /><span className="text-muted">Mood score</span></div>
          </div>
        </div>
      )}

      {/* Wellness Tips */}
      <div className="card">
        <h3 style={{ color: 'var(--forest)', marginBottom: 16 }}>Today's Wellness Tips 🌱</h3>
        <div className="grid-2">
          {[
            { icon: '💧', tip: 'Drink 8 glasses of water today. Hydration directly affects mood.' },
            { icon: '🚶', tip: 'A 10-minute walk outside can reduce anxiety by up to 20%.' },
            { icon: '📵', tip: 'Try a 30-minute phone-free break this afternoon.' },
            { icon: '🙏', tip: 'Write down 3 things you\'re grateful for before bed tonight.' },
          ].map(({ icon, tip }, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px', background: 'var(--cream)', borderRadius: 12 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
