import React, { useState } from 'react';

interface BoxStats {
  min: number;
  q1: number;
  med: number;
  q3: number;
  max: number;
  outliers: number[];
}

interface BoxplotConfig {
  key: string;
  title: string;
  label: string;
  unit: string;
  minY: number;
  maxY: number;
  ticksY: number[];
  healthy: BoxStats;
  ckd: BoxStats;
}

const BOXPLOT_CONFIGS: BoxplotConfig[] = [
  {
    key: 'age',
    title: 'age',
    label: 'Patient Age',
    unit: 'years',
    minY: 0,
    maxY: 95,
    ticksY: [0, 25, 50, 75],
    healthy: { min: 15, q1: 34, med: 47, q3: 58, max: 80, outliers: [] },
    ckd: { min: 22, q1: 48, med: 60, q3: 66, max: 89, outliers: [2, 5, 7, 8, 12, 14, 15, 17] }
  },
  {
    key: 'bgr',
    title: 'bgr',
    label: 'Blood Glucose Random',
    unit: 'mg/dL',
    minY: 0,
    maxY: 520,
    ticksY: [0, 100, 200, 300, 400, 500],
    healthy: { min: 70, q1: 95, med: 110, q3: 125, max: 145, outliers: [195] },
    ckd: { min: 75, q1: 105, med: 148, q3: 220, max: 390, outliers: [410, 424, 450, 490] }
  },
  {
    key: 'bp',
    title: 'bp',
    label: 'Blood Pressure',
    unit: 'mm/Hg',
    minY: 40,
    maxY: 190,
    ticksY: [80, 120, 160],
    healthy: { min: 60, q1: 70, med: 75, q3: 80, max: 80, outliers: [50] },
    ckd: { min: 50, q1: 70, med: 80, q3: 90, max: 120, outliers: [140, 180] }
  },
  {
    key: 'bu',
    title: 'bu',
    label: 'Blood Urea',
    unit: 'mg/dL',
    minY: 0,
    maxY: 420,
    ticksY: [0, 100, 200, 300, 400],
    healthy: { min: 10, q1: 25, med: 33, q3: 45, max: 65, outliers: [] },
    ckd: { min: 10, q1: 35, med: 55, q3: 95, max: 180, outliers: [195, 211, 223, 235, 241, 309, 322, 391] }
  },
  {
    key: 'hemo',
    title: 'hemo',
    label: 'Hemoglobin',
    unit: 'g/dL',
    minY: 2,
    maxY: 19,
    ticksY: [5, 10, 15],
    healthy: { min: 11.5, q1: 14.2, med: 15.2, q3: 16.3, max: 17.8, outliers: [9.8] },
    ckd: { min: 5.4, q1: 9.5, med: 11.0, q3: 12.2, max: 16.2, outliers: [3.1, 4.8, 5.6] }
  },
  {
    key: 'pot',
    title: 'pot',
    label: 'Potassium',
    unit: 'mEq/L',
    minY: 0,
    maxY: 52,
    ticksY: [10, 20, 30, 40],
    healthy: { min: 3.5, q1: 4.0, med: 4.5, q3: 4.9, max: 5.3, outliers: [] },
    ckd: { min: 2.5, q1: 3.8, med: 4.6, q3: 5.1, max: 7.0, outliers: [39.0, 47.0] }
  },
  {
    key: 'sc',
    title: 'sc',
    label: 'Serum Creatinine',
    unit: 'mg/dL',
    minY: 0,
    maxY: 82,
    ticksY: [0, 20, 40, 60],
    healthy: { min: 0.4, q1: 0.7, med: 1.0, q3: 1.2, max: 1.8, outliers: [2.4, 3.2] },
    ckd: { min: 0.5, q1: 1.5, med: 2.8, q3: 4.8, max: 9.2, outliers: [12.0, 16.0, 24.0, 32.0, 48.0, 76.0] }
  },
  {
    key: 'sod',
    title: 'sod',
    label: 'Sodium',
    unit: 'mEq/L',
    minY: 0,
    maxY: 180,
    ticksY: [0, 50, 100, 150],
    healthy: { min: 130, q1: 139, med: 143, q3: 146, max: 150, outliers: [] },
    ckd: { min: 120, q1: 132, med: 136, q3: 140, max: 150, outliers: [4.5, 104, 111, 114] }
  }
];

