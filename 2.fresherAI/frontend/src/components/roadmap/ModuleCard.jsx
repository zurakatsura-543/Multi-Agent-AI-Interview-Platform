import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react";
import { FiBookOpen, FiCheck, FiChevronDown, FiChevronUp, FiClock, FiFlag, FiYoutube } from 'react-icons/fi';

const difficultyColor = {
    Easy: "text-emerald-500 bg-emerald-50 border-emerald-100",
    Medium: "text-[#6D35FF] bg-[#F4F0FF] border-[#6D35FF]/15",
    Hard: "text-rose-500 bg-rose-50 border-rose-100",
};

function ModuleCard({ mod, index, done, onToggle }) {
    const [open, setOpen] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28 }}
            className={`relative overflow-hidden rounded-2xl border bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)] transition-all ${done ? "border-emerald-200" : "border-black/8 hover:border-[#6D35FF]/25"}`}>
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(!open)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(!open);
                    }
                }}
                className='relative flex w-full items-center gap-3 p-4 text-left'>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition ${done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-[#6D35FF]/15 bg-[#F8F7FF] text-[#6D35FF]"}`}>
                    {done ? <FiCheck size={16} /> : index + 1}
                </button>

                <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <p className='text-sm font-black text-[#071123]'>{mod.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${difficultyColor[mod.difficulty] || difficultyColor.Medium}`}>
                            {mod.difficulty}
                        </span>
                    </div>
                    <div className='mt-1 flex flex-wrap items-center gap-3 text-[11px] text-black/40'>
                        <span className='flex items-center gap-1'><FiClock size={11} /> Week {mod.week || index + 1}</span>
                        <span>{mod.duration}</span>
                    </div>
                </div>

                {open
                    ? <FiChevronUp size={16} className="text-black/35" />
                    : <FiChevronDown size={16} className="text-black/35" />
                }
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='overflow-hidden'>
                        <div className='border-t border-black/8 px-4 pb-4 pt-3'>
                            <p className='text-xs leading-5 text-black/55'>{mod.description}</p>

                            {mod.gapAddressed && (
                                <div className='mt-3 rounded-xl border border-[#6D35FF]/12 bg-[#F8F7FF] p-3'>
                                    <p className='flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#6D35FF]'>
                                        <FiFlag size={11} /> Gap Addressed
                                    </p>
                                    <p className='mt-1 text-xs leading-5 text-black/55'>{mod.gapAddressed}</p>
                                </div>
                            )}

                            {Array.isArray(mod.outcomes) && Boolean(mod.outcomes.length) && (
                                <div className='mt-3 grid gap-1.5 sm:grid-cols-2'>
                                    {mod.outcomes.map((outcome) => (
                                        <div key={outcome} className='flex items-start gap-2 text-xs text-black/55'>
                                            <span className='mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
                                                <FiCheck size={10} />
                                            </span>
                                            <span>{outcome}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mod.projectTask && (
                                <div className='mt-3 rounded-xl border border-black/8 bg-[#F9FAFB] p-3'>
                                    <p className='text-[10px] font-black uppercase tracking-widest text-black/35'>Practice Task</p>
                                    <p className='mt-1 text-xs leading-5 text-black/60'>{mod.projectTask}</p>
                                </div>
                            )}

                            <div className='mt-3 flex flex-wrap gap-2'>
                                {mod.youtube && (
                                    <a href={mod.youtube} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100">
                                            <FiYoutube size={12} /> {mod.youtubeChannel || "Watch Video"}
                                        </motion.button>
                                    </a>
                                )}

                                {mod.article && (
                                    <a href={mod.article} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-1.5 rounded-lg border border-[#6D35FF]/15 bg-[#F8F7FF] px-3 py-1.5 text-xs font-bold text-[#6D35FF] transition-colors hover:bg-[#F1EDFF]">
                                            <FiBookOpen size={12} /> Read Article
                                        </motion.button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default ModuleCard
