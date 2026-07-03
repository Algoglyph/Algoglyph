import re

files = [
    'src/components/TopicDesignGraph.tsx',
    'src/components/SystemDesignGraph.tsx'
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add import
    if "import { useWorkspaceStore }" not in content:
        content = content.replace(
            "import { Search } from 'lucide-react';",
            "import { Search } from 'lucide-react';\nimport { useWorkspaceStore } from '../store/workspaceStore';"
        )

    # 2. Add isDark
    if "const isDark" not in content:
        content = content.replace(
            "const queryRef = useRef('');",
            "const queryRef = useRef('');\n  const isDark = useWorkspaceStore((state) => state.theme) === 'dark';"
        )

    # 3. Canvas draw updates
    
    # Edges
    content = content.replace(
        "ctx.strokeStyle = `rgba(160, 170, 190, ${alpha})`;",
        "ctx.strokeStyle = isDark ? `rgba(160, 170, 190, ${alpha})` : `rgba(38, 35, 26, ${alpha * 0.4})`;"
    )

    # Nodes base fill
    content = content.replace(
        "let fill = `rgba(226, 232, 244, ${alpha})`;",
        "let fill = isDark ? `rgba(226, 232, 244, ${alpha})` : `rgba(38, 35, 26, ${alpha})`;"
    )

    # Nodes query no-match
    content = content.replace(
        "fill = `rgba(226, 232, 244, ${alpha})`;",
        "fill = isDark ? `rgba(226, 232, 244, ${alpha})` : `rgba(38, 35, 26, ${alpha})`;"
    )

    # Nodes match
    content = content.replace(
        "fill = `rgba(96, 179, 255, ${alpha})`;",
        "fill = isDark ? `rgba(96, 179, 255, ${alpha})` : `rgba(60, 130, 246, ${alpha})`;"
    )
    
    # Nodes glow
    content = content.replace(
        "glow.addColorStop(0, 'rgba(96, 179, 255, 0.35)');",
        "glow.addColorStop(0, isDark ? 'rgba(96, 179, 255, 0.35)' : 'rgba(60, 130, 246, 0.25)');"
    )
    content = content.replace(
        "glow.addColorStop(1, 'rgba(96, 179, 255, 0)');",
        "glow.addColorStop(1, isDark ? 'rgba(96, 179, 255, 0)' : 'rgba(60, 130, 246, 0)');"
    )

    # Nodes hover
    content = content.replace(
        "fill = `rgba(255, 255, 255, ${alpha})`;",
        "fill = isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;"
    )

    # Label colors
    # Topic/System design graph might have different text color assignments
    content = content.replace(
        "? 'rgba(255,255,255,0.95)'",
        "? (isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.95)')"
    )
    content = content.replace(
        ": `rgba(210, 215, 225, ${n.kind === 'subtopic' ? 0.85 : 0.65})`;",
        ": (isDark ? `rgba(210, 215, 225, ${n.kind === 'subtopic' ? 0.85 : 0.65})` : `rgba(38, 35, 26, ${n.kind === 'subtopic' ? 0.85 : 0.65})`);"
    )

    # 4. Tailwind classes for stats text and search bar
    content = content.replace(
        '<span className="text-white font-semibold">',
        '<span className="text-[var(--rm-text)] font-semibold">'
    )

    # Search bar container
    content = content.replace(
        '<div className="flex items-center gap-2 border border-zinc-800 bg-[#18181b] rounded-lg px-3 py-2 transition focus-within:border-white/20 focus-within:bg-white/[0.04] focus-within:ring-1 focus-within:ring-white/10">',
        '<div className="flex items-center gap-2 border border-[var(--rm-border)] bg-[var(--rm-bg)] rounded-lg px-3 py-2 transition focus-within:border-[var(--rm-border-strong)] focus-within:ring-1 focus-within:ring-[var(--rm-border-strong)]">'
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

    # Helper text
    content = content.replace(
        '<div className="absolute bottom-3 right-4 font-mono text-[9.5px] text-zinc-600 pointer-events-none">',
        '<div className="absolute bottom-3 right-4 font-mono text-[9.5px] text-[var(--rm-text-faint)] pointer-events-none">'
    )

    with open(filepath, 'w') as f:
        f.write(content)
