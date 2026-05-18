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
  { id: 'audit',       name: 'geo audit',       desc: '전체 종합 감사 및 리포트 생성',      icon: '📋' },
  { id: 'competitive', name: 'geo competitive',  desc: '경쟁사 히트맵 & AI 소스 구조 분석', icon: '🎯' },
  { id: 'quick',       name: 'geo quick',        desc: '60초 가시성 스냅샷',                 icon: '⚡' },
  { id: 'citability',  name: 'geo citability',   desc: 'AI 인용 준비도 평가',                icon: '✍️' },
  { id: 'crawlers',    name: 'geo crawlers',      desc: 'AI 크롤러 접근성 점검',              icon: '🕷️' },
  { id: 'llmstxt',     name: 'geo llmstxt',      desc: 'llms.txt 분석 및 생성',              icon: '📄' },
  { id: 'brands',      name: 'geo brands',        desc: '브랜드 권위도 및 언급 스캔',         icon: '🛡️' },
  { id: 'schema',      name: 'geo schema',        desc: '스키마 마크업 분석 및 생성',         icon: '🏷️' },
  { id: 'platforms',   name: 'geo platforms',     desc: '플랫폼별 맞춤 최적화',               icon: '🌐' },
];

// ── 통합 마켓 목록 (국내 + 글로벌 전 지역) ────────────────────────────────────
export const GEO_MARKETS = [
  // ── 국내 ─────────────────────────────────────────────────────────────────────
  { value: 'domestic',  label: '국내',              flag: '🇰🇷', group: '국내',       isGlobal: false,
    shopping: ['네이버쇼핑', '쿠팡', '올리브영', '11번가', 'G마켓'] },

  // ── 아메리카 ─────────────────────────────────────────────────────────────────
  { value: 'us-ca',     label: '미국/캐나다',        flag: '🇺🇸', group: '아메리카',    isGlobal: true,
    shopping: ['Amazon', 'Sephora', 'Target', 'Walmart', 'Ulta Beauty'] },

  // ── 아시아태평양 ─────────────────────────────────────────────────────────────
  { value: 'au',        label: '호주',               flag: '🇦🇺', group: '아시아태평양', isGlobal: true,
    shopping: ['Amazon AU', 'Sephora AU', 'Chemist Warehouse', 'Catch', 'eBay AU'] },
  { value: 'jp',        label: '일본',               flag: '🇯🇵', group: '아시아태평양', isGlobal: true,
    shopping: ['Amazon JP', 'Rakuten', 'Yahoo!ショッピング', '@cosme', 'LOFT'] },

  // ── 서유럽 ───────────────────────────────────────────────────────────────────
  { value: 'w-eu',      label: '서유럽',             flag: '🇪🇺', group: '서유럽',      isGlobal: true,
    subLabel: '영국·독일·프랑스·이탈리아·스페인',
    shopping: ['Amazon EU', 'Sephora EU', 'Douglas', 'Boots', 'Feelunique'] },
  { value: 'de',        label: '독일',               flag: '🇩🇪', group: '서유럽',      isGlobal: true,
    shopping: ['Amazon DE', 'Douglas', 'Sephora DE', 'dm', 'Rossmann'] },
  { value: 'fr',        label: '프랑스',             flag: '🇫🇷', group: '서유럽',      isGlobal: true,
    shopping: ['Amazon FR', 'Sephora FR', 'Nocibé', 'Marionnaud', 'Cdiscount'] },
  { value: 'it',        label: '이탈리아',           flag: '🇮🇹', group: '서유럽',      isGlobal: true,
    shopping: ['Amazon IT', 'Sephora IT', 'Profumerie Areté', 'eBay IT', 'Zalando IT'] },
  { value: 'es',        label: '스페인',             flag: '🇪🇸', group: '서유럽',      isGlobal: true,
    shopping: ['Amazon ES', 'Sephora ES', 'El Corte Inglés', 'Primor', 'eBay ES'] },

  // ── 동유럽 ───────────────────────────────────────────────────────────────────
  { value: 'e-eu',      label: '동유럽',             flag: '🌍', group: '동유럽',      isGlobal: true,
    subLabel: '네덜란드·스웨덴·폴란드',
    shopping: ['Amazon EU', 'bol.com', 'Zalando', 'Allegro', 'Coolblue'] },
  { value: 'nl',        label: '네덜란드',           flag: '🇳🇱', group: '동유럽',      isGlobal: true,
    shopping: ['bol.com', 'Amazon NL', 'Coolblue', 'Zalando NL', 'eBay NL'] },
  { value: 'se',        label: '스웨덴',             flag: '🇸🇪', group: '동유럽',      isGlobal: true,
    shopping: ['Amazon SE', 'CDON', 'Lyko', 'Apotea', 'Zalando SE'] },
  { value: 'pl',        label: '폴란드',             flag: '🇵🇱', group: '동유럽',      isGlobal: true,
    shopping: ['Allegro', 'Amazon PL', 'Zalando PL', 'Empik', 'Ceneo'] },

  // ── 동남아시아 ───────────────────────────────────────────────────────────────
  { value: 'sea-all',   label: '동남아(All)',        flag: '🌏', group: '동남아시아',  isGlobal: true,
    subLabel: '인도네시아·베트남·태국·필리핀',
    shopping: ['Shopee', 'Lazada', 'TikTok Shop', 'Tokopedia', 'Grab'] },
  { value: 'id',        label: '인도네시아',         flag: '🇮🇩', group: '동남아시아',  isGlobal: true,
    shopping: ['Shopee ID', 'Tokopedia', 'Lazada ID', 'TikTok Shop', 'Blibli'] },
  { value: 'vn',        label: '베트남',             flag: '🇻🇳', group: '동남아시아',  isGlobal: true,
    shopping: ['Shopee VN', 'Lazada VN', 'TikTok Shop', 'Tiki', 'Sendo'] },
  { value: 'th',        label: '태국',               flag: '🇹🇭', group: '동남아시아',  isGlobal: true,
    shopping: ['Shopee TH', 'Lazada TH', 'TikTok Shop', 'Central Online', 'JD Central'] },
  { value: 'ph',        label: '필리핀',             flag: '🇵🇭', group: '동남아시아',  isGlobal: true,
    shopping: ['Shopee PH', 'Lazada PH', 'TikTok Shop', 'Zalora PH', 'BeautyMNL'] },
];

