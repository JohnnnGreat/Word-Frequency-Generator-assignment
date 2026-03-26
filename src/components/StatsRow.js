export default function StatsRow({ stats }) {
  const items = [
    { label: 'Total Words', value: stats.totalWords.toLocaleString(), unit: 'tokens' },
    { label: 'Unique Words', value: stats.uniqueWords.toLocaleString(), unit: 'types' },
    { label: 'Sentences', value: stats.sentences.toLocaleString(), unit: 'detected' },
    { label: 'Avg. Word Length', value: stats.avgWordLength.toFixed(1), unit: 'chars' },
  ];

  return (
    <div className="bg-surface border border-border rounded-[6px] flex divide-x divide-border max-sm:flex-col max-sm:divide-x-0 max-sm:divide-y">
      {items.map((item) => (
        <div key={item.label} className="flex-1 px-4 sm:px-5 py-4">
          <div
            className="text-[10px] font-semibold uppercase tracking-widest text-secondary mb-2.5"
            style={{ opacity: 0.7 }}
          >
            {item.label}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[26px] font-medium text-primary leading-none">
              {item.value}
            </span>
            <span className="font-mono text-[11px] text-secondary" style={{ opacity: 0.5 }}>
              {item.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
