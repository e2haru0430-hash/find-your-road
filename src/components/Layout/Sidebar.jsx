import { useState } from 'react';

const INITIAL_DASHBOARDS = [
  { id: 'brand-query', name: 'Brand Query Trend', icon: '📊', locked: true },
];

export default function Sidebar({ activePage, onNavigate, dashboards, onAddDashboard, onDeleteDashboard, onRenameDashboard }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const allDashboards = dashboards || INITIAL_DASHBOARDS;

  const handleRename = (id) => {
    if (editName.trim()) {
      onRenameDashboard?.(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛤️</div>
        <div className="logo-text">
          <h1>Find your Road</h1>
          <span>Solutions Hub</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">MY DASHBOARDS</div>

        {allDashboards.map((db) => (
          <button
            key={db.id}
            className={`nav-item ${activePage === db.id ? 'active' : ''}`}
            onClick={() => onNavigate(db.id)}
          >
            <div className="nav-item-editable">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="nav-icon">{db.icon || '📊'}</span>
                {editingId === db.id ? (
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleRename(db.id)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(db.id)}
                    autoFocus
                    style={{ width: '100px', padding: '2px 6px', fontSize: '0.82rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span>{db.name}</span>
                )}
              </span>
              {!db.locked && (
                <span className="nav-actions">
                  <button onClick={e => { e.stopPropagation(); setEditingId(db.id); setEditName(db.name); }} title="이름 수정">✏️</button>
                  <button onClick={e => { e.stopPropagation(); onDeleteDashboard?.(db.id); }} title="삭제">✕</button>
                </span>
              )}
              {db.locked && <span style={{ opacity: 0.4, fontSize: '0.75rem' }}>🔒</span>}
            </div>
          </button>
        ))}

        <button className="nav-item" onClick={() => onNavigate('new-dashboard')}>
          <span className="nav-icon">➕</span>
          <span>대시보드 추가</span>
        </button>

        <div className="nav-divider" />

        <button
          className={`nav-item ${activePage === 'instagram' ? 'active' : ''}`}
          onClick={() => onNavigate('instagram')}
        >
          <span className="nav-icon">📷</span>
          <span>인스타그램 분석</span>
        </button>

        <button
          className={`nav-item ${activePage === 'shopping' ? 'active' : ''}`}
          onClick={() => onNavigate('shopping')}
        >
          <span className="nav-icon">🛍️</span>
          <span>쇼핑몰 인사이트</span>
        </button>

        <button
          className={`nav-item ${activePage === 'geo' ? 'active' : ''}`}
          onClick={() => onNavigate('geo')}
        >
          <span className="nav-icon">🤖</span>
          <span>GEO 분석 (생성형 AI)</span>
        </button>

        <div className="nav-divider" />

        <button
          className={`nav-item ${activePage === 'guide' ? 'active' : ''}`}
          onClick={() => onNavigate('guide')}
        >
          <span className="nav-icon">ℹ️</span>
          <span>데이터 추정 방식 안내</span>
        </button>
      </nav>
    </aside>
  );
}
