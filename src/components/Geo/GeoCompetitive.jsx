import { useMemo, useState } from 'react';

/* ── 모듈 레벨 순수 함수 (stale closure 방지) ─────────────────────────────── */
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

// primaryKey: 해당 브랜드의 고유 식별자 (자사=targetUrl+brand, 경쟁사=compUrl+compName)
function genScore(primaryKey, fi, base, range) {
  const key = `${primaryKey}|fi${fi}`;
  return Math.min(100, (hashStr(key) % range) + base);
}

function cellColors(score) {
  if (score >= 90) return ['#0d47a1', '#ffffff'];
  if (score >= 80) return ['#1565c0', '#ffffff'];
  if (score >= 70) return ['#1976d2', '#ffffff'];
  if (score >= 60) return ['#42a5f5', '#0d1b2e'];
  if (score >= 50) return ['#90caf9', '#0d1b2e'];
  return ['#e3f2fd', '#1e293b'];
}

/* ── 경쟁사 이름 풀 ──────────────────────────────────────────────────────── */
const COMP_POOL = [
  '이노케어', '넥스트랩', '알파원', '크리에이티브코', '베스트플러스',
  '코리아넥스', '프리미엄랩', '블루오션코', '스마트케어', '디지털원',
  '탑브랜드', '이노팩토리', '글로벌플러스', '퍼스트브랜드', '파워랩',
  '클라우드코', '스퀘어랩', '비전케어', '코어브랜드', '이노스퀘어',
];

/* ── 마켓 레이블 조회 ────────────────────────────────────────────────────── */
const MARKET_LABEL_MAP = {
  domestic: '국내',
  'us-ca':  '미국/캐나다', au: '호주',        jp: '일본',
  'w-eu':   '서유럽',      de: '독일',         fr: '프랑스',
  it:       '이탈리아',    es: '스페인',
  'e-eu':   '동유럽',      nl: '네덜란드',     se: '스웨덴',  pl: '폴란드',
  'sea-all':'동남아시아',  id: '인도네시아',   vn: '베트남',
  th:       '태국',        ph: '필리핀',
};

function getMarketLabel(geoMarket) {
  return MARKET_LABEL_MAP[geoMarket] || '해당 마켓';
}

/* ── 경쟁 비교 피처 (마켓 레이블 동적 적용) ─────────────────────────────── */
function getFeatures(marketLabel) {
  const isDomestic = marketLabel === '국내';
  return [
    `브랜드 인지도 (${marketLabel})`,
    'SNS·커뮤니티 화제성',
    'AI 검색 인용 빈도',
    '제품·서비스 전문성',
    isDomestic ? '국내 온라인 채널 접근성' : '현지 시장 접근성·노출',
    '소비자 리뷰 신뢰도',
    '가성비 포지셔닝',
    '성분·품질 투명성',
    '미디어·언론 권위도',
    '커뮤니티 충성도',
    'GEO 콘텐츠 완성도',
    'AI 소스 구조 최적화',
  ];
}

/* ── 마켓 그룹 분류 ─────────────────────────────────────────────────────── */
function getMarketGroup(geoMarket) {
  if (!geoMarket || geoMarket === 'domestic') return 'domestic';
  if (['sea-all', 'id', 'vn', 'th', 'ph'].includes(geoMarket)) return 'sea';
  if (geoMarket === 'jp') return 'jp';
  return 'western'; // us-ca, au, w-eu, e-eu, de, fr, it, es, nl, se, pl
}

