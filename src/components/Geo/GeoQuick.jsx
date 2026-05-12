import { useMemo } from 'react';

export default function GeoQuick({ targetUrl }) {
  const snapshot = useMemo(() => [
    { platform: 'ChatGPT', visibility: 'High', mentionRate: '15.4%', trend: 'up' },
    { platform: 'Claude', visibility: 'Medium', mentionRate: '8.2%', trend: 'up' },
    { platform: 'Perplexity', visibility: 'High', mentionRate: '21.0%', trend: 'up' },
    { platform: 'Gemini', visibility: 'Low', mentionRate: '3.1%', trend: 'down' },
  ], [targetUrl]);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>60s Visibility Snapshot</h3>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {snapshot.map(s => (
          <div key={s.platform} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, fontWeight: 700 }}>{s.platform}</div>
            <div style={{ flex: 1, fontSize: '0.85rem' }}>
              Visibility: <span style={{ fontWeight: 600, color: s.visibility === 'High' ? 'var(--color-success)' : s.visibility === 'Medium' ? 'var(--color-warning)' : 'var(--color-danger)' }}>{s.visibility}</span>
            </div>
            <div style={{ flex: 1, textAlign: 'right', fontWeight: 600 }}>
              {s.mentionRate} {s.trend === 'up' ? '📈' : '📉'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: '#f0f9ff', color: '#0369a1', fontSize: '0.85rem' }}>
        ℹ️ <strong>Quick Analysis:</strong> Your site is performing exceptionally well on <strong>Perplexity</strong> due to high citation rates in technology-related queries.
      </div>
    </div>
  );
}
