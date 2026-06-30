import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Compass,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  Activity,
  Code,
} from 'lucide-react';
import { ROADMAP_ZONES } from '../config/roadmapData';
import type { SubConcept } from '../config/roadmapData';
import { useWorkspaceStore } from '../store/workspaceStore';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '../config/editorTheme';
import { RoadmapBackground } from './RoadmapBackground';
import { RoadmapConvergence } from './RoadmapConvergence';

interface RoadmapPageProps {
  onBack: () => void;
  onLaunch: () => void;
  onViewBlog?: (slug?: string) => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const SERIF = '"Instrument Serif", Georgia, serif';

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onBack, onLaunch, onViewBlog }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const addVisualizerNode = useWorkspaceStore((state) => state.addVisualizerNode);
  const setLayoutMode = useWorkspaceStore((state) => state.setLayoutMode);
  const roadmapProgress = useWorkspaceStore((state) => state.roadmapProgress);
  const updateRoadmapProgress = useWorkspaceStore((state) => state.updateRoadmapProgress);

  const allSubConcepts = useMemo(() => ROADMAP_ZONES.flatMap((z: any) => z.subConcepts), []);
  const firstNotCompletedIndex = useMemo(() => {
    return allSubConcepts.findIndex((c: SubConcept) => {
      const status = roadmapProgress[c.name] || c.learningStatus || 'Not Started';
      return status !== 'Completed';
    });
  }, [allSubConcepts, roadmapProgress]);

  const [selectedConcept, setSelectedConcept] = useState<SubConcept | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'py'>('py');

  const { scrollYProgress } = useScroll({ container: containerRef });
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // ── Map scroll position to the active curriculum zone (for the timeline rail) ──
  const [activeZoneIndex, setActiveZoneIndex] = useState<number>(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleScroll = () => {
      const ids = [
        'hero-section',
        ...ROADMAP_ZONES.map((z) => z.id),
        'convergence-section',
        'exit-section',
      ];
      let activeIdx = 0;
      let minDistance = Infinity;
      const viewportMid = window.innerHeight / 2;
      ids.forEach((id, idx) => {
        const child = document.getElementById(id);
        if (!child) return;
        const rect = child.getBoundingClientRect();
        const childMid = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(childMid - viewportMid);
        if (distance < minDistance) {
          minDistance = distance;
          activeIdx = idx;
        }
      });
      setActiveZoneIndex(activeIdx);
    };
    el.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToZone = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLaunchConcept = (concept: SubConcept) => {
    if (concept.visualizerId) {
      useWorkspaceStore.getState().clearVisualizerNodes();
      addVisualizerNode(concept.visualizerId, 100, 100);
      setLayoutMode('visualizer');
      onLaunch();
    } else {
      onLaunch();
    }
  };

  // Earthy difficulty accents — warm, desaturated, never blue.
  const getDifficultyColor = (diff: 'Easy' | 'Medium' | 'Hard') => {
    if (diff === 'Easy') return 'border-[#8fa68c]/25 text-[#a9c0a3] bg-[#8fa68c]/[0.06]';
    if (diff === 'Medium') return 'border-[#c9a86a]/25 text-[#ddc18c] bg-[#c9a86a]/[0.06]';
    return 'border-[#c98a72]/25 text-[#dca390] bg-[#c98a72]/[0.06]';
  };

  const totalHours = ROADMAP_ZONES.reduce((sum, z) => sum + z.hours, 0);
  const totalConcepts = ROADMAP_ZONES.reduce((sum, z) => sum + z.subConcepts.length, 0);

  // Doubled list of zone names for a seamless marquee loop.
  const marqueeItems = [...ROADMAP_ZONES, ...ROADMAP_ZONES];

  return (
    <div className="relative w-full h-screen bg-[#0a0908] text-[#f0ece3] select-none font-sans antialiased overflow-hidden">
      {/* ── Warm dust-field backdrop ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0a0908] pointer-events-none z-0">
        <RoadmapBackground scrollYProgress={scrollYProgress} />
        {/* gentle edge vignette — frames the sparse, cursor-driven field */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 140% 135% at 50% 46%, rgba(10,9,8,0) 0%, rgba(10,9,8,0) 72%, rgba(10,9,8,0.55) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, #0a0908 0%, rgba(10,9,8,0) 100%)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0908 0%, rgba(10,9,8,0) 100%)' }}
        />
        {/* film grain */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen roadmap-grain" />
      </div>

      {/* ── Scroll progress bar ── */}
      <motion.div
        className="fixed top-20 left-0 right-0 h-[1.5px] bg-gradient-to-r from-[#cdbf9f] via-[#e6ddca] to-transparent z-40 origin-left pointer-events-none"
        style={{ scaleX: progressScaleX }}
      />

      {/* ── Left timeline rail ── */}
      <nav className="fixed left-5 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-5 z-35 font-mono text-[10px] text-white/40 max-w-[200px] pointer-events-auto">
        {ROADMAP_ZONES.map((zone, idx) => {
          const isActive = idx === activeZoneIndex - 1;
          return (
            <button
              key={zone.id}
              onClick={() => handleScrollToZone(zone.id)}
              className="flex items-center gap-4 text-left group cursor-pointer transition-colors"
            >
              <span
                className={`w-6 text-[10px] font-mono font-semibold tracking-tight text-right ${
                  isActive ? 'text-[#e6ddca]' : 'text-white/20 group-hover:text-white/45'
                }`}
              >
                {zone.number}
              </span>
              <div className="relative w-1.5 h-6 flex items-center justify-center">
                <div
                  className={`absolute top-0 bottom-0 w-px ${
                    isActive ? 'bg-[#cdbf9f]' : 'bg-white/5 group-hover:bg-white/10'
                  } transition`}
                />
                {isActive && (
                  <motion.div
                    layoutId="timeline-tracker-dot"
                    className="absolute w-1.5 h-1.5 rounded-full bg-[#e6ddca] shadow-[0_0_10px_rgba(230,221,202,0.6)]"
                  />
                )}
              </div>
              <span
                className={`transition duration-300 truncate max-w-[140px] font-sans text-[12px] font-medium ${
                  isActive
                    ? 'text-[#f0ece3] translate-x-1'
                    : 'text-white/30 group-hover:text-white/60'
                }`}
              >
                {zone.name}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 h-20 border-b border-white/[0.05] bg-[#0a0908]/55 backdrop-blur-xl z-40 flex items-center justify-between px-6 sm:px-12 pointer-events-auto">
        <button
          onClick={onBack}
          className="group flex items-center gap-3 text-[13px] text-white/55 hover:text-white transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full border border-white/8 bg-white/[0.02] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition duration-300">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
          </div>
          <span className="font-sans font-medium text-white/70 group-hover:text-white transition-colors">Return</span>
        </button>

        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none hidden md:flex justify-center items-center pl-6 sm:pl-8 xl:pl-[210px] pr-6 sm:pr-8 md:pr-8">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d8bf8f] animate-pulse" />
            <span className="font-mono text-[10px] text-white/45 tracking-[0.3em] font-semibold uppercase">
              The Atlas — Curriculum
            </span>
          </div>
        </div>

        <button
          onClick={onLaunch}
          className="group px-5 py-2.5 rounded-full bg-[#f0ece3] hover:bg-white text-[#13110e] text-[13px] font-semibold transition flex items-center gap-1.5 cursor-pointer font-sans shadow-[0_1px_22px_rgba(216,191,143,0.16)]"
        >
          <span>Open Workspace</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </header>

      {/* ── Scrollable journey ── */}
      <div
        ref={containerRef}
        className="relative z-10 w-full h-screen overflow-y-auto roadmap-scroll flex flex-col pl-6 sm:pl-8 xl:pl-[210px] pr-6 sm:pr-8 md:pr-8"
      >
        {/* Hero */}
        <section
          id="hero-section"
          className="w-full min-h-screen shrink-0 flex flex-col items-center justify-center text-center relative overflow-hidden py-28"
        >
          {/* localized scrim so the headline + subcopy stay legible over the field */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[680px] max-w-[95vw] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(10,9,8,0.42) 0%, rgba(10,9,8,0.18) 42%, rgba(10,9,8,0) 72%)',
            }}
          />
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
            className="relative z-10 max-w-4xl flex flex-col items-center gap-7"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/8 bg-white/[0.02] backdrop-blur-sm"
            >
              <Compass size={11} className="text-[#d8bf8f] animate-spin-slow" />
              <span className="text-[10px] font-mono text-white/55 tracking-[0.28em] font-semibold uppercase">
                Interactive Learning Platform
              </span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
              className="text-5xl sm:text-7xl lg:text-[7.5rem] font-semibold tracking-[-0.045em] text-[#f4f0e8] leading-[0.96]"
            >
              Computer science,
              <br />
              <span className="italic font-normal text-[#d8bf8f]" style={{ fontFamily: SERIF }}>
                as a spatial journey
              </span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
              className="text-[15px] sm:text-[17px] leading-[1.65] text-[#9a948a] max-w-[600px] font-sans font-normal text-balance"
            >
              Deconstruct algorithms and data structures through a visual, physical feedback loop.
              Move the cursor to stir the field — then scroll to assemble the map.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => handleScrollToZone(ROADMAP_ZONES[0].id)}
                  className="group px-7 py-3 rounded-full bg-[#f0ece3] hover:bg-white text-[#13110e] text-[13.5px] font-semibold transition flex items-center justify-center gap-2 cursor-pointer font-sans shadow-[0_1px_22px_rgba(216,191,143,0.16)]"
                >
                  <span>Begin journey</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => handleScrollToZone('index-section')}
                  className="group px-7 py-3 rounded-full border border-white/12 hover:border-white/28 bg-white/[0.02] text-[13.5px] font-semibold text-white/75 hover:text-white transition flex items-center justify-center gap-2 cursor-pointer font-sans backdrop-blur-sm"
                >
                  <span>View index</span>
                </button>
              </div>

              {/* Stat triad — agency "big numbers" treatment */}
              <div className="flex items-stretch gap-8 sm:gap-14">
                {[
                  { value: ROADMAP_ZONES.length, label: 'Curriculum zones' },
                  { value: totalConcepts, label: 'Mapped concepts' },
                  { value: `${totalHours}`, label: 'Hours of depth' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    {i > 0 && <span className="w-px self-stretch bg-white/8" />}
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#f0ece3] tabular-nums">
                        {s.value}
                      </span>
                      <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/40">
                        {s.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Marquee band of zone names */}
          <div
            aria-hidden="true"
            className="absolute bottom-10 inset-x-0 overflow-hidden pointer-events-none [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
          >
            <div className="flex w-max gap-8 marquee-track opacity-[0.5]">
              {marqueeItems.map((zone, i) => (
                <span
                  key={`${zone.id}-${i}`}
                  className="flex items-center gap-8 text-[13px] font-mono uppercase tracking-[0.18em] text-white/35 whitespace-nowrap"
                >
                  <span className="text-[#9a8e74]">{zone.number}</span>
                  {zone.name}
                  <span className="text-[#d8bf8f]/50">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum index — agency-style numbered contents */}
        <section
          id="index-section"
          className="w-full min-h-screen shrink-0 flex items-center justify-center relative py-32"
        >
          <div className="w-full max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EASE_OUT }}
              className="flex flex-col gap-3 mb-12"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#cdbf9f] font-semibold">
                The Curriculum
              </span>
              <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] text-[#f0ece3] leading-[1.0]">
                Nine zones,{' '}
                <span className="italic font-normal text-[#d8bf8f]" style={{ fontFamily: SERIF }}>
                  start to finish
                </span>
              </h2>
            </motion.div>

            <div className="flex flex-col border-t border-white/[0.07]">
              {ROADMAP_ZONES.map((zone, idx) => (
                <motion.button
                  key={zone.id}
                  onClick={() => handleScrollToZone(zone.id)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.55, ease: EASE_OUT, delay: idx * 0.04 }}
                  className="group relative grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-4 sm:gap-8 py-5 sm:py-6 border-b border-white/[0.07] text-left cursor-pointer transition-colors"
                >
                  <span className="font-mono text-[13px] text-white/30 group-hover:text-[#d8bf8f] transition-colors w-8">
                    {zone.number}
                  </span>
                  <span className="text-[18px] sm:text-[22px] font-medium tracking-[-0.01em] text-[#cfcabf] group-hover:text-[#f4f0e8] transition-colors group-hover:translate-x-1 duration-300">
                    {zone.name}
                  </span>
                  <span
                    className={`hidden sm:inline-flex text-[9.5px] font-mono border px-2.5 py-0.5 rounded-full font-semibold justify-self-end ${getDifficultyColor(
                      zone.difficulty
                    )}`}
                  >
                    {zone.difficulty}
                  </span>
                  <span className="flex items-center gap-3 justify-self-end">
                    <span className="font-mono text-[11px] text-white/30 tabular-nums hidden sm:inline">
                      {zone.hours} hrs
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-white/25 group-hover:text-[#d8bf8f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300"
                    />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Curriculum zones */}
        {ROADMAP_ZONES.map((zone) => {
          const zoneStatus = (() => {
            const statuses = zone.subConcepts.map(
              (c) => roadmapProgress[c.name] || c.learningStatus || 'Not Started'
            );
            if (statuses.every((s) => s === 'Completed')) return 'Completed';
            if (statuses.every((s) => s === 'Not Started')) return 'Not Started';
            return 'In Progress';
          })();

          const featured = zone.subConcepts.find((c) => c.codePreview);

          return (
            <section
              key={zone.id}
              id={zone.id}
              className="w-full min-h-screen shrink-0 flex items-center justify-center relative py-32 md:py-40"
            >
              {/* Oversized ghost numeral for editorial depth */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-16 select-none font-semibold text-white/[0.02] leading-none text-[26vw] xl:text-[20vw]"
                style={{ fontFamily: SERIF }}
              >
                {zone.number}
              </span>

              <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-10 gap-10 xl:gap-12 items-start relative">
                {/* Left — concept narrative + signature code converging in */}
                <motion.div
                  initial={{ opacity: 0, x: -44 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.85, ease: EASE_OUT }}
                  className="lg:col-span-5 flex flex-col gap-6 text-left lg:sticky lg:top-[20vh] pb-10"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#d8bf8f] text-[20px] font-semibold">{zone.number}</span>
                    <div className="h-px w-8 bg-white/12" />
                    <span
                      className={`text-[10px] font-mono border px-2.5 py-0.5 rounded-full font-semibold ${getDifficultyColor(
                        zone.difficulty
                      )}`}
                    >
                      {zone.difficulty}
                    </span>
                  </div>

                  <h2 className="text-5xl sm:text-6xl lg:text-[5.25rem] font-semibold tracking-[-0.04em] text-[#f4f0e8] leading-[0.98] text-balance">
                    {zone.name}
                  </h2>

                  <p className="text-[15.5px] leading-relaxed text-[#9a948a] font-sans font-normal max-w-[52ch]">
                    {zone.description}
                  </p>

                  {zone.blogSlug && onViewBlog && (
                    <button
                      onClick={() => onViewBlog(zone.blogSlug)}
                      className="mt-1 w-fit group/zone-btn px-4 py-2 rounded-full border border-white/8 hover:border-white/20 bg-white/[0.02] text-[12px] font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <BookOpen size={12} className="text-[#d8bf8f]" />
                      <span>Read theory and guides</span>
                      <ArrowRight size={11} className="group-hover/zone-btn:translate-x-0.5 transition-transform duration-300" />
                    </button>
                  )}

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-5 font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/35 font-semibold tracking-wide uppercase">Estimate</span>
                      <span className="text-[13px] text-white/85 font-semibold flex items-center gap-1.5">
                        <Clock size={12} className="text-[#d8bf8f]" />
                        {zone.hours} hrs
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/35 font-semibold tracking-wide uppercase">Status</span>
                      <span className="text-[13px] text-white/85 font-semibold flex items-center gap-1.5">
                        {zoneStatus === 'Completed' ? (
                          <CheckCircle2 size={12} className="text-[#9bb592]" />
                        ) : zoneStatus === 'In Progress' ? (
                          <Activity size={12} className="text-[#d8bf8f]" />
                        ) : (
                          <Lock size={12} className="text-white/25" />
                        )}
                        <span className="text-[11px] font-sans">{zoneStatus}</span>
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-white/35 font-semibold tracking-wide uppercase">Sandbox</span>
                      <span className="text-[13px] text-white/85 font-semibold font-sans">
                        {zone.visualizerAvailable ? 'Supported' : 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Signature snippet — assembles with a scan reveal */}
                  {featured && featured.codePreview && (
                    <motion.div
                      initial={{ opacity: 0, x: 44, clipPath: 'inset(0 0 100% 0)' }}
                      whileInView={{ opacity: 1, x: 0, clipPath: 'inset(0 0 0% 0)' }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}
                      className="mt-2 rounded-2xl border border-white/[0.08] bg-[#0c0b09]/80 backdrop-blur-md overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          <Code size={11} className="text-[#d8bf8f]" />
                          <span>{featured.name}</span>
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono">
                          <button
                            onClick={() => setSelectedLanguage('cpp')}
                            className={`cursor-pointer transition-colors ${
                              selectedLanguage === 'cpp' ? 'text-[#d8bf8f]' : 'text-white/30 hover:text-white/60'
                            }`}
                          >
                            C++
                          </button>
                          <span className="text-white/15">/</span>
                          <button
                            onClick={() => setSelectedLanguage('py')}
                            className={`cursor-pointer transition-colors ${
                              selectedLanguage === 'py' ? 'text-[#d8bf8f]' : 'text-white/30 hover:text-white/60'
                            }`}
                          >
                            Python
                          </button>
                        </div>
                      </div>
                      <div className="p-2 text-[11px] leading-[1.55] max-h-[240px] overflow-auto roadmap-scroll [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent">
                        <CodeMirror
                          value={
                            selectedLanguage === 'cpp'
                              ? featured.codePreview
                              : featured.codePreviewPython || featured.codePreview
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
                    </motion.div>
                  )}
                </motion.div>

                {/* Right — interactive concept cards */}
                <motion.div
                  initial={{ opacity: 0, x: 44 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.1 }}
                  className="lg:col-span-5 flex flex-col gap-5 pb-20 lg:relative lg:left-[3px]"
                >
                  {zone.subConcepts.map((concept, cIdx) => {
                    const isSel = selectedConcept?.name === concept.name;
                    const conceptIndex = allSubConcepts.findIndex((c: SubConcept) => c.name === concept.name);
                    const timelineState = (() => {
                      const status = roadmapProgress[concept.name] || concept.learningStatus || 'Not Started';
                      if (status === 'Completed') return 'Completed';
                      if (conceptIndex === firstNotCompletedIndex) return 'Current';
                      return 'Next Topic';
                    })();

                    return (
                      <motion.div
                        key={cIdx}
                        whileHover={isSel ? undefined : { y: -3 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        onClick={() => setSelectedConcept(isSel ? null : concept)}
                        className={`group border rounded-3xl p-5 text-left cursor-pointer transition-[border-color,background-color,box-shadow] duration-500 relative overflow-hidden ${
                          isSel
                            ? 'border-white/35 bg-[#100f0c]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_44px_rgba(0,0,0,0.5)]'
                            : 'border-white/[0.07] bg-[#0c0b09]/60 backdrop-blur-sm hover:border-white/16 hover:bg-[#100f0c]/70 hover:shadow-[0_18px_44px_rgba(0,0,0,0.4)]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(216,191,143,0.05),transparent_55%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-mono text-[#cdbf9f] font-semibold tracking-wider">
                              Concept 0{cIdx + 1}
                            </span>
                            <h3 className="font-sans font-semibold text-[16px] text-[#f0ece3] group-hover:text-[#e6ddca] transition-colors duration-300">
                              {concept.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {concept.blogSlug && onViewBlog && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewBlog(concept.blogSlug);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-[#d8bf8f] hover:text-white transition-colors cursor-pointer flex items-center justify-center relative z-10"
                                title="Read Theory"
                              >
                                <BookOpen size={12} />
                              </button>
                            )}
                            <span
                              className={`text-[9px] font-mono border px-2 py-0.5 rounded-full ${getDifficultyColor(
                                concept.difficulty
                              )}`}
                            >
                              {concept.difficulty}
                            </span>
                            <span
                              className={`text-[9px] font-sans border px-2 py-0.5 rounded-full ${
                                timelineState === 'Completed'
                                  ? 'border-[#8fa68c]/25 text-[#a9c0a3] bg-[#8fa68c]/[0.06] shadow-[0_0_10px_rgba(143,166,140,0.15)]'
                                  : timelineState === 'Current'
                                  ? 'border-[#c9a86a]/25 text-[#ddc18c] bg-[#c9a86a]/[0.06] shadow-[0_0_12px_rgba(201,168,106,0.25)]'
                                  : 'border-white/8 text-white/35 bg-white/[0.01]'
                              }`}
                            >
                              {timelineState}
                            </span>
                          </div>
                        </div>

                        <p className="text-[13px] leading-relaxed text-[#8d877d] mt-2 font-sans font-normal">
                          {concept.desc}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {concept.keyPoints.map((pt, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded-full border border-white/8 bg-white/[0.02] text-[9.5px] font-mono text-white/50"
                            >
                              # {pt}
                            </span>
                          ))}
                        </div>

                        <AnimatePresence>
                          {isSel && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.4, ease: EASE_OUT }}
                              className="overflow-hidden mt-4 pt-4 border-t border-white/[0.08]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-[9.5px] font-mono text-white/35 px-1 border-b border-white/[0.06] pb-2">
                                  <span>Learning Progress</span>
                                  <div className="flex gap-1.5">
                                    {(['Not Started', 'In Progress', 'Completed'] as const).map((status) => {
                                      const activeSubStatus =
                                        roadmapProgress[concept.name] || concept.learningStatus || 'Not Started';
                                      const isStatusSel = activeSubStatus === status;
                                      return (
                                        <button
                                          key={status}
                                          onClick={() => updateRoadmapProgress(concept.name, status)}
                                          className={`px-2 py-0.5 rounded border transition cursor-pointer font-sans text-[10px] ${
                                            isStatusSel
                                              ? 'border-white/20 bg-white/10 text-white font-semibold'
                                              : 'border-white/8 bg-white/[0.02] text-white/40 hover:text-white/65'
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {concept.codePreview && (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[9px] font-mono text-white/35 uppercase tracking-widest px-1">
                                      <span>Structure Representation</span>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => setSelectedLanguage('cpp')}
                                          className={`hover:text-white cursor-pointer ${
                                            selectedLanguage === 'cpp' ? 'text-[#d8bf8f]' : ''
                                          }`}
                                        >
                                          C++
                                        </button>
                                        <span>/</span>
                                        <button
                                          onClick={() => setSelectedLanguage('py')}
                                          className={`hover:text-white cursor-pointer ${
                                            selectedLanguage === 'py' ? 'text-[#d8bf8f]' : ''
                                          }`}
                                        >
                                          Python
                                        </button>
                                      </div>
                                    </div>
                                    <div className="relative rounded-xl border border-white/8 bg-black/50 p-2 text-[10.5px] leading-[1.5] text-left max-h-[300px] overflow-auto roadmap-scroll [&_.cm-editor]:!bg-transparent [&_.cm-gutters]:!bg-transparent">
                                      <Code className="absolute top-2.5 right-2.5 text-white/10 z-10" size={12} />
                                      <CodeMirror
                                        value={
                                          selectedLanguage === 'cpp'
                                            ? concept.codePreview
                                            : concept.codePreviewPython || concept.codePreview
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
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-1.5 pt-2 border-t border-white/[0.06]">
                                  <div className="flex items-center gap-1 text-[9.5px] font-mono text-white/35">
                                    <span>Estimated: </span>
                                    <span className="text-white font-semibold">{concept.hours} hours</span>
                                  </div>

                                  <div className="flex gap-2">
                                    {concept.blogSlug && onViewBlog && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewBlog(concept.blogSlug);
                                        }}
                                        className="group/btn px-3 py-1.5 rounded-full border border-[#d8bf8f]/20 hover:border-[#d8bf8f]/40 bg-[#d8bf8f]/[0.02] text-[10.5px] font-semibold text-white/90 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-sans"
                                      >
                                        <BookOpen size={10} className="text-[#d8bf8f]" />
                                        <span>Read Theory</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleLaunchConcept(concept)}
                                      className="group/btn px-3 py-1.5 rounded-full border border-white/12 hover:border-white/22 bg-white/[0.02] text-[10.5px] font-semibold text-white/90 hover:text-white transition flex items-center gap-1.5 cursor-pointer font-sans"
                                    >
                                      {concept.visualizerId ? (
                                        <>
                                          <Play size={10} className="text-[#d8bf8f]" />
                                          <span>Launch Visualizer</span>
                                        </>
                                      ) : (
                                        <>
                                          <BookOpen size={10} className="text-[#d8bf8f]" />
                                          <span>Explore Workspace</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* Consolidation finale */}
        <RoadmapConvergence roadmapProgress={roadmapProgress} onLaunch={onLaunch} />

        {/* Exit */}
        <section
          id="exit-section"
          className="w-full h-screen shrink-0 flex items-center justify-center text-center relative overflow-hidden"
        >
          <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] text-[#f4f0e8] leading-[0.98]">
              Ready to explore?
              <br />
              <span className="italic font-normal text-[#d8bf8f]" style={{ fontFamily: SERIF }}>
                Enter the sandbox
              </span>
            </h2>
            <p className="text-[14.5px] leading-relaxed text-[#9a948a] max-w-md font-sans">
              Jump directly into the workspace canvas. Draw nodes, compile algorithms, and test edge cases.
            </p>

            <div className="flex gap-4 mt-2">
              <button
                onClick={onLaunch}
                className="group px-6 py-3 rounded-full bg-[#f0ece3] hover:bg-white text-[#13110e] text-[13px] font-semibold transition flex items-center gap-1.5 cursor-pointer font-sans shadow-[0_1px_22px_rgba(216,191,143,0.18)]"
              >
                <span>Launch Workspace</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </button>
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-full border border-white/12 hover:border-white/22 bg-white/[0.01] text-[13px] font-semibold text-white/80 hover:text-white transition cursor-pointer font-sans"
              >
                <span>Back to Portal</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Scroll hint */}
      {activeZoneIndex < 9 && (
        <div className="fixed bottom-6 left-6 sm:left-8 xl:left-[210px] right-6 sm:right-8 md:right-8 flex justify-center pointer-events-none select-none z-30">
          <div className="flex flex-col items-center gap-1.5 opacity-25">
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-white">Scroll to travel</span>
            <div className="w-[1px] h-4 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      )}

      {/* Ambient styles */}
      <style>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .marquee-track { animation: marquee 42s linear infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .animate-spin-slow { animation: none; }
        }
        .roadmap-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .roadmap-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .roadmap-scroll::-webkit-scrollbar-track { background: transparent; }
        .roadmap-scroll::-webkit-scrollbar-thumb { background: rgba(230,221,202,0.12); border-radius: 3px; }
        .roadmap-scroll::-webkit-scrollbar-thumb:hover { background: rgba(216,191,143,0.4); }
        #hero-section ::selection, section ::selection { background: rgba(216,191,143,0.28); color: #fff; }
      `}</style>
    </div>
  );
};
