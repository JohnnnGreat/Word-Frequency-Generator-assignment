'use client';

import { useState } from 'react';
import TextInput from '@/components/TextInput';
import FileUpload from '@/components/FileUpload';
import StatsRow from '@/components/StatsRow';
import FrequencyChart from '@/components/FrequencyChart';
import WordTable from '@/components/WordTable';
import NgramTabs from '@/components/NgramTabs';
import StopwordToggle from '@/components/StopwordToggle';
import KeywordPanel from '@/components/KeywordPanel';
import SummaryPanel from '@/components/SummaryPanel';
import ExportPanel from '@/components/ExportPanel';

const PAGE_SIZE = 50;

const RESULT_TABS = [
  { id: 'frequency', label: 'Frequency' },
  { id: 'keywords', label: 'Keywords' },
  { id: 'summary',  label: 'Summary'   },
  { id: 'export',   label: 'Export'    },
];

function SectionLabel({ number, text }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.45 }}>
        {number}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
        {text}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function Home() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ngramType, setNgramType] = useState('unigram');
  const [excludeStopwords, setExcludeStopwords] = useState(true);
  const [sortBy, setSortBy] = useState('frequency');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeResultTab, setActiveResultTab] = useState('frequency');

  const analyze = async (ngType) => {
    const type = ngType !== undefined ? ngType : ngramType;
    if (!text.trim() && !file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      else formData.append('text', text);
      formData.append('ngramType', type);

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data = await res.json();
      setResults(data);
      setCurrentPage(1);
      setActiveResultTab('frequency');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNgramChange = (type) => {
    setNgramType(type);
    if (results) analyze(type);
  };

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const handleStopwordToggle = (val) => {
    setExcludeStopwords(val);
    setCurrentPage(1);
  };

  const filteredWords = results?.words
    ? excludeStopwords
      ? results.words.filter((w) => !w.isStopword)
      : results.words
    : [];

  const sortedWords = [...filteredWords].sort((a, b) => {
    if (sortBy === 'frequency')
      return sortDir === 'desc' ? b.frequency - a.frequency : a.frequency - b.frequency;
    return sortDir === 'desc'
      ? b.word.localeCompare(a.word)
      : a.word.localeCompare(b.word);
  });

  const totalPages = Math.max(1, Math.ceil(sortedWords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE + 1;
  const pagedWords = sortedWords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const top20 = filteredWords.slice(0, 20);
  const canAnalyze = (text.trim().length > 0 || file !== null) && !loading;

  return (
    <>
      {/* Full-width accent strip */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-accent z-50" />

      <div className="bg-bg min-h-screen pt-[3px]">
        <div className="max-w-[960px] mx-auto px-6 pt-10 pb-24 max-sm:px-4">

          {/* Masthead */}
          <header className="mb-12">
            <div className="flex items-baseline justify-between gap-4">
              <h1 className="text-[22px] sm:text-[28px] font-semibold text-primary tracking-[-0.02em] leading-none">
                Word Frequency Analyzer
              </h1>
              <span className="font-mono text-[11px] text-secondary tracking-[0.05em] shrink-0 pb-px hidden sm:block">
                NLP Analysis Tool
              </span>
            </div>
            <div className="mt-4 h-px bg-border" />
          </header>

          {/* ── 01 Input ─────────────────────────────────────────── */}
          <SectionLabel number="01" text="Text Input" />
          <div className="bg-surface border border-border rounded-[6px] p-6 mb-12">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start mb-4">
              <div className="flex-1 w-full">
                <TextInput
                  value={text}
                  onChange={(v) => {
                    setText(v);
                    if (file) { setFile(null); setFileName(''); }
                  }}
                  onSubmit={() => canAnalyze && analyze()}
                />
              </div>
              <FileUpload
                onFile={(f, name) => { setFile(f); setFileName(name); setText(''); }}
                fileName={fileName}
              />
            </div>

            {error && (
              <p className="text-danger text-[13px] mb-3 font-mono">{error}</p>
            )}

            <button
              type="button"
              onClick={() => analyze()}
              disabled={!canAnalyze}
              className="w-full h-11 bg-accent text-white text-[13px] font-semibold uppercase tracking-[0.08em] rounded-[6px] hover:bg-[#245030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Run Analysis'}
            </button>
          </div>

          {/* ── Results ──────────────────────────────────────────── */}
          {results && (
            <>
              {/* ── 02 Stats ───────────────────────────────────────── */}
              <SectionLabel number="02" text="Summary" />
              <div className="mb-12">
                <StatsRow stats={results.stats} />
              </div>

              {/* ── 03 Analysis tabs ───────────────────────────────── */}
              <SectionLabel number="03" text="Analysis" />

              {/* Tab bar */}
              <div className="mb-6">
                <div className="flex border-b border-border">
                  {/* Scrollable tab row */}
                  <div className="flex overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                    {RESULT_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveResultTab(tab.id)}
                        className={`relative whitespace-nowrap px-3 sm:px-4 py-2.5 text-[13px] transition-colors shrink-0 ${
                          activeResultTab === tab.id
                            ? 'text-primary font-semibold'
                            : 'text-secondary hover:text-primary'
                        }`}
                      >
                        {tab.label}
                        {activeResultTab === tab.id && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Stopword toggle — inline on desktop */}
                  {activeResultTab === 'frequency' && ngramType === 'unigram' && (
                    <div className="pb-2 hidden sm:flex items-center">
                      <StopwordToggle checked={excludeStopwords} onChange={handleStopwordToggle} />
                    </div>
                  )}
                </div>
                {/* Stopword toggle — below tabs on mobile */}
                {activeResultTab === 'frequency' && ngramType === 'unigram' && (
                  <div className="pt-3 flex sm:hidden">
                    <StopwordToggle checked={excludeStopwords} onChange={handleStopwordToggle} />
                  </div>
                )}
              </div>

              {/* ── Frequency tab ──────────────────────────────────── */}
              {activeResultTab === 'frequency' && (
                <div>
                  {/* N-gram sub-tabs */}
                  <div className="border-b border-border/60 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    <NgramTabs active={ngramType} onChange={handleNgramChange} />
                  </div>

                  {ngramType === 'unigram' ? (
                    <>
                      <FrequencyChart words={top20} />
                      {sortedWords.length > 0 ? (
                        <WordTable
                          words={pagedWords}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          onSort={handleSort}
                          currentPage={safePage}
                          totalPages={totalPages}
                          totalWords={sortedWords.length}
                          startIdx={startIdx}
                          onPageChange={setCurrentPage}
                        />
                      ) : (
                        <p className="font-mono text-[13px] text-secondary mt-4">
                          No words to display — try disabling the stopword filter.
                        </p>
                      )}
                    </>
                  ) : (
                    <NgramResultTable ngrams={results.ngrams || []} />
                  )}
                </div>
              )}

              {/* ── Keywords tab ───────────────────────────────────── */}
              {activeResultTab === 'keywords' && (
                <KeywordPanel keywords={results.keywords || []} />
              )}

              {/* ── Summary tab ────────────────────────────────────── */}
              {activeResultTab === 'summary' && (
                <SummaryPanel summary={results.summary} />
              )}

              {/* ── Export tab ─────────────────────────────────────── */}
              {activeResultTab === 'export' && (
                <ExportPanel results={results} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NgramResultTable({ ngrams }) {
  if (!ngrams.length) {
    return (
      <p className="font-mono text-[13px] text-secondary">
        No n-grams found. Try analyzing a longer text.
      </p>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[6px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg border-b border-border">
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-left px-4 py-2.5 w-14">
                #
              </th>
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-left px-4 py-2.5">
                Phrase
              </th>
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-right px-4 py-2.5">
                Count
              </th>
              <th className="text-[11px] uppercase tracking-[0.08em] text-secondary font-semibold text-right px-4 py-2.5 w-24">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {ngrams.slice(0, 100).map((ngram, idx) => (
              <tr
                key={ngram.phrase}
                className={`border-b border-border/40 last:border-0 hover:bg-accent-light transition-colors ${
                  idx % 2 === 0 ? 'bg-surface' : 'bg-bg'
                }`}
              >
                <td className="font-mono text-[12px] text-secondary px-4 py-1.5">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                <td className="font-mono text-[14px] text-primary px-4 py-1.5">{ngram.phrase}</td>
                <td className="font-mono text-[14px] text-primary text-right px-4 py-1.5">
                  {ngram.frequency.toLocaleString()}
                </td>
                <td className="font-mono text-[13px] text-secondary text-right px-4 py-1.5">
                  {ngram.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
