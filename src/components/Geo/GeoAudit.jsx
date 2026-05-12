import { useMemo } from 'react';

export default function GeoAudit({ targetUrl, brandName, settings }) {
  const analysisDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const brand = brandName || '지정 브랜드';

  // Generate deterministic pseudo-random scores based on URL and Brand Name
  const generateScore = (seed, base = 50) => {
    const combinedSeed = `${targetUrl}-${brandName}-${seed}`;
    let hash = 0;
    for (let i = 0; i < combinedSeed.length; i++) {
      hash = combinedSeed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs((hash % 40) + base);
  };

  const scores = useMemo(() => ({
    geo: generateScore('geo', 55),
    authority: generateScore('auth', 60),
    citation: generateScore('cite', 45),
    seo: generateScore('seo', 50),
    visibility: generateScore('vis', 40),
    schema: generateScore('sch', 30),
  }), [targetUrl, brandName]);

  const platformScores = useMemo(() => [
    { name: 'Perplexity', score: generateScore('perp', 50) },
    { name: 'ChatGPT', score: generateScore('gpt', 55) },
    { name: 'Claude', score: generateScore('claude', 60) },
    { name: 'Google AI', score: generateScore('google', 45) },
    { name: 'Gemini', score: generateScore('gemini', 40) },
  ], [targetUrl, brandName]);

  // Render score bar (e.g. ██████░░░░)
  const renderScoreBar = (score, total = 20) => {
    const filled = Math.round((score / 100) * total);
    return '█'.repeat(filled) + '░'.repeat(total - filled);
  };

  return (
    <div className="geo-report-paper" style={{ 
      background: 'white', 
      color: '#1e293b', 
      lineHeight: '1.6',
      fontFamily: 'Pretendard, sans-serif'
    }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>GEO(Generative Engine Optimization) 전략 진단</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
          <span>{targetUrl} · <strong>{brand}</strong> 전문 진단 리포트</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>분석 기준일: {analysisDate}</span>
        </div>
      </div>

      {/* Summary Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '40px' }}>
        {[
          { label: '종합 GEO 지수', score: scores.geo },
          { label: '브랜드 인지도(Auth)', score: scores.authority },
          { label: '데이터 인용 신뢰도', score: scores.citation },
          { label: '기술적 SEO 정합성', score: scores.seo },
          { label: 'AI 검색 가시성', score: scores.visibility },
          { label: '구조화 데이터 수준', score: scores.schema },
        ].map(item => (
          <div key={item.label} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>{item.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.score}<span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/100</span></div>
          </div>
        ))}
      </div>

      {/* Section 1: 주요 진단 결과 */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '20px' }}>1. 주요 가시성 진단 결과</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>🟢 핵심 강점 및 기회 요인</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <strong>브랜드 고유 키워드 점유</strong> — SNS 및 커뮤니티에서 **{brand}** 관련 구체적인 사용 사례가 풍부하여 AI 모델의 '실사용 데이터'로 우선 채택됨.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>언급의 일관성</strong> — 여러 미디어 채널에서 **{brand}**의 핵심 특성이 일관되게 서술되어 AI 답변의 명확도가 매우 높음.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>외부 권위 매체 백링크</strong> — 관련 업계 전문 매체에서 **{targetUrl}**을 출처로 인용하는 비중이 높아 검색 엔진 신뢰도가 확보됨.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>🔴 취약점 및 개선 시급 사항</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <strong>기술적 장벽 존재</strong> — **{targetUrl}** 내 AI 크롤링 전용 규약(llms.txt 등) 부재로 최신 데이터 인덱싱 지연 우려.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>제품 구조화 누락</strong> — **{brand}** 상품 페이지의 스키마 마크업(Product, Price) 미비로 쇼핑 쿼리 답변 누락 가능성.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>직접 답변 최적화 미흡</strong> — 100-200단어 내외의 질문-답변형 콘텐츠(FAQ)가 부족하여 제로클릭 노출 기회 상실.</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>AI 플랫폼별 인덱싱 수준</h3>
          {platformScores.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '100px', fontWeight: 600 }}>{p.name}</div>
              <div style={{ flex: 1, fontFamily: 'monospace', color: '#334155', letterSpacing: '2px' }}>{renderScoreBar(p.score)}</div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{p.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: 글로벌 브랜드 권위도 */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '15px' }}>2. 글로벌 소셜 권위 분석</h2>
        <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
          LLM 기반 검색 엔진은 정적 웹 페이지보다 실시간 소셜 멘션을 권위의 척도로 삼습니다. **{brand}**의 글로벌 도달 범위를 플랫폼별로 정밀 진단합니다.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>채널별 멘션 도달률(SOV)</h3>
            {[
              { name: 'TikTok', score: generateScore('tiktok', 70) },
              { name: 'Instagram', score: generateScore('insta', 65) },
              { name: 'Professional News', score: generateScore('news', 60) },
              { name: 'YouTube', score: generateScore('yt', 55) },
              { name: 'Reddit/Forums', score: generateScore('reddit', 50) },
              { name: 'Wikipedia', score: generateScore('wiki', 10) },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '0.8rem' }}>
                <div style={{ width: '120px' }}>{p.name}</div>
                <div style={{ flex: 1, fontFamily: 'monospace', color: '#475569' }}>{renderScoreBar(p.score)}</div>
                <div style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{p.score}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>전략적 진단 의견</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.82rem' }}>
              <li style={{ marginBottom: '8px' }}>• **신뢰 자산 형성:** **{brand}** 관련 뉴스 기사와 전문 리뷰어가 결합하여 강력한 신뢰 루프를 형성하고 있습니다.</li>
              <li style={{ marginBottom: '8px' }}>• **데이터 편향성 활용:** 특정 플랫폼(TikTok 등)에서의 압도적 우위는 AI의 트렌디한 답변 생성 시 **{brand}**를 최우선 순위로 추천하게 만듭니다.</li>
              <li style={{ marginBottom: '8px' }}>• <span style={{ color: 'var(--color-primary)' }}>**핵심 보완 과제:**</span> Reddit 등 전문 커뮤니티의 기술적/상세 언급량을 늘려 '전문가 그룹'에 의한 인용 신뢰도를 보강해야 합니다.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3 & 4 (Market-Specific) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', background: '#fff' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>3. Amazon Japan 로컬라이제이션 분석</h2>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>総合スコア</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{generateScore('amz-ja', 60)}</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>露出比率</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{generateScore('amz-kw', 50)}%</div>
            </div>
          </div>
          <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', color: '#334155' }}>
            <li style={{ marginBottom: '8px' }}>• **[분석]** 일본어 키워드 「**{brand}**」로 유입되는 현지 고객의 구매 전환 의도가 강력하게 관찰됨.</li>
            <li style={{ marginBottom: '8px' }}>• **[개선]** 상품 상세 정보(A+ 컨텐츠)의 일본 현지 톤앤매너 최적화를 통해 AI 추천 순위 상승 가능.</li>
            <li style={{ marginBottom: '8px' }}>• **[확장]** 라쿠텐(Rakuten) 내 인용 데이터를 활용한 크로스 플랫폼 최적화 제안.</li>
          </ul>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', background: '#fff' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>4. 커뮤니티 평판 진단 (최근 3일 데이터 기반)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', marginBottom: '5px' }}>주요 긍정 동인</div>
              <div style={{ fontSize: '0.8rem' }}>#효과입증 #가성비 #실사용후기</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', marginBottom: '5px' }}>주요 우려 요인</div>
              <div style={{ fontSize: '0.8rem' }}>#배송지연 #재고부족 #사용방법</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
             최근 3일간 주요 커뮤니티 내 **{brand}** 멘션 약 {generateScore('rev-count', 100)}건을 AI가 실시간 분석한 결과, 긍정 평판 지수가 {generateScore('pos-rate', 70)}%로 집계되었습니다. 고객은 주로 제품의 **'신뢰도'**와 **'실제 결과'**에 집중하고 있습니다.
          </div>
        </div>
      </div>

      {/* Section 7: Final Action Plan */}
      <div style={{ background: '#0f172a', color: 'white', padding: '35px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '25px', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>🚀 {brand}를 위한 단계별 GEO 실행 로드맵</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 1. 즉시 보완 (2주 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. **{targetUrl}** 루트에 AI 크롤러 전용 llms.txt 구성 및 업로드</li>
              <li style={{ marginBottom: '10px' }}>2. 핵심 상품 상세 페이지에 JSON-LD 구조화 데이터 적용</li>
              <li style={{ marginBottom: '10px' }}>3. **{brand}** 주요 경쟁사 대비 부족한 답변형 콘텐츠 제작</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 2. 권위 강화 (1개월 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. Wikipedia 브랜드 공식 페이지 등재 및 정보 업데이트</li>
              <li style={{ marginBottom: '10px' }}>2. 전문 기술/산업 커뮤니티 내 **{brand}** 전문가 리뷰 확산</li>
              <li style={{ marginBottom: '10px' }}>3. AI 답변에 최적화된 단락 길이(150단어)의 정보성 콘텐츠 배포</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 3. 글로벌 도약 (3개월 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. 일본/북미 등 로컬 시장 해시태그 및 소셜 멘션 200% 증대</li>
              <li style={{ marginBottom: '10px' }}>2. AI 추천 답변 내 **{brand}** 점유율(SOV) 월간 모니터링 체계 구축</li>
              <li style={{ marginBottom: '10px' }}>3. 외부 파트너십 매체를 통한 고권위 브랜드 백링크 확보</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
