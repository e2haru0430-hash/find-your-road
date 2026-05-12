import { useMemo } from 'react';

export default function GeoPlatforms({ targetUrl }) {
  const platformData = useMemo(() => [
    { 
      platform: 'ChatGPT', 
      logic: 'Focuses on long-form, conversational context.', 
      action: 'Ensure your URL content has clear headers and direct answers at the beginning of sections.' 
    },
    { 
      platform: 'Perplexity', 
      logic: 'Heavily relies on real-time search & citations.', 
      action: 'Focus on digital PR and backlinks from high-authority news sites.' 
    },
    { 
      platform: 'Google Gemini', 
      logic: 'Integrates with Google Search index & E-E-A-T.', 
      action: 'Optimize for traditional SEO first, then add schema for AI-specific entity recognition.' 
    },
    { 
      platform: 'Claude', 
      logic: 'Prioritizes nuanced and technical accuracy.', 
      action: 'Provide detailed whitepapers and technical documentation in /llms.txt.' 
    },
  ], [targetUrl]);

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Platform-Specific Optimization</h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {platformData.map(p => (
          <div key={p.platform} style={{ padding: '20px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-navy)', marginBottom: '8px' }}>{p.platform}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', fontStyle: 'italic' }}>"{p.logic}"</div>
            <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.6' }}>
              🎯 <strong>Key Action:</strong> {p.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
