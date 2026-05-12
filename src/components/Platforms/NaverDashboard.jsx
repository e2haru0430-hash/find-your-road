import { useState, useMemo } from 'react';
import { NAVER_FILTERS, PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData, generateNaverData } from '../../utils/demoData';

export default function NaverDashboard({ mappings, settings }) {
  const [filters, setFilters] = useState({ gender: '전체', age: '전체', device: '통합' });

  // 플랫 키워드 리스트 추출
  const allKeywords = useMemo(() => {
    const kws = [];
    mappings.forEach(m => {
      const parts = m.keywords.split(',').map(s => s.trim()).filter(s => s);
      kws.push(...parts);
    });
    return [...new Set(kws)].slice(0, 5); // 데모용 최대 5개
  }, [mappings]);

  const trendData = useMemo(() => generateTrendData(allKeywords, 30), [allKeywords]);
  const tableData = useMemo(() => generateNaverData(allKeywords), [allKeywords]);

  return (
    <div className="fade-in">
      <div className="platform-filters">
        <div className="platform-filter-group">
          <label>검색 영역</label>
          <select value={filters.device} onChange={e => setFilters({...filters, device: e.target.value})}>
            {NAVER_FILTERS.device.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="platform-filter-group">
          <label>성별</label>
          <select value={filters.gender} onChange={e => setFilters({...filters, gender: e.target.value})}>
            {NAVER_FILTERS.gender.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="platform-filter-group">
          <label>연령대 (5세 단위)</label>
          <select value={filters.age} onChange={e => setFilters({...filters, age: e.target.value})}>
            {NAVER_FILTERS.ages.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <TrendChart
        data={trendData}
        keywords={allKeywords}
        title="네이버 통합 검색 트렌드"
        badgeClass={PLATFORMS.naver.badge}
        badgeText="POWERED BY NAVER DATALAB"
      />

      <div className="trend-section mt-4">
        <div className="trend-header">
          <span className="trend-title">상세 키워드 검색량 (네이버 검색광고 API)</span>
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
                  <td><span className={`hashtag-chip`} style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{row.competition}</span></td>
                  <td className={Number(row.trend) > 0 ? 'trend-up' : 'trend-down'}>
                    {Number(row.trend) > 0 ? '▲' : '▼'} {Math.abs(row.trend)}%
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>키워드를 입력해주세요.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
