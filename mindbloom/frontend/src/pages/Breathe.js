import { useState, useEffect, useRef } from 'react';

const EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Used by Navy SEALs to calm the mind under stress',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
    color: '#4a7c59',
    bg: '#e8f3eb',
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'A natural tranquilizer for the nervous system',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
    color: '#7c4a7a',
    bg: '#f3e8f3',
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    description: 'Simple deep breathing to reduce anxiety quickly',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Exhale', duration: 6 },
    ],
    color: '#4a6a7c',
    bg: '#e8eef3',
  }
];

export default function Breathe() {
  const [selected, setSelected] = useState(EXERCISES[0]);
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  const currentPhase = selected.phases[phaseIdx];

  const stop = () => {
    clearInterval(timerRef.current);
    setActive(false);
    setPhaseIdx(0);
    setSecondsLeft(0);
    setCycles(0);
  };

  const start = () => {
    setActive(true);
    setPhaseIdx(0);
    setCycles(0);
    setSecondsLeft(selected.phases[0].duration);
  };

  useEffect(() => {
    if (!active) return;
    setSecondsLeft(currentPhase.duration);

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextIdx = (phaseIdx + 1) % selected.phases.length;
          setPhaseIdx(nextIdx);
          if (nextIdx === 0) setCycles(c => c + 1);
          return selected.phases[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [active, phaseIdx, selected]);

  const getCircleClass = () => {
    if (!active) return '';
    if (currentPhase.label === 'Inhale') return 'inhale';
    if (currentPhase.label === 'Exhale') return 'exhale';
    return 'hold';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Breathing Exercises 🍃</h1>
        <p>Controlled breathing activates your parasympathetic nervous system</p>
      </div>

      {/* Exercise selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
        {EXERCISES.map(ex => (
          <button
            key={ex.id}
            onClick={() => { stop(); setSelected(ex); }}
            style={{
              padding: '12px 20px', borderRadius: 12,
              border: '2px solid',
              borderColor: selected.id === ex.id ? ex.color : 'var(--border)',
              background: selected.id === ex.id ? ex.bg : 'white',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 14, color: selected.id === ex.id ? ex.color : 'var(--slate)' }}>{ex.name}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ex.description}</p>
          </button>
        ))}
      </div>

      <div className="breathe-container">
        {/* Phase indicators */}
        <div style={{ display: 'flex', gap: 8 }}>
          {selected.phases.map((phase, i) => (
            <div key={i} style={{
              padding: '6px 16px', borderRadius: 50,
              background: active && phaseIdx === i ? selected.color : 'var(--border)',
              color: active && phaseIdx === i ? 'white' : 'var(--muted)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.3s'
            }}>
              {phase.label} {phase.duration}s
            </div>
          ))}
        </div>

        {/* Main circle */}
        <div
          className={`breathe-circle ${getCircleClass()}`}
          style={{ background: `radial-gradient(circle, ${selected.color}aa, ${selected.color})` }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, opacity: 0.9 }}>
              {active ? currentPhase.label : 'Ready'}
            </div>
            {active && (
              <div style={{ fontSize: 40, fontWeight: 300, lineHeight: 1, marginTop: 4 }}>
                {secondsLeft}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!active ? (
            <button className="btn btn-primary" onClick={start}>
              Start Exercise
            </button>
          ) : (
            <button className="btn btn-outline" onClick={stop}>
              Stop
            </button>
          )}
        </div>

        {cycles > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces', fontSize: 36, color: selected.color }}>{cycles}</div>
            <div className="text-muted">cycles completed</div>
          </div>
        )}

        {/* Tips */}
        <div className="card" style={{ maxWidth: 500, background: selected.bg, border: `1px solid ${selected.color}33` }}>
          <h3 style={{ color: selected.color, marginBottom: 8 }}>How to do {selected.name}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selected.phases.map((phase, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--slate)' }}>
                <strong>{i + 1}. {phase.label}</strong> — breathe {phase.label.toLowerCase()} for <strong>{phase.duration} seconds</strong>
                {phase.label === 'Hold' && ' (hold your breath)'}
              </p>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 12 }}>
            Aim for 4-6 cycles for best results. Best practiced daily or during stress.
          </p>
        </div>
      </div>
    </div>
  );
}
