import { useState, useMemo } from 'react';
import { NAVER_FILTERS, PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData, generateNaverData } from '../../utils/demoData';

export default function NaverDashboard({ mappings, settings }) {
  const [filters, setFilters] = useState({ gender: '전체', age: '전체', device: '통합' });

  // 브랜드별 키워드 그룹화 및 전체 키워드 리스트 추출
  const { brandGroups, allKeywords } = useMemo(() => {
    const groups = [];
    const kws = [];
    mappings.forEach(m => {
      let parts = m.keywords.split(',').map(s => s.trim()).filter(s => s);
      
      // 키워드가 비어있을 경우 브랜드명을 기본 키워드로 사용
      if (parts.length === 0 && m.name) {
        parts = [m.name];
      }

      if (m.name && parts.length > 0) {
        groups.push({ name: m.name, keywords: parts, color: m.color });
        kws.push(...parts);
      }
    });
    return { brandGroups: groups, allKeywords: [...new Set(kws)] };
  }, [mappings]);

  // 개별 키워드들의 트렌드 데이터를 먼저 생성
  const rawKeywordTrendData = useMemo(() => {
    if (allKeywords.length === 0) return [];
    return generateTrendData(allKeywords, 14);
  }, [allKeywords]);

  // 브랜드별로 키워드 데이터를 합산(누적)하여 최종 차트 데이터 생성
  const brandTrendData = useMemo(() => {
    if (brandGroups.length === 0 || rawKeywordTrendData.length === 0) {
      return generateTrendData(['검색어 없음'], 14);
    }

    return rawKeywordTrendData.map(dayData => {
      const row = { date: dayData.date };
      brandGroups.forEach(group => {
        // 해당 브랜드 그룹에 속한 모든 키워드의 값을 합산
        const totalValue = group.keywords.reduce((sum, kw) => {
          return sum + (dayData[kw] || 0);
        }, 0);
        row[group.name] = totalValue;
      });
      return row;
    });
  }, [brandGroups, rawKeywordTrendData]);

  // 상세 키워드 테이블 데이터
  const tableData = useMemo(() => generateNaverData(allKeywords.slice(0, 20)), [allKeywords]);

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
        data={brandTrendData}
        keywords={brandGroups.map(g => g.name)}
        title="브랜드별 통합 쿼리 트렌드 (브랜드+제품+확장 키워드 합산)"
        badgeClass={PLATFORMS.naver.badge}
        badgeText="POWERED BY NAVER DATALAB"
      />

      <div className="trend-section mt-4">
        <div className="trend-header">
          <span className="trend-title">상세 키워드별 검색량 (누적 데이터 원천)</span>
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
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>키워드를 입력하고 저장해주세요.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
