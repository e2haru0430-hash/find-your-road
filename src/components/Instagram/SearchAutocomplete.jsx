import { useState, useMemo } from 'react';
import { generateAutocompleteData } from '../../utils/demoData';

export default function SearchAutocomplete() {
  const [keyword, setKeyword] = useState('선크림');
  const suggestions = useMemo(() => generateAutocompleteData(keyword), [keyword]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>시드 키워드</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', width: '200px' }}
          />
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
