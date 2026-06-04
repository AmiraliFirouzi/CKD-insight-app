import React, { useState } from 'react';

interface BinData {
  min: number;
  max: number;
  healthy: number;
  ckd: number;
}

interface HistogramConfig {
  key: string;
  title: string;
  label: string;
  unit: string;
  minX: number;
  maxX: number;
  ticksX: number[];
  bins: BinData[];
}

const HISTOGRAM_CONFIGS: HistogramConfig[] = [
  {
    key: 'age',
    title: 'age',
    label: 'Patient Age',
    unit: 'years',
    minX: 0,
    maxX: 90,
    ticksX: [0, 25, 50, 75],
    bins: [
      { min: 0, max: 4.5, healthy: 0, ckd: 2 },
      { min: 4.5, max: 9, healthy: 0, ckd: 5 },
      { min: 9, max: 13.5, healthy: 0, ckd: 2 },
      { min: 13.5, max: 18, healthy: 0, ckd: 1 },
      { min: 18, max: 22.5, healthy: 0, ckd: 1 },
      { min: 22.5, max: 27, healthy: 0, ckd: 3 },
      { min: 27, max: 31.5, healthy: 1, ckd: 2 },
      { min: 31.5, max: 36, healthy: 4, ckd: 3 },
      { min: 36, max: 40, healthy: 10, ckd: 4 },
      { min: 40, max: 44, healthy: 12, ckd: 5 },
      { min: 44, max: 48, healthy: 18, ckd: 9 },
      { min: 48, max: 52, healthy: 15, ckd: 21 },
      { min: 52, max: 56, healthy: 10, ckd: 21 },
      { min: 56, max: 60, healthy: 6, ckd: 37 },
      { min: 60, max: 64, healthy: 4, ckd: 28 },
      { min: 64, max: 68, healthy: 3, ckd: 18 },
      { min: 68, max: 72, healthy: 1, ckd: 23 },
      { min: 72, max: 76, healthy: 0, ckd: 10 },
      { min: 76, max: 80, healthy: 0, ckd: 3 },
      { min: 80, max: 90, healthy: 0, ckd: 1 }
    ]
  },
  {
    key: 'bgr',
    title: 'bgr',
    label: 'Blood Glucose Random',
    unit: 'mg/dL',
    minX: 0,
    maxX: 500,
    ticksX: [0, 100, 200, 300, 400, 500],
    bins: [
      { min: 0, max: 20, healthy: 0, ckd: 0 },
      { min: 20, max: 40, healthy: 0, ckd: 1 },
      { min: 40, max: 60, healthy: 0, ckd: 0 },
      { min: 60, max: 80, healthy: 2, ckd: 1 },
      { min: 80, max: 100, healthy: 11, ckd: 14 },
      { min: 100, max: 120, healthy: 45, ckd: 41 },
      { min: 120, max: 140, healthy: 24, ckd: 18 },
      { min: 140, max: 160, healthy: 8, ckd: 16 },
      { min: 160, max: 180, healthy: 0, ckd: 11 },
      { min: 180, max: 200, healthy: 0, ckd: 7 },
      { min: 200, max: 220, healthy: 0, ckd: 16 },
      { min: 220, max: 240, healthy: 0, ckd: 8 },
      { min: 240, max: 260, healthy: 0, ckd: 10 },
      { min: 260, max: 280, healthy: 0, ckd: 4 },
      { min: 280, max: 300, healthy: 0, ckd: 7 },
      { min: 300, max: 320, healthy: 0, ckd: 3 },
      { min: 320, max: 340, healthy: 0, ckd: 1 },
      { min: 340, max: 360, healthy: 0, ckd: 3 },
      { min: 360, max: 380, healthy: 0, ckd: 1 },
      { min: 380, max: 400, healthy: 0, ckd: 1 },
      { min: 400, max: 420, healthy: 0, ckd: 1 },
      { min: 420, max: 440, healthy: 0, ckd: 4 },
      { min: 440, max: 465, healthy: 0, ckd: 1 },
      { min: 465, max: 500, healthy: 0, ckd: 2 }
    ]
  },
  {
    key: 'bp',
    title: 'bp',
    label: 'Blood Pressure',
    unit: 'mm/Hg',
    minX: 50,
    maxX: 180,
    ticksX: [80, 120, 160],
    bins: [
      { min: 50, max: 55, healthy: 0, ckd: 5 },
      { min: 60, max: 65, healthy: 21, ckd: 25 },
      { min: 70, max: 75, healthy: 12, ckd: 54 },
      { min: 80, max: 85, healthy: 18, ckd: 50 },
      { min: 90, max: 95, healthy: 0, ckd: 25 },
      { min: 100, max: 105, healthy: 0, ckd: 5 },
      { min: 110, max: 115, healthy: 0, ckd: 1 },
      { min: 120, max: 125, healthy: 0, ckd: 1 },
      { min: 140, max: 145, healthy: 0, ckd: 1 },
      { min: 180, max: 185, healthy: 0, ckd: 1 }
    ]
  },
  {
    key: 'bu',
    title: 'bu',
    label: 'Blood Urea',
    unit: 'mg/dL',
    minX: 0,
    maxX: 400,
    ticksX: [0, 100, 200, 300, 400],
    bins: [
      { min: 0, max: 15, healthy: 12, ckd: 36 },
      { min: 15, max: 30, healthy: 48, ckd: 12 },
      { min: 30, max: 45, healthy: 8, ckd: 37 },
      { min: 45, max: 60, healthy: 2, ckd: 20 },
      { min: 60, max: 75, healthy: 0, ckd: 13 },
      { min: 75, max: 90, healthy: 0, ckd: 11 },
      { min: 90, max: 105, healthy: 0, ckd: 10 },
      { min: 105, max: 120, healthy: 0, ckd: 8 },
      { min: 120, max: 135, healthy: 0, ckd: 6 },
      { min: 135, max: 150, healthy: 0, ckd: 4 },
      { min: 150, max: 175, healthy: 0, ckd: 5 },
      { min: 175, max: 200, healthy: 0, ckd: 3 },
      { min: 200, max: 250, healthy: 0, ckd: 2 },
      { min: 250, max: 300, healthy: 0, ckd: 1 },
      { min: 300, max: 350, healthy: 0, ckd: 1 },
      { min: 350, max: 400, healthy: 0, ckd: 1 }
    ]
  },
  {
    key: 'hemo',
    title: 'hemo',
    label: 'Hemoglobin',
    unit: 'g/dL',
    minX: 3,
    maxX: 18,
    ticksX: [5, 10, 15],
    bins: [
      { min: 3.0, max: 3.8, healthy: 0, ckd: 1 },
      { min: 3.8, max: 4.6, healthy: 0, ckd: 0 },
      { min: 4.6, max: 5.4, healthy: 0, ckd: 1 },
      { min: 5.4, max: 6.2, healthy: 0, ckd: 3 },
      { min: 6.2, max: 7.0, healthy: 0, ckd: 5 },
      { min: 7.0, max: 7.8, healthy: 0, ckd: 14 },
      { min: 7.8, max: 8.6, healthy: 0, ckd: 15 },
      { min: 8.6, max: 9.4, healthy: 0, ckd: 25 },
      { min: 9.4, max: 10.2, healthy: 0, ckd: 34 },
      { min: 10.2, max: 11.0, healthy: 2, ckd: 17 },
      { min: 11.0, max: 11.8, healthy: 5, ckd: 15 },
      { min: 11.8, max: 12.6, healthy: 12, ckd: 21 },
      { min: 12.6, max: 13.4, healthy: 15, ckd: 5 },
      { min: 13.4, max: 14.2, healthy: 18, ckd: 5 },
      { min: 14.2, max: 15.0, healthy: 27, ckd: 4 },
      { min: 15.0, max: 15.8, healthy: 18, ckd: 3 },
      { min: 15.8, max: 16.6, healthy: 15, ckd: 1 },
      { min: 16.6, max: 17.4, healthy: 13, ckd: 0 },
      { min: 17.4, max: 18.2, healthy: 5, ckd: 0 }
    ]
  },
  {
    key: 'pot',
    title: 'pot',
    label: 'Potassium',
    unit: 'mEq/L',
    minX: 0,
    maxX: 50,
    ticksX: [0, 10, 20, 30, 40, 50],
    bins: [
      { min: 0, max: 2, healthy: 0, ckd: 1 },
      { min: 2, max: 4, healthy: 18, ckd: 16 },
      { min: 4, max: 6, healthy: 132, ckd: 114 },
      { min: 6, max: 8, healthy: 0, ckd: 4 },
      { min: 8, max: 10, healthy: 0, ckd: 1 },
      { min: 38, max: 40, healthy: 0, ckd: 1 },
      { min: 46, max: 48, healthy: 0, ckd: 1 }
    ]
  },
  {
    key: 'sc',
    title: 'sc',
    label: 'Serum Creatinine',
    unit: 'mg/dL',
    minX: 0,
    maxX: 80,
    ticksX: [0, 20, 40, 60, 80],
    bins: [
      { min: 0, max: 4, healthy: 148, ckd: 97 },
      { min: 4, max: 8, healthy: 2, ckd: 38 },
      { min: 8, max: 12, healthy: 0, ckd: 11 },
      { min: 12, max: 16, healthy: 0, ckd: 5 },
      { min: 16, max: 20, healthy: 0, ckd: 3 },
      { min: 20, max: 30, healthy: 0, ckd: 2 },
      { min: 30, max: 40, healthy: 0, ckd: 1 },
      { min: 45, max: 50, healthy: 0, ckd: 1 },
      { min: 75, max: 80, healthy: 0, ckd: 1 }
    ]
  },
  {
    key: 'sod',
    title: 'sod',
    label: 'Sodium',
    unit: 'mEq/L',
    minX: 0,
    maxX: 170,
    ticksX: [0, 50, 100, 150],
    bins: [
      { min: 4, max: 8, healthy: 0, ckd: 1 },
      { min: 100, max: 105, healthy: 0, ckd: 1 },
      { min: 105, max: 110, healthy: 0, ckd: 1 },
      { min: 110, max: 115, healthy: 0, ckd: 1 },
      { min: 115, max: 120, healthy: 0, ckd: 3 },
      { min: 120, max: 125, healthy: 0, ckd: 6 },
      { min: 125, max: 130, healthy: 0, ckd: 8 },
      { min: 130, max: 135, healthy: 1, ckd: 39 },
      { min: 135, max: 140, healthy: 5, ckd: 70 },
      { min: 140, max: 145, healthy: 62, ckd: 35 },
      { min: 145, max: 150, healthy: 32, ckd: 28 },
      { min: 150, max: 155, healthy: 0, ckd: 1 },
      { min: 160, max: 165, healthy: 0, ckd: 1 }
    ]
  }
];

