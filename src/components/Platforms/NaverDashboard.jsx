import { useMemo, useState, useEffect, useCallback } from 'react';
import { PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';

/* ── 유틸 함수 ─────────────────────────────────────────────────────────────── */
function isKorean(str) { return /[가-힣]/.test(str); }

// Naver 검색광고 API는 월간값 반환 → 단위에 맞게 환산
function scaleKeywordData(data, unit) {
  if (!data || !data.length) return data;
  const factor = unit === '일간' ? 1 / 30 : unit === '주간' ? 7 / 30 : 1;
  if (factor === 1) return data;
  return data.map(row => ({
    ...row,
    pc_qc:    Math.max(0, Math.round(row.pc_qc    * factor)),
    mo_qc:    Math.max(0, Math.round(row.mo_qc    * factor)),
    total_qc: Math.max(0, Math.round(row.total_qc * factor)),
  }));
}

// DataLab 날짜 → x축 레이블
function formatDateLabel(dateStr, xAxisMode) {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const d = new Date(dateStr + 'T00:00:00');
  if (xAxisMode === 'week')  return `${d.getMonth() + 1}/${d.getDate()}주`;
  if (xAxisMode === 'month') return `${d.getFullYear()}.${d.getMonth() + 1}`;
  return dateStr; // 'date' → YYYY-MM-DD 그대로
}

// DataLab API 응답 → 차트 [{date, brandName: ratio, ...}]
// limit: 마지막 N개 데이터포인트만 취함 (일간/주간 슬라이싱용)
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

// 검색광고 API 응답 → 테이블 배열
function transformKeywordResponse(keywordList) {
  if (!Array.isArray(keywordList)) return [];
  return keywordList.map(item => {
    const pc  = Number(item.monthlyPcQcCnt)     || 0;
    const mo  = Number(item.monthlyMobileQcCnt) || 0;
    const prev = Number(item.monthlyAvePcQcCnt) || pc;
    const trendPct = prev > 0 ? Math.round(((pc - prev) / prev) * 100) : 0;
    return {
      keyword: item.relKeyword,
      pc_qc: pc, mo_qc: mo, total_qc: pc + mo,
      competition: item.compIdx || '-',
      trend: trendPct,
    };
  });
}

/* ── UI 서브 컴포넌트 ───────────────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════════════════ */
export default function NaverDashboard({ mappings, settings = {} }) {
  const unit = settings.unit || '일간';

  // dateRange를 원시값으로 추출 → 객체 참조 비교 문제 방지
  const drStart = settings.dateRange?.start || '';
  const drEnd   = settings.dateRange?.end   || '';

  /* ── 단위별 DataLab API 파라미터 ──────────────────────────────────────── */
  // fetchDays: 실제로 요청할 기간 (DataLab 최신 1-2일 지연 고려해 여유 있게)
  // displayLimit: 차트에 표시할 데이터 포인트 수 (null = 전체)
  const { fetchDays, displayLimit, naverTimeUnit, xAxisMode, periodLabel } = useMemo(() => {
    if (unit === '지정' && drStart && drEnd) {
      const span = Math.ceil((new Date(drEnd) - new Date(drStart)) / 86400000);
      if (span >= 365) return { fetchDays: span, displayLimit: null, naverTimeUnit: 'month', xAxisMode: 'month', periodLabel: `${drStart} ~ ${drEnd} (월간 집계)` };
      if (span >= 90)  return { fetchDays: span, displayLimit: null, naverTimeUnit: 'week',  xAxisMode: 'week',  periodLabel: `${drStart} ~ ${drEnd} (주간 집계)` };
      return                  { fetchDays: Math.max(span, 14), displayLimit: null, naverTimeUnit: 'date',  xAxisMode: 'date',  periodLabel: `${drStart} ~ ${drEnd}` };
    }
    // 일간/주간: DataLab 데이터 지연(~2일) 고려해 최소 14일 요청, 마지막 N포인트만 표시
    if (unit === '월간') return { fetchDays: 45, displayLimit: null, naverTimeUnit: 'week', xAxisMode: 'week', periodLabel: '최근 30일 (주간 집계)' };
    if (unit === '주간') return { fetchDays: 14, displayLimit: 7,    naverTimeUnit: 'date', xAxisMode: 'date', periodLabel: '최근 7일 (일 기준)' };
    return                     { fetchDays: 14, displayLimit: 4,    naverTimeUnit: 'date', xAxisMode: 'date', periodLabel: '최근 3일 (일 기준)' };
  }, [unit, drStart, drEnd]);

  /* ── 브랜드/키워드 파싱 + 한국어 필터 ─────────────────────────────────── */
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
  // trend: 'idle'|'loading'|'real'|'empty'|'unavailable'|'nodata'
  // keyword: 'idle'|'loading'|'real'|'unavailable'|'no_server'
  const [realTrendData,   setRealTrendData]   = useState(null);
  const [realKeywordData, setRealKeywordData] = useState(null);
  const [trendSource,     setTrendSource]     = useState('idle');
  const [keywordSource,   setKeywordSource]   = useState('idle');
  const [trendRetry,      setTrendRetry]      = useState(0);
  const [kwRetry,         setKwRetry]         = useState(0);

  /* ── 공통 fetch 헬퍼: HTTP 에러/JSON 파싱 실패 모두 안전하게 처리 ────── */
  const safeFetch = useCallback(async (url, options) => {
    const r = await fetch(url, options);
    if (r.ok) return r.json();
    // 에러 응답 — JSON이 아닐 수도 있음(Vercel HTML 오류 페이지 등)
    let msg = `HTTP ${r.status}`;
    try { const b = await r.json(); msg = b.error || msg; } catch {}
    // eslint-disable-next-line no-throw-literal
    throw { status: r.status, msg };
  }, []);

  /* ── DataLab 트렌드 API ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (brandGroups.length === 0) { setTrendSource('nodata'); return; }
    setTrendSource('loading');

    const endDate   = unit === '지정' && drEnd   ? new Date(drEnd)   : new Date();
    const startDate = unit === '지정' && drStart ? new Date(drStart) : (() => {
      const d = new Date(endDate);
      d.setDate(d.getDate() - fetchDays);
      return d;
    })();
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
        const transformed = transformDatalabResponse(data.results, xAxisMode, displayLimit);
        if (transformed.length === 0) {
          setTrendSource('empty');
        } else {
          setRealTrendData(transformed);
          setTrendSource('real');
        }
      })
      .catch(err => {
        // err.status 있음 → HTTP 에러(API 키 미설정, 서버 오류 등)
        // err.status 없음 → 네트워크 연결 자체 실패
        if (err?.status) setTrendSource('unavailable');
        else setTrendSource('no_server');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandGroups, unit, fetchDays, naverTimeUnit, xAxisMode, drStart, drEnd, trendRetry, safeFetch]);

  /* ── 검색광고 키워드 검색량 API ─────────────────────────────────────────── */
  useEffect(() => {
    if (koreanKeywords.length === 0) { setKeywordSource('unavailable'); return; }
    setKeywordSource('loading');

    const kwParam = koreanKeywords.slice(0, 20).join(',');
    safeFetch(`/api/naver-keywords?keywords=${encodeURIComponent(kwParam)}`)
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
        if (err?.status) setKeywordSource('unavailable');
        else setKeywordSource('no_server');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [koreanKeywords, kwRetry, safeFetch]);

  /* ── 최종 데이터 ──────────────────────────────────────────────────────── */
  const chartData  = trendSource   === 'real' ? realTrendData  : null;
  const tableData  = keywordSource === 'real' ? scaleKeywordData(realKeywordData, unit) : null;
  const chartKeywords = brandGroups.map(g => g.name);
  const tableUnitLabel = unit === '일간' ? '당일' : unit === '주간' ? 'D-7 누적' : 'D-30 누적';

  const handleTrendRetry   = useCallback(() => setTrendRetry(n => n + 1),  []);
  const handleKwRetry      = useCallback(() => setKwRetry(n => n + 1),     []);

  const SERVER_GUIDE = 'API 서버가 실행 중인지 확인하세요.\n터미널에서: node server/index.js';

  /* ── 렌더 ──────────────────────────────────────────────────────────────── */
  return (
    <div className="fade-in">

      {/* ── 트렌드 차트 ── */}
      {trendSource === 'real' && chartData && chartData.length > 0 ? (
        <TrendChart
          data={chartData}
          keywords={chartKeywords}
          title="브랜드별 통합 쿼리 트렌드 (브랜드+제품+확장 키워드 합산)"
          badgeClass={PLATFORMS.naver.badge}
          badgeText="POWERED BY NAVER DATALAB"
          period={periodLabel}
          tableData={tableData}
        />
      ) : (
        <div className="trend-section fade-in">
          <div className="trend-header">
            <span className="trend-title">브랜드별 통합 쿼리 트렌드 (브랜드+제품+확장 키워드 합산)</span>
            <span className="trend-unit">(단위: 상대 검색 지수)</span>
            <SourceBadge source={trendSource} />
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
              <StatusCard
                icon="📉" title="해당 기간의 검색 데이터가 부족합니다"
                desc={`선택한 단위(${unit}) 기준 기간에 데이터가 없습니다.\n기준기간을 늘리거나 검색량이 있는 키워드를 확인해보세요.`}
                onRetry={handleTrendRetry}
              />
            )}
            {trendSource === 'unavailable' && (
              <StatusCard
                icon="🔑" title="네이버 DataLab API 키 설정이 필요합니다"
                desc={`.env 파일에 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET을 설정하세요.`}
              />
            )}
            {trendSource === 'no_server' && (
              <StatusCard icon="🔌" title="API 서버에 연결할 수 없습니다" desc={SERVER_GUIDE} onRetry={handleTrendRetry} />
            )}
          </div>
        </div>
      )}

      {/* ── 키워드 검색량 테이블 ── */}
      <div className="trend-section mt-4">
        <div className="trend-header">
          <span className="trend-title">
            상세 키워드별 검색량 ({tableUnitLabel} 기준)
          </span>
          <SourceBadge source={keywordSource} />
        </div>

        {keywordSource === 'loading' && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            검색량 데이터 불러오는 중…
          </div>
        )}
        {keywordSource === 'unavailable' && (
          <div style={{ marginTop: '12px' }}>
            <StatusCard
              icon="🔑" title="네이버 검색광고 API 키 설정이 필요합니다"
              desc={`.env 파일에 NAVER_AD_API_KEY / NAVER_AD_SECRET_KEY / NAVER_AD_CUSTOMER_ID를 설정하세요.`}
            />
          </div>
        )}
        {keywordSource === 'no_server' && (
          <div style={{ marginTop: '12px' }}>
            <StatusCard icon="🔌" title="API 서버에 연결할 수 없습니다" desc={SERVER_GUIDE} onRetry={handleKwRetry} />
          </div>
        )}

        {tableData && tableData.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>키워드</th>
                  <th>PC 검색량</th>
                  <th>모바일 검색량</th>
                  <th>총 검색량</th>
                  <th>경쟁도</th>
                  <th>전월 대비 추이</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{row.keyword}</td>
                    <td>{row.pc_qc.toLocaleString()}</td>
                    <td>{row.mo_qc.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{row.total_qc.toLocaleString()}</td>
                    <td>
                      <span className="hashtag-chip" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                        {row.competition}
                      </span>
                    </td>
                    <td className={Number(row.trend) > 0 ? 'trend-up' : 'trend-down'}>
                      {Number(row.trend) > 0 ? '▲' : '▼'} {Math.abs(row.trend)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
