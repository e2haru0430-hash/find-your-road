import { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import BrandQueryTrend from './pages/BrandQueryTrend';
import DataGuide from './pages/DataGuide';
import InstagramDashboard from './components/Platforms/InstagramDashboard';
import GeoDashboard from './components/Geo/GeoDashboard';
import ShoppingMallDashboard from './components/Platforms/ShoppingMallDashboard';
import DashboardChat from './components/Common/DashboardChat';
import './index.css';

const INITIAL_DASHBOARDS = [
  { id: 'brand-query', name: 'Brand Query Trend', icon: '📊', locked: true },
];

function App() {
  const [activePage, setActivePage] = useState('brand-query');
  const [dashboards, setDashboards] = useState(INITIAL_DASHBOARDS);
  
  // localStorage에서 매핑 정보 불러오기
  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('brand_mappings');
    return saved ? JSON.parse(saved) : [];
  });

  // 매핑 정보 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('brand_mappings', JSON.stringify(mappings));
  }, [mappings]);

  const handleNavigate = (page) => {
    if (page === 'new-dashboard') {
      const newId = `dashboard-${Date.now()}`;
      const newDash = { id: newId, name: '새 대시보드', icon: '📝', locked: false };
      setDashboards([...dashboards, newDash]);
      setActivePage(newId);
    } else {
      setActivePage(page);
    }
  };

  const handleDeleteDashboard = (id) => {
    setDashboards(dashboards.filter(d => d.id !== id));
    if (activePage === id) setActivePage('brand-query');
  };

  const handleRenameDashboard = (id, newName) => {
    setDashboards(dashboards.map(d => d.id === id ? { ...d, name: newName } : d));
  };

  const renderPage = () => {
    if (activePage === 'brand-query') return <BrandQueryTrend mappings={mappings} onMappingsChange={setMappings} />;
    if (activePage === 'guide') return <DataGuide />;
    if (activePage === 'instagram') return <InstagramDashboard mappings={mappings} />;
    if (activePage === 'geo') return <GeoDashboard mappings={mappings} />;
    if (activePage === 'shopping') return (
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Shopping Mall Insight</h1>
            <p className="page-subtitle">국내외 주요 쇼핑몰의 브랜드 검색 트렌드와 판매 성과를 분석합니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-pdf" 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('대시보드 URL이 클립보드에 복사되었습니다. 팀원에게 전달하세요!');
              }}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>🔗</span> Share Link
            </button>
            <button className="btn-pdf">📄 PDF Download</button>
          </div>
        </div>
        <ShoppingMallDashboard mappings={mappings} onMappingsChange={setMappings} />
      </div>
    );
    
    // Custom added dashboards
    if (activePage.startsWith('dashboard-')) {
      return (
        <div className="fade-in">
          <div className="page-header">
            <h1 className="page-title">{dashboards.find(d => d.id === activePage)?.name || '커스텀 대시보드'}</h1>
          </div>
          <BrandQueryTrend mappings={mappings} onMappingsChange={setMappings} />
        </div>
      );
    }

    return <div>페이지를 찾을 수 없습니다.</div>;
  };

  return (
    <>
      <MainLayout
        activePage={activePage}
        onNavigate={handleNavigate}
        dashboards={dashboards}
        onAddDashboard={() => handleNavigate('new-dashboard')}
        onDeleteDashboard={handleDeleteDashboard}
        onRenameDashboard={handleRenameDashboard}
      >
        {renderPage()}
      </MainLayout>
      {/* 우측 하단 AI 분석 어시스턴트 — 모든 대시보드 탭에서 공통 노출 */}
      <DashboardChat activePage={activePage} mappings={mappings} />
    </>
  );
}

export default App;
