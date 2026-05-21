import { useMemo, useState } from 'react';
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

/* ── 마켓별 구성 설정 ─────────────────────────────────────────────────────── */
const GOOGLE_MARKET_CONFIG = {
  domestic:  { label: '국내(대한민국)', flag: '🇰🇷', group: '국내',     currency: '₩',  cpcMin: 300,   cpcMax: 2500,  volBase: 500,   volRange: 48000,  geo: 'KR', intCurrency: true  },
  'us-ca':   { label: '미국/캐나다',    flag: '🇺🇸', group: '아메리카', currency: '$',   cpcMin: 0.5,   cpcMax: 8.0,   volBase: 5000,  volRange: 400000, geo: 'US', intCurrency: false },
  au:        { label: '호주',           flag: '🇦🇺', group: '아시아태평양', currency: 'A$', cpcMin: 0.5, cpcMax: 6.0,   volBase: 1000,  volRange: 80000,  geo: 'AU', intCurrency: false },
  jp:        { label: '일본',           flag: '🇯🇵', group: '아시아태평양', currency: '¥', cpcMin: 50,  cpcMax: 600,   volBase: 2000,  volRange: 150000, geo: 'JP', intCurrency: true  },
  'w-eu':    { label: '서유럽',         flag: '🇪🇺', group: '서유럽',   currency: '€',  cpcMin: 0.3,   cpcMax: 5.0,   volBase: 2000,  volRange: 200000, geo: 'GB', intCurrency: false },
  de:        { label: '독일',           flag: '🇩🇪', group: '서유럽',   currency: '€',  cpcMin: 0.4,   cpcMax: 5.5,   volBase: 1000,  volRange: 80000,  geo: 'DE', intCurrency: false },
  fr:        { label: '프랑스',         flag: '🇫🇷', group: '서유럽',   currency: '€',  cpcMin: 0.3,   cpcMax: 4.5,   volBase: 800,   volRange: 60000,  geo: 'FR', intCurrency: false },
  it:        { label: '이탈리아',       flag: '🇮🇹', group: '서유럽',   currency: '€',  cpcMin: 0.2,   cpcMax: 3.5,   volBase: 600,   volRange: 50000,  geo: 'IT', intCurrency: false },
  es:        { label: '스페인',         flag: '🇪🇸', group: '서유럽',   currency: '€',  cpcMin: 0.2,   cpcMax: 3.5,   volBase: 600,   volRange: 50000,  geo: 'ES', intCurrency: false },
  'e-eu':    { label: '동유럽',         flag: '🌍',  group: '동유럽',   currency: '€',  cpcMin: 0.15,  cpcMax: 2.5,   volBase: 500,   volRange: 40000,  geo: 'PL', intCurrency: false },
  nl:        { label: '네덜란드',       flag: '🇳🇱', group: '동유럽',   currency: '€',  cpcMin: 0.3,   cpcMax: 3.5,   volBase: 300,   volRange: 20000,  geo: 'NL', intCurrency: false },
  se:        { label: '스웨덴',         flag: '🇸🇪', group: '동유럽',   currency: 'kr', cpcMin: 3,     cpcMax: 35,    volBase: 200,   volRange: 15000,  geo: 'SE', intCurrency: false },
  pl:        { label: '폴란드',         flag: '🇵🇱', group: '동유럽',   currency: 'zł', cpcMin: 1,     cpcMax: 12,    volBase: 300,   volRange: 18000,  geo: 'PL', intCurrency: false },
  'sea-all': { label: '동남아(All)',    flag: '🌏',  group: '동남아시아', currency: '$', cpcMin: 0.1,  cpcMax: 1.5,   volBase: 1000,  volRange: 80000,  geo: 'SG', intCurrency: false },
  id:        { label: '인도네시아',     flag: '🇮🇩', group: '동남아시아', currency: 'Rp', cpcMin: 800,  cpcMax: 12000, volBase: 1000,  volRange: 60000,  geo: 'ID', intCurrency: true  },
  vn:        { label: '베트남',         flag: '🇻🇳', group: '동남아시아', currency: '₫', cpcMin: 2000, cpcMax: 25000, volBase: 800,   volRange: 50000,  geo: 'VN', intCurrency: true  },
  th:        { label: '태국',           flag: '🇹🇭', group: '동남아시아', currency: '฿', cpcMin: 3,    cpcMax: 40,    volBase: 600,   volRange: 40000,  geo: 'TH', intCurrency: false },
  ph:        { label: '필리핀',         flag: '🇵🇭', group: '동남아시아', currency: '₱', cpcMin: 5,    cpcMax: 60,    volBase: 400,   volRange: 30000,  geo: 'PH', intCurrency: false },
};

