import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';

const MOODS = [
  { score: 1, emoji: '😢', label: 'Awful' },
  { score: 2, emoji: '😔', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😄', label: 'Great' },
];

const EMOTIONS = ['Anxious', 'Calm', 'Excited', 'Tired', 'Grateful', 'Overwhelmed', 'Hopeful', 'Frustrated', 'Content', 'Lonely', 'Motivated', 'Sad'];

export default function Mood() {
  const { user } = useAuth();
  const [score, setScore] = useState(3);
  const [emotion, setEmotion] = useState('');
  const [note, setNote] = useState('');
  const [history, setHistory] = useState([]);
  const [today, setToday] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_URL}/api/tracking/history/${user.id}`)
      .then(r => r.json())
      .then(d => setHistory(d.mood || []));
    fetch(`${API_URL}/api/tracking/today/${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.mood) {
          setToday(d.mood);
          setScore(d.mood.score);
          setEmotion(d.mood.emotion || '');
          setNote(d.mood.note || '');
        }
      });
  }, [user]);

  const save = async () => {
    await fetch(`${API_URL}/api/tracking/mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, score, emotion, note })
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    const d = await fetch(`${API_URL}/api/tracking/today/${user.id}`).then(r => r.json());
    setToday(d.mood);
    const hist = await fetch(`${API_URL}/api/tracking/history/${user.id}`).then(r => r.json());
    setHistory(hist.mood || []);
  };

  const chartData = history.map(m => ({ date: m.date.slice(5), score: m.score }));

  return (
    <div>
      <div className="page-header">
        <h1>Mood Check-in 🌈</h1>
        <p>Understanding your emotions is the first step to managing them</p>
      </div>

      <div className="grid-2 gap-20">
        <div className="card">
          <h3 style={{ color: 'var(--forest)', marginBottom: 20 }}>How are you feeling today?</h3>

          <div className="mood-grid">
            {MOODS.map(({ score: s, emoji, label }) => (
              <div
                key={s}
                className={`mood-option ${score === s ? 'selected' : ''}`}
                onClick={() => setScore(s)}
              >
                <div className="emoji">{emoji}</div>
                <div className="label">{label}</div>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label>What emotion best describes you right now?</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {EMOTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmotion(emotion === e ? '' : e)}
                  style={{
                    padding: '6px 14px', borderRadius: 50,
                    border: '2px solid', cursor: 'pointer', fontSize: 13,
                    borderColor: emotion === e ? 'var(--sage)' : 'var(--border)',
                    background: emotion === e ? 'var(--sage-pale)' : 'white',
                    color: emotion === e ? 'var(--forest)' : 'var(--muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>What's going on? (optional)</label>
            <textarea
              rows={3}
              placeholder="Share your thoughts freely — this is just for you..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={save} style={{ width: '100%', justifyContent: 'center' }}>
            {saved ? '✓ Logged!' : today ? 'Update Mood' : 'Save Mood'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Today summary */}
          {today && (
            <div className="card card-sm" style={{ background: 'var(--sage-pale)', border: '2px solid var(--sage)' }}>
              <p style={{ color: 'var(--forest)', fontWeight: 500, marginBottom: 4 }}>Today's mood</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 36 }}>{MOODS.find(m => m.score === today.score)?.emoji}</span>
                <div>
                  <p style={{ fontFamily: 'Fraunces', fontSize: 22, color: 'var(--forest)' }}>{MOODS.find(m => m.score === today.score)?.label}</p>
                  {today.emotion && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Feeling {today.emotion}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Mood trend */}
          <div className="card card-sm">
            <h3 style={{ color: 'var(--forest)', marginBottom: 16 }}>Mood Trend (7d)</h3>
            {chartData.length > 1 ? (
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip formatter={(v) => [MOODS.find(m => m.score === v)?.label || v, 'Mood']} />
                    <Line type="monotone" dataKey="score" stroke="#b8a9d9" strokeWidth={2.5} dot={{ fill: '#b8a9d9', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted" style={{ textAlign: 'center', padding: '30px 0' }}>Log mood for at least 2 days to see your trend</p>
            )}
          </div>

          {/* Insight */}
          {history.length >= 3 && (
            <div className="card card-sm">
              <p style={{ fontWeight: 500, color: 'var(--forest)', marginBottom: 8 }}>🔍 Insight</p>
              {(() => {
                const avg = history.reduce((a, b) => a + b.score, 0) / history.length;
                const trend = history.length >= 2 ? history[history.length - 1].score - history[0].score : 0;
                return (
                  <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>
                    Your average mood this week is <strong>{avg.toFixed(1)}/5</strong>.
                    {trend > 0 ? ' 📈 Your mood has been improving — keep going!' : trend < 0 ? ' The trend is downward. Consider talking to Bloom or a friend today.' : ' Your mood has been fairly stable.'}
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
