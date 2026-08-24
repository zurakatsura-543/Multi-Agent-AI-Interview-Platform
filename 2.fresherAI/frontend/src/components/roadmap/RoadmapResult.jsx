import React, { useEffect, useMemo, useState } from 'react'
import { motion } from "motion/react";
import { FiCheckCircle, FiClock, FiDownload, FiGrid, FiMap, FiTarget, FiX } from 'react-icons/fi';
import ModuleCard from './ModuleCard';

function RoadmapResult({ roadmap, onClear }) {
    const [view, setView] = useState("modules");
    const progressKey = `hiregen_roadmap_progress_${roadmap?._id || roadmap?.title}`;
    const [completed, setCompleted] = useState({});

    useEffect(() => {
        try {
            setCompleted(JSON.parse(localStorage.getItem(progressKey)) || {});
        } catch {
            setCompleted({});
        }
    }, [progressKey]);

    const progress = useMemo(() => {
        const total = roadmap.modules?.length || 0;
        const done = Object.values(completed).filter(Boolean).length;
        return {
            total,
            done,
            percent: total ? Math.round((done / total) * 100) : 0,
        };
    }, [completed, roadmap.modules]);

    const toggleModule = (index) => {
        const next = {
            ...completed,
            [index]: !completed[index],
        };
        setCompleted(next);
        localStorage.setItem(progressKey, JSON.stringify(next));
    }

    const exportRoadmap = () => {
        window.print();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-4'>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='relative overflow-hidden rounded-3xl border border-[#6D35FF]/20 bg-[#071123] p-5 text-white shadow-[0_24px_70px_rgba(37,24,85,0.24)]'>
                <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(109,53,255,0.25),transparent_42%),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,32px_32px,32px_32px]' />

                <div className='relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                        <p className='text-[10px] text-purple-200/70 tracking-widest uppercase mb-1'>Personalized Career Roadmap</p>
                        <h2 className='max-w-2xl text-2xl font-black text-white'>{roadmap.title}</h2>
                        <p className='mt-1 text-sm text-white/50'>
                            Target: <span className="font-bold text-purple-200">{roadmap.targetPackage}</span>
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        <button onClick={exportRoadmap} className='flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 text-xs font-bold text-white/75 transition hover:bg-white/15'>
                            <FiDownload size={14} /> Export
                        </button>
                        <button onClick={onClear} className='flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/55 transition hover:text-white'>
                            <FiX size={16} />
                        </button>
                    </div>
                </div>

                <div className='relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4'>
                    {[
                        { icon: FiTarget, label: "Level", value: roadmap.level },
                        { icon: FiClock, label: "Duration", value: roadmap.duration },
                        { icon: FiCheckCircle, label: "Modules", value: `${roadmap.modules.length} topics` },
                        { icon: FiMap, label: "Progress", value: `${progress.percent}%` },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className='rounded-2xl border border-white/10 bg-white/[0.08] p-3'>
                            <div className='flex items-center gap-1.5 mb-1'>
                                <Icon size={12} className="text-purple-200/60" />
                                <span className='text-[10px] uppercase tracking-widest text-white/35'>{label}</span>
                            </div>
                            <p className='text-sm font-black text-white'>{value}</p>
                        </div>
                    ))}
                </div>

                <div className='relative mt-4 h-2 overflow-hidden rounded-full bg-white/10'>
                    <div className='h-full rounded-full bg-[#8B5CF6] transition-all' style={{ width: `${progress.percent}%` }} />
                </div>
            </motion.div>

            <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                    <p className='text-[10px] font-black uppercase tracking-widest text-black/35'>Learning Plan</p>
                    <p className='text-sm text-black/50'>{progress.done} of {progress.total} modules completed</p>
                </div>
                <div className='flex rounded-xl border border-black/8 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'>
                    {[
                        ["modules", FiGrid, "Modules"],
                        ["timeline", FiClock, "Timeline"],
                    ].map(([key, Icon, label]) => (
                        <button key={key} onClick={() => setView(key)} className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${view === key ? "bg-[#071123] text-white" : "text-black/45 hover:text-[#071123]"}`}>
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </div>
            </div>

            {view === "timeline" ? (
                <div className='rounded-3xl border border-black/8 bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)]'>
                    <div className='grid gap-3 md:grid-cols-2'>
                        {roadmap.modules.map((module, index) => (
                            <div key={`${module.title}-${index}`} className='relative rounded-2xl border border-black/8 bg-[#F8F7FF] p-4'>
                                <p className='text-[10px] font-black uppercase tracking-widest text-[#6D35FF]'>Week {module.week || index + 1}</p>
                                <h3 className='mt-1 text-sm font-black text-[#071123]'>{module.title}</h3>
                                <p className='mt-1 text-xs leading-5 text-black/50'>{module.projectTask || module.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='flex flex-col gap-3'>
                    {roadmap.modules.map((m, i) => (
                        <ModuleCard
                            key={`${m.title}-${i}`}
                            mod={m}
                            index={i}
                            done={Boolean(completed[i])}
                            onToggle={() => toggleModule(i)}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default RoadmapResult