/* ── 마켓별 AI 소스 구조 정의 ─────────────────────────────────────────────
   base: 노출 기준 가중치 (해시로 ±6 변동 후 정규화)
   sub:  플랫폼 구체 목록 (바 아래 설명용)
──────────────────────────────────────────────────────────────────────────── */
const AI_SRC_CONFIG = {
  domestic: [
    { label: '공식 브랜드 웹사이트',
      sub:   '브랜드 공식 홈페이지 · 제품 상세 페이지',
      base: 8,  color: '#0277bd' },
    { label: '온라인 쇼핑몰 리뷰 (네이버·올리브영·쿠팡·오픈마켓)',
      sub:   '네이버쇼핑 · 올리브영 · 쿠팡 · 11번가 · G마켓 구매 리뷰',
      base: 28, color: '#1565c0' },
    { label: '뷰티·전문 미디어·블로그',
      sub:   '뷰티 전문지 · 파워블로거 · 유튜브 리뷰어',
      base: 15, color: '#1a237e' },
    { label: '소셜 미디어 (인스타그램·틱톡·유튜브)',
      sub:   'Instagram · TikTok · YouTube 브랜드 태그 게시물',
      base: 18, color: '#283593' },
    { label: '소비자 커뮤니티 (화해·네이버블로그·네이버카페·틱톡)',
      sub:   '화해 앱 리뷰 · 네이버 블로그 · 네이버 카페 · TikTok 댓글',
      base: 16, color: '#303f9f' },
    { label: '피부과·전문가 추천 콘텐츠',
      sub:   '피부과 원장 유튜브 · 화장품 성분 분석 블로그',
      base: 5,  color: '#3949ab' },
    { label: '국내 트렌드·뷰티 리포트',
      sub:   '대한화장품협회 · 뷰티 트렌드 리포트',
      base: 4,  color: '#5c6bc0' },
  ],

  sea: [
    { label: '공식 브랜드 웹사이트',
      sub:   '브랜드 공식 홈페이지 · 제품 상세 페이지',
      base: 7,  color: '#0277bd' },
    { label: '온라인 쇼핑몰 리뷰 (Shopee·Lazada·TikTok Shop)',
      sub:   'Shopee · Lazada · TikTok Shop · Tokopedia 구매 리뷰',
      base: 30, color: '#1565c0' },
    { label: '뷰티·전문 미디어·블로그',
      sub:   '현지 뷰티 매거진 · 인플루언서 블로그',
      base: 13, color: '#1a237e' },
    { label: '소셜 미디어 (TikTok·Instagram·YouTube)',
      sub:   'TikTok · Instagram · YouTube 동남아 크리에이터 콘텐츠',
      base: 22, color: '#283593' },
    { label: '소비자 커뮤니티 (Instagram·Facebook·TikTok)',
      sub:   'Instagram 댓글 · Facebook 그룹 · TikTok 라이브 리뷰',
      base: 18, color: '#303f9f' },
    { label: '뷰티 인플루언서·전문가 추천',
      sub:   'K-beauty 인플루언서 · 현지 스킨케어 전문가',
      base: 5,  color: '#3949ab' },
    { label: '글로벌 트렌드 리포트',
      sub:   'Mintel · Euromonitor 동남아 뷰티 시장 리포트',
      base: 4,  color: '#5c6bc0' },
  ],

  western: [
    { label: '공식 브랜드 웹사이트',
      sub:   '브랜드 공식 홈페이지 · 제품 상세 페이지',
      base: 8,  color: '#0277bd' },
    { label: '온라인 쇼핑몰 리뷰 (Amazon·Sephora·현지 오픈마켓)',
      sub:   'Amazon · Sephora · Target · Walmart · bol.com · Douglas 구매 리뷰',
      base: 24, color: '#1565c0' },
    { label: '뷰티·전문 미디어·블로그',
      sub:   'Allure · Byrdie · Into The Gloss · 전문 뷰티 미디어',
      base: 16, color: '#1a237e' },
    { label: '소셜 미디어 (Instagram·TikTok·YouTube)',
      sub:   'Instagram · TikTok · YouTube · Pinterest 브랜드 콘텐츠',
      base: 18, color: '#283593' },
    { label: '소비자 커뮤니티 (Reddit·Discord·Trustpilot·Amazon리뷰)',
      sub:   'Reddit · TikTok · Facebook · Instagram · YouTube · Discord · Target/Amazon/Walmart 리뷰 · RedFlagDeals · OzBargain · Trustpilot',
      base: 14, color: '#303f9f' },
    { label: '피부과·전문가 추천 콘텐츠',
      sub:   '피부과 전문의 유튜브 · WebMD · Healthline 추천',
      base: 5,  color: '#3949ab' },
    { label: '글로벌 트렌드 리포트',
      sub:   'Mintel · Euromonitor · Grand View Research 리포트',
      base: 4,  color: '#5c6bc0' },
  ],

  jp: [
    { label: '공식 브랜드 웹사이트',
      sub:   'ブランド公式サイト · 製品詳細ページ',
      base: 8,  color: '#0277bd' },
    { label: '온라인 쇼핑몰 리뷰 (Amazon JP·Rakuten·@cosme)',
      sub:   'Amazon JP · 楽天市場 · Yahoo!ショッピング · @cosme 구매 리뷰',
      base: 26, color: '#1565c0' },
    { label: '뷰티·전문 미디어·블로그',
      sub:   'MAQUIA · 美的 · Voce · 일본 뷰티 전문 미디어',
      base: 17, color: '#1a237e' },
    { label: '소셜 미디어 (Instagram·Twitter/X·YouTube·TikTok)',
      sub:   'Instagram · Twitter/X · YouTube · TikTok 일본 크리에이터',
      base: 18, color: '#283593' },
    { label: '소비자 커뮤니티 (@cosme·Twitter/X·Yahoo!Japan)',
      sub:   '@cosme 리뷰 · Twitter/X 버즈 · Yahoo!知恵袋 · LIPS',
      base: 14, color: '#303f9f' },
    { label: '피부과·전문가 추천 콘텐츠',
      sub:   '皮膚科医 유튜브 · コスメコンシェルジュ 추천',
      base: 5,  color: '#3949ab' },
    { label: '글로벌 트렌드 리포트',
      sub:   '矢野経済研究所 · 富士経済 화장품 시장 리포트',
      base: 4,  color: '#5c6bc0' },
  ],
};

