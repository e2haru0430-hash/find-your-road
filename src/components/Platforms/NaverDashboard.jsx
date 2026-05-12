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
      const parts = m.keywords.split(',').map(s => s.trim()).filter(s => s);
      if (m.name && parts.length > 0) {
        groups.push({ name: m.name, keywords: parts, color: m.color });
        kws.push(...parts);
      }
    });
    return { brandGroups: groups, allKeywords: [...new Set(kws)] };
  }, [mappings]);

  // 브랜드 단위 트렌드 데이터 생성 (각 브랜드의 모든 키워드 합산 시뮬레이션)
  const brandTrendData = useMemo(() => {
    const brandNames = brandGroups.map(g => g.name);
    if (brandNames.length === 0) return generateTrendData(['검색어 없음'], 30);
    return generateTrendData(brandNames, 30);
  }, [brandGroups]);

  // 개별 키워드 상세 테이블 데이터
  const tableData = useMemo(() => generateNaverData(allKeywords.slice(0, 15)), [allKeywords]);

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
        title="브랜드별 통합 쿼리 트렌드 (연관/확장 검색어 포함)"
        badgeClass={PLATFORMS.naver.badge}
        badgeText="POWERED BY NAVER DATALAB"
      />

      <div className="trend-section mt-4">
        <div className="trend-header">
          <span className="trend-title">상세 키워드 검색량 분석 (최근 30일 기준)</span>
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
