import { useState } from 'react';
import GeoAudit from './GeoAudit';
import GeoQuick from './GeoQuick';
import GeoCitability from './GeoCitability';
import GeoCrawlers from './GeoCrawlers';
import GeoLlmstxt from './GeoLlmstxt';
import GeoBrands from './GeoBrands';
import GeoSchema from './GeoSchema';
import GeoPlatforms from './GeoPlatforms';
import GeoCompetitive from './GeoCompetitive';
import { getDefaultDateRange } from '../../utils/constants';

const GEO_TOOLS = [
  { id: 'audit',       name: 'geo audit',       desc: '전체 종합 감사 및 리포트 생성',       icon: '📋' },
  { id: 'competitive', name: 'geo competitive',  desc: '경쟁사 히트맵 & AI 소스 구조 분석',  icon: '🎯' },
  { id: 'quick',       name: 'geo quick',        desc: '60초 가시성 스냅샷',                  icon: '⚡' },
  { id: 'citability',  name: 'geo citability',   desc: 'AI 인용 준비도 평가',                 icon: '✍️' },
  { id: 'crawlers',    name: 'geo crawlers',      desc: 'AI 크롤러 접근성 점검',               icon: '🕷️' },
  { id: 'llmstxt',     name: 'geo llmstxt',      desc: 'llms.txt 분석 및 생성',               icon: '📄' },
  { id: 'brands',      name: 'geo brands',        desc: '브랜드 권위도 및 언급 스캔',          icon: '🛡️' },
  { id: 'schema',      name: 'geo schema',        desc: '스키마 마크업 분석 및 생성',          icon: '🏷️' },
  { id: 'platforms',   name: 'geo platforms',     desc: '플랫폼별 맞춤 최적화',                icon: '🌐' },
];

export default function GeoDashboard({ mappings }) {
  const [activeTool, setActiveTool] = useState('audit');
  
  // localStorage에서 GEO 설정 불러오기
  const [targetUrl, setTargetUrl] = useState(() => localStorage.getItem('geo_target_url') || '');
  const [brandName, setBrandName] = useState(() => localStorage.getItem('geo_brand_name') || '');
  const [isEditMode, setIsEditMode] = useState(!localStorage.getItem('geo_target_url'));
  
  // 국내 / 글로벌 타입 — localStorage에 유지
  const [brandType, setBrandType] = useState(() => localStorage.getItem('geo_brand_type') || 'domestic');

  const [isExecuting, setIsExecuting] = useState(false);
  const [settings] = useState({
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
    localStorage.setItem('geo_brand_type', brandType);
    
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsEditMode(false);
    }, 1500);
  };

  const renderTool = () => {
    if (isExecuting) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🌐</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '10px' }}>AI 가시성 데이터 추출 중...</h3>
          <p style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
            $ geo-analyze --target {targetUrl} --brand "{brandName}" --indexing-check --status-ok
          </p>
        </div>
      );
    }

    if (!targetUrl || !brandName || isEditMode) {
      return (
        <div className="fade-in" style={{ padding: '60px 40px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🛡️</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '12px' }}>GEO 전략 분석 설정</h3>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6' }}>
            분석하고자 하는 사이트의 <strong>URL</strong>과 <strong>브랜드명</strong>을 입력하세요.<br/>
            AI 검색 엔진에서의 인용 신뢰도와 가시성 점유율을 실시간으로 진단합니다.
          </p>
          
          {mappings && mappings.length > 0 && (
             <div style={{ marginBottom: '24px', padding: '12px', background: '#f0f9ff', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid #bae6fd' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>💡 등록된 브랜드 활용:</span>
                {mappings.slice(0, 3).map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setBrandName(m.name)}
                    style={{ padding: '4px 12px', background: 'white', border: '1px solid #0369a1', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {m.name}
                  </button>
                ))}
             </div>
          )}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>* 입력된 정보는 브라우저에 안전하게 고정 저장됩니다.</div>
        </div>
      );
    }

    const toolProps = { targetUrl, brandName, brandType, settings };

    switch (activeTool) {
      case 'audit':       return <GeoAudit       {...toolProps} />;
      case 'competitive': return <GeoCompetitive  {...toolProps} />;
      case 'quick':       return <GeoQuick        {...toolProps} />;
      case 'citability':  return <GeoCitability   {...toolProps} />;
      case 'crawlers':    return <GeoCrawlers      {...toolProps} />;
      case 'llmstxt':     return <GeoLlmstxt      {...toolProps} />;
      case 'brands':      return <GeoBrands        {...toolProps} />;
      case 'schema':      return <GeoSchema        {...toolProps} />;
      case 'platforms':   return <GeoPlatforms     {...toolProps} />;
      default:            return <GeoAudit         {...toolProps} />;
    }
  };

  return (
    <div className="fade-in geo-global-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
             Global GEO Optimizer <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>PREMIUM REPORT</span>
          </h2>
          <p className="page-subtitle">Answer Engine Optimization을 위한 통합 진단 및 가시성 확보 전략 리포트입니다.</p>
        </div>
      </div>

      {/* 분석 설정 영역 (Fixed/Edit Mode) */}
      <div style={{ 
        background: isEditMode ? 'var(--bg-secondary)' : '#1e293b', 
        padding: '24px', 
        borderRadius: '16px', 
        marginBottom: '32px', 
        marginTop: '20px', 
        border: '1px solid var(--border-color)',
        boxShadow: isEditMode ? 'none' : '0 10px 30px rgba(30, 41, 59, 0.15)',
        transition: 'all 0.3s ease'
      }}>
        {isEditMode ? (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>TARGET WEBSITE URL</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🌐</span>
                <input
                  value={targetUrl}
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="mezzomedia.co.kr"
                  style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>BRAND NAME</label>
                {/* 국내 / 글로벌 타입 토글 */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { value: 'domestic', label: '🇰🇷 국내', activeColor: '#059669' },
                    { value: 'global',   label: '🌐 글로벌', activeColor: '#0369a1' },
                  ].map(opt => {
                    const active = brandType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setBrandType(opt.value)}
                        style={{
                          height: '28px', padding: '0 12px',
                          background: active ? opt.activeColor : 'white',
                          color: active ? 'white' : '#64748b',
                          border: `1px solid ${active ? opt.activeColor : '#cbd5e1'}`,
                          borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🛡️</span>
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="메조미디어"
                  style={{ width: '100%', padding: '14px 14px 14px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {localStorage.getItem('geo_target_url') && (
                <button 
                  onClick={() => setIsEditMode(false)}
                  style={{ height: '52px', padding: '0 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  취소
                </button>
              )}
              <button 
                className="btn-save" 
                onClick={handleExecute}
                style={{ height: '52px', padding: '0 30px', background: 'var(--color-navy)', color: 'white', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <span>▶</span> 분석 시작 및 데이터 고정
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Target URL</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{targetUrl}</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Authority</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {brandName}
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '4px',
                    background: brandType === 'global' ? '#0369a1' : '#059669', color: 'white',
                  }}>
                    {brandType === 'global' ? '🌐 글로벌' : '🇰🇷 국내'}
                  </span>
                </div>
              </div>
              <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>✅ DATA FIXED</div>
              </div>
            </div>
            <button 
              onClick={() => setIsEditMode(true)}
              style={{ 
                padding: '10px 20px', 
                background: 'rgba(255,255,255,0.1)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                color: 'white', 
                borderRadius: '8px', 
                fontSize: '0.9rem', 
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
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
