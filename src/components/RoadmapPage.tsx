import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Search
} from 'lucide-react';
import { ROADMAP_ZONES } from '../config/roadmapData';
import type { Concept, RoadmapZone, Topic } from '../config/roadmapData';
import { BLOG_POSTS } from '../config/blogData';
import type { BlogPost } from '../config/blogData';
import { ML_BLOG_DATA } from '../config/mlBlogData';
import { useWorkspaceStore } from '../store/workspaceStore';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '../config/editorTheme';
import { RoadmapConvergence } from './RoadmapConvergence';
import { RoadmapIllustration } from './RoadmapIllustration';
import { SystemDesignGraph } from './SystemDesignGraph';

interface RoadmapPageProps {
  onBack: () => void;
  onLaunch: () => void;
}

// Fallback generator for new/specific subtopics to guarantee detailed content is always available
const getFallbackBlogPost = (slug: string, subtopicName: string, category: string): BlogPost => {
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
        <div className="w-full max-w-4xl border border-zinc-800 bg-[#18181b] rounded-xl p-6 relative overflow-hidden mt-8 text-left">
          <div className="flex flex-col gap-2">
            <span className="text-white text-[10px] font-sans font-semibold tracking-[0.08em]">
              {label || activeModule?.name.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight font-sans">
              {title}
            </h2>
            <p className="text-[13px] text-zinc-400 font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Concepts — card grid of the topic's daughter nodes */}
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {conceptsList.map((concept, cIdx) => {
            const { status, percent, total } = getConceptStatusStats(concept);
            const preview = concept.subtopics.slice(0, 3).map((s) => s.name).join(' · ');
            return (
              <Link
                key={concept.id}
                to={`/roadmap/${activeModuleId}/${activeCoreTopicId}/${concept.id}`}
                className="group border border-zinc-800 bg-[#18181b] rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-zinc-600 hover:bg-[#202024] hover:ring-1 hover:ring-white/5 cursor-pointer flex flex-col justify-between min-h-[170px] text-left block no-underline"
              >
                <div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-zinc-500 font-semibold text-[13px]">
                      {String(cIdx + 1).padStart(2, '0')}.
                    </span>
                    <span
                      className={`text-[9px] font-mono border px-2 py-0.5 rounded ${
                        status === 'Completed'
                          ? 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                          : status === 'In Progress'
                          ? 'border-zinc-700 text-zinc-400 bg-zinc-800'
                          : 'border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[15px] text-white mt-3 tracking-tight font-sans">
                    {concept.name}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-white mt-2 font-sans font-normal line-clamp-2">
                    {preview}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-800/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                    <span>{total} subtopics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 bg-zinc-800 rounded-full flex-1 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-white font-semibold w-7 text-right">
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
          className="mt-10 px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-[12.5px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 font-sans"
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
      </motion.div>
    );
  };

  const renderContent = () => {
    // ================== LEVEL 5: TEXTBOOK INLINE READER ==================
    if (selectedBlogSlug && activePost) {
      const progressStatus = roadmapProgress[activePost.title] || 'Not Started';
      return (
        <motion.div
          key="blog-reader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full flex flex-col items-center pb-32 text-left"
        >
          <nav className="w-full max-w-3xl flex items-center gap-1.5 text-[10px] font-sans font-medium text-zinc-500 uppercase tracking-[0.08em] mt-8">
            <span>Roadmap</span>
            <span>&gt;</span>
            <span>{activePost.category}</span>
            <span>&gt;</span>
            <span className="text-zinc-100 font-semibold">{activePost.title.split(' (')[0]}</span>
          </nav>

          <div className="w-full max-w-3xl flex flex-col gap-6 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-white leading-tight font-sans">
                {activePost.title}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-zinc-500">Progress:</span>
                {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateRoadmapProgress(activePost.title, status)}
                    className={`px-2 py-0.5 rounded border text-[9px] font-mono transition cursor-pointer ${
                      progressStatus === status
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-zinc-800 bg-zinc-900/40 text-zinc-550 hover:text-zinc-350'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[16px] leading-relaxed text-zinc-400 font-serif font-normal italic">
              {activePost.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono text-zinc-500 border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-blue-400" />
                <span>Updated: <span className="text-zinc-300 font-medium">{activePost.lastUpdated}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-blue-400" />
                <span>Read Time: <span className="text-zinc-300 font-medium">{activePost.readTime} mins</span></span>
              </div>
            </div>

            {/* Topic Illustration Banner */}
            <RoadmapIllustration slug={activePost.slug} />



            <div className="flex flex-col gap-8 text-[15.5px] leading-relaxed text-zinc-300 font-serif mt-4">
              <section className="flex flex-col gap-2.5">
                <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">1. Overview</h2>
                <p>{activePost.content.introduction}</p>
              </section>

              <section className="flex flex-col gap-2.5">
                <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">2. Practical Importance</h2>
                <p>{activePost.content.whyImportant}</p>
              </section>

              {activePost.content.realWorldApps && activePost.content.realWorldApps.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">3. Real-World Applications</h2>
                  <ul className="list-disc pl-5 flex flex-col gap-1.5">
                    {activePost.content.realWorldApps.map((app, idx) => (
                      <li key={idx}>{app}</li>
                    ))}
                  </ul>
                </section>
              )}

              {activePost.content.algorithmDescription && activePost.content.algorithmDescription.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">4. Structural Mechanics</h2>
                  <ol className="list-decimal pl-5 flex flex-col gap-1.5">
                    {activePost.content.algorithmDescription.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </section>
              )}

              {activePost.content.complexity && activePost.content.complexity.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">5. Asymptotic Bounds</h2>
                  <div className="overflow-x-auto border border-zinc-800 rounded-lg bg-zinc-950/20">
                    <table className="w-full text-left border-collapse text-[12.5px] font-sans">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-[#18181b] font-mono text-[10px] text-zinc-400 uppercase">
                          <th className="p-3">Measurement</th>
                          <th className="p-3">Asymptotic Bound</th>
                          <th className="p-3">Context & Constraints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePost.content.complexity.map((row, idx) => (
                          <tr key={idx} className="border-b border-zinc-800/60 hover:bg-[#18181b]/20">
                            <td className="p-3 font-semibold text-white">{row.label}</td>
                            <td className="p-3 font-mono text-blue-400">{row.value}</td>
                            <td className="p-3 text-zinc-400">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {(activePost.content.implementationCpp || activePost.content.implementationPython) && (
                <section className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                    <h2 className="text-base font-bold text-white font-sans">6. Implementation Code</h2>
                    <div className="flex gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      <button
                        onClick={() => setSelectedLanguage('cpp')}
                        className={`hover:text-white cursor-pointer ${selectedLanguage === 'cpp' ? 'text-blue-400 font-semibold' : ''}`}
                      >
                        C++
                      </button>
                      <span>/</span>
                      <button
                        onClick={() => setSelectedLanguage('py')}
                        className={`hover:text-white cursor-pointer ${selectedLanguage === 'py' ? 'text-blue-400 font-semibold' : ''}`}
                      >
                        Python
                      </button>
                    </div>
                  </div>
                  <div className="relative rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[11px] leading-[1.5] max-h-[300px] overflow-auto roadmap-scroll font-sans">
                    <CodeMirror
                      value={
                        selectedLanguage === 'cpp'
                          ? activePost.content.implementationCpp
                          : activePost.content.implementationPython || activePost.content.implementationCpp
                      }
                      readOnly
                      editable={false}
                      theme={vscodeDark}
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
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">7. Common Pitfalls</h2>
                  <ul className="list-disc pl-5 flex flex-col gap-1.5">
                    {activePost.content.commonMistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </section>
              )}

              {activePost.content.interviewQuestions && activePost.content.interviewQuestions.length > 0 && (
                <section className="flex flex-col gap-2.5">
                  <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-1 font-sans">8. Interview Preparation</h2>
                  <ol className="list-decimal pl-5 flex flex-col gap-2">
                    {activePost.content.interviewQuestions.map((q, idx) => (
                      <li key={idx} className="font-semibold text-white">
                        <span className="text-zinc-300 font-normal">{q}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {activePost.content.summary && (
                <section className="flex flex-col gap-2 bg-[#18181b]/30 p-4 border border-zinc-850 rounded-xl mt-4 font-sans">
                  <h2 className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">Syllabus Summary</h2>
                  <p className="leading-relaxed text-[13px]">{activePost.content.summary}</p>
                </section>
              )}
            </div>
          </div>

          <button
            onClick={handleBack}
            className="mt-10 px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-[12.5px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
          <section className="w-full py-12 text-left max-w-5xl border-b border-zinc-800/60 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-3 font-sans">
                Computer Science Curriculum
              </h1>
              <p className="text-[14px] leading-relaxed text-zinc-400 max-w-xl font-sans">
                Click a module below to inspect its core topics, sub-containers, and syllabus concepts.
              </p>
              <div className="flex items-center gap-10 mt-6 font-mono text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-[14px]">{ROADMAP_ZONES.length}</span>
                  <span>Modules</span>
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-[14px]">{totalConcepts}</span>
                  <span>Subtopics</span>
                </div>
                <div className="w-px h-3 bg-zinc-800" />
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-[14px]">{totalHours}</span>
                  <span>Hours</span>
                </div>
              </div>
            </div>

            {/* Custom Theory Search Bar */}
            <div className="relative w-full sm:w-72 mt-4 sm:mt-0 z-30">
              <div className="flex items-center gap-2 border border-zinc-800 bg-[#18181b] rounded-lg px-3 py-2 transition focus-within:border-white/20 focus-within:bg-white/[0.04] focus-within:ring-1 focus-within:ring-white/10">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search theory articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className="bg-transparent border-none text-[12px] text-zinc-200 !outline-none focus-visible:!outline-none w-full placeholder-zinc-500 font-sans"
                />
              </div>

              {/* Autocomplete suggestions dropdown */}
              <AnimatePresence>
                {isSearchFocused && filteredBlogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-11 left-0 right-0 border border-zinc-800 bg-[#18181b] rounded-lg shadow-xl max-h-60 overflow-y-auto p-1.5 flex flex-col gap-0.5 text-left"
                  >
                    {filteredBlogs.map((post) => (
                      <button
                        key={post.slug}
                        onMouseDown={() => handleSearchSelect(post)}
                        className="w-full rounded px-2.5 py-2 hover:bg-zinc-800/80 text-left transition cursor-pointer"
                      >
                        <div className="text-[12px] font-semibold text-white truncate font-sans">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
                          <span>{post.category}</span>
                          <span>•</span>
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
                  className="group border border-zinc-800 bg-[#18181b] rounded-xl p-5 relative overflow-hidden transition-all duration-200 hover:border-zinc-600 hover:bg-[#202024] hover:ring-1 hover:ring-white/5 cursor-pointer flex flex-col justify-between min-h-[200px] select-none text-left block no-underline"
                >
                  <div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-zinc-500 font-semibold text-[13px]">{module.number}.</span>
                      <span
                        className={`text-[9px] font-mono border px-2 py-0.5 rounded ${
                          status === 'Completed'
                            ? 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                            : status === 'In Progress'
                            ? 'border-zinc-700 text-zinc-400 bg-zinc-800'
                            : 'border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <h3 className="font-semibold text-[16px] text-white mt-3 tracking-tight font-sans">
                      {module.name}
                    </h3>
                    <p className="text-[12.5px] leading-relaxed text-zinc-400 mt-2 font-sans font-normal line-clamp-3">
                      {module.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-800/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-505">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {moduleHours} hrs
                      </span>
                      <span>{total} subtopics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 bg-zinc-800 rounded-full flex-1 overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-white font-semibold w-7 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="w-full max-w-5xl mt-12 pt-6 border-t border-zinc-800/60">
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
          <div className="w-full max-w-4xl border border-zinc-800 bg-[#18181b] rounded-xl p-6 relative overflow-hidden mt-8 text-left">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-sans">
                <span className="text-white text-[13px] font-semibold tracking-wide">MODULE {activeModule.number}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-[12px] text-zinc-400 font-medium tracking-wide">KNOWLEDGE GRAPH</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
                {activeModule.name}
              </h2>
              <p className="text-[13.5px] leading-relaxed text-zinc-400 font-sans">
                {activeModule.description}
              </p>
            </div>
          </div>

          <div className="w-full mt-8">
            <SystemDesignGraph zone={activeModule} />
          </div>

          <button
            onClick={handleBack}
            className="mt-10 px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-[12.5px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
          <div className="w-full max-w-4xl border border-zinc-800 bg-[#18181b] rounded-xl p-6 relative overflow-hidden mt-8 text-left">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 font-sans">
                <span className="text-white text-[13px] font-semibold tracking-wide">MODULE {activeModule.number}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-[12px] text-zinc-400 font-medium tracking-wide">CORE TOPICS</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
                {activeModule.name}
              </h2>
              <p className="text-[13.5px] leading-relaxed text-zinc-400 font-sans">
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
                  className="group border border-zinc-800 bg-[#18181b] hover:border-zinc-600 hover:bg-[#202024] hover:ring-1 hover:ring-white/5 rounded-xl p-5 cursor-pointer text-left flex flex-col justify-between transition min-h-[150px] block no-underline"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>TOPIC</span>
                      <span className={status === 'Completed' ? 'text-blue-400' : status === 'In Progress' ? 'text-zinc-300' : 'text-zinc-500'}>
                        {status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[15px] text-white mt-2 transition font-sans">
                      {topic.name}
                    </h3>
                    <p className="text-[12.5px] text-zinc-400 mt-1 line-clamp-2 font-sans">
                      {topic.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>{total} subtopics</span>
                    <span>{percent}% done</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleBack}
            className="mt-10 px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-[12.5px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
            <span className="text-9xl font-black text-white/95 tracking-tight font-sans leading-none block select-none">
              {activeCoreTopic.concepts.findIndex((c) => c.id === activeSubContainerId) + 1}
            </span>

            <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-4 pb-6 border-b border-zinc-900/80">
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
                  className="group flex flex-col gap-2 pb-6 border-b border-zinc-900/80 last:border-b-0 block no-underline transition-all duration-200 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[16px] text-white group-hover:text-blue-400 transition-colors font-sans leading-tight">
                      {sIdx + 1}. {subtopic.name}
                    </h3>

                    <span
                      className={`text-[9px] font-mono border px-2 py-0.5 rounded transition ${
                        subStatus === 'Completed'
                          ? 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                          : subStatus === 'In Progress'
                          ? 'border-zinc-700 text-zinc-400 bg-zinc-850/60'
                          : 'border-zinc-800/80 text-zinc-500'
                      }`}
                    >
                      {subStatus}
                    </span>
                  </div>

                  <p className="text-[13px] leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors font-sans">
                    {post.tagline}
                  </p>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleBack}
            className="mt-10 px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/20 text-[12.5px] text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 font-sans"
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
    <div className="relative w-full h-screen bg-[#09090b] text-zinc-200 select-none font-sans antialiased overflow-hidden">
      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-zinc-800 bg-[#09090b] z-40 flex items-center justify-between px-6 sm:px-12 pointer-events-auto">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-[13px] text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="font-sans font-medium">
            {backLabel()}
          </span>
        </button>

        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none hidden md:flex justify-center items-center px-8">
          <span className="font-sans text-[10px] text-zinc-500 tracking-[0.1em] font-semibold uppercase">
            {headerPath()}
          </span>
        </div>

        <button
          onClick={onLaunch}
          className="group px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[13px] font-medium transition flex items-center gap-1.5 cursor-pointer font-sans border border-zinc-700"
        >
          <span>Open Workspace</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* ── Scrollable content ── */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-auto roadmap-scroll flex flex-col px-6 sm:px-12 md:px-20 pt-20"
      >
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {/* Minimal Exit Section */}
        <section className="w-full py-16 shrink-0 flex items-center justify-center text-center relative border-t border-zinc-800/60 mt-12">
          <div className="max-w-xl mx-auto px-6 flex flex-col items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              Ready to construct code structures?
            </h2>
            <p className="text-[13px] leading-relaxed text-zinc-400 font-sans">
              Enter the workspace to drag structures, run script compilers, and test your logic sandboxes.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={onLaunch}
                className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-white text-black text-[12.5px] font-semibold transition cursor-pointer font-sans"
              >
                Launch Workspace
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/10 text-zinc-350 hover:text-white text-[12.5px] font-medium transition cursor-pointer font-sans"
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


