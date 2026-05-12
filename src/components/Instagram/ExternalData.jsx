import { useMemo } from 'react';
import { generateExternalComparison } from '../../utils/demoData';

export default function ExternalData() {
  const data = useMemo(() => generateExternalComparison('테스트'), []);

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>크로스플랫폼 데이터 결합 검증</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        인스타그램 단독 트렌드의 한계를 보완하기 위해 외부 검색 데이터를 함께 비교합니다.
      </p>

      <table className="data-table" style={{ marginBottom: '30px' }}>
        <thead>
          <tr>
            <th>데이터 소스</th>
            <th>분석 역할</th>
            <th>현재 상대적 지수 (0~100)</th>
            <th>트렌드</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 600 }}>{row.source}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{row.role}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, background: '#f0f0f0', height: '6px', borderRadius: '3px' }}>
                    <div style={{ width: `${row.score}%`, background: 'var(--color-navy)', height: '100%', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', width: '20px' }}>{row.score}</span>
                </div>
              </td>
              <td>{row.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📈</div>
          <p>멀티플랫폼 트렌드 오버레이 차트</p>
          <p style={{ fontSize: '0.8rem' }}>(네이버 vs 구글 vs 틱톡 vs 인스타 지수 동시 비교)</p>
        </div>
      </div>
    </div>
  );
}
