import { useMemo } from 'react';
import { generateGenAIOptimizationData } from '../../utils/demoData';

export default function GeoOptimizer({ targetUrl }) {
  const data = useMemo(() => generateGenAIOptimizationData(targetUrl || 'mezzomedia.co.kr'), [targetUrl]);
  
  // Create actionable insights
  const topPlatform = [...data].sort((a,b) => b.zeroClickSov - a.zeroClickSov)[0];
  const fastGrowingPlatform = [...data].sort((a,b) => b.growth - a.growth)[0];
  const lowSovPlatform = [...data].sort((a,b) => a.zeroClickSov - b.zeroClickSov)[0];

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>AEO(Answer Engine Optimization) 옵티마이저</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        생성형 AI 플랫폼별 제로클릭 유입과 인용 순위를 바탕으로 가장 효율적인 AEO 대응 전략을 제안합니다.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ color: '#1565c0', marginBottom: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🔥 선도 채널 유지</h5>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#0d47a1' }}>
            <strong>{topPlatform.platform}</strong>에서 {topPlatform.zeroClickSov}%의 높은 제로클릭 노출도를 보입니다. 
            해당 엔진이 주로 인용하는 <strong>"{topPlatform.dominantFormat}"</strong> 형태의 콘텐츠를 자사 URL에 지속 배포하여 인용 순위({topPlatform.citationRank}위)를 방어하세요.
          </p>
        </div>

        <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ color: '#2e7d32', marginBottom: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>📈 AI 트래픽 급상승</h5>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1b5e20' }}>
            <strong>{fastGrowingPlatform.platform}</strong>발 유입 트래픽이 전월 대비 <strong>{fastGrowingPlatform.growth}%</strong> 증가했습니다. 
            이 엔진의 답변 구조에 최적화된 URL 마크업(Schema.org) 및 Q&A 구성 비율을 높여 유입 성장을 극대화하세요.
          </p>
        </div>

        <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '8px', padding: '16px' }}>
          <h5 style={{ color: '#e65100', marginBottom: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>🎯 제로클릭 노출도 개선 필요</h5>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#bf360c' }}>
            <strong>{lowSovPlatform.platform}</strong>에서의 제로클릭 노출도가 {lowSovPlatform.zeroClickSov}%로 저조합니다. (인용 순위: {lowSovPlatform.citationRank}위) 
            타겟 고객의 질문에 직접적으로 답변하는 <strong>"{lowSovPlatform.dominantFormat}"</strong> 포맷을 강화하여 답변 내 자사 URL 노출 기회를 확보하세요.
          </p>
        </div>
      </div>

      <div className="trend-section" style={{ marginBottom: '32px' }}>
        <h5 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>엔진별 URL AEO 타겟팅 제안</h5>
        <table className="data-table">
          <thead>
            <tr>
              <th>플랫폼</th>
              <th>현재 상태</th>
              <th>권장 마케팅 액션 (AEO)</th>
              <th>우선순위</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{row.platform}</td>
                <td>{Number(row.zeroClickSov) > 20 ? '안정적 노출 중' : Number(row.growth) > 10 ? '트래픽 유입 증가' : '노출 개선 필요'}</td>
                <td style={{ fontSize: '0.85rem' }}>
                  {row.platform === 'ChatGPT' ? '대화형 프롬프트에 대응하는 롱테일 가이드 URL 생성 및 배포' :
                   row.platform === 'Perplexity' ? '신뢰도 높은 언론사/기술블로그 내 자사 URL 백링크 빌딩' :
                   row.platform === 'Google Gemini' ? '기존 웹 트래픽과 연계된 구글 생태계 SEO 및 URL 최적화' : 
                   '전문성(E-E-A-T)을 강조한 양질의 리뷰 콘텐츠 URL 확보'}
                </td>
                <td>
                  <span style={{ color: i === 0 || Number(row.growth) > 20 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
                    {i === 0 || Number(row.growth) > 20 ? 'High' : 'Medium'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AEO Response Guide for Zero-Click */}
      <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <h5 style={{ marginBottom: '16px', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ 제로클릭 대응을 위한 URL 최적화 가이드
        </h5>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-navy)' }}>1. 답변 엔진용 데이터 구조화</div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              AI 모델은 `JSON-LD`나 `Schema.org` 마크업을 통해 데이터를 학습합니다. 
              특히 **FAQ, Review, How-to** 스키마를 자사 URL에 적극 적용하여 AI 답변 내 인용 확률을 높이세요.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-navy)' }}>2. 직접 답변 콘텐츠(Direct Answer)</div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              사용자의 질문에 대해 첫 문단에서 요약된 답변을 제공하는 '피처드 스니핏' 스타일의 구성을 지향하세요. 
              AI가 인용하기 쉬운 **단락, 리스트, 테이블** 형식을 URL 본문에 포함해야 합니다.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-navy)' }}>3. 인용 신뢰도(Citation Trust) 확보</div>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
              Perplexity 등 답변 엔진은 출처의 신뢰도를 중시합니다. 
              권위 있는 외부 매체(뉴스, 위키 등)에서 자사 URL을 인용하도록 유도하는 **디지털 PR**과 **백링크 빌딩**을 병행하세요.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
