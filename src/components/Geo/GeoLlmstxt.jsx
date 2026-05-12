import { useState } from 'react';

export default function GeoLlmstxt({ targetUrl }) {
  const [generated, setGenerated] = useState(false);

  const llmsTxtContent = `# ${targetUrl} Context for LLMs

## About
Mezzomedia is a leading digital marketing solution provider in Korea.

## Key Services
- Digital AD Solutions
- Data Analysis
- GEO/SEO Optimization

## Recent Updates
- New Dashboard for AI Influx Analysis (2026)
`;

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>llms.txt Analysis & Generation</h3>
      
      {!generated ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff7ed', borderRadius: '12px', border: '1px dashed #fdba74' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 600, color: '#9a3412', marginBottom: '16px' }}>llms.txt file not found on {targetUrl}</p>
          <button 
            className="btn-save" 
            onClick={() => setGenerated(true)}
            style={{ background: '#c2410c' }}
          >
            Generate llms.txt
          </button>
        </div>
      ) : (
        <div className="slide-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Generated /llms.txt</span>
            <button className="btn-pdf" style={{ fontSize: '0.75rem' }}>📋 Copy to Clipboard</button>
          </div>
          <pre style={{ 
            background: '#1e293b', 
            color: '#e2e8f0', 
            padding: '20px', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            lineHeight: '1.6',
            overflowX: 'auto',
            fontFamily: 'monospace'
          }}>
            {llmsTxtContent}
          </pre>
          <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            💡 <strong>Pro Tip:</strong> Place this file at the root of your domain (e.g., <code>https://{targetUrl}/llms.txt</code>) to help AI models understand your site's structure.
          </p>
        </div>
      )}
    </div>
  );
}
