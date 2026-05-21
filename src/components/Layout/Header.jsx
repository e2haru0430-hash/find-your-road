export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-nav">
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Find your Road</span>
        </div>
      </div>
      <div className="header-right">
        <span className="header-version">v1.0.0</span>
      </div>
    </header>
  );
}
