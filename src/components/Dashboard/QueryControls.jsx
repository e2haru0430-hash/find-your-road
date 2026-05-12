import { useState } from 'react';
import { UNIT_OPTIONS, getDefaultDateRange } from '../../utils/constants';

export default function QueryControls({ onSettingsChange, settings }) {
  const dateRange = settings?.dateRange || getDefaultDateRange();
  const unit = settings?.unit || '일간';
  const compare = settings?.compare || '없음';

  return (
    <div className="controls-bar fade-in">
      <div className="control-group">
        <span className="control-label">분석 단위</span>
        <div className="unit-buttons">
          {UNIT_OPTIONS.map(u => (
            <button
              key={u}
              className={`unit-btn ${unit === u ? 'active' : ''}`}
              onClick={() => onSettingsChange?.({ ...settings, unit: u })}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">기준 기간</span>
        <div className="date-range">
          <span>📅</span>
          <input
            type="date"
            value={dateRange.start}
            onChange={e => onSettingsChange?.({ ...settings, dateRange: { ...dateRange, start: e.target.value } })}
          />
          <span>~</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={e => onSettingsChange?.({ ...settings, dateRange: { ...dateRange, end: e.target.value } })}
          />
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">비교 대상</span>
        <select
          className="compare-select"
          value={compare}
          onChange={e => onSettingsChange?.({ ...settings, compare: e.target.value })}
        >
          <option>없음</option>
          <option>이전 기간</option>
          <option>전년 동기</option>
        </select>
      </div>
    </div>
  );
}
