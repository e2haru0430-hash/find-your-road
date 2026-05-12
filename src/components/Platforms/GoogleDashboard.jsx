import { useState, useMemo } from 'react';
import { GOOGLE_FILTERS, PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData } from '../../utils/demoData';

export default function GoogleDashboard({ mappings, settings }) {
  const [filters, setFilters] = useState({ searchType: '웹 검색', region: '한국', kwType: '검색어' });

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
    return generateTrendData(allKeywords, 90);
  }, [allKeywords]);

  // 브랜드별로 키워드 데이터를 합산하여 최종 차트 데이터 생성
  const brandTrendData = useMemo(() => {
    if (brandGroups.length === 0 || rawKeywordTrendData.length === 0) {
      return generateTrendData(['검색어 없음'], 90);
    }

    return rawKeywordTrendData.map(dayData => {
      const row = { date: dayData.date };
      brandGroups.forEach(group => {
        const totalValue = group.keywords.reduce((sum, kw) => {
          return sum + (dayData[kw] || 0);
        }, 0);
        row[group.name] = totalValue;
      });
      return row;
    });
  }, [brandGroups, rawKeywordTrendData]);

  return (
    <div className="fade-in">
      <div className="platform-filters">
        <div className="platform-filter-group">
          <label>검색 유형</label>
          <select value={filters.searchType} onChange={e => setFilters({...filters, searchType: e.target.value})}>
            {GOOGLE_FILTERS.searchType.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="platform-filter-group">
          <label>지역</label>
          <select value={filters.region} onChange={e => setFilters({...filters, region: e.target.value})}>
            {GOOGLE_FILTERS.region.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="platform-filter-group">
          <label>분석 방식</label>
          <select value={filters.kwType} onChange={e => setFilters({...filters, kwType: e.target.value})}>
            <option>검색어 (Search term)</option>
            <option>주제 (Topic)</option>
          </select>
        </div>
      </div>

      <TrendChart
        data={brandTrendData}
        keywords={brandGroups.map(g => g.name)}
        title={`구글 트렌드 브랜드별 관심도 (${filters.region} / ${filters.searchType})`}
        badgeClass={PLATFORMS.google.badge}
        badgeText="POWERED BY GOOGLE TRENDS"
      />
    </div>
  );
}
