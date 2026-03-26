'use client';

export default function WordTable({
  words,
  sortBy,
  sortDir,
  onSort,
  currentPage,
  totalPages,
  totalWords,
  startIdx,
  onPageChange,
}) {
  const endIdx = Math.min(startIdx + words.length - 1, totalWords);

  const SortIndicator = ({ col }) => {
    if (sortBy !== col) return <span className="ml-1 opacity-25">↕</span>;
    return <span className="text-accent ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-surface border border-border rounded-[6px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg border-b border-border">
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-left px-4 py-2.5 w-14">
                #
              </th>
              <th
                className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-left px-4 py-2.5 cursor-pointer hover:text-primary select-none"
                onClick={() => onSort('word')}
              >
                Word <SortIndicator col="word" />
              </th>
              <th
                className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-right px-4 py-2.5 cursor-pointer hover:text-primary select-none"
                onClick={() => onSort('frequency')}
              >
                Count <SortIndicator col="frequency" />
              </th>
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-right px-4 py-2.5 w-20">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {words.map((word, idx) => (
              <tr
                key={word.word}
                className={`border-b border-border/40 last:border-0 hover:bg-accent-light transition-colors ${
                  idx % 2 === 0 ? 'bg-surface' : 'bg-bg'
                }`}
              >
                <td className="font-mono text-[12px] text-secondary px-4 py-1.5" style={{ opacity: 0.6 }}>
                  {String(startIdx + idx).padStart(2, '0')}
                </td>
                <td className="font-mono text-[14px] text-primary px-4 py-1.5">
                  {word.word}
                </td>
                <td className="font-mono text-[14px] text-primary text-right px-4 py-1.5">
                  {word.frequency.toLocaleString()}
                </td>
                <td className="font-mono text-[13px] text-secondary text-right px-4 py-1.5">
                  {word.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 border-t border-border bg-bg">
        <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.7 }}>
          {words.length > 0 ? startIdx : 0}–{endIdx} of {totalWords.toLocaleString()} words
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="font-mono text-[12px] text-secondary border border-border rounded-[4px] px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-light transition-colors"
          >
            ← prev
          </button>
          <span className="font-mono text-[11px] text-secondary opacity-50">
            {currentPage}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="font-mono text-[12px] text-secondary border border-border rounded-[4px] px-3 py-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent-light transition-colors"
          >
            next →
          </button>
        </div>
      </div>
    </div>
  );
}
