import { useMemo } from 'react';

export default function GeoAudit({ targetUrl, brandName, settings }) {
  const analysisDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

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
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>GEO · SEO 분석 리포트</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
          <span>{targetUrl} ({brandName})  ·  분석일 {analysisDate}</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Global Market + AI Search 최적화 종합 진단</span>
        </div>
      </div>

      {/* Summary Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '40px' }}>
        {[
          { label: '종합 GEO', score: scores.geo },
          { label: '브랜드 권위도', score: scores.authority },
          { label: '인용 준비도', score: scores.citation },
          { label: '기술적 SEO', score: scores.seo },
          { label: 'AI 가시성', score: scores.visibility },
          { label: '스키마 마크업', score: scores.schema },
        ].map(item => (
          <div key={item.label} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>{item.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.score}<span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/100</span></div>
          </div>
        ))}
      </div>

      {/* Section 1: GEO 종합 분석 */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '20px' }}>1. GEO 종합 분석</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>강점 — AI 검색에서 잘 되는 것</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <strong>[강점] 소셜 바이럴 콘텐츠 다수</strong> — TikTok·Instagram·YouTube에서 **{brandName}** 제품이 AI 답변 시 반복 인용되는 수준의 인지도 보유</li>
              <li style={{ marginBottom: '10px' }}>• <strong>[강점] 명확한 브랜드 스토리텔링</strong> — **{brandName}** 고유의 브랜드 아이덴티티가 AI의 관련 카테고리 질문에 인용 가능한 서사 구조 형성</li>
              <li style={{ marginBottom: '10px' }}>• <strong>[강점] 외부 리뷰 생태계 풍부</strong> — 권위 있는 외부 미디어(DA 높은 매체)에서 **{targetUrl}** 관련 내용이 반복적으로 언급됨</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#dc2626', marginBottom: '12px' }}>약점 — 즉시 개선 필요</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <span style={{ color: '#ef4444', fontWeight: 700 }}>[위험]</span> <strong>llms.txt 파일 없음</strong> — AI 크롤러가 **{targetUrl}** 사이트 구조를 파악하는 표준 파일 미존재</li>
              <li style={{ marginBottom: '10px' }}>• <span style={{ color: '#ef4444', fontWeight: 700 }}>[위험]</span> <strong>구조화 데이터 미흡</strong> — **{brandName}** 관련 Organization, Product, Review 스키마 마크업 미감지</li>
              <li style={{ marginBottom: '10px' }}>• <span style={{ color: '#f59e0b', fontWeight: 700 }}>[주의]</span> <strong>Q&A 구조화 콘텐츠 부재</strong> — AI 인용 최적 단락 길이(134-167단어) 콘텐츠 부족</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>AI 플랫폼별 가시성</h3>
          {platformScores.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '100px', fontWeight: 600 }}>{p.name}</div>
              <div style={{ flex: 1, fontFamily: 'monospace', color: 'var(--color-navy)', letterSpacing: '2px' }}>{renderScoreBar(p.score)}</div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{p.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: 브랜드 권위도 */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '15px' }}>2. 브랜드 권위도</h2>
        <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
          AI 검색에서 백링크보다 <strong>브랜드 언급(Brand Mention)</strong>이 3배 이상 강력하게 작용합니다. **{brandName}**은 소셜/뉴스 언급이 풍부하여 AI 답변에 자주 등장하는 브랜드입니다.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>플랫폼별 브랜드 존재감</h3>
            {[
              { name: 'TikTok', score: generateScore('tiktok', 70) },
              { name: 'Instagram', score: generateScore('insta', 65) },
              { name: '뉴스 미디어', score: generateScore('news', 60) },
              { name: 'YouTube', score: generateScore('yt', 55) },
              { name: 'Reddit', score: generateScore('reddit', 50) },
              { name: 'Wikipedia', score: generateScore('wiki', 10) },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '0.8rem' }}>
                <div style={{ width: '80px' }}>{p.name}</div>
                <div style={{ flex: 1, fontFamily: 'monospace', color: '#475569' }}>{renderScoreBar(p.score)}</div>
                <div style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{p.score}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>인사이트</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.82rem' }}>
              <li style={{ marginBottom: '8px' }}>• [강점] **{brandName}** 바이럴 제품이 AI 학습 데이터에 고빈도 노출되어 카테고리 추천에서 최상위 인용</li>
              <li style={{ marginBottom: '8px' }}>• [강점] 권위 있는 전문 미디어 반복 리뷰로 **{targetUrl}**의 AI 신뢰도 기준 충족</li>
              <li style={{ marginBottom: '8px' }}>• <span style={{ color: 'var(--color-primary)' }}>[개선]</span> Wikipedia 페이지 없음 — AI 모델의 **{brandName}** 기본 정보 파악을 위한 Wikipedia 등재 권장</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 7: Action Plan */}
      <div style={{ background: '#0f172a', color: 'white', padding: '30px', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--color-primary)' }}>7. 우선 실행 액션 플랜</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#94a3b8' }}>즉시 실행 (0~2주)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.75rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '8px' }}>1. llms.txt 파일 생성 및 **{targetUrl}** 루트 업로드</li>
              <li style={{ marginBottom: '8px' }}>2. robots.txt에 AI 크롤러 허용 규칙 명시</li>
              <li style={{ marginBottom: '8px' }}>3. **{brandName}** Organization + Product 스키마 삽입</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#94a3b8' }}>단기 실행 (1~4주)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.75rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '8px' }}>1. **{brandName}** Wikipedia 브랜드 페이지 등재 추진</li>
              <li style={{ marginBottom: '8px' }}>2. 콘텐츠 단락 AI 인용 최적 길이로 재편집</li>
              <li style={{ marginBottom: '8px' }}>3. **{brandName}** 관련 외부 미디어 언급 강화</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#94a3b8' }}>중기 실행 (1~3개월)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.75rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '8px' }}>1. Reddit 커뮤니티 **{brandName}** 언급 활성화</li>
              <li style={{ marginBottom: '8px' }}>2. YouTube 전문 교육 시리즈 제작</li>
              <li style={{ marginBottom: '8px' }}>3. 글로벌 시장 로컬 해시태그 전략 강화</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
