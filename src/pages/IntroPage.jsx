export default function IntroPage({ onStart }) {
  return (
    <div className="intro-page fade-in">
      <div className="intro-icon">🔍</div>
      <h1 className="intro-title">Find your Road 멀티플랫폼 분석 솔루션</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
        네이버 데이터랩, 구글 트렌드, 인스타그램 등 다양한 플랫폼의 검색 트렌드와 콘텐츠 반응을 하나의 대시보드에서 분석하세요.
      </p>

      <div className="intro-features">
        <div className="intro-feature">
          <div className="feat-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>📊</div>
          <h3>통합 검색 트렌드 분석</h3>
          <p>각 플랫폼별 고유한 조회 설정(인구통계, 기기, 검색영역 등)을 반영하여 세밀한 트렌드 추이를 분석합니다.</p>
        </div>
        <div className="intro-feature">
          <div className="feat-icon" style={{ background: '#e3f2fd', color: '#1565c0' }}>📷</div>
          <h3>인스타그램 심층 분석</h3>
          <p>해시태그 증가량, 자동완성 검색어 변화, 콘텐츠 소비자 반응을 기반으로 SNS 트렌드를 도출합니다.</p>
        </div>
        <div className="intro-feature">
          <div className="feat-icon" style={{ background: '#fff3e6', color: '#ff7a00' }}>🎯</div>
          <h3>카테고리 매핑 커스텀</h3>
          <p>원하는 브랜드와 세부 검색 키워드를 자유롭게 매핑하여 나만의 분석 대시보드를 구성할 수 있습니다.</p>
        </div>
        <div className="intro-feature">
          <div className="feat-icon" style={{ background: '#f3e8fd', color: '#7b1fa2' }}>🔗</div>
          <h3>크로스플랫폼 데이터 결합</h3>
          <p>포털 검색량과 숏폼/SNS 반응 데이터를 결합하여 마케팅 가설을 다각도로 검증합니다.</p>
        </div>
      </div>

      <button className="btn-start" onClick={onStart}>대시보드 시작하기 →</button>
    </div>
  );
}
