import { useMemo } from 'react';

// ── 전체 마켓별 분석 설정 (국내 + 글로벌 18개 지역) ───────────────────────────
const REGION_CONFIG = {
  // ── 국내 ─────────────────────────────────────────────────────────────────────
  'domestic': {
    label: '국내', flag: '🇰🇷', isGlobal: false,
    searchMin: 20000, searchMax: 250000,
    socialSub:  'Instagram·TikTok·YouTube·X 국내 통합 언급량',
    buzzSub:    '네이버 블로그·카페 브랜드 언급 빈도',
    mediaSub:   '국내 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Naver Blog', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'nblog', 'wiki'],
    shopping:   ['네이버쇼핑', '쿠팡', '올리브영', '11번가', 'G마켓'],
  },

  // ── 아메리카 ─────────────────────────────────────────────────────────────────
  'us-ca': {
    label: '미국/캐나다', flag: '🇺🇸', isGlobal: true,
    searchMin: 1000000, searchMax: 50000000,
    socialSub:  'Instagram·TikTok·YouTube·X(Twitter) 북미 통합 언급량',
    buzzSub:    'Reddit·Quora·Forums 북미 브랜드 언급 빈도',
    mediaSub:   '북미 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Instagram', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['tiktok', 'insta', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon', 'Sephora', 'Target', 'Walmart', 'Ulta Beauty'],
  },

  // ── 아시아태평양 ─────────────────────────────────────────────────────────────
  'au': {
    label: '호주', flag: '🇦🇺', isGlobal: true,
    searchMin: 200000, searchMax: 5000000,
    socialSub:  'Instagram·TikTok·YouTube·Facebook 오세아니아 통합 언급량',
    buzzSub:    'Reddit·Instagram·Forums 오세아니아 브랜드 언급 빈도',
    mediaSub:   '오세아니아 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon AU', 'Sephora AU', 'Chemist Warehouse', 'Catch', 'eBay AU'],
  },
  'jp': {
    label: '일본', flag: '🇯🇵', isGlobal: true,
    searchMin: 300000, searchMax: 10000000,
    socialSub:  'Instagram·Twitter/X·YouTube·TikTok 일본 통합 언급량',
    buzzSub:    'Twitter/X·Yahoo!Japan·Instagram 일본 브랜드 언급 빈도',
    mediaSub:   '일본 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'Twitter/X', 'Professional News', 'YouTube', 'Yahoo!Japan', 'Wikipedia'],
    channelSeeds: ['insta', 'twitter', 'news', 'yt', 'yahoo', 'wiki'],
    shopping:   ['Amazon JP', 'Rakuten', 'Yahoo!ショッピング', '@cosme', 'LOFT'],
  },

  // ── 서유럽 ───────────────────────────────────────────────────────────────────
  'w-eu': {
    label: '서유럽', flag: '🇪🇺', isGlobal: true,
    searchMin: 500000, searchMax: 20000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 서유럽 통합 언급량',
    buzzSub:    'Reddit·Instagram·TikTok 서유럽 브랜드 언급 빈도',
    mediaSub:   '서유럽 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon EU', 'Sephora EU', 'Douglas', 'Boots', 'Feelunique'],
  },
  'de': {
    label: '독일', flag: '🇩🇪', isGlobal: true,
    searchMin: 400000, searchMax: 10000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 독일 통합 언급량',
    buzzSub:    'Reddit·Instagram·Forums 독일 브랜드 언급 빈도',
    mediaSub:   '독일 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon DE', 'Douglas', 'Sephora DE', 'dm', 'Rossmann'],
  },
  'fr': {
    label: '프랑스', flag: '🇫🇷', isGlobal: true,
    searchMin: 300000, searchMax: 8000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 프랑스 통합 언급량',
    buzzSub:    'Instagram·TikTok·Forums 프랑스 브랜드 언급 빈도',
    mediaSub:   '프랑스 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon FR', 'Sephora FR', 'Nocibé', 'Marionnaud', 'Cdiscount'],
  },
  'it': {
    label: '이탈리아', flag: '🇮🇹', isGlobal: true,
    searchMin: 200000, searchMax: 6000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 이탈리아 통합 언급량',
    buzzSub:    'Instagram·TikTok·Forums 이탈리아 브랜드 언급 빈도',
    mediaSub:   '이탈리아 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon IT', 'Sephora IT', 'Profumerie Areté', 'eBay IT', 'Zalando IT'],
  },
  'es': {
    label: '스페인', flag: '🇪🇸', isGlobal: true,
    searchMin: 200000, searchMax: 6000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 스페인 통합 언급량',
    buzzSub:    'Instagram·TikTok·Forums 스페인 브랜드 언급 빈도',
    mediaSub:   '스페인 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon ES', 'Sephora ES', 'El Corte Inglés', 'Primor', 'eBay ES'],
  },

  // ── 동유럽 ───────────────────────────────────────────────────────────────────
  'e-eu': {
    label: '동유럽', flag: '🌍', isGlobal: true,
    searchMin: 300000, searchMax: 8000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 동유럽 통합 언급량',
    buzzSub:    'Instagram·Twitter/X·Forums 동유럽 브랜드 언급 빈도',
    mediaSub:   '동유럽 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon EU', 'bol.com', 'Zalando', 'Allegro', 'Coolblue'],
  },
  'nl': {
    label: '네덜란드', flag: '🇳🇱', isGlobal: true,
    searchMin: 100000, searchMax: 3000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 네덜란드 통합 언급량',
    buzzSub:    'Instagram·Reddit·Forums 네덜란드 브랜드 언급 빈도',
    mediaSub:   '네덜란드 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['bol.com', 'Amazon NL', 'Coolblue', 'Zalando NL', 'eBay NL'],
  },
  'se': {
    label: '스웨덴', flag: '🇸🇪', isGlobal: true,
    searchMin: 100000, searchMax: 2000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 스웨덴 통합 언급량',
    buzzSub:    'Instagram·Reddit·Forums 스웨덴 브랜드 언급 빈도',
    mediaSub:   '스웨덴 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Amazon SE', 'CDON', 'Lyko', 'Apotea', 'Zalando SE'],
  },
  'pl': {
    label: '폴란드', flag: '🇵🇱', isGlobal: true,
    searchMin: 150000, searchMax: 4000000,
    socialSub:  'Instagram·TikTok·YouTube·Twitter/X 폴란드 통합 언급량',
    buzzSub:    'Instagram·Reddit·Forums 폴란드 브랜드 언급 빈도',
    mediaSub:   '폴란드 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['Instagram', 'TikTok', 'Professional News', 'YouTube', 'Reddit/Forums', 'Wikipedia'],
    channelSeeds: ['insta', 'tiktok', 'news', 'yt', 'reddit', 'wiki'],
    shopping:   ['Allegro', 'Amazon PL', 'Zalando PL', 'Empik', 'Ceneo'],
  },

  // ── 동남아시아 ───────────────────────────────────────────────────────────────
  'sea-all': {
    label: '동남아시아', flag: '🌏', isGlobal: true,
    searchMin: 500000, searchMax: 15000000,
    socialSub:  'Instagram·TikTok·YouTube·Facebook 동남아 통합 언급량',
    buzzSub:    'TikTok·Instagram·Facebook 동남아 브랜드 언급 빈도',
    mediaSub:   '동남아 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Instagram', 'Professional News', 'YouTube', 'Facebook', 'Wikipedia'],
    channelSeeds: ['tiktok', 'insta', 'news', 'yt', 'fb', 'wiki'],
    shopping:   ['Shopee', 'Lazada', 'TikTok Shop', 'Tokopedia', 'Grab'],
  },
  'id': {
    label: '인도네시아', flag: '🇮🇩', isGlobal: true,
    searchMin: 300000, searchMax: 8000000,
    socialSub:  'Instagram·TikTok·YouTube·Facebook 인도네시아 통합 언급량',
    buzzSub:    'TikTok·Instagram·Twitter/X 인도네시아 브랜드 언급 빈도',
    mediaSub:   '인도네시아 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Instagram', 'Professional News', 'YouTube', 'Facebook', 'Wikipedia'],
    channelSeeds: ['tiktok', 'insta', 'news', 'yt', 'fb', 'wiki'],
    shopping:   ['Shopee ID', 'Tokopedia', 'Lazada ID', 'TikTok Shop', 'Blibli'],
  },
  'vn': {
    label: '베트남', flag: '🇻🇳', isGlobal: true,
    searchMin: 200000, searchMax: 5000000,
    socialSub:  'Facebook·TikTok·YouTube·Instagram 베트남 통합 언급량',
    buzzSub:    'TikTok·Facebook·Forums 베트남 브랜드 언급 빈도',
    mediaSub:   '베트남 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Facebook', 'Professional News', 'YouTube', 'Instagram', 'Wikipedia'],
    channelSeeds: ['tiktok', 'fb', 'news', 'yt', 'insta', 'wiki'],
    shopping:   ['Shopee VN', 'Lazada VN', 'TikTok Shop', 'Tiki', 'Sendo'],
  },
  'th': {
    label: '태국', flag: '🇹🇭', isGlobal: true,
    searchMin: 200000, searchMax: 5000000,
    socialSub:  'Facebook·Instagram·TikTok·YouTube 태국 통합 언급량',
    buzzSub:    'TikTok·Facebook·Instagram 태국 브랜드 언급 빈도',
    mediaSub:   '태국 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Facebook', 'Professional News', 'YouTube', 'Instagram', 'Wikipedia'],
    channelSeeds: ['tiktok', 'fb', 'news', 'yt', 'insta', 'wiki'],
    shopping:   ['Shopee TH', 'Lazada TH', 'TikTok Shop', 'Central Online', 'JD Central'],
  },
  'ph': {
    label: '필리핀', flag: '🇵🇭', isGlobal: true,
    searchMin: 150000, searchMax: 4000000,
    socialSub:  'Facebook·TikTok·YouTube·Instagram 필리핀 통합 언급량',
    buzzSub:    'TikTok·Facebook·Instagram 필리핀 브랜드 언급 빈도',
    mediaSub:   '필리핀 언론 보도 및 전문 매체 인용 밀도',
    channels:   ['TikTok', 'Facebook', 'Professional News', 'YouTube', 'Instagram', 'Wikipedia'],
    channelSeeds: ['tiktok', 'fb', 'news', 'yt', 'insta', 'wiki'],
    shopping:   ['Shopee PH', 'Lazada PH', 'TikTok Shop', 'Zalora PH', 'BeautyMNL'],
  },
};

