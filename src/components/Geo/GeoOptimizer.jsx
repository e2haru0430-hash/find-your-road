import { useMemo } from 'react';
import { generateGenAIOptimizationData } from '../../utils/demoData';

export default function GeoOptimizer({ targetUrl, brandName }) {
  const brand = brandName || '지정 브랜드';
  const data = useMemo(() => generateGenAIOptimizationData(targetUrl || 'mezzomedia.co.kr'), [targetUrl]);
  
  // Create actionable insights
  const topPlatform = [...data].sort((a,b) => b.zeroClickSov - a.zeroClickSov)[0];
  const fastGrowingPlatform = [...data].sort((a,b) => b.growth - a.growth)[0];
  const lowSovPlatform = [...data].sort((a,b) => a.zeroClickSov - b.zeroClickSov)[0];

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>AEO(Answer Engine Optimization) 맞춤 전략 옵티마이저</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
        생성형 AI 플랫폼별 인용 데이터와 가시성 점유율을 바탕으로 **{brand}**의 디지털 자산 노출을 극대화하기 위한 최적의 대응 전략을 제안합니다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' }}>
          <h5 style={{ color: '#0369a1', marginBottom: '10px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>🏆 시장 선도 지위 강화</h5>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#075985' }}>
            현재 <strong>{topPlatform.platform}</strong>에서 {topPlatform.zeroClickSov}%의 높은 점유율을 확보 중입니다. 
            주요 인용 포맷인 <strong>"{topPlatform.dominantFormat}"</strong> 스타일의 고도화된 콘텐츠를 지속적으로 업데이트하여 **{brand}**의 독점적 권위(Authority)를 방어하십시오.
          </p>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
          <h5 style={{ color: '#15803d', marginBottom: '10px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>🚀 트래픽 성장 기회 포착</h5>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#166534' }}>
            <strong>{fastGrowingPlatform.platform}</strong> 내 **{brand}** 관련 유입이 전월 대비 <strong>{fastGrowingPlatform.growth}%</strong> 급증했습니다. 
            해당 엔진이 선호하는 구조화 데이터(Schema.org) 마크업을 강화하여 폭발적인 유입 성장을 비즈니스 성과로 연결하십시오.
          </p>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '20px' }}>
          <h5 style={{ color: '#b45309', marginBottom: '10px', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>🎯 전략적 가시성 보완</h5>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#92400e' }}>
            <strong>{lowSovPlatform.platform}</strong> 내 점유율이 {lowSovPlatform.zeroClickSov}%로 개선이 시급합니다. 
            답변 내 인용 순위 향상을 위해 <strong>"{lowSovPlatform.dominantFormat}"</strong> 형태의 직접 답변형 콘텐츠를 **{targetUrl}**에 우선 배치하여 검색 노출 기회를 확보하십시오.
          </p>
        </div>
      </div>

      <div className="trend-section" style={{ marginBottom: '40px' }}>
        <h5 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 700 }}>플랫폼별 맞춤형 AEO 액션 아이템</h5>
        <table className="data-table">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '12px' }}>AI 플랫폼</th>
              <th>현재 가시성 상태</th>
              <th>권장 전략적 액션 (AEO)</th>
              <th>실행 우선순위</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, padding: '12px' }}>{row.platform}</td>
                <td style={{ fontSize: '0.85rem' }}>{Number(row.zeroClickSov) > 20 ? '✅ 안정적 권위 확보' : Number(row.growth) > 10 ? '📈 가파른 성장세' : '⚠️ 점유율 강화 필요'}</td>
                <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {row.platform === 'ChatGPT' ? `대화 흐름에 최적화된 ${brand} FAQ 가이드 및 롱테일 콘텐츠 배포` :
                   row.platform === 'Perplexity' ? `고권위 전문 미디어 및 기술 블로그 내 ${brand} 백링크 빌딩 강화` :
                   row.platform === 'Google Gemini' ? `구글 검색 인덱스와 연계된 ${brand} 전용 E-E-A-T 기술 SEO 최적화` : 
                   `${brand}의 전문성을 증명할 수 있는 고품질 리뷰 및 사례 중심 URL 확보`}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ 
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    background: i === 0 || Number(row.growth) > 20 ? '#fef2f2' : '#f0fdf4',
                    color: i === 0 || Number(row.growth) > 20 ? '#ef4444' : '#15803d', 
                    fontWeight: 800 
                  }}>
                    {i === 0 || Number(row.growth) > 20 ? 'CRITICAL' : 'NORMAL'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AEO Response Guide for Zero-Click */}
      <div style={{ background: '#1e293b', color: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h5 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛠 {brand} 제로클릭 노출 최적화 핵심 가이드
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', color: '#bae6fd' }}>1. LLM 친화적 데이터 구조화</div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.7' }}>
              AI 모델은 표준화된 `JSON-LD` 마크업을 데이터 추출의 주요 근거로 삼습니다. 
              **{brand}** 관련 FAQ, Product, Organization 스키마를 완벽히 구현하여 AI 답변 내 인용 확률을 극대화하십시오.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', color: '#bae6fd' }}>2. 직접 답변 단락 구성 (Direct Snippets)</div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.7' }}>
              질문에 대해 첫 단락에서 결론을 먼저 제시하는 '두괄식' 구성을 지향하십시오. 
              AI가 즉시 인용하기 쉬운 **목록(Bullet), 테이블, 요약문**을 URL 본문 상단에 배치해야 합니다.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px', color: '#bae6fd' }}>3. 외부 인용 신뢰도(E-E-A-T) 자산화</div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.7' }}>
              AI는 해당 정보가 '얼마나 신뢰할 수 있는 매체에서 언급되었는가'를 중시합니다. 
              전문 미디어 및 권위 있는 뉴스 사이트에서 **{targetUrl}**을 출처로 언급하도록 유도하는 디지털 PR 전략이 병행되어야 합니다.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
