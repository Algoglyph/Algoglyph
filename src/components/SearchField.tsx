import React from 'react';
import { Search, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchField: React.FC<Props> = ({ value, onChange, placeholder = 'Search…' }) => {
  const isDark = useWorkspaceStore((state) => state.theme) === 'dark';

  return (
    <div className="relative">
      <Search
        size={13}
        aria-hidden
        className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 ${
          isDark ? 'text-zinc-500' : 'text-zinc-400'
        }`}
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
        className={`w-full rounded-lg border py-1.5 pl-8 pr-7 text-[12.5px] !outline-none focus-visible:!outline-none transition-all duration-200 [&::-webkit-search-cancel-button]:appearance-none ${
          isDark
            ? 'border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:bg-white/[0.04] focus-visible:ring-1 focus-visible:ring-white/10'
            : 'border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:border-zinc-300 focus-visible:bg-zinc-50 focus-visible:ring-1 focus-visible:ring-zinc-200'
        }`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          title="Clear"
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center rounded p-0.5 transition-colors cursor-pointer outline-none focus-visible:ring-2 ${
            isDark
              ? 'text-zinc-500 hover:bg-white/10 hover:text-zinc-300 focus-visible:ring-white/20'
              : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 focus-visible:ring-zinc-200'
          }`}
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