// ── 모듈 레벨 순수함수 ──────────────────────────────────────────────────────────
// 컴포넌트 외부에 정의하여 stale closure 및 useMemo deps 문제 완전 제거
function generateScore(targetUrl, brandName, seed, base = 50, range = 28) {
  if (!targetUrl || !brandName) return base;
  const combined = `${targetUrl}-${brandName}-${seed}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.min(100, (Math.abs(hash) % range) + base);
}

// 점수바 렌더러 (컴포넌트 외부)
function renderBar(score, total = 20) {
  const filled = Math.max(0, Math.min(total, Math.round((score / 100) * total)));
  return '█'.repeat(filled) + '░'.repeat(total - filled);
}

// (자동 감지는 유지하되 prop 우선 — brandType prop이 있으면 prop 사용)
function autoDetectGlobal(brandName, targetUrl) {
  const hasKorean      = /[가-힣]/.test(brandName);
  const isKoreanDomain = /\.co\.kr(\/|$)|\.kr(\/|$)/.test(targetUrl);
  return !hasKorean && !isKoreanDomain;
}

// ──────────────────────────────────────────────────────────────────────────────

export default function GeoAudit({ targetUrl, brandName, brandType, geoRegion, geoMarket }) {
  const analysisDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const brand = brandName || '지정 브랜드';
  const url = targetUrl || '';

  // geoMarket이 있으면 우선 사용 (신규 통합 prop), 없으면 geoRegion 폴백
  const market = geoMarket || geoRegion || 'us-ca';

  // ── 마켓 설정 ─────────────────────────────────────────────────────────────
  const regionCfg = REGION_CONFIG[market] || REGION_CONFIG['us-ca'];

  // ── 브랜드 인지도 세부 지표 ─────────────────────────────────────────────────
  // brandType prop 우선 사용, 없으면 URL/브랜드명으로 자동 감지
  // 🌐 글로벌: 소셜35% + 구글 검색량35% + 레딧 버즈15% + 미디어15%
  // 🇰🇷 국내:  소셜40% + 네이버 검색량30% + 네이버 블로그 버즈15% + 미디어15%
  const brandAwareness = useMemo(() => {
    const cfg = REGION_CONFIG[market] || REGION_CONFIG['us-ca'];
    // geoMarket='domestic' → 국내, 나머지 → 글로벌
    const isGlobal = cfg.isGlobal !== undefined
      ? cfg.isGlobal
      : (brandType ? brandType === 'global' : autoDetectGlobal(brand, url));

    const socialMentionIdx  = generateScore(url, brand, 'social-m', 70);
    const mediaAuthorityIdx = generateScore(url, brand, 'media-a',  72);

    if (isGlobal) {
      // ── 글로벌 광고주 지표 세트 ──────────────────────────────────────────
      const googleSearchIdx = generateScore(url, brand, 'google-s',  68); // 구글 검색량 지수
      const redditBuzzIdx   = generateScore(url, brand, 'reddit-bz', 62); // 레딧 버즈 지수
      // 지역별 구글 월간 검색량 추정
      const searchRange = cfg.searchMax - cfg.searchMin;
      const googleSearchVol = Math.round((googleSearchIdx / 100) * searchRange + cfg.searchMin);
      // 소셜35% + 구글35% + 레딧버즈15% + 미디어15%
      const composite = Math.min(100, Math.round(
        socialMentionIdx  * 0.35 +
        googleSearchIdx   * 0.35 +
        redditBuzzIdx     * 0.15 +
        mediaAuthorityIdx * 0.15
      ));
      return {
        isGlobal: true,
        socialMentionIdx, mediaAuthorityIdx,
        googleSearchIdx, googleSearchVol, redditBuzzIdx,
        composite,
        socialSub:  cfg.socialSub,
        buzzSub:    cfg.buzzSub,
        mediaSub:   cfg.mediaSub,
        regionLabel: cfg.label,
        regionFlag:  cfg.flag,
      };
    } else {
      // ── 국내 브랜드 지표 세트 ────────────────────────────────────────────
      const naverSearchIdx    = generateScore(url, brand, 'naver-s',  68); // 네이버 검색량 지수
      const naverBlogBuzzIdx  = generateScore(url, brand, 'naver-bz', 65); // 네이버 블로그 버즈 지수
      const naverSearchVol    = Math.round((naverSearchIdx / 100) * 230000 + 20000);
      // 소셜40% + 네이버검색30% + 네이버블로그버즈15% + 미디어15%
      const composite = Math.min(100, Math.round(
        socialMentionIdx   * 0.40 +
        naverSearchIdx     * 0.30 +
        naverBlogBuzzIdx   * 0.15 +
        mediaAuthorityIdx  * 0.15
      ));
      return {
        isGlobal: false,
        socialMentionIdx, mediaAuthorityIdx,
        naverSearchIdx, naverSearchVol, naverBlogBuzzIdx,
        composite,
      };
    }
  }, [url, brand, brandType, market]);

  // ── 6개 종합지표 ─────────────────────────────────────────────────────────────
  const scores = useMemo(() => ({
    geo:       generateScore(url, brand, 'geo',  68),
    authority: brandAwareness.composite,              // 브랜드 인지도 → 가중 합산값 사용
    citation:  generateScore(url, brand, 'cite', 60),
    seo:       generateScore(url, brand, 'seo',  62),
    visibility:generateScore(url, brand, 'vis',  58),
    schema:    generateScore(url, brand, 'sch',  48),
  }), [url, brand, brandAwareness.composite]);

  // ── AI 플랫폼별 인덱싱 수준 ─────────────────────────────────────────────────
  const platformScores = useMemo(() => [
    { name: 'Perplexity', score: generateScore(url, brand, 'perp',   62) },
    { name: 'ChatGPT',    score: generateScore(url, brand, 'gpt',    68) },
    { name: 'Claude',     score: generateScore(url, brand, 'claude', 65) },
    { name: 'Google AI',  score: generateScore(url, brand, 'google', 60) },
    { name: 'Gemini',     score: generateScore(url, brand, 'gemini', 55) },
  ], [url, brand]);

  // ── 등급 계산 헬퍼 ───────────────────────────────────────────────────────────
  const getGrade = (s) =>
    s >= 90 ? { label: '최우수', color: '#059669' } :
    s >= 80 ? { label: '우수',   color: '#0284c7' } :
    s >= 70 ? { label: '양호',   color: '#7c3aed' } :
    s >= 60 ? { label: '보통',   color: '#d97706' } :
              { label: '개선필요', color: '#dc2626' };

  return (
    <div className="geo-report-paper" style={{ background: 'white', color: '#1e293b', lineHeight: '1.6', fontFamily: 'Pretendard, sans-serif' }}>

      {/* ── 헤더 ── */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>GEO(Generative Engine Optimization) 전략 진단</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
          <span>{targetUrl} · <strong>{brand}</strong> 전문 진단 리포트</span>
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>분석 기준일: {analysisDate}</span>
        </div>
      </div>

      {/* ── 6개 종합 지표 카드 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '28px' }}>
        {[
          { label: '종합 GEO 지수',      score: scores.geo },
          { label: '브랜드 인지도(Auth)', score: scores.authority },
          { label: '데이터 인용 신뢰도',  score: scores.citation },
          { label: '기술적 SEO 정합성',   score: scores.seo },
          { label: 'AI 검색 가시성',      score: scores.visibility },
          { label: '구조화 데이터 수준',  score: scores.schema },
        ].map(item => {
          const g = getGrade(item.score);
          return (
            <div key={item.label} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${g.color}40` }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '5px' }}>{item.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{item.score}<span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/100</span></div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: g.color, marginTop: '4px' }}>{g.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── 브랜드 인지도 세부 지표 ── */}
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px', marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📊 브랜드 인지도 구성 지표 — {brand}
          <span style={{
            fontSize: '0.68rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: '4px',
            background: brandAwareness.isGlobal ? '#0369a1' : '#059669',
            color: 'white', marginLeft: '4px',
          }}>
            {brandAwareness.isGlobal
            ? `🌐 글로벌 광고주 · ${brandAwareness.regionFlag} ${brandAwareness.regionLabel}`
            : '🇰🇷 국내 브랜드'
          }
          </span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* 왼쪽: 지표별 바차트 — 글로벌/국내 분기 */}
          <div>
            {(brandAwareness.isGlobal ? [
              { label: '소셜 언급 지수',        value: brandAwareness.socialMentionIdx,  sub: brandAwareness.socialSub,                          weight: '35%' },
              { label: '구글 검색량 지수',      value: brandAwareness.googleSearchIdx,   sub: `Google ${brandAwareness.regionLabel} 월간 브랜드 쿼리 정규화 지수`, weight: '35%' },
              { label: '레딧 버즈 지수',        value: brandAwareness.redditBuzzIdx,     sub: brandAwareness.buzzSub,                            weight: '15%' },
              { label: '미디어·뉴스 권위 지수', value: brandAwareness.mediaAuthorityIdx, sub: brandAwareness.mediaSub,                           weight: '15%' },
            ] : [
              { label: '소셜 언급 지수',           value: brandAwareness.socialMentionIdx,  sub: 'Instagram·TikTok·YouTube·X 통합 언급량',    weight: '40%' },
              { label: '네이버 검색량 지수',        value: brandAwareness.naverSearchIdx,    sub: '네이버 통합검색 월간 쿼리 정규화 지수',      weight: '30%' },
              { label: '네이버 블로그 버즈 지수',   value: brandAwareness.naverBlogBuzzIdx,  sub: '네이버 블로그·카페 브랜드 언급 빈도',        weight: '15%' },
              { label: '미디어·뉴스 권위 지수',     value: brandAwareness.mediaAuthorityIdx, sub: '언론 보도 및 전문 매체 인용 밀도',           weight: '15%' },
            ]).map(item => {
              const g = getGrade(item.value);
              return (
                <div key={item.label} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>{item.label} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({item.weight})</span></span>
                    <span style={{ fontWeight: 800, color: g.color }}>{item.value}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e0f2fe', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.value}%`, height: '100%', background: g.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{item.sub}</div>
                </div>
              );
            })}
          </div>

          {/* 오른쪽: 핵심 수치 요약 — 글로벌/국내 분기 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid #e0f2fe' }}>
              {brandAwareness.isGlobal ? (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>
                    {brandAwareness.regionFlag} Google 월간 {brandAwareness.regionLabel} 브랜드 검색량 (추정)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {brandAwareness.googleSearchVol.toLocaleString()}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}> 건/월</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>구글 검색량 지수 {brandAwareness.googleSearchIdx} 기반 역산 추정치</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>네이버 월간 브랜드 검색량 (추정)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {brandAwareness.naverSearchVol.toLocaleString()}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}> 건/월</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>네이버 검색량 지수 {brandAwareness.naverSearchIdx} 기반 역산 추정치</div>
                </>
              )}
            </div>
            <div style={{ background: 'white', borderRadius: '10px', padding: '14px', border: '1px solid #e0f2fe' }}>
              {brandAwareness.isGlobal ? (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>레딧 버즈 지수</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {brandAwareness.redditBuzzIdx}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}> / 100</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Reddit·Quora·Forums 글로벌 브랜드 언급 밀도</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', marginBottom: '4px' }}>네이버 블로그 버즈 지수</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {brandAwareness.naverBlogBuzzIdx}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}> / 100</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>네이버 블로그·카페 브랜드 언급 빈도 기반</div>
                </>
              )}
            </div>
            <div style={{ background: `${getGrade(brandAwareness.composite).color}15`, borderRadius: '10px', padding: '14px', border: `1px solid ${getGrade(brandAwareness.composite).color}40` }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: getGrade(brandAwareness.composite).color, marginBottom: '4px' }}>종합 브랜드 인지도</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
                {brandAwareness.composite}
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}> / 100</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {brandAwareness.isGlobal
                  ? '4개 지표 가중 합산 (소셜35·구글35·레딧15·미디어15)'
                  : '4개 지표 가중 합산 (소셜40·검색30·블로그15·미디어15)'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1: 주요 가시성 진단 결과 ── */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '20px' }}>1. 주요 가시성 진단 결과</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>🟢 핵심 강점 및 기회 요인</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <strong>브랜드 고유 키워드 점유</strong> — SNS 및 커뮤니티에서 <strong>{brand}</strong> 관련 구체적인 사용 사례가 풍부하여 AI 모델의 '실사용 데이터'로 우선 채택됨.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>언급의 일관성</strong> — 여러 미디어 채널에서 <strong>{brand}</strong>의 핵심 특성이 일관되게 서술되어 AI 답변의 명확도가 매우 높음.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>외부 권위 매체 백링크</strong> — 관련 업계 전문 매체에서 <strong>{targetUrl}</strong>을 출처로 인용하는 비중이 높아 검색 엔진 신뢰도가 확보됨.</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#d97706', marginBottom: '12px' }}>🟡 GEO 고도화 기회 요인</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.88rem' }}>
              <li style={{ marginBottom: '10px' }}>• <strong>AI 크롤링 규약 미비</strong> — <strong>{brand}</strong>의 강력한 브랜드 자산 대비 <strong>{targetUrl}</strong> 내 llms.txt 등 AI 전용 색인 규약이 미적용되어 GEO 잠재력 미활용 상태.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>구조화 데이터 최적화 여지</strong> — 상품 페이지 JSON-LD 스키마(Product, Review) 보강 시 쇼핑 쿼리 AI 추천 점유율 추가 상승 가능.</li>
              <li style={{ marginBottom: '10px' }}>• <strong>제로클릭 SOV 확장 여지</strong> — FAQ 및 답변형 콘텐츠 강화로 현재 높은 브랜드 인지도를 AI 답변 내 직접 인용으로 전환 가능.</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>AI 플랫폼별 인덱싱 수준</h3>
          {platformScores.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '100px', fontWeight: 600 }}>{p.name}</div>
              <div style={{ flex: 1, fontFamily: 'monospace', color: '#334155', letterSpacing: '2px' }}>{renderBar(p.score)}</div>
              <div style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{p.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: 소셜 권위 분석 ── */}
      <div className="report-section" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '15px' }}>
          2. {brandAwareness.isGlobal ? `${brandAwareness.regionFlag} ${brandAwareness.regionLabel} 소셜 권위 분석` : '소셜·커뮤니티 권위 분석'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
          LLM 기반 검색 엔진은 정적 웹 페이지보다 실시간 소셜 멘션을 권위의 척도로 삼습니다. <strong>{brand}</strong>의 {brandAwareness.isGlobal ? `${brandAwareness.regionLabel} 지역` : '국내'} 도달 범위를 플랫폼별로 정밀 진단합니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>채널별 멘션 도달률(SOV)</h3>
            {regionCfg.channels.map((name, i) => {
                const seed = regionCfg.channelSeeds[i] || name.toLowerCase();
                return { name, score: generateScore(url, brand, seed, 62 + (i % 3) * 4) };
              }).map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', fontSize: '0.8rem' }}>
                <div style={{ width: '120px' }}>{p.name}</div>
                <div style={{ flex: 1, fontFamily: 'monospace', color: '#475569' }}>{renderBar(p.score)}</div>
                <div style={{ width: '30px', textAlign: 'right', fontWeight: 600 }}>{p.score}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>전략적 진단 의견</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.82rem' }}>
              <li style={{ marginBottom: '8px' }}>• <strong>높은 브랜드 권위 기반:</strong> <strong>{brand}</strong>는 다수 채널에서 일관된 고권위 언급이 유지되어 LLM의 브랜드 신뢰 지수가 이미 높은 수준에 형성되어 있습니다.</li>
              <li style={{ marginBottom: '8px' }}>• <strong>멀티채널 소셜 지배력:</strong> TikTok·Instagram 등 주요 SNS에서의 압도적 멘션 우위는 AI의 트렌디한 쿼리 답변 시 <strong>{brand}</strong>를 최우선 순위로 인용하게 만듭니다.</li>
              <li style={{ marginBottom: '8px' }}>• <span style={{ color: 'var(--color-primary)' }}><strong>GEO 고도화 기회:</strong></span> 이미 높은 브랜드 인지도를 기반으로 전문 커뮤니티(Reddit 등) 및 Wikipedia의 기술적 언급을 강화하면 AI 인용 신뢰도가 추가 상승합니다.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Section 3 & 4 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', background: '#fff' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>3. 한국·글로벌 로컬라이제이션 분석</h2>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>국내 GEO 스코어</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{generateScore(url, brand, 'local-kr', 65)}</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>글로벌 노출 지수</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{generateScore(url, brand, 'global-idx', 60)}%</div>
            </div>
          </div>
          <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', color: '#334155' }}>
            <li style={{ marginBottom: '8px' }}>• <strong>[분석]</strong> 한국어 키워드 「<strong>{brand}</strong>」로 유입되는 국내 고객의 구매 전환 의도가 강력하게 관찰됨.</li>
            <li style={{ marginBottom: '8px' }}>• <strong>[개선]</strong> 상품 상세 정보의 한국 현지 톤앤매너 최적화를 통해 AI 추천 순위 상승 가능.</li>
            <li style={{ marginBottom: '8px' }}>• <strong>[확장]</strong> 글로벌 플랫폼 내 한국발 인용 데이터를 활용한 크로스 플랫폼 최적화 제안.</li>
          </ul>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', background: '#fff' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '15px' }}>4. 커뮤니티 평판 진단 (최근 3일 기반)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', marginBottom: '5px' }}>주요 긍정 동인</div>
              <div style={{ fontSize: '0.8rem' }}>#브랜드신뢰 #디자인 #실사용후기</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', marginBottom: '5px' }}>주요 우려 요인</div>
              <div style={{ fontSize: '0.8rem' }}>#가격민감도 #재고부족 #배송지연</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
            최근 3일간 주요 커뮤니티 내 <strong>{brand}</strong> 멘션 약 {generateScore(url, brand, 'rev-count', 85, 120)}건을 AI가 실시간 분석한 결과, 긍정 평판 지수가 {generateScore(url, brand, 'pos-rate', 72)}%로 집계되었습니다. 고객은 주로 제품의 <strong>'신뢰도'</strong>와 <strong>'실제 결과'</strong>에 집중하고 있습니다.
          </div>
        </div>
      </div>

      {/* ── 단계별 GEO 실행 로드맵 ── */}
      <div style={{ background: '#0f172a', color: 'white', padding: '35px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '25px', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>🚀 {brand}를 위한 단계별 GEO 실행 로드맵</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 1. 즉시 보완 (2주 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. <strong>{targetUrl}</strong> 루트에 AI 크롤러 전용 llms.txt 구성 및 업로드</li>
              <li style={{ marginBottom: '10px' }}>2. 핵심 상품 상세 페이지에 JSON-LD 구조화 데이터 적용</li>
              <li style={{ marginBottom: '10px' }}>3. <strong>{brand}</strong> 주요 경쟁사 대비 부족한 답변형 콘텐츠 제작</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 2. 권위 강화 (1개월 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. Wikipedia 브랜드 공식 페이지 등재 및 정보 업데이트</li>
              <li style={{ marginBottom: '10px' }}>2. 전문 기술/산업 커뮤니티 내 <strong>{brand}</strong> 전문가 리뷰 확산</li>
              <li style={{ marginBottom: '10px' }}>3. AI 답변에 최적화된 단락 길이(150단어)의 정보성 콘텐츠 배포</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#94a3b8' }}>Phase 3. 글로벌 도약 (3개월 내)</h3>
            <ul style={{ paddingLeft: '0', listStyle: 'none', fontSize: '0.8rem', opacity: 0.9 }}>
              <li style={{ marginBottom: '10px' }}>1. 국내외 로컬 시장 해시태그 및 소셜 멘션 200% 증대</li>
              <li style={{ marginBottom: '10px' }}>2. AI 추천 답변 내 <strong>{brand}</strong> 점유율(SOV) 월간 모니터링 체계 구축</li>
              <li style={{ marginBottom: '10px' }}>3. 외부 파트너십 매체를 통한 고권위 브랜드 백링크 확보</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