export function FeatureBoxplots() {
  const [selectedKey, setSelectedKey] = useState<string>('sc');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [hoveredBox, setHoveredBox] = useState<{ group: 'Healthy' | 'CKD'; stats: BoxStats } | null>(null);

  const activeConfig = BOXPLOT_CONFIGS.find(cfg => cfg.key === selectedKey) || BOXPLOT_CONFIGS[0];

  // Helper function to scale a value onto drawing height
  const getScaleY = (val: number, minY: number, maxY: number, drawingH: number, paddingTop: number) => {
    const range = maxY - minY;
    // value of minY maps to paddingTop + drawingH, value of maxY maps to paddingTop
    const pct = (val - minY) / range;
    return paddingTop + drawingH - pct * drawingH;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1a3a5c]">Feature Distributions by Disease Status</h3>
          <p className="text-xs text-slate-500">Boxplots with outlier overlay (R-ggplot format)</p>
        </div>

        {/* View Mode & Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'single' ? 'bg-[#1a3a5c] text-white shadow-xs' : 'text-gray-600 hover:text-slate-800'}`}
            >
              Single Variable
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'all' ? 'bg-[#1a3a5c] text-white shadow-xs' : 'text-gray-600 hover:text-slate-800'}`}
            >
              Show All Grid
            </button>
          </div>

          {viewMode === 'single' && (
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none bg-white font-serif text-[#1a3a5c] font-semibold"
            >
              {BOXPLOT_CONFIGS.map((cfg) => (
                <option key={cfg.key} value={cfg.key}>{cfg.label} ({cfg.key})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main Large Boxplot Render */}
          <div className="md:col-span-3 bg-white border border-gray-100 rounded-xl p-4 shadow-2xs relative">
            {/* SVG Plot */}
            {(() => {
              const plotW = 340;
              const plotH = 260;
              const paddingLeft = 32;
              const paddingRight = 15;
              const paddingTop = 25;
              const paddingBottom = 25;

              const drawingW = plotW - paddingLeft - paddingRight;
              const drawingH = plotH - paddingTop - paddingBottom;

              const scaleY = (v: number) => getScaleY(v, activeConfig.minY, activeConfig.maxY, drawingH, paddingTop);

              return (
                <div className="relative">
                  {/* Dynamic Tooltip on Box Hover */}
                  {hoveredBox && (
                    <div className="absolute top-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-lg shadow-md text-[10px] font-mono leading-relaxed max-w-[170px] border border-slate-700 pointer-events-none">
                      <div className="font-bold border-b border-white/20 pb-1 mb-1 font-sans text-xs flex justify-between gap-2">
                        <span>{hoveredBox.group} group</span>
                        <span className="text-emerald-400 font-mono text-[10px]">{activeConfig.unit}</span>
                      </div>
                      <div>Max: {hoveredBox.stats.max}</div>
                      <div>Q3 (75%): {hoveredBox.stats.q3}</div>
                      <div className="text-yellow-300 font-bold">Median: {hoveredBox.stats.med}</div>
                      <div>Q1 (25%): {hoveredBox.stats.q1}</div>
                      <div>Min: {hoveredBox.stats.min}</div>
                      {hoveredBox.stats.outliers.length > 0 && (
                        <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-gray-300">
                          Outliers: {hoveredBox.stats.outliers.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full h-auto text-slate-600">
                    {/* Header bar styled like facet in ggplot */}
                    <g>
                      <rect 
                        x={paddingLeft} 
                        y="2" 
                        width={drawingW} 
                        height="18" 
                        fill="#ebf0f5" 
                        stroke="#ced8e3" 
                        strokeWidth="0.5" 
                        rx="1"
                      />
                      <text 
                        x={paddingLeft + drawingW / 2} 
                        y="14" 
                        textAnchor="middle" 
                        className="font-sans font-bold text-[10px] fill-[#1d3d5f] uppercase tracking-wider"
                      >
                        {activeConfig.label} ({activeConfig.key})
                      </text>
                    </g>

                    {/* Chart border */}
                    <rect 
                      x={paddingLeft} 
                      y={paddingTop} 
                      width={drawingW} 
                      height={drawingH} 
                      fill="#ffffff" 
                      stroke="#cbd5e1" 
                      strokeWidth="0.8"
                    />

                    {/* Horizontal grid lines and tick labels */}
                    {activeConfig.ticksY.map((tickY) => {
                      const yVal = scaleY(tickY);
                      return (
                        <g key={tickY}>
                          <line 
                            x1={paddingLeft} 
                            y1={yVal} 
                            x2={paddingLeft + drawingW} 
                            y2={yVal} 
                            className="stroke-[#edf2f6] stroke-[0.8px]" 
                          />
                          <text 
                            x={paddingLeft - 5} 
                            y={yVal + 3} 
                            textAnchor="end" 
                            className="font-mono text-[8px] fill-gray-400 font-semibold"
                          >
                            {tickY}
                          </text>
                        </g>
                      );
                    })}

                    {/* Left Column: Healthy (X center = paddingLeft + drawingW * 0.33) */}
                    {(() => {
                      const xCenter = paddingLeft + drawingW * 0.33;
                      const h = activeConfig.healthy;
                      const boxW = 40;

                      return (
                        <g 
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredBox({ group: 'Healthy', stats: h })}
                          onMouseLeave={() => setHoveredBox(null)}
                        >
                          {/* Whisker vertical line */}
                          <line 
                            x1={xCenter} 
                            y1={scaleY(h.min)} 
                            x2={xCenter} 
                            y2={scaleY(h.max)} 
                            className="stroke-[#319795] stroke-[1.2px] group-hover:stroke-[1.8px] transition-all" 
                          />
                          {/* Whisker caps */}
                          <line x1={xCenter - 10} y1={scaleY(h.min)} x2={xCenter + 10} y2={scaleY(h.min)} className="stroke-[#319795] stroke-[1px]" />
                          <line x1={xCenter - 10} y1={scaleY(h.max)} x2={xCenter + 10} y2={scaleY(h.max)} className="stroke-[#319795] stroke-[1px]" />

                          {/* IQR Box */}
                          <rect 
                            x={xCenter - boxW / 2} 
                            y={scaleY(h.q3)} 
                            width={boxW} 
                            height={Math.max(2, Math.abs(scaleY(h.q1) - scaleY(h.q3)))} 
                            fill="#319795" 
                            fillOpacity="0.8"
                            stroke="#1d5554" 
                            strokeWidth="1.2"
                            className="group-hover:fill-opacity-95 transition-all"
                            rx="1"
                          />

                          {/* Median Line */}
                          <line 
                            x1={xCenter - boxW / 2} 
                            y1={scaleY(h.med)} 
                            x2={xCenter + boxW / 2} 
                            y2={scaleY(h.med)} 
                            className="stroke-white stroke-[2.2px]" 
                          />

                          {/* Outliers */}
                          {h.outliers.map((val, idx) => (
                            <circle 
                              key={idx} 
                              cx={xCenter} 
                              cy={scaleY(val)} 
                              r="3.5" 
                              fill="#b04334" 
                              fillOpacity="0.75"
                              stroke="#ffffff" 
                              strokeWidth="0.6" 
                              className="hover:r-[5px] transition-all"
                            />
                          ))}

                          {/* X Axis Label */}
                          <text x={xCenter} y={paddingTop + drawingH + 14} textAnchor="middle" className="font-sans font-bold text-[9px] fill-slate-700">
                            Healthy
                          </text>
                        </g>
                      );
                    })()}

                    {/* Right Column: CKD (X center = paddingLeft + drawingW * 0.67) */}
                    {(() => {
                      const xCenter = paddingLeft + drawingW * 0.67;
                      const c = activeConfig.ckd;
                      const boxW = 40;

                      return (
                        <g 
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredBox({ group: 'CKD', stats: c })}
                          onMouseLeave={() => setHoveredBox(null)}
                        >
                          {/* Whisker vertical line */}
                          <line 
                            x1={xCenter} 
                            y1={scaleY(c.min)} 
                            x2={xCenter} 
                            y2={scaleY(c.max)} 
                            className="stroke-[#b04334] stroke-[1.2px] group-hover:stroke-[1.8px] transition-all" 
                          />
                          {/* Whisker caps */}
                          <line x1={xCenter - 10} y1={scaleY(c.min)} x2={xCenter + 10} y2={scaleY(c.min)} className="stroke-[#b04334] stroke-[1px]" />
                          <line x1={xCenter - 10} y1={scaleY(c.max)} x2={xCenter + 10} y2={scaleY(c.max)} className="stroke-[#b04334] stroke-[1px]" />

                          {/* IQR Box */}
                          <rect 
                            x={xCenter - boxW / 2} 
                            y={scaleY(c.q3)} 
                            width={boxW} 
                            height={Math.max(2, Math.abs(scaleY(c.q1) - scaleY(c.q3)))} 
                            fill="#b04334" 
                            fillOpacity="0.8"
                            stroke="#692219" 
                            strokeWidth="1.2"
                            className="group-hover:fill-opacity-95 transition-all"
                            rx="1"
                          />

                          {/* Median Line */}
                          <line 
                            x1={xCenter - boxW / 2} 
                            y1={scaleY(c.med)} 
                            x2={xCenter + boxW / 2} 
                            y2={scaleY(c.med)} 
                            className="stroke-white stroke-[2.2px]" 
                          />

                          {/* Outliers */}
                          {c.outliers.map((val, idx) => (
                            <circle 
                              key={idx} 
                              cx={xCenter + (idx % 2 === 0 ? 0.5 : -0.5)} 
                              cy={scaleY(val)} 
                              r="3.5" 
                              fill="#b04334" 
                              fillOpacity="0.75"
                              stroke="#ffffff" 
                              strokeWidth="0.6"
                              className="hover:r-[5px] transition-all"
                            />
                          ))}

                          {/* X Axis Label */}
                          <text x={xCenter} y={paddingTop + drawingH + 14} textAnchor="middle" className="font-sans font-bold text-[9px] fill-slate-700">
                            CKD
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Tab Information panel side description */}
          <div className="md:col-span-1 space-y-4 font-sans text-xs text-slate-600 self-start">
            <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
              <h5 className="font-serif font-bold text-slate-800 text-sm mb-2">Interactive Guide</h5>
              <p className="leading-relaxed mb-3">
                Hover over either box to reveal exact statistical summaries including medians, quartiles, and limits.
              </p>
              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 font-sans font-semibold">
                  <span className="w-3 h-3 rounded-[2px] bg-[#319795]" /> Healthy Group
                </div>
                <div className="flex items-center gap-1.5 font-sans font-semibold">
                  <span className="w-3 h-3 rounded-[2px] bg-[#b04334]" /> CKD Group
                </div>
              </div>
            </div>

            <div className="p-1 text-[11px] text-slate-400 italic font-mono uppercase tracking-wider">
              Selected: {activeConfig.label} ({activeConfig.unit})
            </div>
          </div>
        </div>
      ) : (
        /* Show All 2x4 Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {BOXPLOT_CONFIGS.map((config) => {
            const plotW = 150;
            const plotH = 155;
            const paddingLeft = 25;
            const paddingRight = 8;
            const paddingTop = 22;
            const paddingBottom = 22;

            const drawingW = plotW - paddingLeft - paddingRight; // 117
            const drawingH = plotH - paddingTop - paddingBottom; // 111

            const scaleY = (v: number) => getScaleY(v, config.minY, config.maxY, drawingH, paddingTop);

            return (
              <div 
                key={config.key} 
                className="flex flex-col items-center bg-white border border-gray-100 rounded-xl p-2 pb-3 shadow-xs cursor-pointer hover:border-gray-300 transition-all"
                onClick={() => {
                  setSelectedKey(config.key);
                  setViewMode('single');
                }}
              >
                <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full h-auto text-slate-600">
                  {/* Facet Banner Center Top */}
                  <g>
                    <rect 
                      x={paddingLeft} 
                      y="3" 
                      width={drawingW} 
                      height="14" 
                      fill="#ebf0f5" 
                      stroke="#ced8e3" 
                      strokeWidth="0.5" 
                      rx="1"
                    />
                    <text 
                      x={paddingLeft + drawingW / 2} 
                      y="13" 
                      textAnchor="middle" 
                      className="font-sans font-bold text-[8.5px] fill-[#1d3d5f]"
                    >
                      {config.title}
                    </text>
                  </g>

                  {/* Plot Border */}
                  <rect 
                    x={paddingLeft} 
                    y={paddingTop} 
                    width={drawingW} 
                    height={drawingH} 
                    fill="#ffffff" 
                    stroke="#cbd5e1" 
                    strokeWidth="0.6"
                  />

                  {/* Y Axis Grid lines & Tick Labels */}
                  {config.ticksY.map((tickY) => {
                    const yVal = scaleY(tickY);
                    return (
                      <g key={tickY}>
                        <line 
                          x1={paddingLeft} 
                          y1={yVal} 
                          x2={paddingLeft + drawingW} 
                          y2={yVal} 
                          className="stroke-[#edf2f6] stroke-[0.8px]" 
                        />
                        <text 
                          x={paddingLeft - 4} 
                          y={yVal + 2.5} 
                          textAnchor="end" 
                          className="font-mono text-[7px] fill-gray-400"
                        >
                          {tickY}
                        </text>
                      </g>
                    );
                  })}

                  {/* Healthy Box Column (X center = paddingLeft + drawingW * 0.33) */}
                  {(() => {
                    const xCenter = paddingLeft + drawingW * 0.33;
                    const h = config.healthy;
                    const boxW = 20;

                    return (
                      <g>
                        <line x1={xCenter} y1={scaleY(h.min)} x2={xCenter} y2={scaleY(h.max)} className="stroke-[#319795] stroke-[0.8px]" />
                        <line x1={xCenter - 5} y1={scaleY(h.min)} x2={xCenter + 5} y2={scaleY(h.min)} className="stroke-[#319795] stroke-[0.8px]" />
                        <line x1={xCenter - 5} y1={scaleY(h.max)} x2={xCenter + 5} y2={scaleY(h.max)} className="stroke-[#319795] stroke-[0.8px]" />
                        <rect 
                          x={xCenter - boxW / 2} 
                          y={scaleY(h.q3)} 
                          width={boxW} 
                          height={Math.max(1, Math.abs(scaleY(h.q1) - scaleY(h.q3)))} 
                          fill="#319795" 
                          fillOpacity="0.8" 
                          stroke="#1d5554"
                          strokeWidth="0.6"
                        />
                        <line x1={xCenter - boxW / 2} y1={scaleY(h.med)} x2={xCenter + boxW / 2} y2={scaleY(h.med)} className="stroke-white stroke-[1.5px]" />
                        
                        {h.outliers.map((out, idx) => (
                          <circle key={idx} cx={xCenter} cy={scaleY(out)} r="1.5" fill="#319795" stroke="#ffffff" strokeWidth="0.2" />
                        ))}
                        
                        <text x={xCenter} y={paddingTop + drawingH + 11} textAnchor="middle" className="font-sans text-[7.5px] fill-slate-500 font-medium">Healthy</text>
                      </g>
                    );
                  })()}

                  {/* CKD Box Column (X center = paddingLeft + drawingW * 0.67) */}
                  {(() => {
                    const xCenter = paddingLeft + drawingW * 0.67;
                    const c = config.ckd;
                    const boxW = 20;

                    return (
                      <g>
                        <line x1={xCenter} y1={scaleY(c.min)} x2={xCenter} y2={scaleY(c.max)} className="stroke-[#b04334] stroke-[0.8px]" />
                        <line x1={xCenter - 5} y1={scaleY(c.min)} x2={xCenter + 5} y2={scaleY(c.min)} className="stroke-[#b04334] stroke-[0.8px]" />
                        <line x1={xCenter - 5} y1={scaleY(c.max)} x2={xCenter + 5} y2={scaleY(c.max)} className="stroke-[#b04334] stroke-[0.8px]" />
                        <rect 
                          x={xCenter - boxW / 2} 
                          y={scaleY(c.q3)} 
                          width={boxW} 
                          height={Math.max(1, Math.abs(scaleY(c.q1) - scaleY(c.q3)))} 
                          fill="#b04334" 
                          fillOpacity="0.8" 
                          stroke="#692219"
                          strokeWidth="0.6"
                        />
                        <line x1={xCenter - boxW / 2} y1={scaleY(c.med)} x2={xCenter + boxW / 2} y2={scaleY(c.med)} className="stroke-white stroke-[1.5px]" />
                        
                        {c.outliers.slice(0, 8).map((out, idx) => (
                          <circle key={idx} cx={xCenter + (idx % 2 === 0 ? 1 : -1)} cy={scaleY(out)} r="1.5" fill="#b04334" stroke="#ffffff" strokeWidth="0.2" />
                        ))}
                        
                        <text x={xCenter} y={paddingTop + drawingH + 11} textAnchor="middle" className="font-sans text-[7.5px] fill-slate-500 font-medium">CKD</text>
                      </g>
                    );
                  })()}
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
