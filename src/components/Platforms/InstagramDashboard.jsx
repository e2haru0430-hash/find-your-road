import { useState, useMemo } from 'react';
import HashtagGrowth from '../Instagram/HashtagGrowth';
import SearchAutocomplete from '../Instagram/SearchAutocomplete';
import ContentReaction from '../Instagram/ContentReaction';
import ExternalData from '../Instagram/ExternalData';

export default function InstagramDashboard({ mappings = [] }) {
  const [activeTab, setActiveTab] = useState('A');
  const [selectedBrandId, setSelectedBrandId] = useState(mappings[0]?.id);

  const selectedBrand = useMemo(() => {
    return mappings.find(m => m.id === selectedBrandId) || mappings[0];
  }, [mappings, selectedBrandId]);

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.4rem' }}>인스타그램 심층 분석</h2>
          <p className="page-subtitle">해시태그, 자동완성, 콘텐츠 반응을 기반으로 SNS 트렌드를 파악합니다.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>분석 대상 브랜드:</span>
          <select 
            value={selectedBrandId} 
            onChange={(e) => setSelectedBrandId(Number(e.target.value))}
            style={{ border: 'none', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', cursor: 'pointer', outline: 'none' }}
          >
            {mappings.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="insta-grid">
        <div className={`insta-card ${activeTab === 'A' ? 'active' : ''}`} onClick={() => setActiveTab('A')} style={{ cursor: 'pointer', border: activeTab === 'A' ? '2px solid var(--color-primary)' : '' }}>
          <div className="insta-card-header">
            <div className="insta-card-icon growth">📈</div>
            <h3>A. 해시태그 게시물 증가량</h3>
          </div>
          <p>일자별 해시태그 게시물 생산량 트렌드 파악</p>
        </div>

        <div className={`insta-card ${activeTab === 'B' ? 'active' : ''}`} onClick={() => setActiveTab('B')} style={{ cursor: 'pointer', border: activeTab === 'B' ? '2px solid var(--color-primary)' : '' }}>
          <div className="insta-card-header">
            <div className="insta-card-icon search">🔍</div>
            <h3>B. 검색 자동완성/추천어 변화</h3>
          </div>
          <p>연관어 및 검색 추천 네트워크 추적</p>
        </div>

        <div className={`insta-card ${activeTab === 'C' ? 'active' : ''}`} onClick={() => setActiveTab('C')} style={{ cursor: 'pointer', border: activeTab === 'C' ? '2px solid var(--color-primary)' : '' }}>
          <div className="insta-card-header">
            <div className="insta-card-icon reaction">❤️</div>
            <h3>C. 콘텐츠 반응 기반 키워드</h3>
          </div>
          <p>좋아요/저장/공유 기준 소비자 반응 도출</p>
        </div>

        <div className={`insta-card ${activeTab === 'D' ? 'active' : ''}`} onClick={() => setActiveTab('D')} style={{ cursor: 'pointer', border: activeTab === 'D' ? '2px solid var(--color-primary)' : '' }}>
          <div className="insta-card-header">
            <div className="insta-card-icon external">🔗</div>
            <h3>D. 외부 검색 데이터 결합</h3>
          </div>
          <p>포털 검색량과 SNS 트렌드 크로스 체크</p>
        </div>
      </div>

      <div className="trend-section slide-in" key={`${activeTab}-${selectedBrandId}`}>
        {activeTab === 'A' && <HashtagGrowth brand={selectedBrand} />}
        {activeTab === 'B' && <SearchAutocomplete brand={selectedBrand} />}
        {activeTab === 'C' && <ContentReaction brand={selectedBrand} />}
        {activeTab === 'D' && <ExternalData brand={selectedBrand} />}
      </div>
    </div>
  );
}
