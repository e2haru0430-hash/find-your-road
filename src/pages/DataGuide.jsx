export default function DataGuide() {
  return (
    <div className="guide-page fade-in">
      <h1>데이터 추정 방식 안내</h1>
      <p className="guide-subtitle">Find your Road가 플랫폼별 데이터를 수집하고 분석하는 원리를 안내합니다.</p>

      <div className="guide-highlight">
        <div className="highlight-icon">⚡</div>
        <div>
          <p>본 플랫폼은 각 매체의 공식 API와 스크래핑 기법을 혼합하여 데이터를 제공하며, <strong>추정치와 상대 지수</strong>를 결합하여 트렌드 방향성을 제시합니다.</p>
        </div>
      </div>

      <div className="guide-item">
        <h3><span className="guide-icon">🟢</span> 네이버 검색/데이터랩</h3>
        <p>네이버 검색광고 API의 <span className="highlight">절대 수치(검색량)</span>와 데이터랩 API의 <span className="highlight">상대 지수(0~100)</span>를 결합하여 일간/주간/월간 조회수를 역산한 추정치입니다. 연령별(5세 단위) 및 성별 트렌드 분석에 최적화되어 있습니다.</p>
      </div>

      <div className="guide-item">
        <h3><span className="guide-icon">🔵</span> 구글 트렌드</h3>
        <p>구글 트렌드의 관심도(Interest Over Time) 지수를 사용합니다. 특정 기간 내 최고 검색량을 100으로 기준하여 <span className="highlight">상대적인 검색 빈도</span>를 나타냅니다. 글로벌 타겟 분석이나 웹/이미지/유튜브 섹션별 비교에 유용합니다.</p>
      </div>

      <div className="guide-item">
        <h3><span className="guide-icon">📷</span> 인스타그램 (SNS 반응)</h3>
        <p>인스타그램 데이터는 공식 검색 API가 제한적이므로, 주기적인 <strong>해시태그 게시물 수 수집</strong>과 <strong>인기 콘텐츠 반응(좋아요, 댓글 등)</strong>을 기반으로 콘텐츠 생산량 관점의 트렌드를 추정합니다. 검색 관심도와는 차이가 있을 수 있습니다.</p>
      </div>

      <div className="guide-item">
        <h3><span className="guide-icon">⏱️</span> 추정치 한계 및 갱신 주기</h3>
        <p>모든 데이터는 실시간 반영이 아니며 플랫폼별 캐싱 주기에 따라 <span className="highlight">전일(Yesterday) 기준</span>으로 업데이트됩니다. 수집 방식의 특성상 실제 수치와 오차가 발생할 수 있으므로, 정확한 수치보다는 <span className="highlight">상대적 비교 및 시계열 트렌드 방향성 검증</span> 목적으로 활용하시길 권장합니다.</p>
      </div>
    </div>
  );
}
