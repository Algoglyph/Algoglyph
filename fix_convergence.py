import re

with open('src/components/RoadmapConvergence.tsx', 'r') as f:
    content = f.read()

# 1. Add import
content = content.replace(
    "import { Search } from 'lucide-react';",
    "import { Search } from 'lucide-react';\nimport { useWorkspaceStore } from '../store/workspaceStore';"
)

# 2. Add isDark
content = content.replace(
    "const queryRef = useRef('');",
    "const queryRef = useRef('');\n  const isDark = useWorkspaceStore((state) => state.theme) === 'dark';"
)

# 3. Canvas draw updates
content = content.replace(
    "ctx.strokeStyle = hoveredId && (e.a === hoveredId || e.b === hoveredId) \n          ? 'rgba(255, 255, 255, 0.6)' \n          : `rgba(63, 63, 70, ${alpha})`;",
    "ctx.strokeStyle = hoveredId && (e.a === hoveredId || e.b === hoveredId) \n          ? (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(38, 35, 26, 0.6)')\n          : (isDark ? `rgba(255, 255, 255, ${alpha * 0.4})` : `rgba(38, 35, 26, ${alpha * 0.4})`);"
)

# Node fill
content = re.sub(
    r"// Map status colors for curriculum zones[\s\S]*?fill = '#ffffff'; // root is always white\n        \}",
    "fill = isDark ? '#ffffff' : '#26231a';",
    content
)

# Hover glow
content = content.replace(
    "glowGrad.addColorStop(0, n.kind === 'root' ? 'rgba(255,255,255,0.25)' : 'rgba(255, 255, 255, 0.35)');",
    "glowGrad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(38, 35, 26, 0.25)');"
)

# Hover ring
content = content.replace(
    "ctx.strokeStyle = '#ffffff';",
    "ctx.strokeStyle = isDark ? '#ffffff' : '#26231a';"
)

# Node text
content = content.replace(
    "ctx.fillStyle = isHovered || matches \n            ? '#ffffff' \n            : 'rgba(228, 228, 231, 0.75)';",
    "ctx.fillStyle = isHovered || matches \n            ? (isDark ? '#ffffff' : '#26231a')\n            : (isDark ? 'rgba(228, 228, 231, 0.75)' : 'rgba(38, 35, 26, 0.75)');"
)

# 4. Tailwind classes

# Section
content = content.replace(
    '<section className="relative w-full py-10 flex flex-col items-center justify-center border-t border-zinc-800/60 mt-10">',
    '<section className="relative w-full py-10 flex flex-col items-center justify-center border-t border-[var(--rm-border)] mt-10">'
)

# Title
content = content.replace(
    '<h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">',
    '<h2 className="text-xl sm:text-2xl font-bold text-[var(--rm-text)] tracking-tight">'
)

# Subtitle
content = content.replace(
    '<p className="max-w-xl text-[12.5px] text-zinc-400 font-sans">',
    '<p className="max-w-xl text-[12.5px] text-[var(--rm-text-muted)] font-sans">'
)

# Search bar container
content = content.replace(
    '<div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950/60 rounded-lg px-3 py-2 transition focus-within:border-white/20 focus-within:bg-zinc-900/60 focus-within:ring-1 focus-within:ring-white/10">',
    '<div className="flex items-center gap-2 border border-[var(--rm-border)] bg-[var(--rm-surface)] rounded-lg px-3 py-2 transition focus-within:border-[var(--rm-border-strong)] focus-within:ring-1 focus-within:ring-[var(--rm-border-strong)]">'
)

# Search icon
content = content.replace(
    '<Search size={14} className="text-zinc-500 shrink-0" />',
    '<Search size={14} className="text-[var(--rm-text-faint)] shrink-0" />'
)

# Search input
content = content.replace(
    'className="bg-transparent border-none text-[12px] text-zinc-200 !outline-none focus-visible:!outline-none w-full placeholder-zinc-500 font-sans"',
    'className="bg-transparent border-none text-[12px] text-[var(--rm-text)] !outline-none focus-visible:!outline-none w-full placeholder-[var(--rm-text-faint)] font-sans"'
)

# Graph container
content = content.replace(
    'className="relative z-10 w-full h-[460px] bg-zinc-950/40 border border-zinc-800 rounded-xl overflow-hidden"',
    'className="relative z-10 w-full h-[460px] bg-[var(--rm-bg)] border border-[var(--rm-border)] rounded-xl overflow-hidden"'
)

# Helper text
content = content.replace(
    '<div className="absolute bottom-3 right-4 font-mono text-[9px] text-zinc-600 pointer-events-none">',
    '<div className="absolute bottom-3 right-4 font-mono text-[9px] text-[var(--rm-text-faint)] pointer-events-none">'
)

# Button
content = content.replace(
    'className="mt-8 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[12.5px] font-medium transition cursor-pointer font-sans"',
    'className="mt-8 px-5 py-2.5 rounded-lg bg-[var(--rm-btn-bg)] hover:bg-[var(--rm-btn-hover)] border border-[var(--rm-btn-border)] text-[var(--rm-btn-text)] text-[12.5px] font-medium transition cursor-pointer font-sans"'
)

with open('src/components/RoadmapConvergence.tsx', 'w') as f:
    f.write(content)
