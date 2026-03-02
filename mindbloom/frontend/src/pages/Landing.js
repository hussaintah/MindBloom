import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    localStorage.setItem('mindbloom_seen_intro', 'true');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #f0f7f4 0%, #fdf8f0 50%, #f0f4f7 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 20px', fontFamily: 'Georgia, serif'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <img src="/logo.jpeg" alt="Amity University - Centre for Science of Happiness"
          style={{ height: 90, objectFit: 'contain', borderRadius: 8 }} />
      </div>

      {/* App title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🌸</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 38, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>
          MindBloom
        </h1>
        <p style={{ color: '#5a7a6a', fontSize: 16, marginTop: 8, maxWidth: 420 }}>
          Your personal wellness companion — track your sleep, understand your mood, and build habits that last.
        </p>
      </div>

      {/* How to use */}
      <div style={{
        background: 'white', borderRadius: 20, padding: '32px 36px',
        maxWidth: 640, width: '100%', boxShadow: '0 4px 32px rgba(74,124,89,0.1)',
        border: '1px solid #e0ede6', marginBottom: 28
      }}>
        <h2 style={{ color: '#2d5a3d', fontSize: 20, marginBottom: 20, textAlign: 'center' }}>
          📖 How to Use MindBloom
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '🏡', title: 'Dashboard', desc: "Your home screen shows a summary of your recent sleep, mood trends, a daily wellness quote, and quick action buttons to log your day." },
            { icon: '💬', title: 'Chat with Bloom', desc: "Talk to Bloom, your AI wellness companion. Share how you're feeling, ask for advice, or just vent. Bloom is always here to listen without judgment." },
            { icon: '🌙', title: 'Sleep Analysis', desc: "Log how many hours you slept and rate your sleep quality every morning. Over time, you'll see patterns and get personalised tips to sleep better." },
            { icon: '🌈', title: 'Mood Tracker', desc: "Check in with your emotions daily using the mood scale. Add emotion tags and a note about your day. Track your mood trends over the week." },
            { icon: '🍃', title: 'Breathing Exercises', desc: "Reduce stress and anxiety with guided breathing exercises. Try Box Breathing, 4-7-8, or Calming Breath — each takes less than 5 minutes." },
            { icon: '⚙️', title: 'Settings', desc: "Subscribe to daily email reminders for sleep logging and morning check-ins. Personalise your experience and manage your account." },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: '#e8f3eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0, border: '2px solid #c0ddc8'
              }}>{icon}</div>
              <div>
                <p style={{ fontWeight: 700, color: '#2d5a3d', fontSize: 15, marginBottom: 3 }}>{title}</p>
                <p style={{ color: '#5a7a6a', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: '#e8f3eb', borderRadius: 16, padding: '20px 28px',
        maxWidth: 640, width: '100%', marginBottom: 28, border: '1px solid #c0ddc8'
      }}>
        <p style={{ fontWeight: 700, color: '#2d5a3d', marginBottom: 10, fontSize: 15 }}>💡 Tips for best results</p>
        <ul style={{ color: '#4a6a5a', fontSize: 14, lineHeight: 2, paddingLeft: 20, margin: 0 }}>
          <li>Log your sleep every morning and mood every evening</li>
          <li>Enable email reminders in Settings so you never forget</li>
          <li>Try a breathing exercise when you feel stressed or anxious</li>
          <li>Chat with Bloom regularly — even a short check-in helps</li>
        </ul>
      </div>

      {/* CTA */}
      <button onClick={handleGetStarted} style={{
        background: '#4a7c59', color: 'white', border: 'none',
        padding: '16px 48px', borderRadius: 50, fontSize: 17,
        fontFamily: 'Georgia, serif', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(74,124,89,0.35)', transition: 'all 0.2s', marginBottom: 20
      }}
        onMouseEnter={e => e.target.style.background = '#2d5a3d'}
        onMouseLeave={e => e.target.style.background = '#4a7c59'}
      >
        Go to Dashboard →
      </button>

      {/* Footer */}
      <div style={{ textAlign: 'center', color: '#8aaa9a', fontSize: 13, lineHeight: 1.8 }}>
        <p>Working for your well-being and made by <strong style={{ color: '#4a7c59' }}>Centre of Happiness</strong></p>
        <p>For any query: <a href="mailto:happyness@amity.edu" style={{ color: '#4a7c59' }}>happyness@amity.edu</a> · <a href="mailto:happyness.amity@gmail.com" style={{ color: '#4a7c59' }}>happyness.amity@gmail.com</a></p>
        <p>Teacher's no.: <a href="tel:+918447968032" style={{ color: '#4a7c59' }}>+91 8447968032</a></p>
      </div>
    </div>
  );
}
