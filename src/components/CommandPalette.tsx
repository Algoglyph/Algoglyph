import React, { useEffect, useState, useRef, useMemo } from 'react';
import { dsaStructures } from '../config/dsaStructures';
import type { DSAStructure } from '../config/dsaStructures';
import { Search, CornerDownLeft, Info } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { insertStructureIntoCanvas } from '../lib/insertStructure';
import { BLOG_POSTS } from '../config/blogData';
import { ALGORITHMS } from '../config/algorithms';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  type: 'structure' | 'blog' | 'view' | 'algorithm' | 'command';
  name: string;
  category: string;
  description: string;
  structureData?: DSAStructure;
  slug?: string;
  viewName?: any;
  algoId?: string;
  action?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const showNotification = useWorkspaceStore((state) => state.showNotification);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Aggregate all search targets
  const allItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];

    // 1. Views
    list.push({
      id: 'nav-roadmap',
      type: 'view',
      name: 'Curriculum Roadmap',
      category: 'Navigation',
      description: 'Open the interactive spatial learning curriculum',
      viewName: 'roadmap'
    });
    list.push({
      id: 'nav-blog',
      type: 'view',
      name: 'Theory Graph Mesh',
      category: 'Navigation',
      description: 'Open the CS theory index and concept mesh',
      viewName: 'blog'
    });
    list.push({
      id: 'nav-workspace',
      type: 'view',
      name: 'Interactive Workspace',
      category: 'Navigation',
      description: 'Open the canvas, code runner, and editor split workspace',
      viewName: 'workspace'
    });

    // 2. Blogs
    BLOG_POSTS.forEach((post) => {
      list.push({
        id: `blog-${post.slug}`,
        type: 'blog',
        name: `Theory: ${post.title}`,
        category: 'Theory Post',
        description: post.tagline,
        slug: post.slug
      });
    });

    // 3. Algorithms
    Object.values(ALGORITHMS).forEach((algo) => {
      list.push({
        id: `algo-${algo.id}`,
        type: 'algorithm',
        name: `Visualizer: ${algo.name}`,
        category: 'Algorithm',
        description: `Launch ${algo.name} playback session in workspace`,
        algoId: algo.id
      });
    });

    // 4. Commands
    list.push({
      id: 'cmd-theme',
      type: 'command',
      name: 'Command: Toggle Theme Mode',
      category: 'Workspace',
      description: 'Switch workspace between dark and light themes',
      action: () => {
        const currentTheme = useWorkspaceStore.getState().theme;
        useWorkspaceStore.getState().setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        showNotification(`Theme set to ${currentTheme === 'dark' ? 'light' : 'dark'}`, 'success');
      }
    });
    list.push({
      id: 'cmd-clear-viz',
      type: 'command',
      name: 'Command: Reset Visualizers',
      category: 'Workspace',
      description: 'Remove all active playback nodes from the infinite plane',
      action: () => {
        useWorkspaceStore.getState().clearVisualizerNodes();
        showNotification('Cleared all visualizer sessions', 'success');
      }
    });

    // 5. Canvas templates / structures
    dsaStructures.forEach((s) => {
      list.push({
        id: `structure-${s.id}`,
        type: 'structure',
        name: `Insert: ${s.name}`,
        category: 'Canvas Template',
        description: s.description,
        structureData: s
      });
    });

    return list;
  }, [showNotification]);

  // Filter items matching the query
  const filteredItems = useMemo(() => {
    const searchStr = query.toLowerCase().trim();
    if (!searchStr) return allItems.slice(0, 8); // default selection
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchStr) ||
        item.description.toLowerCase().includes(searchStr) ||
        item.category.toLowerCase().includes(searchStr)
    );
  }, [allItems, query]);

  const handleSelectItem = (item: PaletteItem) => {
    if (item.type === 'structure' && item.structureData) {
      if ((window as any).navigateTo) {
        (window as any).navigateTo('workspace');
      }
      insertStructureIntoCanvas(item.structureData, (msg) => showNotification(msg, 'error'));
      showNotification(`Inserted ${item.structureData.name} onto canvas`, 'success');
    } else if (item.type === 'blog' && item.slug) {
      if ((window as any).navigateTo) {
        (window as any).navigateTo('blog', `/blog/${item.slug}`);
      }
    } else if (item.type === 'view' && item.viewName) {
      if ((window as any).navigateTo) {
        (window as any).navigateTo(item.viewName);
      }
    } else if (item.type === 'algorithm' && item.algoId) {
      useWorkspaceStore.getState().clearVisualizerNodes();
      useWorkspaceStore.getState().addVisualizerNode(item.algoId, 100, 100);
      useWorkspaceStore.getState().setLayoutMode('visualizer');
      if ((window as any).navigateTo) {
        (window as any).navigateTo('workspace');
      }
      showNotification(`Launched visualizer for ${item.name}`, 'success');
    } else if (item.type === 'command' && item.action) {
      item.action();
    }
    onClose();
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          handleSelectItem(selected);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      {/* Backdrop click to close */}
      <div className="absolute inset-0 z-0 cursor-default" onClick={onClose} />

      {/* Main Palette Box */}
      <div className="w-full max-w-xl bg-canvas border border-hairline rounded-xl shadow-[var(--shadow-modal)] ring-1 ring-hairline overflow-hidden flex flex-col font-mono z-10 mx-4">
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline bg-transparent">
          <Search size={16} className="text-body" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search blogs, roadmaps, algorithms, commands..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-ink !outline-none focus-visible:!outline-none placeholder-mute"
          />
        </div>

        {/* List of matches */}
        <div className="max-h-[340px] overflow-y-auto p-1.5 bg-transparent">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => handleSelectItem(item)}
                  className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-link/10 text-link ring-1 ring-inset ring-link/30'
                      : 'border border-transparent text-body hover:text-ink'
                  }`}
                >
                  <div className="flex flex-col text-left max-w-[75%]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate">{item.name}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border border-hairline tracking-wider text-mute select-none`}>
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-body mt-0.5 truncate">{item.description}</span>
                  </div>

                  {/* Action indicator */}
                  <div className="flex items-center shrink-0 select-none">
                    {isSelected && (
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-link">
                        Execute
                        <CornerDownLeft size={10} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-xs text-mute text-center">
              No matching items, algorithms, or commands found.
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-3 border-t border-hairline bg-transparent text-[9px] text-mute flex justify-between select-none items-center">
          <div className="flex gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to execute</span>
          </div>
          <span className="flex items-center gap-1">
            <Info size={10} />
            esc to close
          </span>
        </div>
      </div>
    </div>
  );
};
