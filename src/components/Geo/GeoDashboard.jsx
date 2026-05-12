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

export default function GeoDashboard() {
  const [activeTool, setActiveTool] = useState('audit');
  const [targetUrl, setTargetUrl] = useState('mezzomedia.co.kr');
  const [brandName, setBrandName] = useState('메조미디어');
  const [isExecuting, setIsExecuting] = useState(false);
  const [settings, setSettings] = useState({
    unit: '일간',
    dateRange: getDefaultDateRange(),
    compare: '없음'
  });

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 1500);
  };

  const renderTool = () => {
    if (isExecuting) {
      return (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ fontSize: '2rem', marginBottom: '15px' }}>⏳</div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
            $ {GEO_TOOLS.find(t => t.id === activeTool).name} --url {targetUrl} --brand "{brandName}" --period {settings.dateRange.start} to {settings.dateRange.end} --executing...
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
            🤖 Global GEO Optimizer <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Powered by Claude Code CLI PoC</span>
          </h2>
          <p className="page-subtitle">AI 검색 엔진에서의 인용 가능성을 분석하고 최적화 방안을 제안하는 통합 도구입니다.</p>
        </div>
      </div>

      <QueryControls settings={settings} onSettingsChange={setSettings} />

      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '24px', marginTop: '20px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TARGET WEBSITE URL</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🌐</span>
              <input
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="example.com"
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 36px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace'
                }}
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
                placeholder="브랜드명 입력"
                style={{ 
                  width: '100%', 
                  padding: '12px 12px 12px 36px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>
          <button 
            className="btn-save" 
            onClick={handleExecute}
            style={{ 
              height: '46px', 
              padding: '0 24px', 
              background: 'var(--color-navy)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.95rem'
            }}
          >
            <span>▶</span> Run Analysis
          </button>
        </div>
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
