import { useMemo } from 'react';
import { generateGenAIOptimizationData } from '../../utils/demoData';

export default function GeoReport({ targetUrl }) {
  const data = useMemo(() => generateGenAIOptimizationData(targetUrl || 'mezzomedia.co.kr'), [targetUrl]);

  // Aggregate metrics for summary
  const totalTraffic = data.reduce((acc, curr) => acc + curr.referralTraffic, 0);
  const avgZeroClick = (data.reduce((acc, curr) => acc + parseFloat(curr.zeroClickSov), 0) / data.length).toFixed(1);
  const topPlatform = [...data].sort((a,b) => b.zeroClickSov - a.zeroClickSov)[0];

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>제로클릭 유입 및 엔진 노출 리포트</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        주요 AI 챗봇 및 답변 엔진에서 타겟 URL 입력 시 귀하의 웹사이트가 얼마나 빈번하게 노출되고(제로클릭), 실제 유입으로 얼마나 이어지는지 분석합니다.
      </p>

      {/* Zero-Click Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>총 추정 유입 트래픽</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalTraffic.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>PV</span></div>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>평균 제로클릭 노출도</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-navy)' }}>{avgZeroClick}%</div>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>최고 노출 플랫폼</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-warning)' }}>{topPlatform.platform}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '350px' }}>
          <h5 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>플랫폼별 제로클릭 노출 비중</h5>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>실시간 점유율 분석</p>
                <p style={{ fontSize: '0.8rem' }}>AI 답변 내 웹사이트 인용 빈도</p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                   {data.map((d, i) => (
                     <div key={i} style={{ width: '12px', height: `${d.zeroClickSov}%`, background: 'var(--color-primary)', opacity: 1 - i*0.2, borderRadius: '2px' }} title={d.platform} />
                   ))}
                </div>
             </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>플랫폼</th>
                <th>유형</th>
                <th>추정 유입 트래픽</th>
                <th>제로클릭 노출도 (SOV)</th>
                <th>주요 인용 순위</th>
                <th>주요 인용 포맷</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{row.platform}</td>
                  <td><span className="hashtag-chip">{row.type}</span></td>
                  <td>{row.referralTraffic.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#e0e0e0', height: '6px', borderRadius: '3px', width: '50px' }}>
                        <div style={{ width: `${row.zeroClickSov}%`, background: 'var(--color-primary)', height: '100%', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.zeroClickSov}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      color: row.citationRank <= 3 ? 'var(--color-success)' : '#666',
                      fontWeight: 600
                    }}>
                      {row.citationRank}위
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#666' }}>
                    {row.dominantFormat}
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
