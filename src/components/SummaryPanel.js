'use client';

import { useState } from 'react';

const COUNT_OPTIONS = [3, 5, 7];

export default function SummaryPanel({ summary }) {
  const [showCount, setShowCount] = useState(5);

  if (!summary || summary.originalSentenceCount === 0) {
    return (
      <div className="bg-surface border border-border rounded-[6px] p-6">
        <PanelHeading />
        <p className="text-[14px] text-secondary italic text-center py-8" style={{ opacity: 0.6 }}>
          Text is too short to summarize. Try a longer document.
        </p>
      </div>
    );
  }

  if (!summary.sentences || summary.sentences.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[6px] p-6">
        <PanelHeading />
        <p className="text-[14px] text-secondary italic text-center py-8" style={{ opacity: 0.6 }}>
          Text is too short to summarize. Try a longer document.
        </p>
      </div>
    );
  }

  const available = summary.sentences;
  const displayed = available.slice(0, showCount);
  const maxScore = Math.max(...displayed.map(s => s.score), 0.001);
  const isShortText = available.length < showCount;

  return (
    <div className="bg-surface border border-border rounded-[6px] p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <PanelHeading />
          <p className="text-[13px] text-secondary" style={{ opacity: 0.7 }}>
            Top sentences extracted by importance scoring
          </p>
        </div>
        {/* Length selector */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-mono text-[11px] text-secondary mr-1.5" style={{ opacity: 0.6 }}>
            Show:
          </span>
          {COUNT_OPTIONS.map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setShowCount(n)}
              className={`font-mono text-[12px] px-2.5 py-0.5 rounded-[4px] border transition-colors ${
                showCount === n
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg text-secondary border-border hover:bg-accent-light'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {isShortText && (
        <p className="font-mono text-[11px] text-secondary mb-4 italic" style={{ opacity: 0.6 }}>
          Showing all {available.length} sentence{available.length !== 1 ? 's' : ''} — text is shorter than the summary target.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {displayed.map((item) => {
          const isTop = item.score === maxScore;
          return (
            <div
              key={item.index}
              className="pl-4"
              style={{
                borderLeft: `3px solid ${isTop ? '#2D5A3D' : '#A3C4AE'}`,
              }}
            >
              <p className="text-[15px] leading-relaxed text-primary font-sans">
                {item.sentence}
              </p>
              <div className="mt-1.5 text-right">
                <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.5 }}>
                  Sentence {item.index + 1} of {summary.originalSentenceCount} · Score: {item.score.toFixed(3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PanelHeading() {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-widest text-secondary mb-1">
      Text Summary
    </div>
  );
}