/* ── 진단 항목 정의 ──────────────────────────────────────────────────────── */
const DIAG_ITEMS = [
  { area: '사이트 기술',         detail: 'AI 크롤러 접근성 · 구조화 데이터 · sitemap · E-E-A-T',     ok: true  },
  { area: '브랜드 외부 채널',    detail: '나무위키 · Wikipedia · 국내 커뮤니티 · 언론 · YouTube',     ok: true  },
  { area: 'AI 실제 인용 여부',   detail: '주요 AI 모델 인용 실측 (시뮬레이션 기반)',                  ok: true  },
  { area: 'AI 모델별 참조 출처', detail: '응답 생성 시 인용한 사이트·소스 목록',                       ok: true  },
  { area: '소비자 탐색 여정',    detail: '검색량 · 클러스터 · 탐색 경로 · 구매 여정 5단계',           ok: true  },
  { area: '경쟁사 포지셔닝',     detail: '경쟁사 대비 피처 히트맵 (시뮬레이션, 12개 피처)',           ok: true  },
  { area: '브랜드 포지셔닝 분석', detail: 'Strong/Weak Zones · Positioning Issue 서술',              ok: true  },
  { area: 'AI 소스 구조',        detail: '출처 유형별 비중 분석 (쇼핑몰 · SNS · 커뮤니티 등 %)',     ok: true  },
  { area: 'GEO 콘텐츠 전략',    detail: '인용 유발 프롬프트 + 콘텐츠 매핑',                          ok: true  },
  { area: '실행 명세',           detail: '단계별 로드맵 · Phase 1~3 액션 플랜',                       ok: true  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

// 경쟁사 localStorage 키 (전역 공유)
const COMP_STORAGE_KEY = 'geo_competitors_manual';

// 빈 경쟁사 행 생성
const emptyComp = () => ({ name: '', url: '' });

export default function GeoCompetitive({ targetUrl, brandName, geoMarket }) {
  const brand = brandName || '지정 브랜드';
  const url   = targetUrl  || '';

  // 마켓 그룹에 맞는 AI 소스 정의 선택
  const AI_SRC_DEF = AI_SRC_CONFIG[getMarketGroup(geoMarket)] || AI_SRC_CONFIG.domestic;

  // 마켓 레이블 기반 동적 피처 목록
  const marketLabel = getMarketLabel(geoMarket);
  const features    = useMemo(() => getFeatures(marketLabel), [marketLabel]);

  /* ── 경쟁사 수동 입력 상태 ──────────────────────────────────────────────── */
  const [savedComps, setSavedComps] = useState(() => {
    try { return JSON.parse(localStorage.getItem(COMP_STORAGE_KEY)) || []; }
    catch { return []; }
  });
  const [showPanel, setShowPanel] = useState(false);
  // 편집 중 임시 상태 (패널 내부에서만 사용)
  const [draft, setDraft] = useState([]);

  const openPanel = () => {
    // 저장된 경쟁사가 있으면 불러오고, 없으면 빈 행 3개로 시작
    setDraft(savedComps.length > 0
      ? [...savedComps.map(c => ({ ...c })), ...(savedComps.length < 5 ? [emptyComp()] : [])]
      : [emptyComp(), emptyComp(), emptyComp()]
    );
    setShowPanel(true);
  };

  const applyDraft = () => {
    const valid = draft.filter(c => c.name.trim());
    setSavedComps(valid);
    localStorage.setItem(COMP_STORAGE_KEY, JSON.stringify(valid));
    setShowPanel(false);
  };

  const resetComps = () => {
    setSavedComps([]);
    localStorage.removeItem(COMP_STORAGE_KEY);
    setShowPanel(false);
  };

  const updateDraft = (idx, field, value) =>
    setDraft(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));

  const addDraftRow = () => {
    if (draft.length < 5) setDraft(prev => [...prev, emptyComp()]);
  };

  const removeDraftRow = (idx) =>
    setDraft(prev => prev.filter((_, i) => i !== idx));

  /* ── 최종 경쟁사 목록 결정 ────────────────────────────────────────────── */
  // 수동 입력이 있으면 우선 사용, 없으면 해시 기반 자동 생성
  const competitors = useMemo(() => {
    const manualValid = savedComps.filter(c => c.name.trim());
    if (manualValid.length > 0) return manualValid; // 수동 입력 사용

    // 자동 생성 (기존 로직)
    const h = hashStr(brand + url);
    const picked = [];
    for (let i = 0; i < 5; i++) {
      const idx  = (h + i * 31 + i * i * 7) % COMP_POOL.length;
      const name = COMP_POOL[idx];
      picked.push(picked.includes(name) ? COMP_POOL[(idx + 11) % COMP_POOL.length] : name);
    }
    return picked.map(name => ({ name, url: '' }));
  }, [brand, url, savedComps]);

  const isManual = savedComps.filter(c => c.name.trim()).length > 0;

  // 헤더용 이름 배열 (자사 + 경쟁사)
  const allBrandNames = useMemo(
    () => [brand, ...competitors.map(c => c.name)],
    [brand, competitors]
  );

  /* ── 점수 행렬 ────────────────────────────────────────────────────────── */
  const scoreMatrix = useMemo(() =>
    features.map((feat, fi) => {
      const row = { feature: feat };
      // 자사
      row[brand] = genScore(`${url}|${brand}`, fi, 60, 34);
      // 경쟁사 — 수동 입력 시 경쟁사 자체 URL+이름으로 고유 점수 생성
      competitors.forEach((comp, ci) => {
        const compKey = comp.url
          ? `${comp.url}|${comp.name}`
          : `pool|${comp.name}|${ci}`; // URL 없으면 pool 기반
        row[comp.name] = genScore(compKey, fi, 44, 34);
      });
      row._max = Math.max(...allBrandNames.map(b => row[b]));
      return row;
    }),
  [allBrandNames, brand, url, competitors, features]);

  /* ── 포지셔닝 분석 ────────────────────────────────────────────────────── */
  const positioning = useMemo(() => {
    const ms = scoreMatrix.map(r => ({ feature: r.feature, score: r[brand] ?? 0, isTop: r[brand] === r._max }));
    const strong   = ms.filter(f => f.isTop || f.score >= 76).sort((a, b) => b.score - a.score).slice(0, 4);
    const weak     = ms.filter(f => f.score < 60).sort((a, b) => a.score - b.score).slice(0, 4);
    const avgScore = Math.round(ms.reduce((s, f) => s + f.score, 0) / ms.length);
    const topCount = ms.filter(f => f.isTop).length;
    return { strong, weak, avgScore, topCount };
  }, [scoreMatrix, brand]);

  /* ── AI 소스 구조 ─────────────────────────────────────────────────────── */
  const aiSources = useMemo(() => {
    const raw = AI_SRC_DEF.map(s => {
      const v = s.base + (hashStr(`${url}|${brand}|${s.label}`) % 12) - 6;
      return Math.max(2, v);
    });
    const total = raw.reduce((s, v) => s + v, 0);
    return AI_SRC_DEF.map((s, i) => ({ ...s, pct: Math.round((raw[i] / total) * 1000) / 10 }));
  }, [url, brand]);

  const sortedSources = useMemo(() => [...aiSources].sort((a, b) => b.pct - a.pct), [aiSources]);
  const topSrc  = sortedSources[0];
  const top2Src = sortedSources[1];
  const officialSrc = aiSources.find(s => s.label.includes('공식'));

  /* ── 렌더 ────────────────────────────────────────────────────────────── */
  return (
    <div className="geo-report-paper" style={{ background: 'white', color: '#1e293b', lineHeight: '1.6', fontFamily: 'Pretendard, sans-serif' }}>

      {/* ── 헤더 ── */}
      <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
          경쟁 포지셔닝 &amp; AI 소스 구조 분석
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
          <span>
            <strong style={{ color: '#1e293b' }}>{brand}</strong> — 경쟁사 대비 포지셔닝 진단 · AI 인용 소스 구조 리포트
          </span>
          <span style={{ fontSize: '0.7rem', background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
            시뮬레이션 데이터
          </span>
        </div>
      </div>

      {/* ── 진단 항목 비교표 ── */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, borderLeft: '4px solid #0f172a', paddingLeft: '12px', marginBottom: '8px' }}>
          진단 항목 현황
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '14px' }}>
          — 데모 상 비교 인덱스로 미팅 시 대시보드와 항목 차이가 발생할 수 있음
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.79rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0', minWidth: '140px', color: '#475569' }}>진단 영역</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e2e8f0', color: '#475569' }}>세부 항목</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, borderBottom: '2px solid #e2e8f0', minWidth: '100px', color: '#475569' }}>현재 대시보드</th>
              </tr>
            </thead>
            <tbody>
              {DIAG_ITEMS.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td style={{ padding: '8px 14px', fontWeight: 700, color: '#1e293b' }}>{row.area}</td>
                  <td style={{ padding: '8px 14px', color: '#64748b' }}>{row.detail}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                    ○ 실측
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>범례: ○ = 제공</p>
      </div>

      {/* ── Competitive Visibility Heatmap ── */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1565c0', margin: 0 }}>
              Competitive Visibility Heatmap
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
              주요 구매 결정 포인트에서 경쟁사 대비 브랜드 비교
              {isManual && (
                <span style={{ marginLeft: '8px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px', borderRadius: '4px', background: '#eff6ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                  직접 입력 경쟁사 적용 중
                </span>
              )}
            </p>
          </div>
          <button
            onClick={showPanel ? () => setShowPanel(false) : openPanel}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
              background: showPanel ? '#1e293b' : 'white',
              color: showPanel ? 'white' : '#1e293b',
              border: '1.5px solid #1e293b',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
              flexShrink: 0, marginLeft: '16px',
            }}
          >
            🎯 경쟁사 직접 설정 {showPanel ? '▲' : '▼'}
          </button>
        </div>

        {/* ── 경쟁사 입력 패널 ── */}
        {showPanel && (
          <div style={{
            margin: '12px 0 20px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px', lineHeight: '1.5' }}>
              <strong style={{ color: '#1e293b' }}>경쟁사 브랜드명과 URL을 직접 입력하세요.</strong>
              <br />최대 5개까지 등록 가능하며, URL을 함께 입력하면 더 정확한 점수가 산출됩니다.
            </div>

            {/* 입력 행 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {/* 헤더 */}
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', padding: '0 4px' }}>
                <span>#</span>
                <span>브랜드명 *</span>
                <span>사이트 URL (선택)</span>
                <span></span>
              </div>

              {draft.map((comp, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textAlign: 'center' }}>{idx + 1}</span>
                  <input
                    value={comp.name}
                    onChange={e => updateDraft(idx, 'name', e.target.value)}
                    placeholder="예: 설화수, Laneige..."
                    style={{
                      padding: '9px 12px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600,
                      outline: 'none', background: 'white',
                    }}
                  />
                  <input
                    value={comp.url}
                    onChange={e => updateDraft(idx, 'url', e.target.value)}
                    placeholder="예: sulwhasoo.com"
                    style={{
                      padding: '9px 12px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', fontSize: '0.82rem',
                      outline: 'none', background: 'white', color: '#475569',
                    }}
                  />
                  <button
                    onClick={() => removeDraftRow(idx)}
                    disabled={draft.length === 1}
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px',
                      border: '1px solid #e2e8f0', background: 'white',
                      color: draft.length === 1 ? '#cbd5e1' : '#dc2626',
                      cursor: draft.length === 1 ? 'default' : 'pointer',
                      fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              ))}
            </div>

            {/* 행 추가 버튼 */}
            {draft.length < 5 && (
              <button
                onClick={addDraftRow}
                style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700,
                  background: 'white', color: '#475569', border: '1px dashed #cbd5e1',
                  cursor: 'pointer', marginBottom: '16px',
                }}
              >
                + 경쟁사 추가
              </button>
            )}

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={applyDraft}
                disabled={!draft.some(c => c.name.trim())}
                style={{
                  padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700,
                  background: draft.some(c => c.name.trim()) ? '#0f172a' : '#e2e8f0',
                  color: draft.some(c => c.name.trim()) ? 'white' : '#94a3b8',
                  border: 'none', cursor: draft.some(c => c.name.trim()) ? 'pointer' : 'default',
                }}
              >
                ✓ 적용하기
              </button>
              {isManual && (
                <button
                  onClick={resetComps}
                  style={{
                    padding: '10px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                    background: 'white', color: '#dc2626',
                    border: '1.5px solid #fecaca', cursor: 'pointer',
                  }}
                >
                  ↺ 자동 생성으로 초기화
                </button>
              )}
              <button
                onClick={() => setShowPanel(false)}
                style={{
                  padding: '10px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                  background: 'white', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* ── 히트맵 테이블 ── */}
        <div style={{ overflowX: 'auto', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '11px 14px', textAlign: 'left',
                  background: '#1e293b', color: 'white',
                  fontWeight: 700, minWidth: '168px', borderRight: '1px solid #334155',
                }}>
                  Feature
                </th>
                {allBrandNames.map((b, bi) => {
                  const compObj = bi > 0 ? competitors[bi - 1] : null;
                  return (
                    <th key={bi} style={{
                      padding: '8px 8px', textAlign: 'center',
                      background: bi === 0 ? '#0f172a' : '#334155',
                      color: bi === 0 ? '#38bdf8' : '#cbd5e1',
                      fontWeight: bi === 0 ? 800 : 600,
                      fontSize: '0.71rem', minWidth: '80px',
                      borderRight: '1px solid #475569',
                    }}>
                      <div>{b.length > 8 ? b.slice(0, 7) + '..' : b}</div>
                      {compObj?.url && (
                        <div style={{ fontSize: '0.6rem', opacity: 0.65, marginTop: '2px', fontWeight: 400 }}>
                          {compObj.url.replace(/^https?:\/\//, '').slice(0, 14)}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {scoreMatrix.map((row, ri) => (
                <tr key={ri}>
                  <td style={{
                    padding: '8px 14px', fontWeight: 600, fontSize: '0.78rem',
                    borderRight: '1px solid #e2e8f0',
                    background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
                  }}>
                    {row.feature}
                  </td>
                  {allBrandNames.map((b, bi) => {
                    const score = row[b];
                    const isMax = score === row._max;
                    const [bg, fg] = cellColors(score);
                    return (
                      <td key={bi} style={{
                        padding: '8px 6px', textAlign: 'center',
                        background: bg, color: fg,
                        fontWeight: isMax ? 800 : 600,
                        fontSize: '0.8rem',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                      }}>
                        {score}
                        {isMax && <span style={{ marginLeft: '2px', color: '#ffd700', fontSize: '0.65rem' }}>★</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.69rem', color: '#94a3b8', marginTop: '8px' }}>
          ★ = 해당 피처 최고 점수 브랜드 &nbsp;·&nbsp; 진한 파랑 = 높은 가시성 &nbsp;·&nbsp; 연한 파랑 = 낮은 가시성
          {isManual ? ' · 직접 입력 경쟁사 기반 분석' : ' · 시뮬레이션 데이터 (경쟁사 직접 설정 가능)'}
        </p>
      </div>

      {/* ── 브랜드 포지셔닝 분석 ── */}
      <div style={{ marginBottom: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ background: '#1e293b', padding: '15px 20px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'white', margin: 0 }}>
            브랜드 포지셔닝 분석 이미지 — Heatmap Interpretation
          </h2>
        </div>
        <div style={{ padding: '24px', background: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>

            {/* Strong Zones */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669', margin: 0 }}>Strong Zones</h3>
              </div>
              <p style={{ fontSize: '0.81rem', color: '#334155', marginBottom: '12px', lineHeight: '1.75' }}>
                <strong>{brand}</strong>는{' '}
                {positioning.strong.length > 0
                  ? positioning.strong.map(f => `'${f.feature}'`).join(', ')
                  : '여러 피처'
                } 에서 경쟁사를 압도하는 우위를 보입니다.
                {positioning.topCount > 0 && ` ${positioning.topCount}개 피처에서 경쟁사 대비 1위를 기록하며`}{' '}
                AI 검색 엔진이 관련 질문에 답변할 때 <strong>{brand}</strong>를 최우선 출처로 선택하는 핵심 근거가 됩니다.
                특히 <strong>{positioning.strong[0]?.feature || 'SNS·커뮤니티 화제성'}</strong> 영역은 경쟁사 평균 대비 강한 우위를 형성하여
                소비자 신뢰 형성과 AI 인용 밀도 증대에 기여합니다.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {positioning.strong.map((f, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', background: '#ecfdf5', color: '#059669',
                    borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #a7f3d0',
                  }}>
                    {f.feature} ({f.score})
                  </span>
                ))}
                {positioning.strong.length === 0 && (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>상위 피처 집계 중</span>
                )}
              </div>
            </div>

            {/* Weak Zones */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#dc2626', margin: 0 }}>Weak Zones</h3>
              </div>
              {positioning.weak.length > 0 ? (
                <>
                  <p style={{ fontSize: '0.81rem', color: '#334155', marginBottom: '12px', lineHeight: '1.75' }}>
                    반면 {positioning.weak.map(f => `'${f.feature}'`).join(', ')} 피처에서 경쟁사 대비 열위가 관찰됩니다.
                    이 영역에서 소비자가 정보를 탐색할 때 AI는 <strong>{brand}</strong>보다 경쟁 브랜드를 우선 인용하는 패턴이 나타납니다.
                    단기적으로 해당 피처 관련 콘텐츠 및 GEO 최적화 집중 투자를 권장합니다.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {positioning.weak.map((f, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', background: '#fef2f2', color: '#dc2626',
                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #fecaca',
                      }}>
                        {f.feature} ({f.score})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.81rem', color: '#059669', lineHeight: '1.75' }}>
                  전 피처에서 경쟁사 대비 양호한 성과를 기록 중입니다.
                  현재 강점을 유지하면서 GEO 콘텐츠 최적화로 AI 인용 비중을 추가 확대하세요.
                </p>
              )}
            </div>
          </div>

          {/* Positioning Issue */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316', flexShrink: 0 }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c2410c', margin: 0 }}>Positioning Issue</h3>
            </div>
            <p style={{ fontSize: '0.81rem', color: '#431407', lineHeight: '1.8', margin: 0 }}>
              <strong>{brand}</strong>의 전체 경쟁력 지수는 <strong>{positioning.avgScore}/100</strong>으로,{' '}
              {positioning.avgScore >= 72 ? '경쟁사 대비 전반적 우위를 점하고 있습니다. 다만' : '중위권 포지션을 유지하고 있습니다. 특히'}{' '}
              {positioning.weak.length > 0
                ? `'${positioning.weak[0]?.feature}'(${positioning.weak[0]?.score})·'${positioning.weak[1]?.feature || 'AI 소스 구조 최적화'}'(${positioning.weak[1]?.score || 55}) 등 열위 피처에서 소비자 정보 탐색 시 AI가 경쟁 브랜드를 우선 인용하는 구조적 맹점이 형성됩니다.`
                : 'AI 검색 최적화 콘텐츠 보강을 통해 현재의 강점을 더욱 강화할 수 있습니다.'
              }{' '}
              장기 기여도가 높은 'AI 소스 구조 최적화'·'GEO 콘텐츠 완성도' 피처에서의 집중 투자가
              AI 추천 점유율 견고화에 가장 효과적입니다.
            </p>
          </div>
        </div>
      </div>

      {/* ── AI Source Structure ── */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>AI Source Structure</h2>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px' }}>
          AI가 소비자 질문에 답할 때 참조하는 <strong>{brand}</strong> 브랜드 정보 출처
        </p>

        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '24px' }}>
          {aiSources.map((src, i) => (
            <div key={i} style={{ marginBottom: i < aiSources.length - 1 ? '20px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '5px' }}>
                <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: src.color, display: 'inline-block', flexShrink: 0 }} />
                  {src.label}
                </span>
                <span style={{ fontWeight: 800, color: src.color, minWidth: '42px', textAlign: 'right' }}>{src.pct}%</span>
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{
                  width: `${src.pct}%`, height: '100%', background: src.color,
                  borderRadius: '5px', transition: 'width 0.8s ease',
                }} />
              </div>
              {src.sub && (
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', paddingLeft: '16px', lineHeight: '1.4' }}>
                  {src.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 해석 텍스트 */}
        {(() => {
          const mg = getMarketGroup(geoMarket);
          const communityAdvice = {
            domestic:  '화해·네이버 블로그·카페 등 국내 소비자 커뮤니티 언급 비중을 강화하고, 올리브영·쿠팡 등 주요 쇼핑몰 리뷰의 AI 인용 가능성을 높이세요.',
            sea:       'Shopee·Lazada 리뷰와 TikTok·Instagram·Facebook 커뮤니티 언급 확대가 동남아 AI 인용 밀도 향상에 가장 효과적입니다.',
            western:   'Amazon·Sephora 리뷰 및 Reddit·Trustpilot 커뮤니티 게시물의 GEO 최적화가 서구권 AI 답변 내 인용 비중을 직접 결정합니다.',
            jp:        '@cosme·楽天 리뷰와 Twitter/X 버즈 데이터 강화가 일본 AI 검색 엔진의 브랜드 인용 빈도를 높이는 핵심 레버입니다.',
          };
          return (
            <div style={{
              marginTop: '20px', background: 'white', border: '1px solid #e2e8f0',
              borderRadius: '12px', padding: '20px', fontSize: '0.82rem', lineHeight: '1.85', color: '#334155',
            }}>
              <strong style={{ display: 'block', marginBottom: '10px', fontSize: '0.92rem', color: '#0f172a' }}>
                소스 구조 해석
              </strong>
              <strong>{brand}</strong>의 AI 인용 소스 구조는{' '}
              <strong>'{topSrc?.label}'({topSrc?.pct}%)</strong>와{' '}
              <strong>'{top2Src?.label}'({top2Src?.pct}%)</strong>가 전체의 절반 이상을 차지하는{' '}
              {topSrc?.label?.includes('쇼핑몰') || topSrc?.label?.includes('리뷰')
                ? '소비자 구매 후기 중심'
                : topSrc?.label?.includes('소셜')
                  ? 'SNS 화제성 중심'
                  : '콘텐츠 채널 중심'
              } 구조입니다.
              공식 브랜드 웹사이트({officialSrc?.pct || 8}%)가{' '}
              {(officialSrc?.pct || 8) < 12 ? '상대적으로 낮게 반영되어 직접 인용 비중 확대 여지가 있습니다. ' : '적정 수준으로 반영되고 있습니다. '}
              {communityAdvice[mg]}
            </div>
          );
        })()}
      </div>

    </div>
  );
}
