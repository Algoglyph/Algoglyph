import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { ROADMAP_ZONES } from '../config/roadmapData';
import type { Concept, RoadmapZone, Topic } from '../config/roadmapData';
import { BLOG_POSTS } from '../config/blogData';
import type { BlogPost } from '../config/blogData';
import { ML_BLOG_DATA } from '../config/mlBlogData';
import { deBlogData } from '../config/deBlogData';
import { getArticleRouteBySlug, getRelatedArticleRoutes } from '../lib/seoRoutes';
import { useWorkspaceStore } from '../store/workspaceStore';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { vscodeDark, vscodeLight } from '../config/editorTheme';
import { RoadmapConvergence } from './RoadmapConvergence';
import { RoadmapIllustration } from './RoadmapIllustration';
import katex from 'katex';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';

import { SystemDesignGraph } from './SystemDesignGraph';
import { TopicDesignGraph } from './TopicDesignGraph';

interface RoadmapPageProps {
  onBack: () => void;
  onLaunch: () => void;
}

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const renderInlineMarkdown = (text: string): string => {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--rm-accent)] hover:underline font-semibold">$1</a>');
};

const articleMarkdownToHtml = (markdown: string): string => {
  const blocks: string[] = [];
  const mathBlocks: string[] = [];
  const inlineMathBlocks: string[] = [];
  
  // Protect code blocks (```lang...```) and syntax highlight them using highlight.js
  let content = markdown.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const token = `@@BLOCK_CODE_${blocks.length}@@`;
    let highlightedCode = escapeHtml(code.trim());
    let languageClass = '';
    
    if (lang) {
      try {
        const cleanLang = lang.toLowerCase() === 'cpp' ? 'cpp' : lang.toLowerCase();
        highlightedCode = hljs.highlight(code.trim(), { language: cleanLang }).value;
        languageClass = ` class="language-${cleanLang} hljs"`;
      } catch (e) {
        try {
          highlightedCode = hljs.highlightAuto(code.trim()).value;
          languageClass = ' class="hljs"';
        } catch (err) {
          // ignore
        }
      }
    } else {
      try {
        highlightedCode = hljs.highlightAuto(code.trim()).value;
        languageClass = ' class="hljs"';
      } catch (err) {
        // ignore
      }
    }
    
    blocks.push(`<pre><code${languageClass}>${highlightedCode}</code></pre>`);
    return token;
  });

  // Protect and render LaTeX block math ($$...$$) using KaTeX
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const token = `@@BLOCK_MATH_${mathBlocks.length}@@`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathBlocks.push(rendered);
    } catch (e) {
      mathBlocks.push(`<div class="math-error">${escapeHtml(math)}</div>`);
    }
    return token;
  });

  // Protect and render LaTeX inline math ($...$) using KaTeX
  content = content.replace(/\$([^\$]+?)\$/g, (_, math) => {
    const token = `@@INLINE_MATH_${inlineMathBlocks.length}@@`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      inlineMathBlocks.push(rendered);
    } catch (e) {
      inlineMathBlocks.push(`<span class="math-error">${escapeHtml(math)}</span>`);
    }
    return token;
  });

  // Protect SVG blocks (<svg ... </svg>)
  content = content.replace(/<svg[\s\S]*?<\/svg>/g, (match) => {
    const token = `@@BLOCK_SVG_${blocks.length}@@`;
    blocks.push(match);
    return token;
  });

  // Protect HTML table blocks if any
  content = content.replace(/<table[\s\S]*?<\/table>/g, (match) => {
    const token = `@@BLOCK_TABLE_${blocks.length}@@`;
    blocks.push(match);
    return token;
  });

  const lines = content.split(/\r?\n/);
  const htmlLines: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inTable = false;
  let tableRows: string[][] = [];
  let inBlockquote = false;

  const closeBlockquote = () => {
    if (inBlockquote) {
      htmlLines.push('</blockquote>');
      inBlockquote = false;
    }
  };

  const closeList = () => {
    if (inList) {
      htmlLines.push(`</${inList}>`);
      inList = null;
    }
  };

  const closeTable = () => {
    if (inTable) {
      let tableHtml = `<div class="overflow-x-auto"><table>`;
      tableRows.forEach((row, rIdx) => {
        const isHeader = rIdx === 0;
        const tag = isHeader ? 'th' : 'td';
        
        tableHtml += `<tr>`;
        row.forEach(cell => {
          tableHtml += `<${tag}>${renderInlineMarkdown(cell)}</${tag}>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</table></div>`;
      htmlLines.push(tableHtml);
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (line.startsWith('@@BLOCK_') || line.startsWith('@@INLINE_')) {
      closeList();
      closeTable();
      closeBlockquote();
      htmlLines.push(line);
      continue;
    }

    if (!line) {
      closeList();
      closeTable();
      closeBlockquote();
      continue;
    }

    if (line.startsWith('|')) {
      closeList();
      closeBlockquote();
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.every(c => c.startsWith('-'))) {
        continue; // skip the separator line |---|---|
      }
      tableRows.push(cells);
      continue;
    } else {
      closeTable();
    }

    if (line === '---') {
      closeList();
      closeBlockquote();
      htmlLines.push('<hr class="my-8 border-[var(--rm-border)] opacity-30" />');
    } else if (line.startsWith('>')) {
      closeList();
      if (!inBlockquote) {
        inBlockquote = true;
        htmlLines.push('<blockquote>');
      }
      const bqLine = line.replace(/^>\s*/, '');
      htmlLines.push(`<p>${renderInlineMarkdown(bqLine)}</p>`);
    } else if (line.startsWith('# ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h1>${renderInlineMarkdown(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      closeList();
      closeBlockquote();
      htmlLines.push(`<h3>${renderInlineMarkdown(line.slice(4))}</h3>`);
    } else if (/^[-*]\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        htmlLines.push('<ul>');
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      closeBlockquote();
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        htmlLines.push('<ol>');
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else {
      closeList();
      closeBlockquote();
      htmlLines.push(`<p>${renderInlineMarkdown(rawLine)}</p>`);
    }
  }
  closeList();
  closeTable();
  closeBlockquote();

  let finalHtml = htmlLines.join('\n');

  // Substitute blocks
  blocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(`@@BLOCK_CODE_${idx}@@`, block);
    finalHtml = finalHtml.replace(`@@BLOCK_SVG_${idx}@@`, block);
    finalHtml = finalHtml.replace(`@@BLOCK_TABLE_${idx}@@`, block);
  });

  // Substitute math blocks
  mathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(`@@BLOCK_MATH_${idx}@@`, mathHtml);
  });

  // Substitute inline math blocks
  inlineMathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(`@@INLINE_MATH_${idx}@@`, mathHtml);
  });

  // Remove <p> tag wrappers around blocks
  finalHtml = finalHtml.replace(/<p class="my-4">@@BLOCK_SVG_(\d+)@@<\/p>/g, (_, id) => blocks[Number(id)]);
  finalHtml = finalHtml.replace(/<p class="my-4">@@BLOCK_CODE_(\d+)@@<\/p>/g, (_, id) => blocks[Number(id)]);
  finalHtml = finalHtml.replace(/<p class="my-4">@@BLOCK_MATH_(\d+)@@<\/p>/g, (_, id) => mathBlocks[Number(id)]);

  // Final replacement for safety
  blocks.forEach((block, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_CODE_${idx}@@`, 'g'), block);
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_SVG_${idx}@@`, 'g'), block);
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_TABLE_${idx}@@`, 'g'), block);
  });

  mathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@BLOCK_MATH_${idx}@@`, 'g'), mathHtml);
  });

  inlineMathBlocks.forEach((mathHtml, idx) => {
    finalHtml = finalHtml.replace(new RegExp(`@@INLINE_MATH_${idx}@@`, 'g'), mathHtml);
  });

  return finalHtml;
};

