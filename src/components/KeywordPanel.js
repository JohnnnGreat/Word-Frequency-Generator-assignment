'use client';

import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export default function KeywordPanel({ keywords }) {
  const [view, setView] = useState('tags'); // 'tags' | 'list'

  if (!keywords || keywords.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[6px] p-6">
        <PanelHeader view={view} onToggle={setView} />
        <p className="font-mono text-[13px] text-secondary italic text-center py-8" style={{ opacity: 0.6 }}>
          Not enough distinct terms to extract keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[6px] p-6">
      <PanelHeader view={view} onToggle={setView} />

      {view === 'tags' ? (
        <TagCloud keywords={keywords} />
      ) : (
        <ListView keywords={keywords} />
      )}
    </div>
  );
}

function PanelHeader({ view, onToggle }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-secondary mb-1">
          Keyword Extraction
        </div>
        <p className="text-[13px] text-secondary" style={{ opacity: 0.7 }}>
          Top keywords ranked by TF-IDF importance score
        </p>
      </div>
      <div className="flex gap-1 ml-4 shrink-0">
        <button
          type="button"
          onClick={() => onToggle('tags')}
          title="Tag cloud view"
          className={`p-1.5 rounded-[4px] border transition-colors ${
            view === 'tags'
              ? 'border-accent bg-accent-light text-accent'
              : 'border-border text-secondary hover:bg-accent-light'
          }`}
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          onClick={() => onToggle('list')}
          title="List view"
          className={`p-1.5 rounded-[4px] border transition-colors ${
            view === 'list'
              ? 'border-accent bg-accent-light text-accent'
              : 'border-border text-secondary hover:bg-accent-light'
          }`}
        >
          <List size={14} />
        </button>
      </div>
    </div>
  );
}

function TagCloud({ keywords }) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw, i) => (
        <span
          key={kw.keyword}
          className={`bg-accent-light text-accent border border-accent-muted rounded-[4px] px-3 py-1.5 font-mono transition-opacity hover:opacity-80 cursor-default ${
            i < 5 ? 'text-[15px] font-medium' : 'text-[13px] font-normal'
          }`}
          title={`TF-IDF score: ${kw.score}`}
        >
          {kw.keyword}
        </span>
      ))}
    </div>
  );
}

function ListView({ keywords }) {
  const maxScore = keywords[0]?.score || 1;

  return (
    <div className="flex flex-col gap-[3px]">
      {keywords.map((kw, i) => (
        <div key={kw.keyword} className="flex items-center gap-3 h-[26px] group">
          <span
            className="font-mono text-[11px] w-5 text-right shrink-0 select-none"
            style={{ color: '#6B6B65', opacity: 0.4 }}
          >
            {String(kw.rank).padStart(2, '0')}
          </span>
          <span className="font-mono text-[13px] text-primary w-32 shrink-0 truncate">
            {kw.keyword}
          </span>
          <div className="flex-1 h-[14px] bg-bg rounded-[2px] overflow-hidden">
            <div
              className={`h-full transition-opacity group-hover:opacity-70 ${
                i < 5 ? 'bg-accent' : 'bg-accent-muted'
              }`}
              style={{ width: `${(kw.score / maxScore) * 100}%`, minWidth: '2px' }}
            />
          </div>
          <span
            className="font-mono text-[12px] text-secondary w-12 text-right shrink-0"
            style={{ opacity: 0.7 }}
          >
            {kw.score.toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}
