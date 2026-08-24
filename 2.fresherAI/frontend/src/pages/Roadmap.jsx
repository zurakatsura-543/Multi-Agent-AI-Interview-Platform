import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import { FiArrowLeft, FiCheck, FiClock, FiFileText, FiSend, FiX, FiZap } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { BsRocketTakeoff } from "react-icons/bs";
import { useCoins } from '../apis/user.api'
import api from '../utils/axios'
import { useSelector } from 'react-redux'
import RoadmapResult from '../components/roadmap/RoadmapResult'
import BrandMark from '../components/BrandMark'

const PACKAGE_OPTIONS = ["10 LPA", "15 LPA", "20 LPA", "30 LPA", "40 LPA"];
const ROLE_OPTIONS = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "AI/ML Engineer",
    "Data Scientist",
    "DevOps Engineer",
    "Other",
];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const EXPERIENCE_OPTIONS = ["Fresher", "0-1 years", "1-2 years", "2-4 years", "4+ years"];

function Roadmap({ user, setUser }) {
    const navigate = useNavigate()
    const [historyOpen, setHistoryOpen] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
    const [customRole, setCustomRole] = useState("");
    const [targetPackage, setTargetPackage] = useState(PACKAGE_OPTIONS[2]);
    const [currentLevel, setCurrentLevel] = useState("Beginner");
    const [experienceLevel, setExperienceLevel] = useState("Fresher");
    const [useResume, setUseResume] = useState(false);
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");

    const { resume } = useSelector((state) => state.resume)
    const role = useMemo(() => selectedRole === "Other" ? customRole.trim() : selectedRole, [selectedRole, customRole]);

    useEffect(() => {
        getAllRoadmaps()
    }, [])

    const getAllRoadmaps = async () => {
        setHistoryLoading(true)
        try {
            const response = await api.get("/api/roadmap/all")
            setHistory(response.data.data)
        } catch (error) {
            console.log(error)
        } finally {
            setHistoryLoading(false)
        }
    }

    const getRoadmapById = async (id) => {
        try {
            const response = await api.get(`/api/roadmap/${id}`)
            setRoadmap(response.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleGenerate = async () => {
        if (!role || loading) return;
        if (useResume && !resume) {
            alert("Analyze your resume first before using resume gap personalization.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            try {
                const coinResponse = await useCoins({ coins: 20, action: "roadmap-builder" })
                setUser((prev) => ({
                    ...prev, interviewCoin: coinResponse?.interviewCoin,
                }))
            } catch (error) {
                setLoading(false)
                alert(error?.response?.data?.message || "Failed to use coins.")
                return;
            }

            const response = await api.post("/api/roadmap/generate", {
                role,
                targetPackage,
                currentLevel,
                experienceLevel,
                useResume,
                resume
            })
            setRoadmap(response.data.data)
            getAllRoadmaps()
        } catch (error) {
            console.error("Failed to generate roadmap:", error);
            setError(error?.response?.data?.message || "Something went wrong while generating your roadmap. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#F4F6FB] text-[#071123]'>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_1px_0_rgba(15,23,42,0.04)]'>
                <div className='mx-auto flex h-12 max-w-7xl items-center justify-between px-3 sm:px-5'>
                    <div onClick={() => navigate("/dashboard")}
                        className='flex cursor-pointer items-center gap-1.5'>
                        <BrandMark />
                        <span className='hidden rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-black/50 sm:block'>Roadmap Builder</span>
                    </div>

                    <div className='flex items-center gap-2'>
                        <button onClick={() => navigate("/dashboard")} className='hidden h-8 items-center gap-1.5 rounded-lg border border-black/10 px-2.5 text-xs font-semibold text-black/55 transition hover:border-[#6D35FF]/30 hover:text-[#251855] sm:flex'>
                            <FiArrowLeft size={14} />
                            Dashboard
                        </button>
                        <button onClick={() => setHistoryOpen(!historyOpen)} className='flex h-8 items-center justify-center gap-1 rounded-lg border border-black/10 px-2.5 text-xs font-semibold text-black/55 transition hover:border-[#6D35FF]/30 hover:text-[#251855]'>
                            <FiClock />
                            <span className="hidden sm:inline">History</span>
                        </button>
                    </div>
                </div>
            </motion.nav>

            <main className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(109,53,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,53,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]' />
                <div className='pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[#071123]' />
                <div className='pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[linear-gradient(120deg,rgba(109,53,255,0.22),transparent_42%),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:auto,36px_36px,36px_36px]' />

                <div className='relative mx-auto max-w-7xl px-4 py-8'>
                    <AnimatePresence mode='wait'>
                        {!roadmap ? (
                            <motion.div
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 18 }}
                                transition={{ duration: 0.35 }}
                                className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start'>
                                <section className='pt-6 text-white'>
                                    <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-100'>
                                        <BsRocketTakeoff size={13} />
                                        AI Roadmap Agent
                                    </div>
                                    <h1 className='max-w-xl text-4xl font-black leading-tight sm:text-5xl'>
                                        Build a role-specific learning path.
                                    </h1>
                                    <p className='mt-3 max-w-xl text-sm leading-6 text-white/55'>
                                        Generate a weekly roadmap mapped to your target role, package, current level, experience, resume gaps, and curated learning resources.
                                    </p>

                                    <div className='mt-6 grid gap-2 sm:max-w-md'>
                                        {[
                                            "CampusX and Krish Naik preference for AI/ML",
                                            "Chai aur Code and CodeWithHarry preference for web",
                                            "Official docs and GeeksforGeeks articles",
                                            "Progress tracking and export-ready roadmap",
                                        ].map((item) => (
                                            <div key={item} className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2'>
                                                <FiCheck className='text-emerald-300' size={13} />
                                                <span className='text-xs text-white/70'>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className='rounded-3xl border border-white/70 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.14)]'>
                                    <div className='flex items-center justify-between border-b border-black/8 pb-4'>
                                        <div>
                                            <p className='text-[10px] font-black uppercase tracking-widest text-[#6D35FF]'>Roadmap Studio</p>
                                            <h2 className='text-xl font-black'>Career target</h2>
                                        </div>
                                        <span className='rounded-full bg-[#F1EDFF] px-2.5 py-1 text-[10px] font-black text-[#6D35FF]'>20 coins</span>
                                    </div>

                                    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                                        <div>
                                            <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Target Role</label>
                                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                                {ROLE_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Target Package</label>
                                            <select value={targetPackage} onChange={(e) => setTargetPackage(e.target.value)} className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                                {PACKAGE_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedRole === "Other" && (
                                            <div className='sm:col-span-2'>
                                                <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Custom Role</label>
                                                <input value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder='Cloud Security Engineer' className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10' />
                                            </div>
                                        )}

                                        <div>
                                            <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Current Skill Level</label>
                                            <select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)} className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                                {LEVEL_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className='text-[10px] font-black uppercase tracking-widest text-black/45'>Experience Level</label>
                                            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className='mt-1.5 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none transition focus:border-[#6D35FF] focus:ring-4 focus:ring-[#6D35FF]/10'>
                                                {EXPERIENCE_OPTIONS.map((option) => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => {
                                            if (!resume && !useResume) {
                                                alert("Analyze your resume first before using resume gap personalization.");
                                                return;
                                            }
                                            setUseResume(!useResume)
                                        }}
                                        className={`mt-4 flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${useResume ? "border-emerald-200 bg-emerald-50" : "border-black/8 bg-[#F9FAFB]"}`}>
                                        <div className='flex items-center gap-3'>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${useResume ? "bg-emerald-100 text-emerald-600" : "bg-[#F1EDFF] text-[#6D35FF]"}`}>
                                                <FiFileText />
                                            </div>
                                            <div>
                                                <p className='text-sm font-black'>Use resume gap analysis</p>
                                                <p className='text-xs text-black/45'>{resume ? "Map roadmap modules to missing resume skills." : "Analyze resume first to unlock stronger personalization."}</p>
                                            </div>
                                        </div>
                                        {useResume && <FiCheck className='text-emerald-600' />}
                                    </button>

                                    {error && <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading || !role}
                                        onClick={handleGenerate}
                                        className='mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#071123] text-sm font-black text-white shadow-[0_14px_35px_rgba(7,17,35,0.18)] transition hover:bg-[#251855] disabled:cursor-not-allowed disabled:opacity-45'>
                                        {loading ? (
                                            <>
                                                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                    <FiZap size={15} />
                                                </motion.span>
                                                Generating roadmap
                                            </>
                                        ) : (
                                            <>
                                                <FiSend size={15} />
                                                Generate Roadmap
                                            </>
                                        )}
                                    </motion.button>
                                </section>
                            </motion.div>
                        ) : (
                            <RoadmapResult
                                roadmap={roadmap}
                                onClear={() => setRoadmap(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {historyOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setHistoryOpen(false)}
                            className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm' />

                        <motion.aside
                            initial={{ x: 340 }}
                            animate={{ x: 0 }}
                            exit={{ x: 340 }}
                            transition={{ type: "spring", stiffness: 320, damping: 32 }}
                            className='fixed right-0 top-0 bottom-0 z-50 flex w-[320px] max-w-[88vw] flex-col overflow-y-auto border-l border-black/8 bg-white shadow-[0_0_45px_rgba(15,23,42,0.16)]'>
                            <div className='sticky top-0 flex items-center justify-between border-b border-black/8 bg-white/90 px-4 py-4 backdrop-blur-xl'>
                                <span className='text-sm font-black text-[#071123]'>Previous Roadmaps</span>
                                <button onClick={() => setHistoryOpen(false)} className='text-black/35 hover:text-[#071123] transition-colors'><FiX size={16} /></button>
                            </div>

                            <div className='flex flex-col gap-2 p-3'>
                                {historyLoading ? (
                                    <p className="py-6 text-center text-xs text-black/35">Loading</p>
                                )
                                    : history.length === 0 ?
                                        (
                                            <p className="py-6 text-center text-xs text-black/35">No roadmaps yet.</p>
                                        ) :
                                        (
                                            history.map((h) => (
                                                <button key={h._id} onClick={() => {
                                                    getRoadmapById(h._id);
                                                    setHistoryOpen(false)
                                                }} className='relative overflow-hidden rounded-2xl border border-[#6D35FF]/15 bg-[#071123] p-4 text-left text-white'>
                                                    <div className='absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.16),transparent_44%)]' />
                                                    <h3 className='relative font-black'>{h.title}</h3>
                                                    <div className='relative my-1 flex items-center justify-between'>
                                                        <span className='text-xs font-bold text-purple-200'>{h.targetPackage}</span>
                                                        <p className='text-xs text-white/40'>{h.duration}</p>
                                                    </div>

                                                    <p className='relative mt-1 text-xs text-white/30'>
                                                        {new Date(h.createdAt).toLocaleDateString()}</p>
                                                </button>
                                            ))
                                        )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Roadmap
