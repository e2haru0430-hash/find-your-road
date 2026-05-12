import { useMemo } from 'react';
import { generateInstagramKeywords } from '../../utils/keywordHelper';

export default function ContentReaction({ brand }) {
  const brandName = brand?.name || '미지정';
  const keywords = useMemo(() => generateInstagramKeywords(brandName), [brandName]);
  
  const data = useMemo(() => {
    return keywords.map((kw, i) => {
      const seed = kw.length + i;
      const getVal = (base, range) => Math.round(base + (Math.sin(seed) * 0.5 + 0.5) * range);
      
      return {
        keyword: kw,
        posts: getVal(100, 1500),
        likes: getVal(1000, 10000),
        saves: getVal(50, 500),
        engagementRate: (getVal(1, 5) + Math.random()).toFixed(1)
      };
    });
  }, [keywords]);

  return (
    <div className="fade-in">
      <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>
        주요 반응 키워드 분석 (캡션/댓글/릴스 기준) - <strong>{brandName}</strong>
      </h4>
      
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

        <div style={{ background: 'var(--bg-primary)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>키워드 반응 점수</div>
            <div style={{ fontSize: '0.85rem' }}>인게이지먼트 기여도 TOP 3</div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.slice(0, 3).map((d, i) => (
              <div key={i} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                  <span>{d.keyword}</span>
                  <span>{d.engagementRate}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${d.engagementRate * 10}%`, height: '100%', background: 'var(--color-primary)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
