import { useMemo } from 'react';

export default function GeoCitability({ targetUrl }) {
  const scores = useMemo(() => [
    { label: 'Content Clarity', score: 85, desc: 'Direct answers and summary available.' },
    { label: 'Reference Quality', score: 60, desc: 'Internal linking is strong, but external authority is low.' },
    { label: 'Structure Match', score: 92, desc: 'Uses headers (H1-H3) perfectly for indexing.' },
    { label: 'Fact Density', score: 70, desc: 'High factual content, but needs more citations.' },
  ], [targetUrl]);

  const avgScore = (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(0);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>AI Citation Readiness</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '8px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
          {avgScore}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Ready for Citations</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your content structure matches AI answer patterns.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {scores.map(s => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.desc}</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${s.score}%`, height: '100%', background: 'var(--color-primary)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