const MARKET_GROUPS_ORDER = ['국내', '아메리카', '아시아태평양', '서유럽', '동유럽', '동남아시아'];

/* ── CPC 포맷터 ───────────────────────────────────────────────────────────── */
function formatCpc(val, cfg) {
  if (cfg.intCurrency) {
    return `${cfg.currency}${Math.round(val).toLocaleString()}`;
  }
  return `${cfg.currency}${val.toFixed(2)}`;
}
function calcCpc(hashKey, cfg, offset = 0) {
  const ratio = (hv(hashKey, 0, 100) + offset * 17) % 100 / 100;
  const val = cfg.cpcMin + ratio * (cfg.cpcMax - cfg.cpcMin);
  return formatCpc(val, cfg);
}

/* ── 검색량 포맷터 ──────────────────────────────────────────────────────────── */
function fmtVol(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 10000)   return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

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
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
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

/* ── 공통 테이블 셀 ────────────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function GoogleDashboard({ mappings, settings = {} }) {
  const unit = settings.unit || '일간';
  // 일간=3일, 주간=D-7일, 월간=D-31일 (모두 일별 데이터포인트)
  const numPoints = unit === '월간' ? 31 : unit === '주간' ? 7 : 3;

  /* ── 마켓 선택 상태 ─────────────────────────────────────────────────────── */
  const [selectedMarket, setSelectedMarket] = useState(
    () => localStorage.getItem('google_market') || 'domestic'
  );
  const handleMarketChange = (val) => {
    setSelectedMarket(val);
    localStorage.setItem('google_market', val);
  };

  const mCfg = GOOGLE_MARKET_CONFIG[selectedMarket] || GOOGLE_MARKET_CONFIG.domestic;
  const isGlobal = selectedMarket !== 'domestic';

  /* ── 브랜드/키워드 파싱 ─────────────────────────────────────────────────── */
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
  const rawKwTrend = useMemo(() => {
    if (allKeywords.length === 0) return [];
    return generateTrendData(allKeywords, numPoints, '일간');
  }, [allKeywords, numPoints]);

  const brandTrendData = useMemo(() => {
    if (brandGroups.length === 0 || rawKwTrend.length === 0)
      return generateTrendData(['검색어 없음'], numPoints, '일간');
    return rawKwTrend.map(d => {
      const row = { date: d.date };
      brandGroups.forEach(g => {
        row[g.name] = g.keywords.reduce((s, kw) => s + (d[kw] || 0), 0);
      });
      return row;
    });
  }, [brandGroups, rawKwTrend]);

  /* ── 2. 자사 사이트 검색 유입 쿼리 (Search Console) ──────────────────── */
  const gscQueries = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const kws = allKeywords.length > 0 ? allKeywords.slice(0, 8) : [brand, `${brand} 후기`, `${brand} 가격`];
    const seed = `${selectedMarket}|gsc`;
    return kws.map((kw, i) => {
      const imp  = hv(`${seed}-imp-${kw}`, mCfg.volBase / 5, mCfg.volRange / 4);
      const clk  = Math.round(imp * (hv(`${seed}-ctr-${kw}`, 3, 14) / 100));
      const ctr  = ((clk / imp) * 100).toFixed(1);
      const pos  = (hv(`${seed}-pos-${kw}`, 1, 15) + hv(`${seed}-pos2-${kw}`, 0, 9) / 10).toFixed(1);
      return { query: kw, impressions: imp, clicks: clk, ctr, position: pos };
    }).sort((a, b) => b.clicks - a.clicks);
  }, [allKeywords, brandGroups, selectedMarket, mCfg]);

  /* ── 3. 키워드 검색량/확장 키워드 (Google Ads KP) ────────────────────── */
  const kpKeywords = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const baseKws = allKeywords.slice(0, 6);
    const expanded = isGlobal
      ? [`${brand} buy`, `${brand} review`, `${brand} discount`, `${brand} best`, `${brand} price`, `${brand} online`]
      : [`${brand} 추천`, `${brand} 리뷰`, `${brand} 할인`, `${brand} 구매`, `${brand} 효과`, `${brand} 가격`];
    const seed = `${selectedMarket}|kp`;
    return [...baseKws, ...expanded].slice(0, 12).map((kw, i) => {
      const vol  = hv(`${seed}-vol-${kw}`, mCfg.volBase, mCfg.volRange);
      const comp = ['낮음', '보통', '높음'][hv(`${seed}-comp-${kw}`, 0, 3)];
      const minCpc = calcCpc(`${seed}-min-${kw}`, mCfg);
      const maxCpc = calcCpc(`${seed}-max-${kw}`, mCfg, 30);
      const trend  = hv(`${seed}-tr-${kw}`, 0, 3);
      return { keyword: kw, volume: vol, competition: comp, minCpc, maxCpc, trend };
    }).sort((a, b) => b.volume - a.volume);
  }, [allKeywords, brandGroups, selectedMarket, mCfg, isGlobal]);

  /* ── 4. 검색결과 상위 노출 현황 (SERP API) ───────────────────────────── */
  const serpData = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const kws = allKeywords.length > 0 ? allKeywords.slice(0, 8) : [`${brand}`, `${brand} 구매`];
    const TYPES = ['오가닉', '쇼핑광고', '이미지팩', '지식패널', 'People Also Ask'];
    const seed = `${selectedMarket}|serp`;
    return kws.map(kw => {
      const rank  = hv(`${seed}-rank-${kw}`, 1, 15);
      const type  = TYPES[hv(`${seed}-type-${kw}`, 0, TYPES.length)];
      const feat  = hv(`${seed}-feat-${kw}`, 0, 5) === 0;
      return { keyword: kw, rank, type, featuredSnippet: feat };
    }).sort((a, b) => a.rank - b.rank);
  }, [allKeywords, brandGroups, selectedMarket]);

  /* ── 5. 경쟁사 브랜드 관심도 비교 ────────────────────────────────────── */
  const competitorTrend = useMemo(() => {
    if (brandGroups.length === 0) return generateTrendData(['비교 대상 없음'], numPoints, '일간');
    return rawKwTrend.map(d => {
      const row = { date: d.date };
      brandGroups.forEach(g => { row[g.name] = g.keywords.reduce((s, kw) => s + (d[kw] || 0), 0); });
      return row;
    });
  }, [brandGroups, rawKwTrend]);

  /* ── 6. 캠페인 키워드 발굴 ───────────────────────────────────────────── */
  const campaignKeywords = useMemo(() => {
    const brand = brandGroups[0]?.name || '브랜드';
    const seed = `${selectedMarket}|cmp`;
    const TRENDICONS = ['↑', '→', '↓'];
    const pairs = isGlobal ? [
      [`${brand} official`,      '정확검색'],
      [`${brand} review`,        '구문검색'],
      [`${brand} discount code`, '광범위수정'],
      [`${brand} vs competitor`, '구문검색'],
      [`${brand} ingredients`,   '광범위수정'],
      [`buy ${brand} online`,    '정확검색'],
      [`${brand} sample`,        '구문검색'],
      [`${brand} how to use`,    '광범위수정'],
    ] : [
      [`${brand} 공식`,           '정확검색'],
      [`${brand} 후기`,           '구문검색'],
      [`${brand} 할인코드`,       '광범위수정'],
      [`${brand} vs 경쟁사`,     '구문검색'],
      [`${brand} 성분`,           '광범위수정'],
      [`${brand} 구매하기`,       '정확검색'],
      [`${brand} 샘플`,           '구문검색'],
      [`${brand} 사용법`,         '광범위수정'],
    ];
    return pairs.map(([keyword, type], i) => ({
      keyword, type,
      cpc:   calcCpc(`${seed}-${i}-${keyword}`, mCfg),
      trend: TRENDICONS[hv(`${seed}-trend-${i}`, 0, 3)],
    }));
  }, [brandGroups, selectedMarket, mCfg, isGlobal]);

  /* ── 헬퍼 ──────────────────────────────────────────────────────────────── */
  const rankColor = (r) => r <= 3 ? '#059669' : r <= 10 ? '#0369a1' : '#dc2626';
  const trendEl = (t) =>
    t === 0 ? <span style={{ color: '#059669' }}>▲</span>
    : t === 2 ? <span style={{ color: '#dc2626' }}>▼</span>
    : <span style={{ color: '#94a3b8' }}>—</span>;

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* ── 마켓 선택 필터 박스 ── */}
      <div style={{
        padding: '12px 18px', background: '#f8fafc', borderRadius: '10px',
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>분석 마켓</span>
        <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={selectedMarket}
            onChange={e => handleMarketChange(e.target.value)}
            style={{
              appearance: 'none', WebkitAppearance: 'none',
              padding: '8px 40px 8px 14px',
              border: `1.5px solid ${isGlobal ? '#1a73e8' : '#059669'}`,
              borderRadius: '10px',
              background: isGlobal ? '#eff6ff' : '#ecfdf5',
              color: isGlobal ? '#1a73e8' : '#059669',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              minWidth: '220px', outline: 'none',
            }}
          >
            {MARKET_GROUPS_ORDER.map(group => {
              const items = Object.entries(GOOGLE_MARKET_CONFIG).filter(([, v]) => v.group === group);
              return (
                <optgroup key={group} label={`── ${group} ──`}>
                  {items.map(([val, cfg]) => (
                    <option key={val} value={val}>
                      {cfg.flag} {cfg.group === '국내' ? '국내_대한민국' : `글로벌_${cfg.label}`}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.75rem', color: isGlobal ? '#1a73e8' : '#059669' }}>▾</span>
        </div>

        {/* 선택 마켓 정보 */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}>
            통화: <strong>{mCfg.currency}</strong>
          </span>
          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}>
            Google Trends Geo: <strong>{mCfg.geo}</strong>
          </span>
          <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}>
            검색량 기준: <strong>{fmtVol(mCfg.volBase)}~{fmtVol(mCfg.volBase + mCfg.volRange)}</strong>
          </span>
        </div>
      </div>

      {/* ── 1. 브랜드 검색 관심도 추이 ── */}
      <div className="trend-section">
        <SectionHeader
          title="브랜드 검색 관심도 추이"
          apiLabel="Google Trends API (pytrends)"
          apiColor="#1a73e8"
          desc={`최근 90일 브랜드별 Google 검색 관심도 지수 (0~100 정규화) · Geo: ${mCfg.geo}`}
        />
        <TrendChart
          data={brandTrendData}
          keywords={brandGroups.map(g => g.name)}
          title=""
          badgeClass={PLATFORMS.google?.badge}
          badgeText={`GOOGLE TRENDS · ${mCfg.flag} ${mCfg.label}`}
        />
      </div>

      {/* ── 2. 자사 사이트 검색 유입 쿼리 ── */}
      <div className="trend-section">
        <SectionHeader
          title="자사 사이트 검색 유입 쿼리"
          apiLabel="Google Search Console API"
          apiColor="#34a853"
          desc="Google 검색을 통해 자사 사이트로 유입된 쿼리별 노출·클릭·CTR·평균 순위"
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><TH>검색 쿼리</TH><TH right>노출수</TH><TH right>클릭수</TH><TH right>CTR</TH><TH right>평균 순위</TH></tr>
            </thead>
            <tbody>
              {gscQueries.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <TD bold>{row.query}</TD>
                  <TD right>{fmtVol(row.impressions)}</TD>
                  <TD right bold color="#0369a1">{fmtVol(row.clicks)}</TD>
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
          desc={`Google Ads Keyword Planner 기반 월간 검색량, 경쟁도, 예상 CPC (${mCfg.currency} · ${mCfg.label})`}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><TH>키워드</TH><TH right>월간 검색량</TH><TH>경쟁도</TH><TH right>최소 CPC</TH><TH right>최대 CPC</TH><TH>트렌드</TH></tr>
            </thead>
            <tbody>
              {kpKeywords.map((row, i) => {
                const cc = row.competition === '높음' ? '#dc2626' : row.competition === '보통' ? '#d97706' : '#059669';
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <TD bold>{row.keyword}</TD>
                    <TD right bold color="#0369a1">{fmtVol(row.volume)}</TD>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: `${cc}15`, color: cc, border: `1px solid ${cc}30` }}>
                        {row.competition}
                      </span>
                    </td>
                    <TD right>{row.minCpc}</TD>
                    <TD right>{row.maxCpc}</TD>
                    <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '1rem' }}>
                      {trendEl(row.trend)}
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
          desc={`주요 브랜드 키워드의 Google ${mCfg.label} 검색결과 순위 및 결과 유형`}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><TH>키워드</TH><TH right>현재 순위</TH><TH>결과 유형</TH><TH>Featured Snippet</TH></tr>
            </thead>
            <tbody>
              {serpData.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                  <TD bold>{row.keyword}</TD>
                  <td style={{ padding: '8px 14px', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: rankColor(row.rank) }}>{row.rank}위</span>
                  </td>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#0369a1', border: '1px solid #bae6fd' }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', fontSize: '0.82rem' }}>
                    {row.featuredSnippet ? <span style={{ color: '#059669', fontWeight: 700 }}>✓ 획득</span> : <span style={{ color: '#94a3b8' }}>—</span>}
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
          desc={`등록된 브랜드 간 Google ${mCfg.label} 검색 관심도 비교 추이 (90일)`}
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
            badgeText={`GOOGLE TRENDS COMPARE · ${mCfg.flag} ${mCfg.label}`}
          />
        )}
      </div>

      {/* ── 6. 캠페인 키워드 발굴 ── */}
      <div className="trend-section">
        <SectionHeader
          title="캠페인 키워드 발굴"
          apiLabel="Google Ads API + Trends"
          apiColor="#ff6d00"
          desc={`${mCfg.label} 광고 캠페인용 추천 키워드 — 검색 의도별 분류 및 예상 CPC (${mCfg.currency})`}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {campaignKeywords.map((item, i) => (
            <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{item.keyword}</span>
                <span style={{ fontSize: '1rem' }}>{item.trend}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                  {item.type}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', marginLeft: 'auto' }}>
                  CPC {item.cpc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
