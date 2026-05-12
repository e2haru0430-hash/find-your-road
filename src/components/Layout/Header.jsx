export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-nav">
          <span style={{ fontWeight: 700, fontSize: '0.92rem', marginRight: '12px' }}>Find your Road</span>
          <button className="header-nav-item">소개</button>
          <button className="header-nav-item active">
            Query <span className="header-badge">Beta</span>
          </button>
          <button className="header-nav-item" style={{ color: 'var(--text-muted)' }}>
            다양한 솔루션 출시 예정
          </button>
        </div>
      </div>
      <div className="header-right">
        <span className="header-version">v1.0.0</span>
      </div>
    </header>
  );
}
