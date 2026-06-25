import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchField: React.FC<Props> = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="relative">
    <Search
      size={13}
      aria-hidden
      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mute"
    />
    <input
      type="search"
      role="searchbox"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value) {
          e.stopPropagation();
          onChange('');
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete="off"
      spellCheck={false}
      className="w-full rounded-lg border border-hairline bg-canvas-soft py-1.5 pl-8 pr-7 text-[12.5px] text-ink placeholder:text-mute outline-none transition-colors focus-visible:border-link focus-visible:ring-1 focus-visible:ring-link"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        title="Clear"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center rounded p-0.5 text-mute hover:text-ink transition-colors cursor-pointer"
      >
        <X size={13} />
      </button>
    )}
  </div>
);
