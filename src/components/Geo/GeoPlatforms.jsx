import { useMemo } from 'react';

export default function GeoPlatforms({ targetUrl, brandName }) {
  const brand = brandName || '지정 브랜드';
  const platformData = useMemo(() => [
    { 
      platform: 'ChatGPT (OpenAI)', 
      logic: '대화의 맥락과 심층적인 서사 구조를 중시합니다.', 
      action: `${brand}의 브랜드 스토리와 제품별 상세 FAQ를 두괄식으로 구성하여 답변 내 인용 가능성을 높이십시오.` 
    },
    { 
      platform: 'Perplexity AI', 
      logic: '실시간 검색 데이터와 고권위 뉴스 출처를 최우선합니다.', 
      action: `주요 테크 미디어 및 뉴스 사이트 내 ${brand} 관련 기사 배포를 통해 인용 가능한 '검증된 출처'를 확보하십시오.` 
    },
    { 
      platform: 'Google Gemini', 
      logic: '기존 구글 검색 인덱스와 E-E-A-T(전문성·경험·권위·신뢰)를 기반으로 합니다.', 
      action: `${brand} 공식 홈페이지의 기술 SEO를 강화하고, 전문가 그룹의 리뷰를 통해 신뢰도 높은 데이터를 제공하십시오.` 
    },
    { 
      platform: 'Claude (Anthropic)', 
      logic: '기술적 정확도와 정밀한 문구 매칭을 선호합니다.', 
      action: `${targetUrl}/llms.txt 파일을 통해 ${brand}의 기술 사양 및 정밀한 데이터를 구조화하여 AI 크롤러에게 직접 제공하십시오.` 
    },
  ], [targetUrl, brand]);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-navy)' }}>플랫폼별 맞춤형 최적화 전략</h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {platformData.map(p => (
          <div key={p.platform} style={{ padding: '24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary)', marginBottom: '10px' }}>{p.platform}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', fontStyle: 'italic', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              " {p.logic} "
            </div>
            <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.6' }}>
              🎯 <strong>전략적 실행 과제:</strong> {p.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
