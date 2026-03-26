'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ onFile, fileName }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFile(file, file.name);
  };

  return (
    <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 border border-border rounded-[6px] px-3 py-1.5 text-[13px] font-medium text-secondary hover:bg-accent-light transition-colors whitespace-nowrap"
      >
        <Upload size={16} />
        Upload Document
      </button>
      {fileName && (
        <span className="text-[12px] text-secondary bg-accent-light border border-border rounded-[4px] px-2 py-0.5 max-w-[160px] truncate">
          {fileName}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
