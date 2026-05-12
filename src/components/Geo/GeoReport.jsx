import { useMemo } from 'react';
import { generateGenAIOptimizationData } from '../../utils/demoData';

export default function GeoReport({ targetUrl, brandName }) {
  const brand = brandName || '지정 브랜드';
  const data = useMemo(() => generateGenAIOptimizationData(targetUrl || 'mezzomedia.co.kr'), [targetUrl]);

  // Aggregate metrics for summary
  const totalTraffic = data.reduce((acc, curr) => acc + curr.referralTraffic, 0);
  const avgZeroClick = (data.reduce((acc, curr) => acc + parseFloat(curr.zeroClickSov), 0) / data.length).toFixed(1);
  const topPlatform = [...data].sort((a,b) => b.zeroClickSov - a.zeroClickSov)[0];

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>AI 답변 엔진 가시성 및 제로클릭 분석</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
        주요 AI 답변 엔진(Search GPT, Perplexity 등)에서 **{brand}** 관련 쿼리 시 웹사이트가 인용되는 비중(SOV)과 실제 유입 트래픽을 분석합니다.
      </p>

      {/* Zero-Click Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>월간 추정 AI 유입량</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{totalTraffic.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>PV</span></div>
        </div>
        <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>평균 제로클릭 SOV</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{avgZeroClick}%</div>
        </div>
        <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>최적 최적화 플랫폼</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{topPlatform.platform}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px' }}>
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '24px', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <h5 style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700 }}>플랫폼별 인용 비중</h5>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
             {data.map((d, i) => (
               <div key={i}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px', opacity: 0.8 }}>
                   <span>{d.platform}</span>
                   <span>{d.zeroClickSov}%</span>
                 </div>
                 <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                   <div style={{ width: `${d.zeroClickSov}%`, height: '100%', background: '#38bdf8' }} />
                 </div>
               </div>
             ))}
          </div>
          <p style={{ fontSize: '0.7rem', marginTop: '24px', opacity: 0.6, lineHeight: '1.4' }}>
            ※ 제로클릭 SOV는 사용자가 답변을 보는 것만으로 정보를 획득하여 클릭하지 않는 비율을 포함한 점유율입니다.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '12px' }}>엔진 플랫폼</th>
                <th>추정 유입량</th>
                <th>SOV</th>
                <th>인용 순위</th>
                <th>핵심 인용 포맷</th>
                <th>성장률</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, padding: '12px' }}>{row.platform}</td>
                  <td>{row.referralTraffic.toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PV</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{row.zeroClickSov}%</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: row.citationRank <= 2 ? '#fff7ed' : '#f1f5f9',
                      color: row.citationRank <= 2 ? '#ea580c' : '#475569',
                      fontWeight: 800
                    }}>
                      Top {row.citationRank}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>
                    {row.dominantFormat}
                  </td>
                  <td style={{ fontWeight: 700, color: parseFloat(row.growth) > 0 ? '#059669' : '#dc2626' }}>
                    {parseFloat(row.growth) > 0 ? '+' : ''}{row.growth}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
