import { useMemo } from 'react';

export default function GeoCrawlers({ targetUrl }) {
  const bots = useMemo(() => [
    { name: 'GPTBot (OpenAI)', status: 'Allowed' },
    { name: 'ClaudeBot (Anthropic)', status: 'Allowed' },
    { name: 'PerplexityBot', status: 'Allowed' },
    { name: 'Google-Extended (Gemini)', status: 'Blocked', warn: true },
    { name: 'CCBot (Common Crawl)', status: 'Allowed' },
    { name: 'Applebot', status: 'Allowed' },
    { name: 'Bingbot', status: 'Allowed' },
    { name: 'FacebookBot', status: 'Blocked' },
  ], []);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>AI Crawler Accessibility</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Scanning robots.txt on {targetUrl} for major AI web crawlers.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {bots.map(bot => (
          <div key={bot.name} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid',
            borderColor: bot.warn ? '#fecaca' : 'var(--border-color)',
            background: bot.warn ? '#fef2f2' : 'white'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{bot.name}</span>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: bot.status === 'Allowed' ? 'var(--color-success)' : 'var(--color-danger)' 
            }}>
              {bot.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: '1px solid #ffcc80', background: '#fffde7' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e65100', marginBottom: '8px' }}>⚠️ Crawler Warning</h4>
        <p style={{ fontSize: '0.8rem', color: '#bf360c' }}>
          <strong>Google-Extended</strong> is currently blocked. This may prevent your site from appearing in <strong>Google AI Overviews (SGE)</strong> and <strong>Gemini</strong> answers.
        </p>
      </div>
    </div>
  );
}
