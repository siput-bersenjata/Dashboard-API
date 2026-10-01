"use client";

interface TrendPoint {
  date: string;
  transaksi: number;
  dataApi: number;
}

interface PaymentCategory {
  name: string;
  count: number;
  percentage: number;
}

export function TrendLineChart({ data }: { data: TrendPoint[] }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.transaksi, d.dataApi)), 500);
  const chartHeight = 220;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 20;

  const stepX = (chartWidth - paddingX * 2) / (data.length - 1 || 1);

  const getCoordinates = (value: number, index: number) => {
    const x = paddingX + index * stepX;
    const y = chartHeight - paddingY - (value / maxVal) * (chartHeight - paddingY * 2);
    return { x, y };
  };

  const pointsTx = data.map((d, i) => getCoordinates(d.transaksi, i));
  const pointsApi = data.map((d, i) => getCoordinates(d.dataApi, i));

  const pathTx = pointsTx.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const pathApi = pointsApi.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Tren Transaksi & Data API</h3>
          <p className="text-xs text-slate-400">Aktivitas penarikan data harian</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
            <span className="text-slate-300">Transaksi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Data API</span>
          </div>
        </div>
      </div>

      <div className="relative h-[230px] w-full">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible">
          {/* Grid lines */}
          {[0, 100, 200, 300, 400, 500].map((level) => {
            const y = chartHeight - paddingY - (level / maxVal) * (chartHeight - paddingY * 2);
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#1e2c52"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x="10" y={y + 4} fill="#64748b" fontSize="10">
                  {level}
                </text>
              </g>
            );
          })}

          {/* Transaksi Line */}
          <path d={pathTx} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
          {pointsTx.map((p, i) => (
            <circle key={`tx-${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="#0b132b" strokeWidth="2" />
          ))}

          {/* Data API Line */}
          <path d={pathApi} fill="none" stroke="#10b981" strokeWidth="2.5" />
          {pointsApi.map((p, i) => (
            <circle key={`api-${i}`} cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#0b132b" strokeWidth="2" />
          ))}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = paddingX + i * stepX;
            return (
              <text key={d.date} x={x} y={chartHeight - 4} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {d.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function DonutChart({
  data,
  totalLabel = "2.482",
}: {
  data: PaymentCategory[];
  totalLabel?: string;
}) {
  const colors = ["#2563eb", "#38bdf8", "#10b981", "#64748b"];

  // Hitung stroke offset untuk donut SVG
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Jenis Transaksi</h3>
        <p className="text-xs text-slate-400">Berdasarkan metode & kategori</p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
            {data.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += item.percentage;

              return (
                <circle
                  key={item.name}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute text-center">
            <div className="text-xl font-bold text-white">{totalLabel}</div>
            <div className="text-[11px] font-medium text-slate-400">Total Data</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 w-full text-xs">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></span>
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-100 ml-2">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
