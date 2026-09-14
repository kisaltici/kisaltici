import { useState, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import './AnalyticsChart.css';

function AnalyticsChart({ clicks = [] }) {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Group click timestamps according to selected time range
  const chartData = useMemo(() => {
    if (!clicks || clicks.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate = new Date();

    if (timeRange === '24h') {
      startDate.setHours(now.getHours() - 24);
    } else if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else {
      // 'all' time: find earliest click date or default 7 days ago
      const earliest = clicks.reduce((earliestDate, c) => {
        const d = new Date(c.timestamp);
        return d < earliestDate ? d : earliestDate;
      }, now);
      startDate = new Date(earliest);
    }

    // Filter clicks within start range
    const filteredClicks = clicks.filter(
      (c) => new Date(c.timestamp) >= startDate
    );

    if (timeRange === '24h') {
      // Group by hour
      const hourMap = {};
      for (let i = 0; i < 24; i++) {
        const d = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
        const key = `${d.getHours()}:00`;
        hourMap[key] = { label: key, count: 0 };
      }

      filteredClicks.forEach((c) => {
        const d = new Date(c.timestamp);
        const key = `${d.getHours()}:00`;
        if (hourMap[key]) hourMap[key].count += 1;
      });

      return Object.values(hourMap);
    } else {
      // Group by Day
      const daysCount =
        timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 14;
      const dayMap = {};

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        dayMap[label] = { label, count: 0 };
      }

      filteredClicks.forEach((c) => {
        const d = new Date(c.timestamp);
        const label = d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        if (dayMap[label]) {
          dayMap[label].count += 1;
        } else {
          dayMap[label] = { label, count: 1 };
        }
      });

      return Object.values(dayMap);
    }
  }, [clicks, timeRange]);

  const maxCount = useMemo(() => {
    return Math.max(...chartData.map((d) => d.count), 4);
  }, [chartData]);

  if (clicks.length === 0) {
    return (
      <div className="chartEmptyState">
        <div className="emptyChartIcon">📈</div>
        <h4 className="emptyChartTitle">{t('noClickActivityHeader')}</h4>
        <p className="emptyChartSub">{t('noClickActivitySub')}</p>
      </div>
    );
  }

  // Calculate SVG dimensions and path points
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;

  const points = chartData.map((d, i) => {
    const x =
      padding +
      (i / Math.max(chartData.length - 1, 1)) * (svgWidth - 2 * padding);
    const y =
      svgHeight -
      padding -
      (d.count / maxCount) * (svgHeight - 2 * padding);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${
          points[0].x
        } ${svgHeight - padding} Z`
      : '';

  return (
    <div className="analyticsChartContainer">
      <div className="chartHeader">
        <h3 className="chartTitle">{t('clicksOverTime')}</h3>
        <div className="timeRangeTabs">
          {['24h', '7d', '30d', 'all'].map((range) => (
            <button
              key={range}
              type="button"
              className={`rangeTab ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range === '24h'
                ? '24H'
                : range === '7d'
                ? '7D'
                : range === '30d'
                ? '30D'
                : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="svgChartWrapper">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chartSvg">
          <defs>
            <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DEFF36" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#DEFF36" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={svgHeight - padding}
            x2={svgWidth - padding}
            y2={svgHeight - padding}
            className="gridLine"
          />
          <line
            x1={padding}
            y1={padding}
            x2={svgWidth - padding}
            y2={padding}
            className="gridLine"
          />

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#limeGradient)" />}

          {/* Line stroke */}
          {pathD && <path d={pathD} className="chartLine" />}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="pointGroup">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className="chartPoint"
                onMouseEnter={() => setActiveTooltip(p)}
                onMouseLeave={() => setActiveTooltip(null)}
              />
            </g>
          ))}
        </svg>

        {activeTooltip && (
          <div className="chartTooltip">
            <span className="tooltipDate">{activeTooltip.label}</span>
            <span className="tooltipCount">
              <strong>{activeTooltip.count}</strong>{' '}
              {activeTooltip.count === 1 ? t('click') : t('clicks')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsChart;
