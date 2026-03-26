'use client';

const TABS = [
  { id: 'unigram', label: 'Words' },
  { id: 'bigram', label: 'Bigrams' },
  { id: 'trigram', label: 'Trigrams' },
];

export default function NgramTabs({ active, onChange }) {
  return (
    <div className="flex">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-[14px] transition-colors ${
            active === tab.id
              ? 'text-primary font-semibold'
              : 'text-secondary font-normal hover:text-primary'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
