import { useMemo } from 'react';
import { PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData } from '../../utils/demoData';

/* ── 모듈 레벨 순수 함수 ───────────────────────────────────────────────────── */
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}
function hv(key, base, range) { return (hashStr(key) % range) + base; }
function fmtNum(n) { return n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString(); }

/* ── API 출처 배지 ─────────────────────────────────────────────────────────── */
function ApiBadge({ label, color = '#1a73e8' }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: '4px',
      background: `${color}18`, color, border: `1px solid ${color}40`,
      marginLeft: '8px', verticalAlign: 'middle', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/* ── 섹션 헤더 ─────────────────────────────────────────────────────────────── */
function SectionHeader({ title, apiLabel, apiColor, desc }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</h3>
        <ApiBadge label={apiLabel} color={apiColor} />
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
          시뮬레이션 데이터
        </span>
      </div>
      {desc && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{desc}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function GoogleDashboard({ mappings, settings }) {

  const { brandGroups, allKeywords } = useMemo(() => {
    const groups = [];
    const kws = [];
    mappings.forEach(m => {
      let parts = m.keywords.split(',').map(s => s.trim()).filter(s => s);
      if (parts.length === 0 && m.name) parts = [m.name];
      if (m.name && parts.length > 0) {
        groups.push({ name: m.name, keywords: parts, color: m.color });
        kws.push(...parts);
      }
    });
    return { brandGroups: groups, allKeywords: [...new Set(kws)] };
  }, [mappings]);

  /* ── 1. 브랜드 검색 관심도 추이 (Google Trends) ───────────────────────── */
  const rawKeywordTrend = useMemo(() => {
    if (allKeywords.length === 0) return [];
    return generateTrendData(allKeywords, 90); // 3개월
  }, [allKeywords]);

  const brandTrendData = useMemo(() => {
    if (brandGroups.length === 0 || rawKeywordTrend.length === 0)
      return generateTrendData(['검색어 없음'], 90);
    return rawKeywordTrend.map(d => {
      const row = { date: d.date };
      brandGroups.forEach(g => {
        row[g.name] = g.keywords.reduce((s, kw) => s + (d[kw] || 0), 0);
      });
      return row;
    });
  }, [brandGroups, rawKeywordTrend]);

  /* ── 2. 자사 사이트 검색 유입 쿼리 (Search Console) ──────────────────── */
  const gscQueries = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const kws = allKeywords.slice(0, 8);
    const rows = kws.length > 0 ? kws : [brand, `${brand} 후기`, `${brand} 가격`];
    return rows.map((kw, i) => {
      const impressions = hv(`gsc-imp-${kw}`, 800, 12000);
      const clicks      = Math.round(impressions * (hv(`gsc-ctr-${kw}`, 3, 14) / 100));
      const ctr         = ((clicks / impressions) * 100).toFixed(1);
      const position    = (hv(`gsc-pos-${kw}`, 1, 18) + hv(`gsc-pos2-${kw}`, 0, 9) / 10).toFixed(1);
      return { query: kw, impressions, clicks, ctr, position };
    }).sort((a, b) => b.clicks - a.clicks);
  }, [allKeywords, brandGroups]);

  /* ── 3. 키워드 검색량/확장 키워드 (Google Ads KP) ────────────────────── */
  const kpKeywords = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const base = allKeywords.slice(0, 6);
    const expanded = [
      `${brand} 추천`, `${brand} 리뷰`, `${brand} 할인`,
      `${brand} 구매`, `${brand} 효과`, `best ${brand}`,
    ];
    return [...base, ...expanded].slice(0, 12).map(kw => {
      const vol  = hv(`kp-vol-${kw}`, 500, 48000);
      const comp = ['낮음', '보통', '높음'][hv(`kp-comp-${kw}`, 0, 3)];
      const minCpc = (hv(`kp-min-${kw}`, 50, 400) / 100).toFixed(2);
      const maxCpc = (Number(minCpc) + hv(`kp-max-${kw}`, 20, 300) / 100).toFixed(2);
      const trend  = hv(`kp-tr-${kw}`, 0, 3); // 0=↑ 1=→ 2=↓
      return { keyword: kw, volume: vol, competition: comp, minCpc, maxCpc, trend };
    }).sort((a, b) => b.volume - a.volume);
  }, [allKeywords, brandGroups]);

  /* ── 4. 검색결과 상위 노출 현황 (SERP API) ───────────────────────────── */
  const serpData = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const kws = allKeywords.slice(0, 8);
    const rows = kws.length > 0 ? kws : [`${brand}`, `${brand} 구매`];
    const TYPES = ['오가닉', '쇼핑광고', '이미지팩', '지식패널', '피플알소어스크'];
    return rows.map(kw => {
      const rank    = hv(`serp-rank-${kw}`, 1, 15);
      const type    = TYPES[hv(`serp-type-${kw}`, 0, TYPES.length)];
      const featSnip = hv(`serp-feat-${kw}`, 0, 5) === 0; // 20% 확률로 featured
      return { keyword: kw, rank, type, featuredSnippet: featSnip };
    }).sort((a, b) => a.rank - b.rank);
  }, [allKeywords, brandGroups]);

  /* ── 5. 경쟁사 브랜드 관심도 비교 (Google Trends + SERP) ─────────────── */
  const competitorTrend = useMemo(() => {
    if (brandGroups.length === 0) return generateTrendData(['비교 대상 없음'], 90);
    // 브랜드명으로 직접 Trends 데이터 (90일)
    return rawKeywordTrend.map(d => {
      const row = { date: d.date };
      brandGroups.forEach(g => {
        row[g.name] = g.keywords.reduce((s, kw) => s + (d[kw] || 0), 0);
      });
      return row;
    });
  }, [brandGroups, rawKeywordTrend]);

  /* ── 6. 캠페인 키워드 발굴 (Google Ads API + Trends) ─────────────────── */
  const campaignKeywords = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const suggestions = [
      { keyword: `${brand} 공식`,        intent: '브랜드',   type: '정확검색',   trend: '↑', cpc: (hv(`cmp1-${brand}`, 80, 400) / 100).toFixed(2) },
      { keyword: `${brand} 후기`,         intent: '정보성',   type: '구문검색',   trend: '↑', cpc: (hv(`cmp2-${brand}`, 50, 250) / 100).toFixed(2) },
      { keyword: `${brand} 할인코드`,     intent: '거래',     type: '광범위수정', trend: '→', cpc: (hv(`cmp3-${brand}`, 100, 500) / 100).toFixed(2) },
      { keyword: `${brand} vs 경쟁사`,    intent: '비교',     type: '구문검색',   trend: '↑', cpc: (hv(`cmp4-${brand}`, 60, 300) / 100).toFixed(2) },
      { keyword: `${brand} 성분`,         intent: '정보성',   type: '광범위수정', trend: '↑', cpc: (hv(`cmp5-${brand}`, 40, 200) / 100).toFixed(2) },
      { keyword: `buy ${brand} online`,   intent: '거래',     type: '정확검색',   trend: '→', cpc: (hv(`cmp6-${brand}`, 120, 600) / 100).toFixed(2) },
      { keyword: `${brand} 샘플`,         intent: '거래',     type: '구문검색',   trend: '↑', cpc: (hv(`cmp7-${brand}`, 70, 350) / 100).toFixed(2) },
      { keyword: `${brand} 사용법`,       intent: '정보성',   type: '광범위수정', trend: '→', cpc: (hv(`cmp8-${brand}`, 30, 150) / 100).toFixed(2) },
    ];
    return suggestions;
  }, [brandGroups]);

  /* ── 공통 테이블 스타일 ──────────────────────────────────────────────────── */
  const TH = ({ children, right }) => (
    <th style={{ padding: '9px 14px', textAlign: right ? 'right' : 'left', fontWeight: 700, fontSize: '0.75rem', color: '#475569', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
  const TD = ({ children, right, bold, color }) => (
    <td style={{ padding: '8px 14px', textAlign: right ? 'right' : 'left', fontWeight: bold ? 700 : 500, fontSize: '0.82rem', color: color || '#334155', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
      {children}
    </td>
  );

  const trendIcon = (t) => t === 0 ? <span style={{ color: '#059669' }}>▲</span> : t === 2 ? <span style={{ color: '#dc2626' }}>▼</span> : <span style={{ color: '#94a3b8' }}>—</span>;
  const rankColor = (r) => r <= 3 ? '#059669' : r <= 10 ? '#0369a1' : '#dc2626';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* ── 1. 브랜드 검색 관심도 추이 ── */}
      <div className="trend-section">
        <SectionHeader
          title="브랜드 검색 관심도 추이"
          apiLabel="Google Trends API (pytrends)"
          apiColor="#1a73e8"
          desc="최근 90일 브랜드별 Google 검색 관심도 지수 (0~100 정규화)"
        />
        <TrendChart
          data={brandTrendData}
          keywords={brandGroups.map(g => g.name)}
          title=""
          badgeClass={PLATFORMS.google?.badge}
          badgeText="POWERED BY GOOGLE TRENDS"
        />
      </div>

      {/* ── 2. 자사 사이트 검색 유입 쿼리 ── */}
      <div className="trend-section">
        <SectionHeader
          title="자사 사이트 검색 유입 쿼리"
          apiLabel="Google Search Console API"
          apiColor="#34a853"
          desc="Google 검색 결과를 통해 자사 사이트로 유입된 쿼리별 노출·클릭·CTR·평균 순위"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr>
                <TH>검색 쿼리</TH>
                <TH right>노출수</TH>
                <TH right>클릭수</TH>
                <TH right>CTR</TH>
                <TH right>평균 순위</TH>
              </tr>
            </thead>
            <tbody>
              {gscQueries.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <TD bold>{row.query}</TD>
                  <TD right>{fmtNum(row.impressions)}</TD>
                  <TD right bold color="#0369a1">{fmtNum(row.clicks)}</TD>
                  <TD right color={Number(row.ctr) >= 5 ? '#059669' : '#64748b'}>{row.ctr}%</TD>
                  <TD right color={rankColor(Number(row.position))}>{row.position}위</TD>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. 키워드 검색량/확장 키워드 ── */}
      <div className="trend-section">
        <SectionHeader
          title="키워드 검색량 및 확장 키워드"
          apiLabel="Google Ads API · Keyword Planner"
          apiColor="#fbbc04"
          desc="Google Ads Keyword Planner 기반 월간 검색량, 경쟁도, 예상 CPC 범위"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr>
                <TH>키워드</TH>
                <TH right>월간 검색량</TH>
                <TH>경쟁도</TH>
                <TH right>최소 CPC</TH>
                <TH right>최대 CPC</TH>
                <TH>트렌드</TH>
              </tr>
            </thead>
            <tbody>
              {kpKeywords.map((row, i) => {
                const compColor = row.competition === '높음' ? '#dc2626' : row.competition === '보통' ? '#d97706' : '#059669';
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <TD bold>{row.keyword}</TD>
                    <TD right bold color="#0369a1">{fmtNum(row.volume)}</TD>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: `${compColor}15`, color: compColor, border: `1px solid ${compColor}30` }}>
                        {row.competition}
                      </span>
                    </td>
                    <TD right>₩{row.minCpc}</TD>
                    <TD right>₩{row.maxCpc}</TD>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '1rem' }}>
                      {trendIcon(row.trend)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. 검색결과 상위 노출 현황 ── */}
      <div className="trend-section">
        <SectionHeader
          title="검색결과 상위 노출 현황"
          apiLabel="SERP API"
          apiColor="#ea4335"
          desc="주요 브랜드 키워드의 Google 검색결과 순위 및 결과 유형"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr>
                <TH>키워드</TH>
                <TH right>현재 순위</TH>
                <TH>결과 유형</TH>
                <TH>Featured Snippet</TH>
              </tr>
            </thead>
            <tbody>
              {serpData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <TD bold>{row.keyword}</TD>
                  <td style={{ padding: '8px 14px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: rankColor(row.rank) }}>
                      {row.rank}위
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                    {row.featuredSnippet
                      ? <span style={{ color: '#059669', fontWeight: 700 }}>✓ 획득</span>
                      : <span style={{ color: '#94a3b8' }}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
          순위 기준: 1~3위 <span style={{ color: '#059669' }}>●</span> 최상위 &nbsp;·&nbsp; 4~10위 <span style={{ color: '#0369a1' }}>●</span> 1페이지 &nbsp;·&nbsp; 11위+ <span style={{ color: '#dc2626' }}>●</span> 개선 필요
        </p>
      </div>

      {/* ── 5. 경쟁사 브랜드 관심도 비교 ── */}
      <div className="trend-section">
        <SectionHeader
          title="경쟁사 브랜드 관심도 비교"
          apiLabel="Google Trends + SERP API"
          apiColor="#9c27b0"
          desc="등록된 브랜드 키워드 간 Google 검색 관심도 비교 추이 (90일)"
        />
        {brandGroups.length < 2 ? (
          <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '10px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            비교 분석을 위해 <strong>브랜드 설정</strong>에서 경쟁 브랜드를 2개 이상 등록해주세요.
          </div>
        ) : (
          <TrendChart
            data={competitorTrend}
            keywords={brandGroups.map(g => g.name)}
            title=""
            badgeClass={PLATFORMS.google?.badge}
            badgeText="GOOGLE TRENDS COMPARE"
          />
        )}
      </div>

      {/* ── 6. 캠페인 키워드 발굴 ── */}
      <div className="trend-section">
        <SectionHeader
          title="캠페인 키워드 발굴"
          apiLabel="Google Ads API + Trends"
          apiColor="#ff6d00"
          desc="광고 캠페인에 활용 가능한 추천 키워드 — 검색 의도별 분류 및 예상 CPC"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {campaignKeywords.map((item, i) => {
            const intentColor = item.intent === '거래' ? '#059669' : item.intent === '비교' ? '#d97706' : '#0369a1';
            return (
              <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{item.keyword}</span>
                  <span style={{ fontSize: '1rem' }}>{item.trend}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: `${intentColor}15`, color: intentColor, border: `1px solid ${intentColor}30` }}>
                    {item.intent}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', marginLeft: 'auto' }}>
                    CPC ₩{item.cpc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '10px' }}>
          의도 분류: <span style={{ color: '#059669' }}>●</span> 거래 = 구매 전환 고의도 &nbsp;·&nbsp; <span style={{ color: '#d97706' }}>●</span> 비교 = 경쟁 키워드 &nbsp;·&nbsp; <span style={{ color: '#0369a1' }}>●</span> 정보성 = 콘텐츠 최적화 대상
        </p>
      </div>

    </div>
  );
}
