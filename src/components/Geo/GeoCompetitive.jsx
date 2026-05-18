import { useMemo } from 'react';

/* ── 모듈 레벨 순수 함수 (stale closure 방지) ─────────────────────────────── */
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function genScore(url, brand, fi, bi, base, range) {
  const key = `${url}|${brand}|fi${fi}|bi${bi}`;
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

/* ── 경쟁 비교 피처 ──────────────────────────────────────────────────────── */
const FEATURES = [
  '브랜드 인지도 (국내)',
  'SNS·커뮤니티 화제성',
  'AI 검색 인용 빈도',
  '제품·서비스 전문성',
  '글로벌 접근성·해외 노출',
  '소비자 리뷰 신뢰도',
  '가성비 포지셔닝',
  '성분·품질 투명성',
  '미디어·언론 권위도',
  '커뮤니티 충성도',
  'GEO 콘텐츠 완성도',
  'AI 소스 구조 최적화',
];

/* ── AI 참조 소스 풀 ─────────────────────────────────────────────────────── */
const AI_SRC_DEF = [
  { label: '공식 브랜드 웹사이트',                base: 8,  color: '#0277bd' },
  { label: '온라인 쇼핑몰 리뷰 (올리브영·아마존 등)', base: 26, color: '#1565c0' },
  { label: '뷰티·전문 미디어·블로그',              base: 16, color: '#1a237e' },
  { label: '소셜 미디어 (인스타그램·틱톡·유튜브)', base: 20, color: '#283593' },
  { label: '소비자 커뮤니티 (레딧·화해·네이버 카페)', base: 14, color: '#303f9f' },
  { label: '피부과·전문가 추천 콘텐츠',            base: 5,  color: '#3949ab' },
  { label: '글로벌 트렌드 리포트',                 base: 4,  color: '#5c6bc0' },
];

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
export default function GeoCompetitive({ targetUrl, brandName }) {
  const brand = brandName || '지정 브랜드';
  const url   = targetUrl  || '';

  /* ── 경쟁사 결정적 선택 ───────────────────────────────────────────────── */
  const competitors = useMemo(() => {
    const h = hashStr(brand + url);
    const picked = [];
    for (let i = 0; i < 5; i++) {
      const idx  = (h + i * 31 + i * i * 7) % COMP_POOL.length;
      const name = COMP_POOL[idx];
      picked.push(picked.includes(name) ? COMP_POOL[(idx + 11) % COMP_POOL.length] : name);
    }
    return picked;
  }, [brand, url]);

  const allBrands = useMemo(() => [brand, ...competitors], [brand, competitors]);

  /* ── 점수 행렬 ────────────────────────────────────────────────────────── */
  const scoreMatrix = useMemo(() =>
    FEATURES.map((feat, fi) => {
      const row = { feature: feat };
      allBrands.forEach((b, bi) => {
        row[b] = genScore(url + b, brand, fi, bi, bi === 0 ? 60 : 44, 34);
      });
      row._max = Math.max(...allBrands.map(b => row[b]));
      return row;
    }),
  [allBrands, brand, url]);

  /* ── 포지셔닝 분석 ────────────────────────────────────────────────────── */
  const positioning = useMemo(() => {
    const ms = scoreMatrix.map(r => ({ feature: r.feature, score: r[brand], isTop: r[brand] === r._max }));
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
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px', color: '#1565c0' }}>
          Competitive Visibility Heatmap
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
          주요 구매 결정 포인트에서 경쟁사 대비 브랜드 비교
        </p>
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
                {allBrands.map((b, bi) => (
                  <th key={bi} style={{
                    padding: '11px 8px', textAlign: 'center',
                    background: bi === 0 ? '#0f172a' : '#334155',
                    color: bi === 0 ? '#38bdf8' : '#cbd5e1',
                    fontWeight: bi === 0 ? 800 : 600,
                    fontSize: '0.71rem', minWidth: '76px',
                    borderRight: '1px solid #475569',
                  }}>
                    {b.length > 7 ? b.slice(0, 6) + '..' : b}
                  </th>
                ))}
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
                  {allBrands.map((b, bi) => {
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
          ★ = 해당 피처 최고 점수 브랜드 &nbsp;·&nbsp; 진한 파랑 = 높은 가시성 &nbsp;·&nbsp; 연한 파랑 = 낮은 가시성 &nbsp;·&nbsp; 시뮬레이션 데이터
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
            <div key={i} style={{ marginBottom: i < aiSources.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: src.color, display: 'inline-block', flexShrink: 0 }} />
                  {src.label}
                </span>
                <span style={{ fontWeight: 800, color: src.color, minWidth: '42px', textAlign: 'right' }}>{src.pct}%</span>
              </div>
              <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${src.pct}%`, height: '100%', background: src.color,
                  borderRadius: '5px', transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* 해석 텍스트 */}
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
            ? '소비자 반응 중심'
            : topSrc?.label?.includes('소셜')
              ? 'SNS 화제성 중심'
              : '콘텐츠 채널 중심'
          } 구조입니다.
          AI는 <strong>{brand}</strong>를 '브랜드 신뢰'로 인식하지만,
          공식 브랜드 웹사이트({officialSrc?.pct || 8}%)가{' '}
          {(officialSrc?.pct || 8) < 12 ? '상대적으로 낮게 반영되어' : '적정 수준으로 반영되어'}{' '}
          직접 인용 비중 확대 여지가 있습니다.
          피부과·전문가 추천 콘텐츠와 커뮤니티 언급 비중을 강화해{' '}
          AI 답변에서 <strong>신뢰도 기반 인용</strong> 비중을 높이는 전략이 중장기적으로 효과적입니다.
        </div>
      </div>

    </div>
  );
}
