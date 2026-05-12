import { useState, useMemo } from 'react';
import KeywordMapping from '../Dashboard/KeywordMapping';
import { isBrandOnPlatform } from '../../utils/keywordHelper';

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

const COUNTRIES = [
  { id: 'USA', name: 'USA', flag: '🇺🇸', weight: 1.0 },
  { id: 'Japan', name: 'Japan', flag: '🇯🇵', weight: 0.6 },
  { id: 'UK', name: 'UK', flag: '🇬🇧', weight: 0.4 },
  { id: 'China', name: 'China', flag: '🇨🇳', weight: 1.5 },
  { id: 'SE Asia', name: 'SE Asia', flag: '🌏', weight: 0.8 }
];

export default function ShoppingMallDashboard({ mappings, onMappingsChange }) {
  const [region, setRegion] = useState('domestic');
  const [activePlatform, setActivePlatform] = useState(DOMESTIC_PLATFORMS[0].id);
  const [country, setCountry] = useState('Global');

  const platforms = region === 'domestic' ? DOMESTIC_PLATFORMS : GLOBAL_PLATFORMS;

  // 플랫폼별 입점 여부에 따른 필터링된 매핑 리스트
  const filteredMappings = useMemo(() => {
    return mappings.filter(m => isBrandOnPlatform(m.name, activePlatform));
  }, [mappings, activePlatform]);

  const mockData = useMemo(() => {
    return filteredMappings.map(m => {
      const brandSeed = (m.name?.length || 0);
      const platformSeed = activePlatform.length;

      // 국가별 개별 수치 생성 함수
      const getCountryVal = (cId, cWeight, seedOffset, base, range) => {
        const seed = brandSeed + platformSeed + cId.length + seedOffset;
        return Math.round((base + (Math.sin(seed) * 0.5 + 0.5) * range) * cWeight);
      };

      if (region === 'global' && country === 'Global') {
        // Global ALL일 경우 모든 국가의 합산 데이터 생성
        let totalReviews = 0;
        let totalSales = 0;
        let totalRating = 0;
        
        COUNTRIES.forEach(c => {
          totalReviews += getCountryVal(c.id, c.weight, 10, 500, 2000);
          totalSales += getCountryVal(c.id, c.weight, 20, 1000, 5000);
          totalRating += (3.5 + (Math.cos(brandSeed + c.id.length) * 0.5 + 0.5) * 1.5);
        });

        return {
          name: m.name || '미지정 브랜드',
          reviews: totalReviews,
          salesVolume: totalSales,
          seoScore: 85,
          rating: (totalRating / COUNTRIES.length).toFixed(1),
          trend: 'up',
          trendValue: '12.5'
        };
      } else {
        // 단일 국가 또는 국내 데이터
        const weight = region === 'domestic' ? 1.0 : (COUNTRIES.find(c => c.id === country)?.weight || 1.0);
        const currentId = region === 'domestic' ? 'KR' : country;

        return {
          name: m.name || '미지정 브랜드',
          reviews: getCountryVal(currentId, weight, 10, 800, 3000),
          salesVolume: getCountryVal(currentId, weight, 20, 1500, 8000),
          seoScore: getCountryVal(currentId, 1.0, 30, 60, 35),
          rating: (3.5 + (Math.cos(brandSeed + currentId.length) * 0.5 + 0.5) * 1.5).toFixed(1),
          trend: Math.sin(brandSeed + platformSeed) > 0 ? 'up' : 'down',
          trendValue: (Math.abs(Math.sin(brandSeed)) * 15).toFixed(1)
        };
      }
    });
  }, [filteredMappings, activePlatform, country, region]);

  return (
    <div className="shopping-dashboard">
      <KeywordMapping mappings={mappings} onMappingsChange={onMappingsChange} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '24px' }}>
        <div className="region-selector" style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-toggle ${region === 'domestic' ? 'active' : ''}`} 
            onClick={() => { setRegion('domestic'); setActivePlatform(DOMESTIC_PLATFORMS[0].id); setCountry('Global'); }}
          >
            🇰🇷 국내 쇼핑몰
          </button>
          <button 
            className={`btn-toggle ${region === 'global' ? 'active' : ''}`} 
            onClick={() => { setRegion('global'); setActivePlatform(GLOBAL_PLATFORMS[0].id); setCountry('Global'); }}
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
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'white', fontWeight: 700 }}
            >
              <option value="Global">🌏 Global ALL (Total)</option>
              {COUNTRIES.map(c => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => { setActivePlatform(p.id); }}
            style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: '1px solid',
              borderColor: activePlatform === p.id ? 'var(--color-primary)' : 'var(--border-color)',
              background: activePlatform === p.id ? 'var(--color-primary)' : 'white',
              color: activePlatform === p.id ? 'white' : 'var(--text-primary)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activePlatform === p.id ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {mockData.map(data => (
          <div 
            key={data.name} 
            className="card"
            style={{ 
              padding: '24px', 
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>BRAND ASSET</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy)' }}>{data.name}</h3>
              </div>
              <span style={{ 
                fontSize: '0.8rem', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                background: data.trend === 'up' ? '#ecfdf5' : '#fef2f2',
                color: data.trend === 'up' ? '#059669' : '#dc2626',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {data.trend === 'up' ? '↗' : '↘'} {data.trendValue}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>누적 리뷰 (Total)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{data.reviews.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>건</span></div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>추정 판매량</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{data.salesVolume.toLocaleString()} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>개</span></div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>만족도 (Rating)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>⭐ {data.rating}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>쇼핑 SEO 지수</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>{data.seoScore} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>점</span></div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              💡 <strong>Insight:</strong> {country === 'Global' ? '전 세계 마켓' : `${country} 시장`}에서 {data.name} 브랜드는 경쟁사 대비 {data.reviews > 10000 ? '높은 신뢰도' : '성장 잠재력'}를 보유하고 있습니다.
            </div>
          </div>
        ))}
        
        {mockData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)', background: 'white', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>분석 대상 브랜드가 없습니다.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>상단 '매핑 설정 편집'을 통해 브랜드를 추가하거나,<br/>다른 플랫폼을 선택해 주세요.</p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '40px', padding: '24px', background: 'var(--color-navy)', color: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(30, 41, 59, 0.2)' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🛡️ {region === 'domestic' ? '국내' : '글로벌'} 쇼핑 플랫폼 자산 보호 전략
        </h4>
        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.7' }}>
          수집된 <strong>{mockData.reduce((sum, d) => sum + d.reviews, 0).toLocaleString()}건</strong>의 누적 데이터 분석 결과, {activePlatform} 내 브랜드 권위(Authority) 유지가 핵심입니다. 
          {region === 'global' ? '국가별 규제 및 통관 정보를 기반으로 한 상세 페이지 최적화' : '네이버/쿠팡의 알고리즘 변화에 대응하는 키워드 가시성 확보'} 전략을 제안합니다.
        </p>
      </div>
    </div>
  );
}
