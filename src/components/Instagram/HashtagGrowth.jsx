import { useState, useMemo } from 'react';
import TrendChart from '../Dashboard/TrendChart';
import { generateHashtagData } from '../../utils/demoData';

export default function HashtagGrowth() {
  const [input, setInput] = useState('');
  const [hashtags, setHashtags] = useState(['#리쥬란', '#PDRN', '#마이크로바이옴']);

  const handleAdd = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      let tag = input.trim();
      if (!tag.startsWith('#')) tag = '#' + tag;
      if (!hashtags.includes(tag)) setHashtags([...hashtags, tag]);
      setInput('');
    }
  };

  const removeTag = (tag) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const rawData = useMemo(() => generateHashtagData(hashtags), [hashtags]);
  const chartData = useMemo(() => {
    const dates = [...new Set(rawData.map(d => d.date))].sort();
    return dates.map(date => {
      const row = { date };
      hashtags.forEach(tag => {
        const item = rawData.find(d => d.date === date && d.hashtag === tag);
        row[tag] = item ? item.postCount : 0;
      });
      return row;
    });
  }, [rawData, hashtags]);

  const latestStats = useMemo(() => {
    return hashtags.map(tag => {
      const data = rawData.filter(d => d.hashtag === tag).sort((a,b) => b.date.localeCompare(a.date));
      return data[0] || null;
    }).filter(Boolean);
  }, [rawData, hashtags]);

  return (
    <div className="fade-in">
      <div className="hashtag-input-area">
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>분석할 해시태그 추가</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleAdd}
            placeholder="예: #선크림추천 (엔터로 추가)"
            style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', width: '250px' }}
          />
        </div>
        <div className="hashtag-chips">
          {hashtags.map(tag => (
            <span key={tag} className="hashtag-chip">
              {tag} <span className="remove" onClick={() => removeTag(tag)}>✕</span>
            </span>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {latestStats.map(stat => (
          <div key={stat.hashtag} className="kpi-card">
            <div className="kpi-label">{stat.hashtag} 누적 게시물</div>
            <div className="kpi-value">{stat.postCount.toLocaleString()}</div>
            <div className="kpi-change up">일평균 +{stat.dailyNew}건 증가</div>
          </div>
        ))}
      </div>

      <TrendChart
        data={chartData}
        keywords={hashtags}
        title="일자별 해시태그 게시물 누적 추이"
        badgeClass="instagram"
        badgeText="INSTAGRAM HASHTAG"
      />
    </div>
  );
}
