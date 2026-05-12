import { useState } from 'react';

export default function GeoSchema({ targetUrl }) {
  const [activeTab, setActiveTab] = useState('analysis');

  const schemaAnalysis = [
    { type: 'Organization', status: 'Found', clarity: 'High' },
    { type: 'FAQPage', status: 'Missing', clarity: 'N/A', priority: 'High' },
    { type: 'Product', status: 'Incomplete', clarity: 'Medium', priority: 'Medium' },
    { type: 'BreadcrumbList', status: 'Found', clarity: 'Low' },
  ];

  const generatedSchema = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What services does Mezzomedia provide?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Mezzomedia provides digital marketing solutions, data analytics, and GEO optimization."
    }
  }]
}`;

  return (
    <div className="geo-tool-result">
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Schema.org Entity Analysis</h3>

      <div className="platform-tabs" style={{ marginBottom: '20px' }}>
        <button className={`platform-tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>Analysis</button>
        <button className={`platform-tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>Generate Code</button>
      </div>

      {activeTab === 'analysis' ? (
        <div className="slide-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Schema Type</th>
                <th>Status</th>
                <th>AI Clarity</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {schemaAnalysis.map(s => (
                <tr key={s.type}>
                  <td style={{ fontWeight: 600 }}>{s.type}</td>
                  <td style={{ color: s.status === 'Found' ? 'var(--color-success)' : 'var(--color-danger)' }}>{s.status}</td>
                  <td>{s.clarity}</td>
                  <td style={{ fontWeight: 700, color: s.priority === 'High' ? 'var(--color-warning)' : 'inherit' }}>{s.priority || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="slide-in">
          <pre style={{ 
            background: '#1e293b', 
            color: '#e2e8f0', 
            padding: '20px', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            lineHeight: '1.4',
            fontFamily: 'monospace'
          }}>
            {generatedSchema}
          </pre>
          <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            💡 Insert this <code>&lt;script type="application/ld+json"&gt;</code> into your page's head section.
          </p>
        </div>
      )}
    </div>
  );
}