// Fallback generator for new/specific subtopics to guarantee detailed content is always available
const getFallbackBlogPost = (slug: string, subtopicName: string, category: string): BlogPost => {
  const deMarkdown = deBlogData[slug];
  if (deMarkdown) {
    return {
      slug,
      title: subtopicName,
      tagline: `A theoretical guide to the design mechanics, complexity characteristics, and real-world usage of ${subtopicName}.`,
      category,
      lastUpdated: 'July 2026',
      readTime: 7,
      prerequisites: [],
      related: [],
      practiceProblems: [],
      content: {
        introduction: `This comprehensive guide covers the core technical structures of ${subtopicName}.`,
        whyImportant: ``,
        realWorldApps: [],
        algorithmDescription: [],
        complexity: [],
        implementationCpp: '',
        implementationPython: '',
        commonMistakes: [],
        interviewQuestions: [],
        summary: ''
      },
      markdown: deMarkdown
    };
  }

  const custom = ML_BLOG_DATA[slug];
  if (custom) {
    return {
      slug,
      title: custom.title || `${subtopicName} (Syllabus Guide)`,
      tagline: custom.tagline || `A theoretical guide to the design mechanics, complexity characteristics, and real-world usage of ${subtopicName}.`,
      category: custom.category || category,
      lastUpdated: 'July 2026',
      readTime: custom.readTime || 7,
      prerequisites: custom.prerequisites || [],
      related: custom.related || [],
      practiceProblems: custom.practiceProblems || [],
      content: {
        introduction: custom.content?.introduction || `This comprehensive guide covers the core technical structures, logical rules, and memory layouts of ${subtopicName}.`,
        whyImportant: custom.content?.whyImportant || `${subtopicName} plays an indispensable role in high-performance computing and modern software architecture.`,
        realWorldApps: custom.content?.realWorldApps || [],
        algorithmDescription: custom.content?.algorithmDescription || [],
        complexity: custom.content?.complexity || [],
        implementationCpp: custom.content?.implementationCpp || '',
        implementationPython: custom.content?.implementationPython || '',
        commonMistakes: custom.content?.commonMistakes || [],
        interviewQuestions: custom.content?.interviewQuestions || [],
        summary: custom.content?.summary || `In summary, mastering ${subtopicName} is key to designing optimal, memory-friendly software systems.`
      }
    };
  }

  return {
    slug,
    title: `${subtopicName} (Syllabus Guide)`,
    tagline: `A theoretical guide to the design mechanics, complexity characteristics, and real-world usage of ${subtopicName}.`,
    category,
    lastUpdated: 'July 2026',
    readTime: 7,
    prerequisites: [],
    related: [],
    practiceProblems: [],
    content: {
      introduction: `This comprehensive guide covers the core technical structures, logical rules, and memory layouts of ${subtopicName}. In computer science, mastering ${subtopicName} is key to designing architectures that utilize resources efficiently and scale without latency degradation.

At its core, ${subtopicName} governs how data elements are represented in virtual memory, processed by CPU instructions, and referenced across different computational spaces. By analyzing its logical boundaries, developers can minimize instruction overhead and avoid page faults in complex workloads.

Historically, this pattern was designed to solve fundamental throughput and storage constraints. Today, it remains a standard paradigm across systems engineering, database engines, and software compiler toolchains. Understanding its underlying mechanics is essential for solving complex engineering challenges and optimizing large-scale software structures.`,
      whyImportant: `${subtopicName} plays an indispensable role in high-performance computing and modern software architecture. Without a firm understanding of its theoretical mechanics, developers risk creating performance bottlenecks, thread-safety violations, and memory leaks.

By studying ${subtopicName}, you learn how to balance execution speed against space allocations. This optimization is crucial in latency-sensitive systems such as high-frequency trading brokers, real-time audio mixers, database query compilers, and embedded controller units where microseconds count.

Furthermore, mastering the structural mechanics of ${subtopicName} enhances your debugging capabilities. It allows you to trace system crashes back to memory alignment faults, cache thrashing patterns, and thread race conditions, ensuring that your code passes strict hardware validation steps.`,
      realWorldApps: [
        `Low-level memory managers and storage device blocks.`,
        `Compiler optimization passes and syntax parsing engines.`,
        `High-throughput event logs and message routers.`
      ],
      algorithmDescription: [],
      complexity: [],
      implementationCpp: "",
      implementationPython: "",
      commonMistakes: [],
      interviewQuestions: [],
      summary: `In summary, mastering ${subtopicName} is key to designing optimal, memory-friendly software systems.`
    }
  };
};

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onBack, onLaunch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const roadmapProgress = useWorkspaceStore((state) => state.roadmapProgress);
  const updateRoadmapProgress = useWorkspaceStore((state) => state.updateRoadmapProgress);
  const theme = useWorkspaceStore((state) => state.theme);
  const toggleTheme = useWorkspaceStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  // Parse path: /roadmap/:moduleId/:topicId/:conceptId/:blogSlug
  const parts = location.pathname.split('/').filter(Boolean);
  const activeModuleId = parts[1] || null;
  const activeCoreTopicId = parts[2] || null;
  const activeSubContainerId = parts[3] || null;
  const selectedBlogSlug = parts[4] || null;

  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'py'>('py');
  
  // Search state for specific blogs
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Reset scroll to 0 instantly on path level changes to fix the bottom-scroll bug!
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'instant' as any });
    }
  }, [location.pathname]);

  const allSubConcepts = useMemo(() => {
    return ROADMAP_ZONES.flatMap((z) =>
      z.topics.flatMap((t) => t.concepts.flatMap((c) => c.subtopics))
    );
  }, []);

  const getZoneSubtopicCount = (zone: RoadmapZone) =>
    zone.topics.reduce((topicSum, topic) =>
      topicSum + topic.concepts.reduce((conceptSum, concept) => conceptSum + concept.subtopics.length, 0), 0);

  const getModuleHours = (zone: RoadmapZone) => getZoneSubtopicCount(zone);

  const totalHours = ROADMAP_ZONES.reduce((sum, z) => sum + getModuleHours(z), 0);
  const totalConcepts = allSubConcepts.length;

  const activeModule = useMemo(() => {
    if (!activeModuleId) return null;
    return ROADMAP_ZONES.find((z) => z.id === activeModuleId) || null;
  }, [activeModuleId]);

  const activeCoreTopic = useMemo(() => {
    if (!activeModule || !activeCoreTopicId) return null;
    return activeModule.topics.find((t) => t.id === activeCoreTopicId) || null;
  }, [activeModule, activeCoreTopicId]);

  const activeSubContainer = useMemo(() => {
    if (!activeCoreTopic || !activeSubContainerId) return null;
    return activeCoreTopic.concepts.find((c) => c.id === activeSubContainerId) || null;
  }, [activeCoreTopic, activeSubContainerId]);

  // Read blog post matching slug
  const activePost = useMemo(() => {
    if (!selectedBlogSlug) return null;
    const clean = selectedBlogSlug.toLowerCase();
    
    // Look up in pre-generated list
    const found = BLOG_POSTS.find(
      (p) =>
        p.slug === clean ||
        p.slug === clean + 's' ||
        p.slug === clean.slice(0, -1) ||
        p.slug.replace(/-/g, '') === clean.replace(/-/g, '')
    );
    if (found) return found;

    // Fallback if not found: find matching subtopic in curriculum data
    for (const zone of ROADMAP_ZONES) {
      for (const topic of zone.topics) {
        for (const concept of topic.concepts) {
          for (const subtopic of concept.subtopics) {
            if (subtopic.blogSlug === clean) {
              return getFallbackBlogPost(clean, subtopic.name, zone.name);
            }
          }
        }
      }
    }

    // Default dynamic guide if no match in structured curriculum either
    const formattedTitle = clean.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return getFallbackBlogPost(clean, formattedTitle, 'Computer Science');
  }, [selectedBlogSlug]);

  const getModuleStatusStats = (zoneId: string) => {
    const zone = ROADMAP_ZONES.find((z) => z.id === zoneId);
    if (!zone) return { status: 'Not Started', percent: 0, completedCount: 0, total: 0 };

    const subtopics = zone.topics.flatMap((t) =>
      t.concepts.flatMap((c) => c.subtopics)
    );
    if (subtopics.length === 0) return { status: 'Not Started', percent: 0, completedCount: 0, total: 0 };

    const statuses = subtopics.map(
      (s) => roadmapProgress[s.name] || 'Not Started'
    );
    const completedCount = statuses.filter((st) => st === 'Completed').length;
    const percent = Math.round((completedCount / subtopics.length) * 100);

    let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
    if (completedCount === subtopics.length) {
      status = 'Completed';
    } else if (completedCount > 0 || statuses.some((st) => st === 'In Progress')) {
      status = 'In Progress';
    }

    return { status, percent, completedCount, total: subtopics.length };
  };

  const getTopicStatusStats = (topic: Topic) => {
    const subtopics = topic.concepts.flatMap((c) => c.subtopics);
    if (subtopics.length === 0) return { status: 'Not Started', percent: 0, completedCount: 0, total: 0 };

    const statuses = subtopics.map(
      (s) => roadmapProgress[s.name] || 'Not Started'
    );
    const completedCount = statuses.filter((st) => st === 'Completed').length;
    const percent = Math.round((completedCount / subtopics.length) * 100);

    let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
    if (completedCount === subtopics.length) {
      status = 'Completed';
    } else if (completedCount > 0 || statuses.some((st) => st === 'In Progress')) {
      status = 'In Progress';
    }

    return { status, percent, completedCount, total: subtopics.length };
  };

  const getConceptStatusStats = (concept: Concept) => {
    const subtopics = concept.subtopics;
    if (subtopics.length === 0) return { status: 'Not Started', percent: 0, completedCount: 0, total: 0 };

    const statuses = subtopics.map(
      (s) => roadmapProgress[s.name] || 'Not Started'
    );
    const completedCount = statuses.filter((st) => st === 'Completed').length;
    const percent = Math.round((completedCount / subtopics.length) * 100);

    let status: 'Not Started' | 'In Progress' | 'Completed' = 'Not Started';
    if (completedCount === subtopics.length) {
      status = 'Completed';
    } else if (completedCount > 0 || statuses.some((st) => st === 'In Progress')) {
      status = 'In Progress';
    }

    return { status, percent, completedCount, total: subtopics.length };
  };



  const handleBack = () => {
    if (parts.length > 1) {
      const newPath = '/' + parts.slice(0, parts.length - 1).join('/');
      navigate(newPath);
    } else {
      onBack();
    }
  };

  const backLabel = () => {
    if (selectedBlogSlug) return 'Back to Subtopics';
    if (activeSubContainerId) return 'Back to Concepts';
    if (activeCoreTopicId) return 'Back to Core Topics';
    if (activeModuleId) return 'Back to Curriculum';
    return 'Return';
  };

  const headerPath = () => {
    if (selectedBlogSlug && activePost) {
      return `Reading: ${activePost.title.split(' (')[0]}`;
    }
    if (!activeModule) return 'Computer Science Roadmap';
    let path = activeModule.name;
    if (activeCoreTopic) {
      path += ` > ${activeCoreTopic.name}`;
      if (activeSubContainer) {
        path += ` > ${activeSubContainer.name}`;
      }
    }
    return path;
  };

  // Autocomplete matching blogs
  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return BLOG_POSTS.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [searchQuery]);

  const handleSearchSelect = (post: BlogPost) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    
    // Find path mapping for correct nested URL
    let foundPath = '/roadmap';
    for (const zone of ROADMAP_ZONES) {
      for (const topic of zone.topics) {
        for (const concept of topic.concepts) {
          for (const subtopic of concept.subtopics) {
            if (subtopic.blogSlug === post.slug) {
              foundPath = `/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`;
              break;
            }
          }
        }
      }
    }
    
    // If not found in curriculum tree, just open it as standard roadmap slug
    if (foundPath === '/roadmap') {
      foundPath = `/roadmap/dsa-foundations/basics-memory/programming-basics/${post.slug}`;
    }
    navigate(foundPath);
  };

  const renderConceptsList = (conceptsList: Concept[], title: string, subtitle?: string, label?: string) => {
    return (
      <motion.div
        key="concepts-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full flex flex-col items-center pb-32"
      >
        {/* Header Block */}
        <div className={`w-full max-w-4xl border rounded-xl p-6 relative overflow-hidden mt-8 text-left border-[var(--rm-border)] bg-[var(--rm-card)]`}>
          <div className="flex flex-col gap-2">
            <span className={`text-[10px] font-sans font-semibold tracking-[0.08em] text-[var(--rm-text)]`}>
              {label || activeModule?.name.toUpperCase()}
            </span>
            <h2 className={`text-xl font-bold tracking-tight font-sans text-[var(--rm-text)]`}>
              {title}
            </h2>
            <p className={`text-[13px] font-sans text-[var(--rm-text-muted)]`}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Concepts - card grid of the topic's daughter nodes */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {conceptsList.map((concept, cIdx) => {
            const { status, percent, total } = getConceptStatusStats(concept);
            const preview = concept.subtopics.slice(0, 3).map((s) => s.name).join(' / ');
            return (
              <Link
                key={concept.id}
                to={`/roadmap/${activeModuleId}/${activeCoreTopicId}/${concept.id}`}
                {...{className: `group border border-[var(--rm-border)] bg-[var(--rm-card)] rounded-xl p-5 relative overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[170px] text-left block no-underline hover:border-[var(--rm-border-strong)] hover:bg-[var(--rm-card-hover)]`.trim()}}
              >
                <div>
                  <div className="flex items-center justify-between font-mono">
                    <span className={`font-semibold text-[13px] text-[var(--rm-text-faint)]`}>
                      {String(cIdx + 1).padStart(2, '0')}.
                    </span>
                    <span
                      className={`text-[9px] font-mono border px-2 py-0.5 rounded ${
                        status === 'Completed'
                          ? 'border-[var(--rm-accent-border)] text-[var(--rm-accent-text)] bg-[var(--rm-accent-bg)]'
                          : status === 'In Progress'
                          ? 'border-[var(--rm-border-strong)] text-[var(--rm-text-muted)] bg-[var(--rm-track)]'
                          : 'border-[var(--rm-border)] text-[var(--rm-text-faint)]'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className={`font-semibold text-[15px] mt-3 tracking-tight font-sans text-[var(--rm-text)]`}>
                    {concept.name}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[var(--rm-text-body)] mt-2 font-sans font-normal line-clamp-2">
                    {preview}
                  </p>
                </div>

                <div className={`mt-5 pt-3 border-t flex flex-col gap-2 ${'border-[var(--rm-border)]'}`}>
                  <div className={`flex items-center justify-between font-mono text-[10px] text-[var(--rm-text-faint)]`}>
                    <span>{total} subtopics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-1 rounded-full flex-1 overflow-hidden bg-[var(--rm-track)]`}>
                      <div
                        className="h-full bg-[var(--rm-text)] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className={`font-mono text-[9px] font-semibold w-7 text-right text-[var(--rm-text)]`}>
                      {percent}%
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleBack}
          className={`mt-10 px-5 py-2.5 rounded-lg border text-[12.5px] transition cursor-pointer flex items-center gap-1.5 font-sans ${'border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
        >
          <ArrowLeft size={14} />
          <span>{
            (activeModuleId === 'system-design' ||
              activeModuleId === 'dsa-foundations' ||
              activeModuleId === 'machine-learning' ||
              activeModuleId === 'ai-data-scientist' ||
              activeModuleId === 'backend' ||
              activeModuleId === 'data-engineering' ||
              activeModuleId === 'android-development' ||
              activeModuleId === 'software-engineering' ||
              activeModuleId === 'game-developer')
              ? 'Back to Graph'
              : 'Back to Core Topics'
          }</span>
        </button>

        {/* Add TopicDesignGraph below the back button */}
        {activeCoreTopic && activeModuleId && (
          <div className="w-full mt-8">
            <TopicDesignGraph topic={activeCoreTopic} moduleId={activeModuleId} />
          </div>
        )}
      </motion.div>
    );
  };

  const renderContent = () => {
    // ================== LEVEL 5: TEXTBOOK INLINE READER ==================
    if (selectedBlogSlug && activePost) {
      const progressStatus = roadmapProgress[activePost.title] || 'Not Started';
      const currentArticlePath = location.pathname.replace(/\/+$/, '');
      const relatedArticleRoutes = getRelatedArticleRoutes(activePost, currentArticlePath);
      return (
        <motion.div
          key="blog-reader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32 text-left"
        >
          {/* Dark Mode Markdown Minimalist Header */}
          <div className="w-full max-w-[700px] flex flex-col gap-8 mt-12 mb-8">
            <h1 className={`text-4xl md:text-[40px] font-serif font-medium tracking-tight leading-[1.2] ${'text-[var(--rm-text)]'}`}>
              {activePost.title}
            </h1>
            
            <p className={`text-[19px] leading-[1.6] font-serif ${'text-[var(--rm-text-muted)]'}`}>
              {activePost.tagline}
            </p>

            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-[13px] mt-2 border-t pt-6 ${'text-[var(--rm-text-faint)] border-[var(--rm-border)]'}`}>
              <div className="flex items-center gap-2">
                <span>Updated {activePost.lastUpdated}</span>
                <span>/</span>
                <span>{activePost.readTime} min read</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-[var(--rm-text-faint)]`}>Status:</span>
                {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateRoadmapProgress(activePost.title, status)}
                    className={`transition-colors cursor-pointer ${
                      progressStatus === status
                        ? 'text-[var(--rm-text)] underline underline-offset-4 decoration-[var(--rm-border-strong)]'
                        : 'text-[var(--rm-text-muted)] hover:text-[var(--rm-text)] hover:underline hover:underline-offset-4 hover:decoration-[var(--rm-border)]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full max-w-[700px] flex flex-col gap-10 mt-4 mb-16">
            {/* Topic Illustration Banner */}
            <div className="my-6">
              <RoadmapIllustration slug={activePost.slug} />
            </div>

            {activePost.markdown ? (
              <div 
                className="markdown-article" 
                dangerouslySetInnerHTML={{ __html: articleMarkdownToHtml(activePost.markdown) }} 
              />
            ) : (
              <div className={`flex flex-col gap-10 text-[17px] leading-[1.8] font-sans ${'text-[var(--rm-text-body)]'}`}>
                <section className="flex flex-col gap-4">
                  <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Overview</h2>
                  <p>{activePost.content.introduction}</p>
                </section>

                <section className="flex flex-col gap-4">
                  <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Practical Importance</h2>
                  <p>{activePost.content.whyImportant}</p>
                </section>

                {activePost.content.realWorldApps && activePost.content.realWorldApps.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Real-World Applications</h2>
                    <ul className="list-disc pl-6 flex flex-col gap-2">
                      {activePost.content.realWorldApps.map((app, idx) => (
                        <li key={idx} className={`pl-1 marker:text-[var(--rm-text-faint)]`}>{app}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {activePost.content.algorithmDescription && activePost.content.algorithmDescription.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Structural Mechanics</h2>
                    <ol className="list-decimal pl-6 flex flex-col gap-2">
                      {activePost.content.algorithmDescription.map((step, idx) => (
                        <li key={idx} className={`pl-1 marker:text-[var(--rm-text-faint)]`}>{step}</li>
                      ))}
                    </ol>
                  </section>
                )}

                {activePost.content.complexity && activePost.content.complexity.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Asymptotic Bounds</h2>
                    <div className="overflow-x-auto my-4">
                      <table className="w-full text-left text-[15px] font-serif border-collapse">
                        <thead>
                          <tr className={`border-y ${'border-[var(--rm-border)] text-[var(--rm-text-body)]'}`}>
                            <th className="py-3 px-2 font-semibold font-sans">Measurement</th>
                            <th className="py-3 px-2 font-semibold font-sans">Asymptotic Bound</th>
                            <th className="py-3 px-2 font-semibold font-sans">Context & Constraints</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activePost.content.complexity.map((row, idx) => (
                            <tr key={idx} className={`border-b ${'border-[var(--rm-border)]'}`}>
                              <td className={`py-3 px-2 ${'text-[var(--rm-text-body)]'}`}>{row.label}</td>
                              <td className={`py-3 px-2 font-mono text-[14px] ${'text-[var(--rm-text-body)]'}`}>{row.value}</td>
                              <td className={`py-3 px-2 ${'text-[var(--rm-text-muted)]'}`}>{row.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {(activePost.content.implementationCpp || activePost.content.implementationPython) && (
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mt-4">
                      <h2 className="text-2xl font-semibold text-zinc-100 font-sans tracking-tight">Implementation Code</h2>
                      <div className={`flex gap-4 text-[13px] font-sans text-[var(--rm-text-muted)]`}>
                        <button
                          onClick={() => setSelectedLanguage('cpp')}
                          className={`hover:text-zinc-200 cursor-pointer transition-colors ${selectedLanguage === 'cpp' ? 'text-zinc-100 underline underline-offset-4 decoration-zinc-700' : ''}`}
                        >
                          C++
                        </button>
                        <button
                          onClick={() => setSelectedLanguage('py')}
                          className={`hover:text-zinc-200 cursor-pointer transition-colors ${selectedLanguage === 'py' ? 'text-zinc-100 underline underline-offset-4 decoration-zinc-700' : ''}`}
                        >
                          Python
                        </button>
                      </div>
                    </div>
                    <div className={`relative rounded-lg border p-4 text-[13px] leading-[1.6] max-h-[400px] overflow-auto roadmap-scroll font-mono shadow-inner my-2 ${'border-[var(--rm-border)] bg-[var(--rm-code-bg)]'}`}>
                      <CodeMirror
                        value={
                          selectedLanguage === 'cpp'
                            ? activePost.content.implementationCpp
                            : activePost.content.implementationPython || activePost.content.implementationCpp
                        }
                        readOnly
                        editable={false}
                        theme={isDark ? vscodeDark : vscodeLight}
                        extensions={selectedLanguage === 'cpp' ? [cpp()] : [python()]}
                        basicSetup={{
                          lineNumbers: false,
                          foldGutter: false,
                          highlightActiveLine: false,
                          highlightActiveLineGutter: false,
                        }}
                      />
                    </div>
                  </section>
                )}

                {activePost.content.commonMistakes && activePost.content.commonMistakes.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Common Pitfalls</h2>
                    <ul className="list-disc pl-6 flex flex-col gap-2">
                      {activePost.content.commonMistakes.map((mistake, idx) => (
                        <li key={idx} className={`pl-1 marker:text-[var(--rm-text-faint)]`}>{mistake}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {activePost.content.interviewQuestions && activePost.content.interviewQuestions.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className={`text-2xl font-semibold font-sans tracking-tight mt-4 ${'text-[var(--rm-text)]'}`}>Interview Preparation</h2>
                    <ol className="list-decimal pl-6 flex flex-col gap-2">
                      {activePost.content.interviewQuestions.map((q, idx) => (
                        <li key={idx} className={`font-semibold text-[var(--rm-text)] marker:text-[var(--rm-text-faint)]`}>
                          <span className={`font-normal text-[var(--rm-text-body)]`}>{q}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {activePost.content.summary && (
                  <section className={`flex flex-col gap-2 italic mt-8 border-l-2 pl-4 ${'text-[var(--rm-text-muted)] border-[var(--rm-border)]'}`}>
                    <p className="leading-[1.8] text-[17px]">{activePost.content.summary}</p>
                  </section>
                )}

                {(activePost.prerequisites.length > 0 || relatedArticleRoutes.length > 0 || activePost.practiceProblems.length > 0) && (
                  <section className="grid grid-cols-1 gap-6 pt-8 border-t border-[var(--rm-border)] font-sans">
                    {activePost.prerequisites.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h2 className={`text-xl font-semibold tracking-tight ${'text-[var(--rm-text)]'}`}>Prerequisites</h2>
                        <div className="flex flex-wrap gap-2">
                          {activePost.prerequisites.map((slug) => {
                            const route = getArticleRouteBySlug(slug);
                            return route ? (
                              <Link key={slug} to={route.path} className="rounded-full border border-[var(--rm-border)] px-3 py-1.5 text-[13px] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)] hover:border-[var(--rm-border-strong)] no-underline">
                                {route.post?.title || route.subtopic.name}
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {relatedArticleRoutes.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h2 className={`text-xl font-semibold tracking-tight ${'text-[var(--rm-text)]'}`}>Related Concepts</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {relatedArticleRoutes.map((route) => (
                            <Link key={route.path} to={route.path} className="border border-[var(--rm-border)] rounded-lg p-3 no-underline hover:border-[var(--rm-border-strong)] hover:bg-[var(--rm-card-hover)] transition">
                              <span className="block text-[13px] font-semibold text-[var(--rm-text)]">{route.post?.title || route.subtopic.name}</span>
                              <span className="block text-[11px] mt-1 text-[var(--rm-text-faint)]">{route.zone.name} / {route.concept.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {activePost.practiceProblems.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h2 className={`text-xl font-semibold tracking-tight ${'text-[var(--rm-text)]'}`}>Practice Problems</h2>
                        <ul className="flex flex-col gap-2 list-none p-0 m-0">
                          {activePost.practiceProblems.map((problem) => (
                            <li key={problem.url}>
                              <a href={problem.url} target="_blank" rel="noopener noreferrer" className="text-[14px] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)] underline underline-offset-4 decoration-[var(--rm-border)]">
                                {problem.title} ({problem.difficulty})
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleBack}
            className={`mt-10 px-5 py-2.5 rounded-lg border text-[12.5px] transition cursor-pointer flex items-center gap-1.5 ${'border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
          >
            <ArrowLeft size={14} />
            <span>Back to Subtopics</span>
          </button>
        </motion.div>
      );
    }

    // ================== LEVEL 1: MODULES GRID ==================
    if (!activeModuleId) {
      return (
        <motion.div
          key="grid-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32"
        >
          {/* Hero Banner */}
          <section className={`w-full py-12 text-left max-w-5xl border-b mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 ${'border-[var(--rm-border)]'}`}>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight mb-3 font-sans ${'text-[var(--rm-text)]'}`}>
                Computer Science Curriculum
              </h1>
              <p className={`text-[14px] leading-relaxed max-w-xl font-sans ${'text-[var(--rm-text-muted)]'}`}>
                Click a module below to inspect its core topics, sub-containers, and syllabus concepts.
              </p>
              <div className={`flex items-center gap-10 mt-6 font-mono text-[11px] ${'text-[var(--rm-text-muted)]'}`}>
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[14px] ${'text-[var(--rm-text)]'}`}>{ROADMAP_ZONES.length}</span>
                  <span>Modules</span>
                </div>
                <div className={`w-px h-3 ${'bg-[var(--rm-track)]'}`} />
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[14px] ${'text-[var(--rm-text)]'}`}>{totalConcepts}</span>
                  <span>Subtopics</span>
                </div>
                <div className={`w-px h-3 ${'bg-[var(--rm-track)]'}`} />
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-[14px] ${'text-[var(--rm-text)]'}`}>{totalHours}</span>
                  <span>Hours</span>
                </div>
              </div>
            </div>

            {/* Custom Theory Search Bar */}
            <div className="relative w-full sm:w-72 mt-4 sm:mt-0 z-30">
              <div className="flex items-center gap-2 border border-[var(--rm-border)] bg-[var(--rm-card)] rounded-lg px-3 py-2 transition focus-within:border-[var(--rm-accent-border)] focus-within:bg-[var(--rm-card-hover)] focus-within:ring-1 focus-within:ring-[var(--rm-accent-border)]">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search theory articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className={`bg-transparent border-none text-[12px] !outline-none focus-visible:!outline-none w-full font-sans ${'text-[var(--rm-text-body)] placeholder-[var(--rm-text-faint)]'}`}
                />
              </div>

              {/* Autocomplete suggestions dropdown */}
              <AnimatePresence>
                {isSearchFocused && filteredBlogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`absolute top-11 left-0 right-0 border rounded-lg shadow-xl max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 text-left ${'border-[var(--rm-border)] bg-[var(--rm-card)]'}`}
                  >
                    {filteredBlogs.map((post) => (
                      <button
                        key={post.slug}
                        onMouseDown={() => handleSearchSelect(post)}
                        className={`w-full rounded px-2.5 py-2 text-left transition cursor-pointer hover:bg-[var(--rm-card-hover)]`}
                      >
                        <div className={`text-[12px] font-semibold truncate font-sans text-[var(--rm-text)]`}>
                          {post.title}
                        </div>
                        <div className={`text-[10px] font-mono flex items-center gap-1.5 mt-0.5 uppercase tracking-wide text-[var(--rm-text-faint)]`}>
                          <span>{post.category}</span>
                          <span>/</span>
                          <span>{post.readTime} mins</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Grid of Modules */}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROADMAP_ZONES.map((module) => {
              const { status, percent, total } = getModuleStatusStats(module.id);
              const moduleHours = getModuleHours(module);
              return (
                <Link
                  key={module.id}
                  to={`/roadmap/${module.id}`}
                  {...{className: `group border border-[var(--rm-border)] bg-[var(--rm-card)] rounded-xl p-5 relative overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[200px] select-none text-left block no-underline hover:border-[var(--rm-border-strong)] hover:bg-[var(--rm-card-hover)]`.trim()}}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono">
                      <span className={`font-semibold text-[13px] ${'text-[var(--rm-text-faint)]'}`}>{module.number}.</span>
                      <span
                        className={`text-[9px] font-mono border px-2 py-0.5 rounded ${
                          status === 'Completed'
                            ? 'border-[var(--rm-accent-border)] text-[var(--rm-accent-text)] bg-[var(--rm-accent-bg)]'
                            : status === 'In Progress'
                            ? 'border-[var(--rm-border-strong)] text-[var(--rm-text-muted)] bg-[var(--rm-track)]'
                            : 'border-[var(--rm-border)] text-[var(--rm-text-faint)]'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h3 className={`font-semibold text-[16px] mt-3 tracking-tight font-sans ${'text-[var(--rm-text)]'}`}>
                      {module.name}
                    </h3>
                    <p className={`text-[12.5px] leading-relaxed mt-2 font-sans font-normal line-clamp-3 ${'text-[var(--rm-text-muted)]'}`}>
                      {module.description}
                    </p>
                  </div>

                  <div className={`mt-5 pt-3 border-t flex flex-col gap-2 ${'border-[var(--rm-border)]'}`}>
                    <div className={`flex items-center justify-between font-mono text-[10px] ${'text-[var(--rm-text-faint)]'}`}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {moduleHours} hrs
                      </span>
                      <span>{total} subtopics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-1 rounded-full flex-1 overflow-hidden bg-[var(--rm-track)]`}>
                        <div
                          className="h-full bg-[var(--rm-text)] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[9px] font-semibold w-7 text-right text-[var(--rm-text)]`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className={`w-full max-w-5xl mt-12 pt-6 border-t border-[var(--rm-border)]`}>
            <RoadmapConvergence roadmapProgress={roadmapProgress} onLaunch={onLaunch} />
          </div>
        </motion.div>
      );
    }

    // ================== KNOWLEDGE GRAPH VIEW (SYSTEM DESIGN & DSA) ==================
    if (
      activeModule &&
      (activeModuleId === 'system-design' ||
        activeModuleId === 'dsa-foundations' ||
        activeModuleId === 'machine-learning' ||
        activeModuleId === 'ai-data-scientist' ||
        activeModuleId === 'backend' ||
        activeModuleId === 'network-engineering' ||
        activeModuleId === 'blockchain' ||
        activeModuleId === 'cyber-security' ||
        activeModuleId === 'product-manager' ||
        activeModuleId === 'data-engineering' ||
        activeModuleId === 'android-development' ||
        activeModuleId === 'software-engineering' ||
        activeModuleId === 'game-developer') &&
      !activeCoreTopicId
    ) {
      return (
        <motion.div
          key="knowledge-graph-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32"
        >
          <div className={`w-full max-w-4xl border rounded-xl p-6 relative overflow-hidden mt-8 text-left border-[var(--rm-border)] bg-[var(--rm-card)]`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-sans">
                <span className={`text-[13px] font-semibold tracking-wide text-[var(--rm-text)]`}>MODULE {activeModule.number}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-[12px] font-medium tracking-wide text-[var(--rm-text-faint)]">KNOWLEDGE GRAPH</span>
              </div>
              <h2 className={`text-2xl font-bold tracking-tight font-sans text-[var(--rm-text)]`}>
                {activeModule.name}
              </h2>
              <p className={`text-[13.5px] leading-relaxed font-sans text-[var(--rm-text-muted)]`}>
                {activeModule.description}
              </p>
            </div>
          </div>

          <div className="w-full mt-8">
            <SystemDesignGraph zone={activeModule} />
          </div>

          <button
            onClick={handleBack}
            className={`mt-10 px-5 py-2.5 rounded-lg border text-[12.5px] transition cursor-pointer flex items-center gap-1.5 ${'border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
          >
            <ArrowLeft size={14} />
            <span>Back to Curriculum</span>
          </button>
        </motion.div>
      );
    }

    // ================== LEVEL 2: TOPICS GRID ==================
    if (activeModule && activeModuleId && !activeCoreTopicId) {
      return (
        <motion.div
          key="topics-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32"
        >
          <div className={`w-full max-w-4xl border rounded-xl p-6 relative overflow-hidden mt-8 text-left border-[var(--rm-border)] bg-[var(--rm-card)]`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-sans">
                <span className={`text-[13px] font-semibold tracking-wide text-[var(--rm-text)]`}>MODULE {activeModule.number}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-[12px] font-medium tracking-wide text-[var(--rm-text-faint)]">CORE TOPICS</span>
              </div>
              <h2 className={`text-2xl font-bold tracking-tight font-sans text-[var(--rm-text)]`}>
                {activeModule.name}
              </h2>
              <p className={`text-[13.5px] leading-relaxed font-sans text-[var(--rm-text-muted)]`}>
                {activeModule.description}
              </p>
            </div>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {activeModule.topics.map((topic) => {
              const { status, percent, total } = getTopicStatusStats(topic);
              return (
                <Link
                  key={topic.id}
                  to={`/roadmap/${activeModuleId}/${topic.id}`}
                  className="group border border-[var(--rm-border)] bg-[var(--rm-card)] rounded-xl p-5 cursor-pointer text-left flex flex-col justify-between transition min-h-[150px] block no-underline hover:border-[var(--rm-border-strong)] hover:bg-[var(--rm-card-hover)]"
                >
                  <div>
                    <div className={`flex items-center justify-between text-[11px] font-mono text-[var(--rm-text-faint)]`}>
                      <span>TOPIC</span>
                      <span className={status === 'Completed' ? 'text-blue-400' : status === 'In Progress' ? 'text-zinc-300' : 'text-zinc-500'}>
                        {status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[15px] text-[var(--rm-text)] mt-2 transition font-sans">
                      {topic.name}
                    </h3>
                    <p className="text-[12.5px] text-[var(--rm-text-muted)] mt-1 line-clamp-2 font-sans">
                      {topic.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--rm-border)] flex items-center justify-between text-[10px] font-mono text-[var(--rm-text-faint)]">
                    <span>{total} subtopics</span>
                    <span>{percent}% done</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleBack}
            className={`mt-10 px-5 py-2.5 rounded-lg border text-[12.5px] transition cursor-pointer flex items-center gap-1.5 ${'border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
          >
            <ArrowLeft size={14} />
            <span>Back to Curriculum</span>
          </button>
        </motion.div>
      );
    }

    // ================== LEVEL 3: CONCEPTS GRID ==================
    if (activeModule && activeCoreTopic && activeCoreTopicId && !activeSubContainerId) {
      return renderConceptsList(activeCoreTopic.concepts, activeCoreTopic.name, activeCoreTopic.description);
    }

    // ================== LEVEL 4: SUBTOPICS LIST (FLAT DIRECT LINKS ON CLICK) ==================
    if (activeModule && activeCoreTopic && activeSubContainer && activeSubContainerId && !selectedBlogSlug) {
      return (
        <motion.div
          key="subtopics-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32"
        >
          {/* Textbook Chapter Header */}
          <div className="w-full max-w-4xl text-left mt-6">
            <span className="text-9xl font-black text-[var(--rm-text)] opacity-95 tracking-tight font-sans leading-none block select-none">
              {activeCoreTopic.concepts.findIndex((c) => c.id === activeSubContainerId) + 1}
            </span>

            <h1 className="text-3xl font-extrabold text-[var(--rm-text)] tracking-tight font-sans mt-4 pb-6 border-b border-[var(--rm-border)]">
              {activeSubContainer.name}
            </h1>
          </div>

          <div className="w-full max-w-4xl flex flex-col gap-6 mt-10">
            {activeSubContainer.subtopics.map((subtopic, sIdx) => {
              const subStatus = roadmapProgress[subtopic.name] || 'Not Started';
              const post = BLOG_POSTS.find(
                (p) => p.slug === subtopic.blogSlug
              ) || getFallbackBlogPost(subtopic.blogSlug, subtopic.name, activeModule.name);

              return (
                <Link
                  key={subtopic.id}
                  to={`/roadmap/${activeModuleId}/${activeCoreTopicId}/${activeSubContainerId}/${subtopic.blogSlug}`}
                  className="group flex flex-col gap-2 pb-6 border-b border-[var(--rm-border)] last:border-b-0 block no-underline transition-all duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[16px] text-[var(--rm-text)] transition-colors font-sans leading-tight">
                      {sIdx + 1}. {subtopic.name}
                    </h3>

                    <span
                      className={`text-[9px] font-mono border px-2 py-0.5 rounded transition ${
                        subStatus === 'Completed'
                          ? 'border-[var(--rm-accent-border)] text-[var(--rm-accent-text)] bg-[var(--rm-accent-bg)]'
                          : subStatus === 'In Progress'
                          ? 'border-[var(--rm-border-strong)] text-[var(--rm-text-body)] bg-[var(--rm-surface)]'
                          : 'border-[var(--rm-border)] text-[var(--rm-text-faint)]'
                      }`}
                    >
                      {subStatus}
                    </span>
                  </div>

                  <p className={`text-[13px] leading-relaxed transition-colors font-sans ${'text-[var(--rm-text-muted)] group-hover:text-[var(--rm-text-body)]'}`}>
                    {post.tagline}
                  </p>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleBack}
            className={`mt-10 px-5 py-2.5 rounded-lg border text-[12.5px] transition cursor-pointer flex items-center gap-1.5 font-sans ${'border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
          >
            <ArrowLeft size={14} />
            <span>Back to Concepts</span>
          </button>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className={`rm-root relative w-full h-screen select-none font-sans antialiased overflow-hidden transition-colors duration-200 ${'bg-[var(--rm-bg)] text-[var(--rm-text-body)]'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 h-20 border-b z-40 flex items-center justify-between px-6 sm:px-12 pointer-events-auto transition-colors duration-200 ${'border-[var(--rm-border)] bg-[var(--rm-bg)]'}`}>
        <button
          onClick={handleBack}
          className={`group flex items-center gap-2 text-[13px] transition-colors cursor-pointer ${'text-[var(--rm-text-muted)] hover:text-[var(--rm-text)]'}`}
        >
          <ArrowLeft size={16} />
          <span className="font-sans font-medium">
            {backLabel()}
          </span>
        </button>

        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none hidden md:flex justify-center items-center px-8">
          <span className={`font-sans text-[10px] tracking-[0.1em] font-semibold uppercase ${'text-[var(--rm-text-faint)]'}`}>
            {headerPath()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${'text-[var(--rm-text-muted)] hover:text-[var(--rm-text)] hover:bg-[var(--rm-card-hover)]'}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onLaunch}
            className={`group px-4 py-2 rounded-lg text-[13px] font-medium transition flex items-center gap-1.5 cursor-pointer font-sans ${'bg-[var(--rm-btn-bg)] hover:bg-[var(--rm-btn-hover)] text-[var(--rm-btn-text)] border border-[var(--rm-btn-border)]'}`}
          >
            <span>Open Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-auto roadmap-scroll flex flex-col px-6 sm:px-12 md:px-20 pt-20"
      >
        {/* light-mode scrollbar style is handled globally via isDark class on root */}
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {/* Minimal Exit Section */}
        <section className={`w-full py-16 shrink-0 flex items-center justify-center text-center relative border-t mt-12 ${'border-[var(--rm-border)]'}`}>
          <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight font-sans ${'text-[var(--rm-text)]'}`}>
              Ready to construct code structures?
            </h2>
            <p className={`text-[13px] leading-relaxed font-sans ${'text-[var(--rm-text-muted)]'}`}>
              Enter the workspace to drag structures, run script compilers, and test your logic sandboxes.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={onLaunch}
                className="px-4 py-2 rounded-lg bg-[var(--rm-btn-bg)] hover:bg-[var(--rm-btn-hover)] text-[var(--rm-btn-text)] text-[12.5px] font-semibold transition cursor-pointer font-sans"
              >
                Launch Workspace
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg border border-[var(--rm-border)] bg-[var(--rm-card)] text-[var(--rm-text-muted)] hover:text-[var(--rm-text)] text-[12.5px] font-medium transition cursor-pointer font-sans"
              >
                Back to Portal
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Basic styles */}
      <style>{`
        .roadmap-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .roadmap-scroll::-webkit-scrollbar-track { background: transparent; }
        .roadmap-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
        .roadmap-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
};




