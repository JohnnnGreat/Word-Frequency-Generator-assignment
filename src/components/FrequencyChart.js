export default function FrequencyChart({ words }) {
  if (!words.length) return null;
  const maxFreq = words[0].frequency;

  return (
    <div className="bg-surface border border-border rounded-[6px] p-6 mb-4">
      <div className="flex items-baseline justify-between mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
          Frequency Distribution
        </span>
        <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.5 }}>
          top {words.length}
        </span>
      </div>

      {/* Chart area with grid */}
      <div className="flex flex-col gap-[3px]">
        {words.map((item, i) => (
          <div key={item.word} className="flex items-center gap-2 h-[26px] group">
            {/* Rank */}
            <span
              className="font-mono text-[11px] w-5 text-right shrink-0 select-none"
              style={{ color: '#6B6B65', opacity: 0.4 }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Word label */}
            <span className="font-mono text-[13px] text-secondary w-[112px] text-right shrink-0 truncate">
              {item.word}
            </span>

            {/* Bar track */}
            <div className="flex-1 relative h-full flex items-center">
              {/* Ghost grid lines */}
              {[25, 50, 75].map((pct) => (
                <div
                  key={pct}
                  className="absolute top-0 bottom-0 border-l border-border"
                  style={{ left: `${pct}%`, borderStyle: 'dashed' }}
                />
              ))}
              {/* Bar */}
              <div
                className={`h-[16px] relative z-10 transition-opacity group-hover:opacity-70 ${
                  i < 5 ? 'bg-accent' : 'bg-accent-muted'
                }`}
                style={{ width: `${(item.frequency / maxFreq) * 100}%`, minWidth: '2px' }}
              />
            </div>

            {/* Count */}
            <span className="font-mono text-[12px] text-secondary w-12 text-right shrink-0">
              {item.frequency.toLocaleString()}
            </span>

            {/* Percentage */}
            <span
              className="font-mono text-[11px] w-10 text-right shrink-0"
              style={{ color: '#6B6B65', opacity: 0.5 }}
            >
              {item.percentage?.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Scale labels */}
      <div className="flex mt-2" style={{ marginLeft: 'calc(5px + 20px + 8px + 112px + 8px)' }}>
        <div className="flex-1 relative">
          {[25, 50, 75].map((pct) => (
            <span
              key={pct}
              className="absolute font-mono text-[10px] text-secondary"
              style={{ left: `${pct}%`, opacity: 0.35, transform: 'translateX(-50%)' }}
            >
              {pct}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
