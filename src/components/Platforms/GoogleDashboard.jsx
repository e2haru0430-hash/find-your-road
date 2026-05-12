import { useState, useMemo } from 'react';
import { GOOGLE_FILTERS, PLATFORMS } from '../../utils/constants';
import TrendChart from '../Dashboard/TrendChart';
import { generateTrendData } from '../../utils/demoData';

export default function GoogleDashboard({ mappings, settings }) {
  const [filters, setFilters] = useState({ searchType: '웹 검색', region: '한국', kwType: '검색어' });

  const allKeywords = useMemo(() => {
    const kws = [];
    mappings.forEach(m => {
      const parts = m.keywords.split(',').map(s => s.trim()).filter(s => s);
      kws.push(...parts);
    });
    return [...new Set(kws)].slice(0, 5);
  }, [mappings]);

  const trendData = useMemo(() => generateTrendData(allKeywords, 90), [allKeywords]);

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
        data={trendData}
        keywords={allKeywords}
        title={`구글 트렌드 관심도 변화 (${filters.region} / ${filters.searchType})`}
        badgeClass={PLATFORMS.google.badge}
        badgeText="POWERED BY GOOGLE TRENDS"
      />
    </div>
  );
}
