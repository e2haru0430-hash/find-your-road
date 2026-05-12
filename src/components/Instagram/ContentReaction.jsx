import { useMemo } from 'react';
import { generateContentReaction } from '../../utils/demoData';

export default function ContentReaction() {
  const keywords = ['속건조', '장벽개선', 'PDRN', '마이크로바이옴', '리프팅', '저자극'];
  const data = useMemo(() => generateContentReaction(keywords), []);

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>주요 반응 키워드 분석 (캡션/댓글/릴스 기준)</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th>소비자 반응 키워드</th>
                <th>관련 게시물</th>
                <th>총 좋아요</th>
                <th>총 저장수</th>
                <th>인게이지먼트율</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{row.keyword}</td>
                  <td>{row.posts.toLocaleString()}</td>
                  <td>{row.likes.toLocaleString()}</td>
                  <td>{row.saves.toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{row.engagementRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            ※ 이 지표는 검색량이 아니며, 인스타그램 내 소비자 반응(좋아요/댓글/저장/공유)을 종합한 점수입니다.
          </p>
        </div>

        <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
            <p>키워드별 반응 구성비 (Stacked Bar Chart)</p>
            <p style={{ fontSize: '0.8rem' }}>(Chart.js Bar Chart)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
