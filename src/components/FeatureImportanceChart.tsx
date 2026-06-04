import React from 'react';

interface ImportanceItem {
  feature: string;
  coef: number;
  type: 'risk' | 'protect';
}

const IMPORTANCE_DATA: ImportanceItem[] = [
  { feature: 'dm_yes', coef: 2.05, type: 'risk' },
  { feature: 'sg', coef: -1.98, type: 'protect' },
  { feature: 'htn_yes', coef: 1.50, type: 'risk' },
  { feature: 'rbc_normal', coef: -1.22, type: 'protect' },
  { feature: 'al', coef: 1.18, type: 'risk' },
  { feature: 'pe_yes', coef: 0.88, type: 'risk' },
  { feature: 'appet_poor', coef: 0.65, type: 'risk' },
  { feature: 'pc_normal', coef: -0.40, type: 'protect' },
  { feature: 'sod', coef: -0.32, type: 'protect' },
  { feature: 'bp', coef: 0.30, type: 'risk' },
  { feature: 'sc', coef: 0.12, type: 'risk' },
  { feature: 'su', coef: 0.11, type: 'risk' },
  { feature: 'bgr', coef: 0.10, type: 'risk' },
  { feature: 'rc', coef: -0.05, type: 'protect' }
];

export function FeatureImportanceChart() {
  const plotW = 540;
  const plotH = 370;
  const paddingLeft = 85;
  const paddingRight = 15;
  const paddingTop = 22;
  const paddingBottom = 40;

  const drawingW = plotW - paddingLeft - paddingRight; // 440
  const drawingH = plotH - paddingTop - paddingBottom; // 308

  const xZero = paddingLeft + drawingW / 2; // 305
  const maxRange = 2.2;
  const scaleX = (drawingW / 2) / maxRange; // 100 pixels per log-odds unit

  const ticksX = [-2, -1, 0, 1, 2];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm select-none">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-[#1d3d5f]">Feature Importance &mdash; Logistic Regression</h3>
        <p className="text-xs text-slate-500">Top 15 features ranked by |coefficient| &mdash; L1-regularized</p>
      </div>

      <div className="relative pt-2">
        <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full h-auto text-slate-600">
          
          {/* Plot background grid */}
          <g>
            {/* Horizontal line at bottom */}
            <line 
              x1={paddingLeft} 
              y1={paddingTop + drawingH} 
              x2={paddingLeft + drawingW} 
              y2={paddingTop + drawingH} 
              className="stroke-[#e2e8f0] stroke-[1px]" 
            />

            {/* Vertical grid lines & tick labels */}
            {ticksX.map((tick) => {
              const xVal = xZero + tick * scaleX;
              return (
                <g key={tick}>
                  <line 
                    x1={xVal} 
                    y1={paddingTop} 
                    x2={xVal} 
                    y2={paddingTop + drawingH} 
                    className={`stroke-[#eff3f8] stroke-[1px] ${tick === 0 ? 'stroke-[#cbd5e1] stroke-[1.2px]' : ''}`}
                    strokeDasharray={tick !== 0 ? '2' : undefined}
                  />
                  <text 
                    x={xVal} 
                    y={paddingTop + drawingH + 11} 
                    textAnchor="middle" 
                    className="font-mono text-[8px] fill-gray-400 font-medium"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Plot bars & feature titles */}
          {IMPORTANCE_DATA.map((item, idx) => {
            const rowHeight = 21;
            const barHeight = 11;
            const barY = paddingTop + idx * rowHeight + (rowHeight - barHeight) / 2;

            // Bar drawing values
            const valScale = item.coef * scaleX;
            const barX = item.coef > 0 ? xZero : xZero + valScale;
            const barWidth = Math.abs(valScale);

            const isPositive = item.coef >= 0;

            return (
              <g key={item.feature}>
                {/* Feature Label (Y Axis Text) */}
                <text 
                  x={paddingLeft - 8} 
                  y={barY + barHeight / 2 + 3} 
                  textAnchor="end" 
                  className="font-mono text-[9px] fill-gray-500"
                >
                  {item.feature}
                </text>

                {/* Interactive bar */}
                <rect 
                  x={barX} 
                  y={barY} 
                  width={Math.max(1, barWidth)} 
                  height={barHeight} 
                  fill={isPositive ? '#b04334' : '#1d3d5f'}
                  className="transition-all duration-150 hover:opacity-90"
                  rx="1"
                />
              </g>
            );
          })}

          {/* Centered Axis title */}
          <text 
            x={paddingLeft + drawingW / 2} 
            y={paddingTop + drawingH + 28} 
            textAnchor="middle" 
            className="font-sans text-[9px] text-gray-500 font-semibold uppercase tracking-wider"
          >
            Coefficient (log-odds scale)
          </text>
        </svg>
      </div>

      {/* Legend Block */}
      <div className="flex justify-center items-center gap-6 mt-4 p-2.5 border border-gray-100 text-xs font-serif bg-gray-50/50 rounded-xl max-w-sm mx-auto">
        <span className="flex items-center gap-2 font-sans font-medium text-[9.5px] text-gray-700">
          <span className="w-4.5 h-3 bg-[#1d3d5f] rounded-[1px]" /> Negative effect (CKD risk &darr;)
        </span>
        <span className="flex items-center gap-2 font-sans font-medium text-[9.5px] text-gray-700">
          <span className="w-4.5 h-3 bg-[#b04334] rounded-[1px]" /> Positive effect (CKD risk &uarr;)
        </span>
      </div>
    </div>
  );
}
