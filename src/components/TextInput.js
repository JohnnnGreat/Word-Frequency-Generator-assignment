'use client';

export default function TextInput({ value, onChange, onSubmit }) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your text here or upload a document..."
        className="w-full min-h-[180px] resize-y border border-border rounded-[6px] p-3 pb-8 font-sans text-[15px] text-primary bg-surface focus:outline-none focus:border-accent placeholder:text-secondary leading-relaxed"
      />
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
        {charCount > 0 ? (
          <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.55 }}>
            {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
          </span>
        ) : (
          <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.4 }}>
            ⌘↵ to analyze
          </span>
        )}
      </div>
    </div>
  );
}