// 그룹 순서 (optgroup 렌더용)
const MARKET_GROUPS = ['국내', '아메리카', '아시아태평양', '서유럽', '동유럽', '동남아시아'];

export default function GeoDashboard({ mappings }) {
  const [activeTool, setActiveTool] = useState('audit');

  const [targetUrl, setTargetUrl] = useState(() => localStorage.getItem('geo_target_url') || '');
  const [brandName, setBrandName] = useState(() => localStorage.getItem('geo_brand_name') || '');
  const [isEditMode, setIsEditMode] = useState(!localStorage.getItem('geo_target_url'));

  // 통합 마켓 선택 (국내 / 글로벌 지역 통합)
  const [geoMarket, setGeoMarket] = useState(
    () => localStorage.getItem('geo_market') || 'domestic'
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [settings] = useState({
    unit: '일간',
    dateRange: getDefaultDateRange(),
    compare: '없음',
  });

  // geoMarket에서 파생되는 값
  const activeMarket  = GEO_MARKETS.find(m => m.value === geoMarket) || GEO_MARKETS[0];
  const brandType     = activeMarket.isGlobal ? 'global' : 'domestic';
  const geoRegion     = geoMarket; // 하위 컴포넌트 호환용 alias

  const handleExecute = () => {
    if (!targetUrl || !brandName) {
      alert('분석을 위해 URL과 브랜드명을 모두 입력해주세요.');
      return;
    }
    localStorage.setItem('geo_target_url', targetUrl);
    localStorage.setItem('geo_brand_name', brandName);
    localStorage.setItem('geo_market',     geoMarket);
    // 구버전 키도 동기화 (다른 탭/컴포넌트 호환)
    localStorage.setItem('geo_brand_type', brandType);
    localStorage.setItem('geo_region',     geoRegion);

    setIsExecuting(true);
    setTimeout(() => { setIsExecuting(false); setIsEditMode(false); }, 1500);
  };

  const renderTool = () => {
    if (isExecuting) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🌐</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '10px' }}>AI 가시성 데이터 추출 중...</h3>
          <p style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
            $ geo-analyze --target {targetUrl} --brand "{brandName}" --market {geoMarket} --status-ok
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
            분석하고자 하는 사이트의 <strong>URL</strong>과 <strong>브랜드명</strong>을 입력하세요.<br />
            AI 검색 엔진에서의 인용 신뢰도와 가시성 점유율을 실시간으로 진단합니다.
          </p>
          {mappings && mappings.length > 0 && (
            <div style={{ marginBottom: '24px', padding: '12px', background: '#f0f9ff', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1px solid #bae6fd' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>💡 등록된 브랜드 활용:</span>
              {mappings.slice(0, 3).map(m => (
                <button key={m.id} onClick={() => setBrandName(m.name)}
                  style={{ padding: '4px 12px', background: 'white', border: '1px solid #0369a1', color: '#0369a1', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>* 입력된 정보는 브라우저에 안전하게 고정 저장됩니다.</div>
        </div>
      );
    }

    const toolProps = { targetUrl, brandName, geoMarket, brandType, geoRegion, settings };

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
            Global GEO Optimizer
            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>PREMIUM REPORT</span>
          </h2>
          <p className="page-subtitle">Answer Engine Optimization을 위한 통합 진단 및 가시성 확보 전략 리포트입니다.</p>
        </div>
      </div>

      {/* ── 분석 설정 영역 ── */}
      <div style={{
        background: isEditMode ? 'var(--bg-secondary)' : '#1e293b',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '32px',
        marginTop: '20px',
        border: '1px solid var(--border-color)',
        boxShadow: isEditMode ? 'none' : '0 10px 30px rgba(30,41,59,0.15)',
        transition: 'all 0.3s ease',
      }}>
        {isEditMode ? (
          <div>
            {/* Row 1: URL + Brand 입력 + 버튼 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '14px' }}>
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
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>BRAND NAME</label>
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
                  <button onClick={() => setIsEditMode(false)}
                    style={{ height: '52px', padding: '0 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                    취소
                  </button>
                )}
                <button className="btn-save" onClick={handleExecute}
                  style={{ height: '52px', padding: '0 30px', background: 'var(--color-navy)', color: 'white', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <span>▶</span> 분석 시작 및 데이터 고정
                </button>
              </div>
            </div>

            {/* Row 2: 분석 마켓 선택 박스 */}
            <div style={{
              padding: '12px 16px',
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>분석 마켓</span>
              <div style={{ width: '1px', height: '20px', background: '#e2e8f0', flexShrink: 0 }} />

              {/* 통합 마켓 드롭다운 */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <select
                  value={geoMarket}
                  onChange={e => setGeoMarket(e.target.value)}
                  style={{
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    padding: '8px 40px 8px 14px',
                    border: `1.5px solid ${activeMarket.isGlobal ? '#0369a1' : '#059669'}`,
                    borderRadius: '10px',
                    background: activeMarket.isGlobal ? '#eff6ff' : '#ecfdf5',
                    color: activeMarket.isGlobal ? '#0369a1' : '#059669',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '240px',
                    outline: 'none',
                  }}
                >
                  {MARKET_GROUPS.map(group => {
                    const items = GEO_MARKETS.filter(m => m.group === group);
                    return (
                      <optgroup key={group} label={`── ${group} ──`}>
                        {items.map(m => (
                          <option key={m.value} value={m.value}>
                            {m.flag} {m.group === '국내' ? '국내' : `글로벌_${m.label}`}
                            {m.subLabel ? ` (${m.subLabel})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                <span style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  pointerEvents: 'none', fontSize: '0.75rem',
                  color: activeMarket.isGlobal ? '#0369a1' : '#059669',
                }}>▾</span>
              </div>

              {/* 선택된 마켓 쇼핑 플랫폼 표시 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>쇼핑 데이터</span>
                {activeMarket.shopping.map(s => (
                  <span key={s} style={{
                    fontSize: '0.68rem', fontWeight: 600,
                    padding: '2px 8px', borderRadius: '4px',
                    background: '#f1f5f9', color: '#475569',
                    border: '1px solid #e2e8f0',
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Fixed mode (dark) */
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis Target URL</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{targetUrl}</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Brand Authority</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {brandName}
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 9px', borderRadius: '4px', background: activeMarket.isGlobal ? '#0369a1' : '#059669', color: 'white' }}>
                    {activeMarket.flag} {activeMarket.isGlobal ? `글로벌_${activeMarket.label}` : '국내'}
                  </span>
                </div>
              </div>
              <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Report Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>✅ DATA FIXED</div>
              </div>
            </div>
            <button onClick={() => setIsEditMode(true)}
              style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
              ⚙️ 분석 설정 변경
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        <div className="geo-tool-sidebar">
          {GEO_TOOLS.map(tool => (
            <button key={tool.id}
              className={`geo-tool-item ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px',
                border: '1px solid', borderColor: activeTool === tool.id ? 'var(--color-primary)' : 'transparent',
                background: activeTool === tool.id ? 'white' : 'transparent',
                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
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
