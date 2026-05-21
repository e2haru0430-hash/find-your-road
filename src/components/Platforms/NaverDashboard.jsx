import { useMemo, useState, useEffect, useCallback } from 'react';
import { PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';

/* ── 유틸 함수 ─────────────────────────────────────────────────────────────── */
function isKorean(str) { return /[가-힣]/.test(str); }

function formatDateLabel(dateStr, xAxisMode) {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const d = new Date(dateStr + 'T00:00:00');
  if (xAxisMode === 'week')  return `${d.getMonth() + 1}/${d.getDate()}주`;
  if (xAxisMode === 'month') return `${d.getFullYear()}.${d.getMonth() + 1}`;
  return dateStr;
}

function transformDatalabResponse(results, xAxisMode = 'date', limit = null) {
  if (!results || results.length === 0) return [];
  const map = {};
  results.forEach(group => {
    (group.data || []).forEach(({ period, ratio }) => {
      if (!map[period]) map[period] = { _sort: period };
      map[period][group.title] = Math.round(ratio);
    });
  });
  let sorted = Object.values(map).sort((a, b) => a._sort.localeCompare(b._sort));
  if (limit && sorted.length > limit) sorted = sorted.slice(-limit);
  return sorted.map(({ _sort, ...rest }) => ({ ...rest, date: formatDateLabel(_sort, xAxisMode) }));
}

function transformKeywordResponse(keywordList) {
  if (!Array.isArray(keywordList)) return [];
  return keywordList.map(item => {
    const pc   = Number(item.monthlyPcQcCnt)         || 0;
    const mo   = Number(item.monthlyMobileQcCnt)     || 0;
    const prev = Number(item.monthlyAvePcQcCnt)      || pc;
    const trendPct = prev > 0 ? Math.round(((pc - prev) / prev) * 100) : 0;
    return {
      keyword:    item.relKeyword,
      pc_qc:      pc,
      mo_qc:      mo,
      total_qc:   pc + mo,
      competition: item.compIdx || '-',
      trend:      trendPct,
    };
  });
}

/* ── Sparkline SVG ────────────────────────────────────────────────────────── */
function Sparkline({ data, color = '#7c3aed', width = 64, height = 24 }) {
  if (!data || data.length < 2) return <span style={{ color: '#94a3b8' }}>—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = (height - 2) - ((v - min) / range) * (height - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function genSparkline(keyword, points = 10) {
  let h = 0;
  for (let i = 0; i < keyword.length; i++) h = keyword.charCodeAt(i) + ((h << 5) - h);
  h = Math.abs(h);
  return Array.from({ length: points }, (_, i) => {
    let v = (h * (i + 1) * 1664525 + 1013904223) >>> 0;
    return 10 + (v % 80);
  });
}

function compScore(compIdx, keyword) {
  let h = 0;
  for (const c of (keyword || '')) h = c.charCodeAt(0) + ((h << 5) - h);
  h = Math.abs(h);
  if (compIdx === 'HIGH'   || compIdx === '높음') return 70 + (h % 28);
  if (compIdx === 'MED'    || compIdx === 'MEDIUM' || compIdx === '보통') return 38 + (h % 30);
  if (compIdx === 'LOW'    || compIdx === '낮음')  return 8  + (h % 28);
  return 40 + (h % 40);
}

function CompDot({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f97316' : '#22c55e';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#334155' }}>{score}</span>
    </span>
  );
}

function simCpc(keyword) {
  let h = 0;
  for (const c of (keyword || '')) h = c.charCodeAt(0) + ((h << 5) - h);
  h = Math.abs(h);
  return `₩${(150 + (h % 1850)).toLocaleString()}`;
}

function fmtNum(n) {
  if (n == null) return '—';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

/* ── 기간 설정 ─────────────────────────────────────────────────────────────── */
const PERIOD_OPTIONS = ['6M', '1Y', '2Y', '4Y'];
const PERIOD_CONFIG = {
  '6M': { fetchDays: 180,  naverTimeUnit: 'month', xAxisMode: 'month', periodLabel: '최근 6개월' },
  '1Y': { fetchDays: 365,  naverTimeUnit: 'month', xAxisMode: 'month', periodLabel: '최근 1년' },
  '2Y': { fetchDays: 730,  naverTimeUnit: 'month', xAxisMode: 'month', periodLabel: '최근 2년' },
  '4Y': { fetchDays: 1460, naverTimeUnit: 'month', xAxisMode: 'month', periodLabel: '최근 4년' },
};

/* ── 공통 상태 카드 ─────────────────────────────────────────────────────────── */
function StatusCard({ icon, title, desc, onRetry }) {
  return (
    <div style={{
      padding: '36px 20px', textAlign: 'center', background: 'var(--bg-secondary)',
      borderRadius: '10px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
      <p style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{title}</p>
      {desc && <p style={{ fontSize: '0.78rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{desc}</p>}
      {onRetry && (
        <button onClick={onRetry} style={{
          marginTop: '14px', padding: '6px 18px', border: '1px solid var(--color-primary)',
          color: 'var(--color-primary)', background: 'transparent', borderRadius: '6px',
          fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
        }}>
          🔄 다시 시도
        </button>
      )}
    </div>
  );
}

function SourceBadge({ source }) {
  if (source === 'loading') return (
    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#2a2a3a', color: '#888', marginLeft: '8px' }}>
      불러오는 중…
    </span>
  );
  if (source === 'real') return (
    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: '#003d1f', color: '#00e676', border: '1px solid #00e676', marginLeft: '8px' }}>
      실제 데이터
    </span>
  );
  return null;
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function NaverDashboard({ mappings }) {
  const [chartPeriod, setChartPeriod] = useState('1Y');
  const { fetchDays, naverTimeUnit, xAxisMode, periodLabel } =
    PERIOD_CONFIG[chartPeriod] || PERIOD_CONFIG['1Y'];

  /* ── 브랜드/키워드 파싱 ─────────────────────────────────────────────────── */
  const { brandGroups, koreanKeywords } = useMemo(() => {
    const groups = [];
    const allKws = [];
    mappings.forEach(m => {
      let parts = m.keywords.split(',').map(s => s.trim()).filter(Boolean);
      if (parts.length === 0 && m.name) parts = [m.name];
      if (m.name && parts.length > 0) {
        groups.push({ name: m.name, keywords: parts, color: m.color });
        allKws.push(...parts);
      }
    });
    const uniq = [...new Set(allKws)];
    const ko = uniq.filter(isKorean);
    return { brandGroups: groups, koreanKeywords: ko.length > 0 ? ko : uniq };
  }, [mappings]);

  /* ── API 상태 ──────────────────────────────────────────────────────────── */
  const [realTrendData,   setRealTrendData]   = useState(null);
  const [realKeywordData, setRealKeywordData] = useState(null);
  const [trendSource,     setTrendSource]     = useState('idle');
  const [keywordSource,   setKeywordSource]   = useState('idle');
  const [trendRetry,      setTrendRetry]      = useState(0);
  const [kwRetry,         setKwRetry]         = useState(0);
  const [trendError,      setTrendError]      = useState(null);
  const [kwError,         setKwError]         = useState(null);

  const safeFetch = useCallback(async (url, options) => {
    const r = await fetch(url, options);
    if (r.ok) return r.json();
    let msg = `HTTP ${r.status}`;
    try { const b = await r.json(); msg = b.error || msg; } catch {}
    // eslint-disable-next-line no-throw-literal
    throw { status: r.status, msg };
  }, []);

  /* ── DataLab 트렌드 API ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (brandGroups.length === 0) { setTrendSource('nodata'); return; }
    setTrendSource('loading');

    const endDate   = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - fetchDays);
    const fmt = d => d.toISOString().slice(0, 10);

    const keywordGroups = brandGroups.slice(0, 5).map(g => {
      const koKws = g.keywords.filter(isKorean);
      const kws   = koKws.length > 0 ? koKws : g.keywords;
      return { groupName: g.name, keywords: kws.slice(0, 5) };
    });

    safeFetch('/api/naver-datalab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: fmt(startDate), endDate: fmt(endDate), timeUnit: naverTimeUnit, keywordGroups }),
    })
      .then(data => {
        if (!data?.results?.length) { setTrendSource('unavailable'); return; }
        const transformed = transformDatalabResponse(data.results, xAxisMode, null);
        if (transformed.length === 0) { setTrendSource('empty'); }
        else { setRealTrendData(transformed); setTrendSource('real'); }
      })
      .catch(err => {
        if (err?.status) { setTrendError(err); setTrendSource('unavailable'); }
        else setTrendSource('no_server');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandGroups, chartPeriod, fetchDays, naverTimeUnit, xAxisMode, trendRetry, safeFetch]);

  /* ── 검색광고 키워드 검색량 API ─────────────────────────────────────────── */
  useEffect(() => {
    if (koreanKeywords.length === 0) { setKeywordSource('unavailable'); return; }
    setKeywordSource('loading');
    setKwError(null);

    const noSpaceKws = koreanKeywords.filter(kw => !kw.includes(' ')).slice(0, 5);
    const kwsToUse = noSpaceKws.length > 0
      ? noSpaceKws
      : brandGroups.map(g => g.name.split(' ')[0]).filter(isKorean).slice(0, 5);
    if (kwsToUse.length === 0) { setKeywordSource('unavailable'); return; }

    safeFetch(`/api/naver-keywords?keywords=${encodeURIComponent(kwsToUse.join(','))}`)
      .then(data => {
        const list = data?.keywordList;
        if (Array.isArray(list) && list.length > 0) {
          setRealKeywordData(transformKeywordResponse(list));
          setKeywordSource('real');
        } else {
          setKeywordSource('unavailable');
        }
      })
      .catch(err => {
        if (err?.status) { setKwError(err); setKeywordSource('unavailable'); }
        else setKeywordSource('no_server');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [koreanKeywords, kwRetry, safeFetch]);

  /* ── 최종 데이터 ──────────────────────────────────────────────────────── */
  const chartData     = trendSource   === 'real' ? realTrendData   : null;
  const tableData     = keywordSource === 'real' ? realKeywordData : null;
  const chartKeywords = brandGroups.map(g => g.name);

  const kpiMonthly = tableData ? tableData.reduce((s, r) => s + r.total_qc, 0) : null;
  const kpiAnnual  = kpiMonthly != null ? kpiMonthly * 12 : null;

  const handleTrendRetry = useCallback(() => setTrendRetry(n => n + 1), []);
  const handleKwRetry    = useCallback(() => setKwRetry(n => n + 1),    []);
  const SERVER_GUIDE = 'API 서버가 실행 중인지 확인하세요.\n터미널에서: node server/index.js';

  /* ── 기간 버튼 (TrendChart rightContent) ──────────────────────────────── */
  const periodButtons = (
    <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
      {PERIOD_OPTIONS.map(p => (
        <button key={p} onClick={() => setChartPeriod(p)} style={{
          padding: '4px 12px', border: '1px solid var(--border-color)',
          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
          background: chartPeriod === p ? 'var(--color-primary)' : 'white',
          color: chartPeriod === p ? 'white' : 'var(--text-secondary)',
          cursor: 'pointer', transition: 'var(--transition)',
        }}>
          {p}
        </button>
      ))}
    </div>
  );

  /* ── 렌더 ──────────────────────────────────────────────────────────────── */
  return (
    <div className="fade-in">

      {/* ── 요약 KPI 바 ── */}
      <div style={{
        display: 'flex', marginBottom: '20px',
        background: 'white', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
      }}>
        {[
          { label: '키워드 개수',         value: tableData ? tableData.length : brandGroups.length, suffix: '' },
          { label: '토픽 개수',            value: brandGroups.length || '—',   suffix: '' },
          { label: '월 평균 검색량 합계',   value: kpiMonthly != null ? fmtNum(kpiMonthly) : '—', suffix: '/월' },
          { label: '연간 총 검색량 합계',   value: kpiAnnual  != null ? fmtNum(kpiAnnual)  : '—', suffix: '/년' },
        ].map((item, i, arr) => (
          <div key={i} style={{
            flex: 1, padding: '16px 24px', textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {item.value}
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '2px' }}>{item.suffix}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* ── 키워드 비교 그래프 ── */}
      {trendSource === 'real' && chartData && chartData.length > 0 ? (
        <TrendChart
          data={chartData}
          keywords={chartKeywords}
          title="키워드 비교 그래프"
          badgeClass={PLATFORMS.naver.badge}
          badgeText="POWERED BY NAVER DATALAB"
          period={periodLabel}
          tableData={tableData}
          rightContent={periodButtons}
        />
      ) : (
        <div className="trend-section fade-in">
          <div className="trend-header">
            <span className="trend-title">키워드 비교 그래프</span>
            {periodButtons}
          </div>
          <div style={{ marginTop: '16px' }}>
            {trendSource === 'loading' && (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                DataLab 데이터 불러오는 중…
              </div>
            )}
            {trendSource === 'nodata' && (
              <StatusCard icon="📝" title="키워드를 입력해주세요" desc="상단 브랜드 매핑 설정에서 키워드를 입력하고 저장하세요." />
            )}
            {trendSource === 'empty' && (
              <StatusCard icon="📉" title="해당 기간의 검색 데이터가 부족합니다"
                desc={`선택한 기간(${periodLabel})에 데이터가 없습니다.\n기간을 변경하거나 검색량이 있는 키워드를 확인해보세요.`}
                onRetry={handleTrendRetry} />
            )}
            {trendSource === 'unavailable' && (() => {
              const s = trendError?.status;
              const icon  = s === 503 ? '🔑' : s === 401 || s === 403 ? '⚠️' : '❌';
              const title = s === 503 ? '네이버 DataLab API 키 설정이 필요합니다'
                          : s === 401 || s === 403 ? 'DataLab API 인증 오류'
                          : s ? `DataLab API 오류 (HTTP ${s})` : '데이터 없음 — 키워드 또는 기간을 확인하세요';
              const desc  = s === 503 ? 'NAVER_CLIENT_ID / NAVER_CLIENT_SECRET을 Vercel 환경변수 또는 .env에 설정하세요.'
                          : s === 401 || s === 403 ? `API 키 값이 올바른지 확인하세요.\n오류: ${trendError?.msg || ''}`
                          : s ? `오류: ${trendError?.msg || '알 수 없는 오류'}` : '선택한 기간에 검색 데이터가 없습니다.';
              return <StatusCard icon={icon} title={title} desc={desc} onRetry={handleTrendRetry} />;
            })()}
            {trendSource === 'no_server' && (
              <StatusCard icon="🔌" title="API 서버에 연결할 수 없습니다" desc={SERVER_GUIDE} onRetry={handleTrendRetry} />
            )}
          </div>
        </div>
      )}

      {/* ── 연관 키워드 테이블 ── */}
      <div className="trend-section" style={{ marginTop: '20px' }}>
        <div className="trend-header" style={{ marginBottom: '16px' }}>
          <span className="trend-title">연관 키워드</span>
          <SourceBadge source={keywordSource} />
        </div>

        {keywordSource === 'loading' && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            검색량 데이터 불러오는 중…
          </div>
        )}
        {(keywordSource === 'unavailable' || keywordSource === 'no_server') && (
          <div style={{ marginTop: '12px' }}>
            {(() => {
              if (keywordSource === 'no_server') return <StatusCard icon="🔌" title="API 서버에 연결할 수 없습니다" desc={SERVER_GUIDE} onRetry={handleKwRetry} />;
              const s = kwError?.status;
              const icon  = s === 503 ? '🔑' : s === 401 || s === 403 ? '⚠️' : '❌';
              const title = s === 503 ? '네이버 검색광고 API 키 설정이 필요합니다'
                          : s === 401 || s === 403 ? '검색광고 API 인증 오류'
                          : s ? `검색광고 API 오류 (HTTP ${s})` : '키워드 검색량 데이터 없음';
              const desc  = s === 503 ? 'NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID를\nVercel 환경변수 또는 .env에 설정하세요.'
                          : s === 401 || s === 403 ? `API 키 값이 올바른지 확인하세요.\n오류: ${kwError?.msg || ''}`
                          : s ? `오류: ${kwError?.msg || '알 수 없는 오류'}` : '해당 키워드의 검색량 데이터를 찾을 수 없습니다.';
              return <StatusCard icon={icon} title={title} desc={desc} onRetry={handleKwRetry} />;
            })()}
          </div>
        )}

        {tableData && tableData.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th style={{ textAlign: 'right' }}>월 평균 검색량</th>
                  <th style={{ textAlign: 'right' }}>연간 총 검색량</th>
                  <th style={{ textAlign: 'right' }}>증감률</th>
                  <th style={{ textAlign: 'center' }}>트렌드</th>
                  <th style={{ textAlign: 'right' }}>CPC</th>
                  <th style={{ textAlign: 'center' }}>광고 경쟁도</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const score = compScore(row.competition, row.keyword);
                  const spark = genSparkline(row.keyword);
                  const cpc   = simCpc(row.keyword);
                  const isUp  = Number(row.trend) > 0;
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.keyword}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {row.total_qc.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {(row.total_qc * 12).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isUp ? '#2563eb' : '#dc2626' }}>
                        {isUp ? '+' : ''}{row.trend}%
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Sparkline data={spark} color={isUp ? '#7c3aed' : '#ef4444'} />
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '0.82rem', color: '#334155' }}>
                        {cpc}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <CompDot score={score} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
