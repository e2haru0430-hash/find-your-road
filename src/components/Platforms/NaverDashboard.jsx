import { useMemo, useState, useEffect } from 'react';
import { PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData, generateNaverData } from '../../utils/demoData';

// DataLab API 응답 → 차트용 [{date, brandName: ratio, ...}] 변환
function transformDatalabResponse(results) {
  if (!results || results.length === 0) return [];
  // 날짜 기준 맵 생성
  const dateMap = {};
  results.forEach(group => {
    group.data.forEach(({ period, ratio }) => {
      if (!dateMap[period]) dateMap[period] = { date: period };
      dateMap[period][group.title] = Math.round(ratio);
    });
  });
  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

// 검색광고 API 응답 → 테이블용 배열 변환
function transformKeywordResponse(keywordList) {
  if (!Array.isArray(keywordList)) return [];
  return keywordList.map(item => {
    const pc  = typeof item.monthlyPcQcCnt     === 'number' ? item.monthlyPcQcCnt     : parseInt(item.monthlyPcQcCnt, 10)     || 0;
    const mo  = typeof item.monthlyMobileQcCnt === 'number' ? item.monthlyMobileQcCnt : parseInt(item.monthlyMobileQcCnt, 10) || 0;
    const prev = typeof item.monthlyAvePcQcCnt === 'number' ? item.monthlyAvePcQcCnt  : pc; // 전월 비교용
    const total = pc + mo;
    const trendPct = prev > 0 ? Math.round(((pc - prev) / prev) * 100) : 0;
    return {
      keyword:    item.relKeyword,
      pc_qc:      pc,
      mo_qc:      mo,
      total_qc:   total,
      competition: item.compIdx || '-',
      trend:      trendPct,
    };
  });
}

export default function NaverDashboard({ mappings }) {
  // 브랜드별 키워드 그룹화 및 전체 키워드 리스트 추출
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

  // ── 실제 API 상태 ────────────────────────────────────────────────────────────
  const [realTrendData,    setRealTrendData]    = useState(null);
  const [realKeywordData,  setRealKeywordData]  = useState(null);
  const [trendSource,      setTrendSource]      = useState('loading');   // 'real' | 'demo' | 'loading'
  const [keywordSource,    setKeywordSource]    = useState('loading');

  // ── Naver DataLab 트렌드 API 호출 ────────────────────────────────────────────
  useEffect(() => {
    if (brandGroups.length === 0) {
      setTrendSource('demo');
      return;
    }
    setTrendSource('loading');

    const endDate   = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 13);
    const fmt = d => d.toISOString().slice(0, 10);

    const keywordGroups = brandGroups.slice(0, 5).map(g => ({
      groupName: g.name,
      keywords:  g.keywords.slice(0, 5),
    }));

    fetch('/api/naver-datalab', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate:     fmt(startDate),
        endDate:       fmt(endDate),
        timeUnit:      'date',
        keywordGroups,
      }),
    })
      .then(r => {
        if (r.status === 503) return null; // API 키 미설정 → demo 사용
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => {
        if (data?.results && data.results.length > 0) {
          setRealTrendData(transformDatalabResponse(data.results));
          setTrendSource('real');
        } else {
          setTrendSource('demo');
        }
      })
      .catch(() => setTrendSource('demo'));
  }, [brandGroups]);

  // ── Naver 검색광고 키워드 검색량 API 호출 ────────────────────────────────────
  useEffect(() => {
    if (allKeywords.length === 0) {
      setKeywordSource('demo');
      return;
    }
    setKeywordSource('loading');

    const kwParam = allKeywords.slice(0, 20).join(',');
    fetch(`/api/naver-keywords?keywords=${encodeURIComponent(kwParam)}`)
      .then(r => {
        if (r.status === 503) return null;
        if (!r.ok) return null;
        return r.json();
      })
      .then(data => {
        const list = data?.keywordList;
        if (Array.isArray(list) && list.length > 0) {
          setRealKeywordData(transformKeywordResponse(list));
          setKeywordSource('real');
        } else {
          setKeywordSource('demo');
        }
      })
      .catch(() => setKeywordSource('demo'));
  }, [allKeywords]);

  // ── 데모 데이터 (fallback) ────────────────────────────────────────────────────
  const rawKeywordTrendData = useMemo(() => {
    if (allKeywords.length === 0) return [];
    return generateTrendData(allKeywords, 14);
  }, [allKeywords]);

  const demoTrendData = useMemo(() => {
    if (brandGroups.length === 0 || rawKeywordTrendData.length === 0) {
      return generateTrendData(['검색어 없음'], 14);
    }
    return rawKeywordTrendData.map(dayData => {
      const row = { date: dayData.date };
      brandGroups.forEach(group => {
        row[group.name] = group.keywords.reduce((sum, kw) => sum + (dayData[kw] || 0), 0);
      });
      return row;
    });
  }, [brandGroups, rawKeywordTrendData]);

  const demoTableData = useMemo(() => generateNaverData(allKeywords.slice(0, 20)), [allKeywords]);

  // ── 최종 렌더 데이터 결정 ─────────────────────────────────────────────────────
  const chartData  = (trendSource   === 'real' && realTrendData)   ? realTrendData   : demoTrendData;
  const tableData  = (keywordSource === 'real' && realKeywordData) ? realKeywordData : demoTableData;

  // ── 데이터 출처 배지 ──────────────────────────────────────────────────────────
  const SourceBadge = ({ source }) => {
    if (source === 'loading') {
      return (
        <span style={{
          fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px',
          background: '#2a2a3a', color: '#888', marginLeft: '8px',
        }}>
          불러오는 중…
        </span>
      );
    }
    const isReal = source === 'real';
    return (
      <span style={{
        fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px',
        background: isReal ? '#003d1f' : '#2a2a1a',
        color:      isReal ? '#00e676' : '#ffb300',
        border:     `1px solid ${isReal ? '#00e676' : '#ffb300'}`,
        marginLeft: '8px',
      }}>
        {isReal ? '실제 데이터' : '시뮬레이션 데이터'}
      </span>
    );
  };

  return (
    <div className="fade-in">
      <TrendChart
        data={chartData}
        keywords={brandGroups.map(g => g.name)}
        title="브랜드별 통합 쿼리 트렌드 (브랜드+제품+확장 키워드 합산)"
        badgeClass={PLATFORMS.naver.badge}
        badgeText="POWERED BY NAVER DATALAB"
        tableData={tableData}
      />

      <div className="trend-section mt-4">
        <div className="trend-header">
          <span className="trend-title">
            상세 키워드별 검색량 (누적 데이터 원천)
            <SourceBadge source={keywordSource} />
          </span>
        </div>
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
                  <td><span className="hashtag-chip" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{row.competition}</span></td>
                  <td className={Number(row.trend) > 0 ? 'trend-up' : 'trend-down'}>
                    {Number(row.trend) > 0 ? '▲' : '▼'} {Math.abs(row.trend)}%
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                    키워드를 입력하고 저장해주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
