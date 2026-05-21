import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { COLORS } from '../../utils/constants';

Chart.register(...registerables);

// tableData: 키워드별 검색량 테이블 (선택적, NaverDashboard에서 전달)
export default function TrendChart({ data, keywords, title, badgeClass, badgeText, period, tableData, rightContent, topContent }) {
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

  // ── Excel 다운로드 ────────────────────────────────────────────────────────────
  const handleExcelDownload = () => {
    if (!data || data.length === 0) return;

    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().slice(0, 10);

    // Sheet 1: 트렌드 차트 데이터
    const trendRows = data.map(row => {
      const r = { '날짜': row.date };
      (keywords || []).forEach(kw => { r[kw] = row[kw] || 0; });
      return r;
    });
    const wsTrend = XLSX.utils.json_to_sheet(trendRows);
    // 열 너비 설정
    wsTrend['!cols'] = [{ wch: 12 }, ...((keywords || []).map(() => ({ wch: 14 })))];
    XLSX.utils.book_append_sheet(wb, wsTrend, '트렌드 데이터');

    // Sheet 2: 키워드별 검색량 테이블 (tableData가 있을 경우)
    if (tableData && tableData.length > 0) {
      const kwRows = tableData.map(row => ({
        '키워드':        row.keyword,
        'PC 검색량':     row.pc_qc,
        '모바일 검색량':  row.mo_qc,
        '총 검색량':     row.total_qc,
        '경쟁도':        row.competition,
        '전월 대비(%)':  row.trend,
      }));
      const wsKw = XLSX.utils.json_to_sheet(kwRows);
      wsKw['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsKw, '키워드 검색량');
    }

    XLSX.writeFile(wb, `브랜드쿼리트렌드_${dateStr}.xlsx`);
  };

  // ── 차트 PDF 저장 ─────────────────────────────────────────────────────────────
  const handlePdfDownload = () => {
    if (!chartRef.current) return;

    // 고해상도 PNG로 추출
    const imgData = chartRef.current.toBase64Image('image/png', 1.0);
    const dateStr = new Date().toLocaleDateString('ko-KR');
    const chartTitle = title || '브랜드 쿼리 트렌드';

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    // A4 가로: 297 × 210 mm

    // 헤더
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, 297, 22, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(chartTitle, 14, 14);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`추출일: ${dateStr}`, 240, 14);

    // 차트 이미지 (여백 포함하여 삽입)
    pdf.addImage(imgData, 'PNG', 14, 28, 269, 155);

    // 하단 워터마크
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(7);
    pdf.text('Find Your Road — Brand Query Trend Report', 14, 205);

    pdf.save(`브랜드트렌드차트_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="trend-section fade-in">
      <div className="trend-header">
        <span className="trend-title">{title || '쿼리 트렌드'}</span>
        <span className="trend-unit">(단위: 검색수)</span>
        {badgeText && <span className={`trend-badge ${badgeClass || ''}`}>{badgeText}</span>}
        {rightContent}
        {/* Excel 다운로드 */}
        <button
          className="btn-download"
          onClick={handleExcelDownload}
          title="트렌드 데이터 및 키워드 검색량을 Excel로 다운로드"
          style={{ cursor: 'pointer' }}
        >
          📊 Excel 다운
        </button>

        {/* 차트 PDF 저장 */}
        <button
          className="btn-download"
          onClick={handlePdfDownload}
          title="차트 이미지를 PDF로 저장"
          style={{ cursor: 'pointer', marginLeft: '6px' }}
        >
          📄 PDF 저장
        </button>
      </div>

      {topContent}
      {period && <div className="trend-period">기준 기간: {period}</div>}
      <div className="chart-container">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
