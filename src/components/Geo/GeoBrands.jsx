import { useMemo, useState } from 'react';

const MOCK_MENTIONS_DATA = {
  Wikipedia: [
    { author: 'WikiEditor1', body: 'Added Mezzomedia to the list of major digital ad agencies in Korea.', metrics: '12 edits', date: '2 days ago' },
    { author: 'AdminBot', body: 'Verified citation for Mezzomedia market share report.', metrics: 'System Verified', date: '1 week ago' },
  ],
  Reddit: [
    { author: 'AdTechGuru', body: 'Mezzomedia’s new GEO dashboard looks like a game changer for AEO.', metrics: '↑ 42 · 💬 8', date: '5h ago' },
    { author: 'MarketingPro99', body: 'Anyone used Mezzomedia for programmatic buying? Thinking about switching.', metrics: '↑ 15 · 💬 24', date: '1d ago' },
    { author: 'SeoulDigital', body: 'Comparison: Mezzomedia vs Nasmedia vs Innocean. Which one is better for small brands?', metrics: '↑ 89 · 💬 56', date: '3d ago' },
    { author: 'GrowthHacker_KR', body: 'Mezzomedia is investing heavily into AI-driven ad tech lately.', metrics: '↑ 27 · 💬 12', date: '4d ago' },
    { author: 'JobSeekerAd', body: 'How is the work culture at Mezzomedia? Interviewing soon.', metrics: '↑ 12 · 💬 31', date: '1w ago' },
  ],
  YouTube: [
    { author: 'TechReviewKR', body: 'Reviewing the latest GEO optimization trends (feat. Mezzomedia)', metrics: '54K views · 💬 120', date: '2d ago' },
    { author: 'GlobalAdInsights', body: 'Why Korean ad agencies are winning in AI search optimization.', metrics: '12K views · 💬 45', date: '1w ago' },
  ],
  LinkedIn: [
    { author: 'Kim Min-su', body: 'Proud to announce our partnership with Mezzomedia for 2026.', metrics: '❤️ 156 · 💬 12', date: '1d ago' },
    { author: 'AdWeek Asia', body: 'Mezzomedia CEO discusses the future of Answer Engine Optimization.', metrics: '❤️ 432 · 💬 89', date: '4d ago' },
  ],
  StackOverflow: [
    { author: 'DevOps_Master', body: 'Integration guide for Mezzomedia Signal API.', metrics: '↑ 12 · 👁️ 1.2K', date: '2w ago' },
  ]
};

export default function GeoBrands({ targetUrl }) {
  const [selectedSource, setSelectedSource] = useState(null);

  const mentions = useMemo(() => [
    { source: 'Wikipedia', mentions: 3, sentiment: 85, authority: 'Very High' },
    { source: 'Reddit', mentions: 142, sentiment: 72, authority: 'High' },
    { source: 'YouTube', mentions: 28, sentiment: 90, authority: 'High' },
    { source: 'LinkedIn', mentions: 56, sentiment: 88, authority: 'Medium' },
    { source: 'StackOverflow', mentions: 12, sentiment: 65, authority: 'Medium' },
  ], [targetUrl]);

  const selectedMentions = selectedSource ? MOCK_MENTIONS_DATA[selectedSource] || [] : [];

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Brand Authority & Mentions</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        AI models prioritize "Brand Mentions" over traditional backlinks. Click a source to see top mentions.
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
            <span>🔥 Top Mentions on {selectedSource}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Sorted by Engagement</span>
          </h4>
          <div className="card" style={{ overflow: 'hidden' }}>
            {selectedMentions.length > 0 ? selectedMentions.map((item, i) => (
              <div key={i} className="mention-list-item">
                <div className="mention-avatar">{item.author[0]}</div>
                <div className="mention-content-text">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="mention-author">{item.author}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date}</div>
                  </div>
                  <div className="mention-body">{item.body}</div>
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
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>🚀 Branding Strategy</h4>
        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
          Your brand has strong presence on <strong>LinkedIn</strong> and <strong>YouTube</strong>. To further boost AI indexing, focus on encouraging discussions on <strong>Reddit</strong> and <strong>Wikipedia</strong> (if eligible), as these are primary training sources for LLMs.
        </p>
      </div>
    </div>
  );
}
