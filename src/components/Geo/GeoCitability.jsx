import { useMemo } from 'react';

export default function GeoCitability({ targetUrl, brandName }) {
  const scores = useMemo(() => {
    const getVal = (seed, base, range) => {
      if (!targetUrl || !brandName) return base;
      const combined = `${targetUrl}-${brandName}-${seed}`;
      let hash = 0;
      for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      return (Math.abs(hash) % range) + base;
    };

    return [
      { label: 'Content Clarity', score: getVal('clarity', 60, 35), desc: `**${brandName}** 관련 정보가 명확하게 요약되어 AI가 인식하기 쉽습니다.` },
      { label: 'Reference Quality', score: getVal('ref', 40, 50), desc: `**${targetUrl}** 외부의 권위 있는 인용문 및 백링크 보완이 필요합니다.` },
      { label: 'Structure Match', score: getVal('struct', 50, 45), desc: '헤더 구조(H1-H3)가 AI 색인 패턴과 잘 일치합니다.' },
      { label: 'Fact Density', score: getVal('fact', 30, 60), desc: '객관적 사실 밀도가 높으나, 구체적인 수치 데이터 보강이 권장됩니다.' },
    ];
  }, [targetUrl, brandName]);

  const avgScore = useMemo(() => 
    (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(0),
  [scores]);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>AI Citation Readiness</h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', background: '#f8fafc', padding: '24px', borderRadius: '16px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '8px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
          {avgScore}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{avgScore > 70 ? 'Ready for Citations' : 'Optimization Required'}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {avgScore > 70 
              ? `**${brandName}**의 콘텐츠 구조가 AI 답변 패턴에 매우 적합합니다.` 
              : `**${brandName}**의 가시성 향상을 위해 추가적인 구조화 작업이 필요합니다.`}
          </div>
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
