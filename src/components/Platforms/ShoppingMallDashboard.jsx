import { useState, useMemo } from 'react';
import KeywordMapping from '../Dashboard/KeywordMapping';
import { generateDynamicReviews, isBrandOnPlatform } from '../../utils/keywordHelper';

const DOMESTIC_PLATFORMS = [
  { id: 'coupang', name: '쿠팡', icon: '📦', lang: 'ko' },
  { id: 'naver-shopping', name: '네이버쇼핑', icon: '🟢', lang: 'ko' },
  { id: 'oliveyoung', name: '올리브영', icon: '🌿', lang: 'ko' }
];

const GLOBAL_PLATFORMS = [
  { id: 'amazon', name: 'Amazon', icon: '🅰️', lang: 'en' },
  { id: 'sephora', name: 'Sephora', icon: '💄', lang: 'en' },
  { id: 'rakuten', name: 'Rakuten', icon: '🔴', lang: 'ja' },
  { id: 'qoo10', name: 'Qoo10', icon: '🔵', lang: 'en' },
  { id: 'shopify', name: 'Shopify', icon: '🛍️', lang: 'en' }
];

export default function ShoppingMallDashboard({ mappings, onMappingsChange }) {
  const [region, setRegion] = useState('domestic');
  const [activePlatform, setActivePlatform] = useState(DOMESTIC_PLATFORMS[0].id);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [country, setCountry] = useState('Global');

  const platforms = region === 'domestic' ? DOMESTIC_PLATFORMS : GLOBAL_PLATFORMS;
  const currentPlatform = platforms.find(p => p.id === activePlatform);
  const currentLang = currentPlatform?.lang || 'ko';

  // 플랫폼별 입점 여부에 따른 필터링된 매핑 리스트
  const filteredMappings = useMemo(() => {
    return mappings.filter(m => isBrandOnPlatform(m.name, activePlatform));
  }, [mappings, activePlatform]);

  const dynamicReviews = useMemo(() => {
    if (!selectedBrand) return { positive: [], negative: [] };
    return generateDynamicReviews(selectedBrand, currentLang);
  }, [selectedBrand, currentLang]);

  const mockData = useMemo(() => {
    return filteredMappings.map(m => {
      // 플랫폼 ID를 시드로 사용하여 플랫폼마다 다른 데이터 생성
      const seed = activePlatform.length + (m.name?.length || 0);
      const getVal = (base, range) => Math.round(base + (Math.sin(seed) * 0.5 + 0.5) * range);

      return {
        name: m.name || '미지정 브랜드',
        reviews: getVal(500, 5000),
        salesVolume: getVal(1000, 10000),
        seoScore: getVal(60, 35),
        rating: (3.5 + (Math.cos(seed) * 0.5 + 0.5) * 1.5).toFixed(1),
        trend: Math.sin(seed) > 0 ? 'up' : 'down',
        trendValue: (Math.abs(Math.sin(seed)) * 15).toFixed(1)
      };
    });
  }, [filteredMappings, activePlatform, country]);

  return (
    <div className="shopping-dashboard">
      <KeywordMapping mappings={mappings} onMappingsChange={onMappingsChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '24px' }}>
        <div className="region-selector" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-toggle ${region === 'domestic' ? 'active' : ''}`} 
            onClick={() => { setRegion('domestic'); setActivePlatform(DOMESTIC_PLATFORMS[0].id); setSelectedBrand(null); }}
          >
            🇰🇷 국내 쇼핑몰
          </button>
          <button 
            className={`btn-toggle ${region === 'global' ? 'active' : ''}`} 
            onClick={() => { setRegion('global'); setActivePlatform(GLOBAL_PLATFORMS[0].id); setSelectedBrand(null); }}
          >
            🌐 해외 쇼핑몰
          </button>
        </div>

        {region === 'global' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>분석 국가:</span>
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'white' }}
            >
              <option value="Global">Global All</option>
              <option value="USA">🇺🇸 USA</option>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="UK">🇬🇧 UK</option>
              <option value="China">🇨🇳 China</option>
              <option value="SE Asia">🌏 SE Asia</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => { setActivePlatform(p.id); setSelectedBrand(null); }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: activePlatform === p.id ? 'var(--color-primary)' : 'var(--border-color)',
              background: activePlatform === p.id ? 'var(--bg-secondary)' : 'white',
              color: activePlatform === p.id ? 'var(--color-primary)' : 'var(--text-primary)',
              fontWeight: activePlatform === p.id ? 700 : 400,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {mockData.map(data => (
          <div 
            key={data.name} 
            className={`card ${selectedBrand === data.name ? 'active' : ''}`} 
            onClick={() => setSelectedBrand(selectedBrand === data.name ? null : data.name)}
            style={{ 
              padding: '20px', 
              cursor: 'pointer',
              border: selectedBrand === data.name ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
              transform: selectedBrand === data.name ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{data.name}</h3>
              <span style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                background: data.trend === 'up' ? '#ecfdf5' : '#fef2f2',
                color: data.trend === 'up' ? '#059669' : '#dc2626',
                fontWeight: 600
              }}>
                {data.trend === 'up' ? '▲' : '▼'} {data.trendValue}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>누적 리뷰 수 ({country})</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.reviews.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>건</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>추정 판매량</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.salesVolume.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>개</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>고객 평점</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>⭐ {data.rating}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>쇼핑 SEO 점수</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{data.seoScore} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>점</span></div>
              </div>
            </div>
          </div>
        ))}
        {mockData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>해당 플랫폼에 입점 데이터가 없습니다.</p>
            <p style={{ fontSize: '0.9rem' }}>브랜드 키워드를 확인하거나 다른 플랫폼을 선택해주세요.</p>
          </div>
        )}
      </div>

      {selectedBrand && (
        <div className="slide-in" style={{ marginTop: '40px', borderTop: '2px solid var(--border-color)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
            📊 {selectedBrand} 고객 리뷰 분석 ({currentPlatform.name} - {region === 'global' ? country : 'Korea'})
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card" style={{ padding: '20px', borderTop: '4px solid var(--color-success)' }}>
              <h4 style={{ color: 'var(--color-success)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🟢 Positive Reviews (Last 3 Days)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dynamicReviews.positive.map(rev => (
                  <div key={rev.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rev.author}</span>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{rev.content}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{rev.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px', borderTop: '4px solid var(--color-danger)' }}>
              <h4 style={{ color: 'var(--color-danger)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🔴 Negative Reviews (Last 3 Days)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {dynamicReviews.negative.map(rev => (
                  <div key={rev.id} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{rev.author}</span>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{rev.content}</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{rev.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
