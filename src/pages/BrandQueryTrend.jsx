import { useState } from 'react';
import QueryControls from '../components/Dashboard/QueryControls';
import KeywordMapping from '../components/Dashboard/KeywordMapping';
import NaverDashboard from '../components/Platforms/NaverDashboard';
import GoogleDashboard from '../components/Platforms/GoogleDashboard';
import InstagramDashboard from '../components/Platforms/InstagramDashboard';
import { getDefaultDateRange } from '../utils/constants';

export default function BrandQueryTrend({ mappings, onMappingsChange }) {
  const [settings, setSettings] = useState({
    unit: '일간',
    dateRange: getDefaultDateRange(),
    compare: '없음'
  });

  const [activeTab, setActiveTab] = useState('naver');

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Brand Query Trend</h1>
          <p className="page-subtitle">내 브랜드의 쿼리 트렌드를 경쟁사와 비교합니다.</p>
        </div>
        <button className="btn-pdf">📄 PDF Download</button>
      </div>

      <QueryControls settings={settings} onSettingsChange={setSettings} />

      <KeywordMapping mappings={mappings} onMappingsChange={onMappingsChange} />

      <div className="platform-tabs">
        <button className={`platform-tab ${activeTab === 'naver' ? 'active' : ''}`} onClick={() => setActiveTab('naver')}>
          🟢 네이버 검색
        </button>
        <button className={`platform-tab ${activeTab === 'google' ? 'active' : ''}`} onClick={() => setActiveTab('google')}>
          🔵 구글 트렌드
        </button>
        <button className={`platform-tab ${activeTab === 'instagram' ? 'active' : ''}`} onClick={() => setActiveTab('instagram')}>
          📷 인스타그램
        </button>
      </div>

      <div className="tab-content slide-in" key={activeTab}>
        {activeTab === 'naver' && <NaverDashboard mappings={mappings} settings={settings} />}
        {activeTab === 'google' && <GoogleDashboard mappings={mappings} settings={settings} />}
        {activeTab === 'instagram' && <InstagramDashboard />}
      </div>
    </div>
  );
}
