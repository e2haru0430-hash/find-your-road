import { useState } from 'react';
import QueryControls from '../Dashboard/QueryControls';
import GeoAudit from './GeoAudit';
import GeoQuick from './GeoQuick';
import GeoCitability from './GeoCitability';
import GeoCrawlers from './GeoCrawlers';
import GeoLlmstxt from './GeoLlmstxt';
import GeoBrands from './GeoBrands';
import GeoSchema from './GeoSchema';
import GeoPlatforms from './GeoPlatforms';
import { getDefaultDateRange } from '../../utils/constants';

const GEO_TOOLS = [
  { id: 'audit', name: 'geo audit', desc: '전체 종합 감사 및 리포트 생성', icon: '📋' },
  { id: 'quick', name: 'geo quick', desc: '60초 가시성 스냅샷', icon: '⚡' },
  { id: 'citability', name: 'geo citability', desc: 'AI 인용 준비도 평가', icon: '✍️' },
  { id: 'crawlers', name: 'geo crawlers', desc: 'AI 크롤러 접근성 점검', icon: '🕷️' },
  { id: 'llmstxt', name: 'geo llmstxt', desc: 'llms.txt 분석 및 생성', icon: '📄' },
  { id: 'brands', name: 'geo brands', desc: '브랜드 권위도 및 언급 스캔', icon: '🛡️' },
  { id: 'schema', name: 'geo schema', desc: '스키마 마크업 분석 및 생성', icon: '🏷️' },
  { id: 'platforms', name: 'geo platforms', desc: '플랫폼별 맞춤 최적화', icon: '🌐' },
];

export default function GeoDashboard({ mappings }) {
  const [activeTool, setActiveTool] = useState('audit');
  
  // localStorage에서 GEO 설정 불러오기
  const [targetUrl, setTargetUrl] = useState(() => localStorage.getItem('geo_target_url') || '');
  const [brandName, setBrandName] = useState(() => localStorage.getItem('geo_brand_name') || '');
  const [isEditMode, setIsEditMode] = useState(!localStorage.getItem('geo_target_url'));
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [settings, setSettings] = useState({
    unit: '일간',
    dateRange: getDefaultDateRange(),
    compare: '없음'
  });

  const handleExecute = () => {
    if (!targetUrl || !brandName) {
      alert('분석을 위해 URL과 브랜드명을 모두 입력해주세요.');
      return;
    }
    // 설정 저장
    localStorage.setItem('geo_target_url', targetUrl);
    localStorage.setItem('geo_brand_name', brandName);
    
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsEditMode(false);
    }, 1500);
  };

  const renderTool = () => {
    if (!targetUrl || !brandName || isEditMode) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)', background: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎯</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '10px' }}>GEO 분석 설정</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>분석할 사이트 URL과 브랜드명을 입력하고 저장하면<br/>최적화 리포트가 생성됩니다.</p>
          {isEditMode && mappings && mappings.length > 0 && (
             <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginBottom: '10px', cursor: 'pointer' }} onClick={() => {
                setBrandName(mappings[0].name);
             }}>
                💡 현재 등록된 '{mappings[0].name}' 브랜드 불러오기
             </div>
          )}
        </div>
      );
    }

    if (isExecuting) {
      return (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            $ {GEO_TOOLS.find(t => t.id === activeTool).name} --url {targetUrl} --brand "{brandName}" --executing...
          </p>
        </div>
      );
    }

    const toolProps = { targetUrl, brandName, settings };

    switch (activeTool) {
      case 'audit': return <GeoAudit {...toolProps} />;
      case 'quick': return <GeoQuick {...toolProps} />;
      case 'citability': return <GeoCitability {...toolProps} />;
      case 'crawlers': return <GeoCrawlers {...toolProps} />;
      case 'llmstxt': return <GeoLlmstxt {...toolProps} />;
      case 'brands': return <GeoBrands {...toolProps} />;
      case 'schema': return <GeoSchema {...toolProps} />;
      case 'platforms': return <GeoPlatforms {...toolProps} />;
      default: return <GeoAudit {...toolProps} />;
    }
  };

  return (
    <div className="fade-in geo-global-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤖 Global GEO Optimizer <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Powered by AI Analysis</span>
          </h2>
          <p className="page-subtitle">AI 검색 엔진에서의 인용 가능성을 분석하고 최적화 방안을 제안합니다.</p>
        </div>
      </div>

      <QueryControls settings={settings} onSettingsChange={setSettings} />

      {/* 분석 설정 영역 (Fixed/Edit Mode) */}
      <div style={{ background: isEditMode ? 'var(--bg-secondary)' : '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', marginTop: '20px', border: '1px solid var(--border-color)' }}>
        {isEditMode ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TARGET WEBSITE URL</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🌐</span>
                <input
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="mezzomedia.co.kr"
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BRAND NAME</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🛡️</span>
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="메조미디어"
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {targetUrl && brandName && <button onClick={() => setIsEditMode(false)} style={{ height: '46px', padding: '0 15px', background: 'white', border: '1px solid #ccc', borderRadius: '8px' }}>취소</button>}
              <button 
                className="btn-save" 
                onClick={handleExecute}
                style={{ height: '46px', padding: '0 24px', background: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
              >
                ✓ 분석 시작 및 저장
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>분석 대상 URL</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-navy)' }}>{targetUrl}</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '24px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>브랜드명</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{brandName}</div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditMode(true)}
              style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              ⚙️ 분석 설정 변경
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        <div className="geo-tool-sidebar">
          {GEO_TOOLS.map(tool => (
            <button
              key={tool.id}
              className={`geo-tool-item ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '8px',
                border: '1px solid',
                borderColor: activeTool === tool.id ? 'var(--color-primary)' : 'transparent',
                background: activeTool === tool.id ? 'white' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>{tool.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{tool.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="geo-tool-content card" style={{ padding: '24px', minHeight: '500px' }}>
          <div style={{ marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Analysis Period: {settings.dateRange.start} ~ {settings.dateRange.end}</span>
            <span>Target: {targetUrl}</span>
          </div>
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
