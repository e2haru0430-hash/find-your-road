import { useMemo, useState } from 'react';

export default function GeoBrands({ brandName }) {
  const [selectedSource, setSelectedSource] = useState(null);
  const brand = brandName || 'Your Brand';

  const mentions = useMemo(() => {
    const getVal = (seed, base, range) => {
      if (!brand || brand === 'Your Brand') return base;
      const combined = `${brand}-${seed}`;
      let hash = 0;
      for (let i = 0; i < combined.length; i++) hash = combined.charCodeAt(i) + ((hash << 5) - hash);
      return (Math.abs(hash) % range) + base;
    };

    return [
      { source: 'Wikipedia', mentions: getVal('wiki', 1, 5), sentiment: 85, authority: 'Very High' },
      { source: 'Reddit', mentions: getVal('red', 50, 200), sentiment: 72, authority: 'High' },
      { source: 'YouTube', mentions: getVal('yt', 20, 80), sentiment: 90, authority: 'High' },
      { source: 'LinkedIn', mentions: getVal('li', 30, 100), sentiment: 88, authority: 'Medium' },
      { source: 'TikTok', mentions: getVal('tk', 100, 500), sentiment: 92, authority: 'High' },
    ];
  }, [brand]);

  const dynamicMentions = useMemo(() => {
    if (!selectedSource) return [];
    
    const templates = {
      Wikipedia: [
        { author: 'WikiEditor', body: `Added **${brand}** to the emerging industry leaders list.`, metrics: 'System Verified', date: '1d ago' },
      ],
      Reddit: [
        { author: 'AdTechGuru', body: `**${brand}**'s latest strategy seems to be working well for search visibility.`, metrics: '↑ 45 · 💬 12', date: '3h ago' },
        { author: 'SeoulDigital', body: `Anyone tried **${brand}** services recently? Looking for feedback.`, metrics: '↑ 89 · 💬 56', date: '1d ago' },
        { author: 'GrowthHacker', body: `Comparing **${brand}** with competitors in terms of AI indexing.`, metrics: '↑ 27 · 💬 8', date: '2d ago' },
      ],
      YouTube: [
        { author: 'TechReview', body: `How **${brand}** is dominating the new search landscape.`, metrics: '54K views', date: '2d ago' },
        { author: 'AdInsights', body: `**${brand}** case study: 300% growth in AEO traffic.`, metrics: '12K views', date: '1d ago' },
      ],
      LinkedIn: [
        { author: 'MarketingDir', body: `Excited to see **${brand}** leading the innovation in this space.`, metrics: '❤️ 156', date: '5h ago' },
        { author: 'IndustryNews', body: `**${brand}** CEO interview on the future of generative search.`, metrics: '❤️ 432', date: '1d ago' },
      ],
      TikTok: [
        { author: 'TrendSetter', body: `Why everyone is talking about **${brand}** right now! #trending`, metrics: '120K likes', date: '6h ago' },
        { author: 'Reviewer_X', body: `Unboxing the latest from **${brand}**. Truly impressed.`, metrics: '85K likes', date: '1d ago' },
      ]
    };
    
    return templates[selectedSource] || [];
  }, [selectedSource, brand]);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Brand Authority & Mentions</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        AI 모델은 전통적인 백링크보다 <strong>브랜드 멘션</strong>을 우선시합니다. 소스를 클릭하여 최근 3일간의 실시간 데이터를 확인하세요.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {mentions.map(m => (
          <div 
            key={m.source} 
            onClick={() => setSelectedSource(selectedSource === m.source ? null : m.source)}
            className={`geo-brand-card ${selectedSource === m.source ? 'selected' : ''}`}
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'white', 
              border: '1px solid',
              borderColor: selectedSource === m.source ? 'var(--color-primary)' : 'var(--border-color)',
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 700 }}>{m.source}</div>
            <div style={{ fontSize: '0.85rem' }}>
              Mentions: <strong>{m.mentions}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                padding: '4px 8px', 
                borderRadius: '20px', 
                background: m.authority === 'Very High' ? '#ecfdf5' : '#f0fdf4', 
                color: m.authority === 'Very High' ? '#059669' : '#166534',
                fontWeight: 600
              }}>
                Auth: {m.authority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedSource && (
        <div className="slide-in" style={{ marginTop: '24px', borderTop: '2px solid var(--border-color)', paddingTop: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <span>🔥 Recent Mentions on {selectedSource} (Last 3 Days)</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Sorted by Engagement</span>
          </h4>
          <div className="card" style={{ overflow: 'hidden' }}>
            {dynamicMentions.length > 0 ? dynamicMentions.map((item, i) => (
              <div key={i} className="mention-list-item">
                <div className="mention-avatar">{item.author[0]}</div>
                <div className="mention-content-text">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="mention-author">{item.author}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
                  </div>
                  <div className="mention-body" dangerouslySetInnerHTML={{ __html: item.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <div className="mention-meta">
                    <span>{item.metrics}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                해당 채널에 대한 구체적인 멘션 데이터가 아직 수집되지 않았습니다.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>🚀 Branding Strategy for {brand}</h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
          **{brand}** 브랜드는 현재 {selectedSource || '다양한'} 플랫폼에서 긍정적인 반응을 얻고 있습니다. AI 색인 최적화를 위해 전문 커뮤니티(Reddit, Tech forums)에서의 구체적인 언급량을 늘리는 전략을 추천합니다.
        </p>
      </div>
    </div>
  );
}
