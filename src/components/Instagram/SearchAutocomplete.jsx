import { useState, useMemo } from 'react';
import { generateAutocompleteData } from '../../utils/demoData';

export default function SearchAutocomplete({ brand }) {
  const [keyword, setKeyword] = useState(brand?.name || '브랜드');
  
  // 브랜드 변경 시 키워드 동기화
  useMemo(() => {
    if (brand?.name) setKeyword(brand.name);
  }, [brand]);

  const suggestions = useMemo(() => generateAutocompleteData(keyword), [keyword]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.2rem' }}>🔍</div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>시드 키워드 (브랜드 매핑 기준)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', width: '200px', fontSize: '0.9rem', fontWeight: 700 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>관련 자동완성 및 검색어 네트워크 분석 중</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>현재 인스타그램 검색 추천어</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>추천어</th>
                <th>유형</th>
                <th>트렌드 지수</th>
                <th>전주 대비</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.suggestion}</td>
                  <td>
                    <span style={{
                      fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                      background: s.type === '해시태그' ? '#e3f2fd' : s.type === '계정' ? '#f3e8fd' : '#f5f5f5',
                      color: s.type === '해시태그' ? '#1565c0' : s.type === '계정' ? '#7b1fa2' : '#666'
                    }}>
                      {s.type}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#f0f0f0', height: '6px', borderRadius: '3px' }}>
                        <div style={{ width: `${s.score}%`, background: 'var(--color-primary)', height: '100%', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem' }}>{s.score}</span>
                    </div>
                  </td>
                  <td>{s.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            ※ 개인화·위치·계정 이력 영향을 배제한 익명 세션 기준 추천어입니다.
          </p>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🕸️</div>
            <p>네트워크 연관도 시각화 차트 영역</p>
            <p style={{ fontSize: '0.8rem' }}>(D3.js / Network Chart)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
