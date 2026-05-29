import { useState, useMemo, useEffect } from 'react';
import TrendChart from '../Dashboard/TrendChart';
import { generateMonthlyTrend } from '../../utils/keywordHelper';
import { detectIndustry, INDUSTRY_SUFFIXES } from '../../utils/industryKeywords';

function getInitialHashtags(brand) {
  const brandName = brand?.name || '미지정';
  const kwArray = brand?.keywords?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const detectionText = [brandName, ...kwArray].join(' ');
  const industry = detectIndustry(detectionText);
  const pool = INDUSTRY_SUFFIXES.ko[industry] || INDUSTRY_SUFFIXES.ko.general;
  // 해시태그용 상위 2개 (공백 없이 연결)
  return [`#${brandName}`, `#${brandName}${pool[0]}`, `#${brandName}${pool[1]}`];
}

export default function HashtagGrowth({ brand }) {
  const brandName = brand?.name || '미지정';
  const [input, setInput] = useState('');

  const [hashtags, setHashtags] = useState(() => getInitialHashtags(brand));

  useEffect(() => {
    setHashtags(getInitialHashtags(brand));
  }, [brand]);

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

  // 1개월(30일) 일별 트렌드 데이터 생성
  const chartData = useMemo(() => {
    // 각 해시태그별로 30일치 데이터를 생성하여 머지
    const allTrends = hashtags.map((tag, idx) => {
      // 브랜드 키워드는 기본값이 크고, 확장 키워드는 작게 설정 (합산 효과 시뮬레이션)
      const baseVal = idx === 0 ? 12000 : 3500 - (idx * 500);
      return generateMonthlyTrend(tag, baseVal);
    });

    const dates = allTrends[0].map(d => d.date);
    return dates.map((date, dayIdx) => {
      const row = { date };
      hashtags.forEach((tag, tagIdx) => {
        row[tag] = allTrends[tagIdx][dayIdx].value;
      });
      return row;
    });
  }, [hashtags]);

  const latestStats = useMemo(() => {
    return hashtags.map(tag => {
      const tagData = chartData.map(d => ({ date: d.date, val: d[tag] }));
      const last = tagData[tagData.length - 1];
      const prev = tagData[tagData.length - 2];
      return {
        hashtag: tag,
        postCount: last.val,
        dailyNew: last.val - prev.val
      };
    });
  }, [chartData, hashtags]);

  return (
    <div className="fade-in">
      <div className="hashtag-input-area">
        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>분석할 해시태그 추가 (최근 1개월 트렌드)</label>
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
            <div className="kpi-change up">전일 대비 +{stat.dailyNew}건 증가</div>
          </div>
        ))}
      </div>

      <TrendChart
        data={chartData}
        keywords={hashtags}
        title={`인스타그램 해시태그 확산 트렌드 (1개월 일별 기준)`}
        badgeClass="instagram"
        badgeText="REAL-TIME HASHTAG TRACKING"
      />
    </div>
  );
}