export function KeyNumericHistograms() {
  const [selectedKey, setSelectedKey] = useState<string>('age');
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [hoveredBin, setHoveredBin] = useState<BinData | null>(null);

  const activeConfig = HISTOGRAM_CONFIGS.find(cfg => cfg.key === selectedKey) || HISTOGRAM_CONFIGS[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1a3a5c]">Distribution of Key Numeric Features</h3>
          <p className="text-xs text-slate-500">Stratified by disease status (stacked frequency histograms)</p>
        </div>

        {/* View mode buttons & Select Dropdown */}
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
              {HISTOGRAM_CONFIGS.map((cfg) => (
                <option key={cfg.key} value={cfg.key}>{cfg.label} ({cfg.key})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {viewMode === 'single' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Left Panel: Selected Single Plot */}
          <div className="md:col-span-3 bg-white border border-gray-100 rounded-xl p-4 shadow-2xs relative">
            {/* SVG Plot */}
            {(() => {
              const plotW = 340;
              const plotH = 220;
              const paddingLeft = 32;
              const paddingRight = 15;
              const paddingTop = 25;
              const paddingBottom = 30;

              const drawingW = plotW - paddingLeft - paddingRight;
              const drawingH = plotH - paddingTop - paddingBottom;

              const binWidth = drawingW / activeConfig.bins.length;

              // Calculate dynamic maxY with 10% breathing space
              const maxStacked = Math.max(...activeConfig.bins.map(b => b.healthy + b.ckd), 10);
              const niceMaxY = Math.ceil(maxStacked / 10) * 10;
              const scaleFactor = niceMaxY * 1.1; // 10% premium space ensures bars never overflow or touch the title banner

              const ticksY = [0, Math.round(niceMaxY / 2), niceMaxY];

              return (
                <div className="relative">
                  {/* Hover tooltip */}
                  {hoveredBin && (
                    <div className="absolute top-2 right-2 bg-slate-900/95 text-white p-2.5 rounded-lg shadow-md text-[10px] font-mono leading-relaxed max-w-[190px] border border-slate-700 pointer-events-none">
                      <div className="font-bold border-b border-white/20 pb-1 mb-1 font-sans text-xs flex justify-between gap-2">
                        <span>Bin Details</span>
                        <span className="text-yellow-400 font-mono text-[10px]">{activeConfig.unit}</span>
                      </div>
                      <div>Range: {hoveredBin.min.toFixed(1)} &mdash; {hoveredBin.max.toFixed(1)}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-[1px] bg-[#319795] inline-block" />
                        Healthy: {hoveredBin.healthy} Patients
                      </div>
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <span className="w-2.5 h-2.5 rounded-[1px] bg-[#b04334] inline-block" />
                        CKD Positive: {hoveredBin.ckd} Patients
                      </div>
                      <div className="text-[9px] text-gray-300 mt-1 border-t border-white/10 pt-1 font-sans">
                        Total Frequency: {hoveredBin.healthy + hoveredBin.ckd} patients
                      </div>
                    </div>
                  )}

                  <svg viewBox={`0 0 ${plotW} ${plotH}`} className="w-full h-auto text-slate-600">
                    {/* Header Banner */}
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

                    {/* Y Axis Grid lines and labels */}
                    {ticksY.map((tickY) => {
                      const yVal = paddingTop + drawingH - (tickY / scaleFactor) * drawingH;
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

                    {/* X Axis labels & lines */}
                    {activeConfig.ticksX.map((tickX) => {
                      const xRatio = (tickX - activeConfig.minX) / (activeConfig.maxX - activeConfig.minX);
                      const xVal = paddingLeft + xRatio * drawingW;

                      if (xVal < paddingLeft || xVal > paddingLeft + drawingW) return null;

                      return (
                        <g key={tickX}>
                          <line 
                            x1={xVal} 
                            y1={paddingTop} 
                            x2={xVal} 
                            y2={paddingTop + drawingH} 
                            className="stroke-[#edf2f6] stroke-[0.8px]" 
                          />
                          <text 
                            x={xVal} 
                            y={paddingTop + drawingH + 11} 
                            textAnchor="middle" 
                            className="font-mono text-[8px] fill-gray-400 font-semibold"
                          >
                            {tickX}
                          </text>
                        </g>
                      );
                    })}

                    {/* Drawing Stacked Bars */}
                    {activeConfig.bins.map((bin, idx) => {
                      const barX = paddingLeft + idx * binWidth;
                      const barW = Math.max(0.6, binWidth - 0.4);

                      const ckdH = (bin.ckd / scaleFactor) * drawingH;
                      const healthyH = (bin.healthy / scaleFactor) * drawingH;

                      const ckdY = paddingTop + drawingH - ckdH;
                      const healthyY = ckdY - healthyH;

                      return (
                        <g 
                          key={idx} 
                          className="cursor-pointer group"
                          onMouseEnter={() => setHoveredBin(bin)}
                          onMouseLeave={() => setHoveredBin(null)}
                        >
                          {/* CKD (Red) bar */}
                          {bin.ckd > 0 && (
                            <rect 
                              x={barX} 
                              y={ckdY} 
                              width={barW} 
                              height={ckdH} 
                              fill="#b04334" 
                              stroke="#ffffff"
                              strokeWidth="0.1"
                              className="group-hover:fill-[#c44e3d] transition-all"
                            />
                          )}
                          {/* Healthy (Teal) bar */}
                          {bin.healthy > 0 && (
                            <rect 
                              x={barX} 
                              y={healthyY} 
                              width={barW} 
                              height={healthyH} 
                              fill="#319795" 
                              stroke="#ffffff"
                              strokeWidth="0.1"
                              className="group-hover:fill-[#3baea3] transition-all"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* Right Panel side information description */}
          <div className="md:col-span-1 space-y-4 font-sans text-xs text-slate-600 self-start">
            <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
              <h5 className="font-serif font-bold text-slate-800 text-sm mb-2">Interactive Guide</h5>
              <p className="leading-relaxed mb-3">
                Hover over the vertical histogram bars to inspect patients frequency counts and exact measurement intervals.
              </p>
              <div className="space-y-1.5 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2.5 rounded-[1px] bg-[#319795] block" />
                  Healthy Patients
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-2.5 rounded-[1px] bg-[#b04334] block" />
                  CKD Patients
                </div>
              </div>
            </div>

            <div className="p-1 text-[11px] text-slate-400 italic font-mono uppercase tracking-wider">
              Dimension: {activeConfig.label} ({activeConfig.unit})
            </div>
          </div>
        </div>
      ) : (
        /* Show All Grid View (2x4) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {HISTOGRAM_CONFIGS.map((config) => {
            const plotW = 150;
            const plotH = 155;
            const paddingLeft = 25;
            const paddingRight = 8;
            const paddingTop = 22;
            const paddingBottom = 22;

            const drawingW = plotW - paddingLeft - paddingRight; // 117
            const drawingH = plotH - paddingTop - paddingBottom; // 111

            const binWidth = drawingW / config.bins.length;

            // Compute dynamic nice Y axis limits to prevent title overflow entirely
            const maxStacked = Math.max(...config.bins.map(b => b.healthy + b.ckd), 10);
            const niceMaxY = Math.ceil(maxStacked / 10) * 10;
            const scaleFactor = niceMaxY * 1.1; // Add 10% premium space to guarantee bars never touch the title rectangle base

            const ticksY = [0, Math.round(niceMaxY / 2), niceMaxY];

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

                  {/* Plot Background and Border */}
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
                  {ticksY.map((tickY) => {
                    const yVal = paddingTop + drawingH - (tickY / scaleFactor) * drawingH;
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

                  {/* X Axis Grid lines & Tick Labels */}
                  {config.ticksX.map((tickX) => {
                    const xRatio = (tickX - config.minX) / (config.maxX - config.minX);
                    const xVal = paddingLeft + xRatio * drawingW;

                    if (xVal < paddingLeft || xVal > paddingLeft + drawingW) return null;

                    return (
                      <g key={tickX}>
                        <line 
                          x1={xVal} 
                          y1={paddingTop} 
                          x2={xVal} 
                          y2={paddingTop + drawingH} 
                          className="stroke-[#edf2f6] stroke-[0.8px]" 
                        />
                        <text 
                          x={xVal} 
                          y={paddingTop + drawingH + 8} 
                          textAnchor="middle" 
                          className="font-mono text-[7px] fill-gray-400"
                        >
                          {tickX}
                        </text>
                      </g>
                    );
                  })}

                  {/* Drawing Stacked Bars */}
                  {config.bins.map((bin, idx) => {
                    const barX = paddingLeft + idx * binWidth;
                    const barW = Math.max(0.6, binWidth - 0.4);

                    const ckdH = (bin.ckd / scaleFactor) * drawingH;
                    const healthyH = (bin.healthy / scaleFactor) * drawingH;

                    const ckdY = paddingTop + drawingH - ckdH;
                    const healthyY = ckdY - healthyH;

                    return (
                      <g key={idx}>
                        {bin.ckd > 0 && (
                          <rect 
                            x={barX} 
                            y={ckdY} 
                            width={barW} 
                            height={ckdH} 
                            fill="#b04334" 
                            stroke="#ffffff"
                            strokeWidth="0.1"
                          />
                        )}
                        {bin.healthy > 0 && (
                          <rect 
                            x={barX} 
                            y={healthyY} 
                            width={barW} 
                            height={healthyH} 
                            fill="#319795" 
                            stroke="#ffffff"
                            strokeWidth="0.1"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend Block */}
      <div className="flex justify-center items-center gap-6 mt-8 p-3 border-t border-gray-100 text-xs font-serif bg-gray-50/50 rounded-xl max-w-md mx-auto">
        <span className="text-gray-500 font-bold tracking-wider">Disease status</span>
        <span className="flex items-center gap-2 font-sans font-medium text-[11px] text-gray-700">
          <span className="w-4 h-3 bg-[#319795] rounded-[2px]" /> Healthy
        </span>
        <span className="flex items-center gap-2 font-sans font-medium text-[11px] text-gray-700">
          <span className="w-4 h-3 bg-[#b04334] rounded-[2px]" /> CKD
        </span>
      </div>
    </div>
  );
}
