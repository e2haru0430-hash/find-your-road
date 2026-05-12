import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { COLORS } from '../../utils/constants';

export default function TrendChart({ data, keywords, title, badgeClass, badgeText, period }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = data.map(d => d.date);
    const datasets = (keywords || []).map((kw, i) => ({
      label: kw,
      data: data.map(d => d[kw] || 0),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '18',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
    }));

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16, font: { size: 11, family: 'Noto Sans KR' } } },
          tooltip: {
            backgroundColor: '#1a1a2e',
            titleFont: { family: 'Noto Sans KR' },
            bodyFont: { family: 'Noto Sans KR' },
            cornerRadius: 8,
            padding: 12,
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
          y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 10 } }, beginAtZero: true },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, keywords]);

  return (
    <div className="trend-section fade-in">
      <div className="trend-header">
        <span className="trend-title">{title || '쿼리 트렌드'}</span>
        <span className="trend-unit">(단위: 검색수)</span>
        {badgeText && <span className={`trend-badge ${badgeClass || ''}`}>{badgeText}</span>}
        <button className="btn-link">🔗 구글 트렌드 함께 보기</button>
        <button className="btn-download">⬇ 데이터 다운</button>
      </div>
      {period && <div className="trend-period">기준 기간: {period}</div>}
      <div className="chart-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
